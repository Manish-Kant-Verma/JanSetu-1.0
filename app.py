
import os, sqlite3, uuid, re
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.utils import secure_filename

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "jansetu.db")
UPLOAD_DIR = os.path.join(BASE, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-in-production")
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024
ALLOWED = {"png","jpg","jpeg","webp"}

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    c = db()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
      locality TEXT NOT NULL, district TEXT, state TEXT,
      gov_id_last4 TEXT, verified INTEGER DEFAULT 0,
      role TEXT DEFAULT 'citizen', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS problems(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      category TEXT NOT NULL, description TEXT NOT NULL,
      locality TEXT NOT NULL, address TEXT, latitude TEXT, longitude TEXT,
      reporter_id INTEGER NOT NULL, authority TEXT NOT NULL,
      status TEXT DEFAULT 'reported',
      verification_count INTEGER DEFAULT 1,
      evidence_count INTEGER DEFAULT 0,
      deadline TEXT, created_at TEXT NOT NULL, closed_at TEXT,
      reopened_at TEXT, reopen_reason TEXT,
      FOREIGN KEY(reporter_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS evidence(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      image_path TEXT, note TEXT, created_at TEXT NOT NULL,
      FOREIGN KEY(problem_id) REFERENCES problems(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS verifications(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      choice TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL,
      UNIQUE(problem_id,user_id),
      FOREIGN KEY(problem_id) REFERENCES problems(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS timeline(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL, status TEXT NOT NULL,
      note TEXT, actor TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY(problem_id) REFERENCES problems(id)
    );
    """)
    c.commit(); c.close()

def now(): return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
def current_user():
    if not session.get("user_id"): return None
    c=db(); u=c.execute("SELECT * FROM users WHERE id=?", (session["user_id"],)).fetchone(); c.close()
    return u

def authority_for(category):
    return {
      "Roads":"Municipality / Nagar Panchayat / Gram Panchayat",
      "Water":"Water Supply Department / Local Body",
      "Sanitation":"Municipality / Gram Panchayat",
      "Streetlights":"Municipality / Gram Panchayat",
      "Drainage":"Municipality / Gram Panchayat",
      "Electricity":"Electricity Distribution Department",
      "Waste":"Municipality / Gram Panchayat",
      "Public Safety":"Local Administration / Police",
      "Other":"Concerned Local Authority"
    }.get(category, "Concerned Local Authority")

def add_timeline(c, pid, status, note, actor="JanSetu"):
    c.execute("INSERT INTO timeline(problem_id,status,note,actor,created_at) VALUES(?,?,?,?,?)",
              (pid,status,note,actor,now()))

@app.route("/")
def index():
    c=db()
    stats = {
      "total": c.execute("SELECT COUNT(*) n FROM problems").fetchone()["n"],
      "open": c.execute("SELECT COUNT(*) n FROM problems WHERE status NOT IN ('closed')").fetchone()["n"],
      "resolved": c.execute("SELECT COUNT(*) n FROM problems WHERE status='closed'").fetchone()["n"],
      "reopened": c.execute("SELECT COUNT(*) n FROM problems WHERE status='reopened'").fetchone()["n"],
    }
    recent=c.execute("""SELECT p.*,u.name reporter FROM problems p JOIN users u ON u.id=p.reporter_id
                        ORDER BY p.id DESC LIMIT 6""").fetchall()
    c.close()
    return render_template("index.html", stats=stats, recent=recent, user=current_user())

@app.route("/register", methods=["GET","POST"])
def register():
    if request.method=="POST":
        name=request.form["name"].strip(); phone=request.form["phone"].strip()
        locality=request.form["locality"].strip(); district=request.form.get("district","").strip()
        state=request.form.get("state","").strip(); gov=request.form["gov_id"].strip()
        if not re.fullmatch(r"[A-Za-z0-9-]{4,40}", gov):
            flash("Enter a valid government-ID reference. This demo stores only a masked reference.", "error")
            return render_template("register.html")
        c=db()
        try:
            c.execute("""INSERT INTO users(name,phone,locality,district,state,gov_id_last4,verified,created_at)
                         VALUES(?,?,?,?,?,?,1,?)""",
                      (name,phone,locality,district,state,gov[-4:],now()))
            uid=c.execute("SELECT last_insert_rowid()").fetchone()[0]
            c.commit()
        except sqlite3.IntegrityError:
            c.close(); flash("That mobile number is already registered.", "error"); return render_template("register.html")
        c.close(); session["user_id"]=uid
        flash("Demo identity verification complete. Production should use a compliant KYC/identity provider.", "success")
        return redirect(url_for("dashboard"))
    return render_template("register.html")

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method=="POST":
        phone=request.form["phone"].strip()
        c=db(); u=c.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone(); c.close()
        if u:
            session["user_id"]=u["id"]; return redirect(url_for("dashboard"))
        flash("No account found. Register first.", "error")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear(); return redirect(url_for("index"))

@app.route("/dashboard")
def dashboard():
    u=current_user()
    if not u: return redirect(url_for("login"))
    c=db(); rows=c.execute("""SELECT * FROM problems WHERE reporter_id=? OR locality=?
                              ORDER BY id DESC""",(u["id"],u["locality"])).fetchall()
    c.close(); return render_template("dashboard.html", user=u, problems=rows)

@app.route("/report", methods=["GET","POST"])
def report():
    u=current_user()
    if not u: return redirect(url_for("login"))
    if request.method=="POST":
        title=request.form["title"].strip(); category=request.form["category"]
        desc=request.form["description"].strip(); locality=request.form["locality"].strip() or u["locality"]
        address=request.form.get("address","").strip(); lat=request.form.get("latitude",""); lon=request.form.get("longitude","")
        case_id="JS-"+datetime.now().strftime("%Y%m%d")+"-"+uuid.uuid4().hex[:6].upper()
        # Demo deadline: 15 days. Production: fetch the authoritative departmental SLA.
        deadline=(datetime.utcnow()+timedelta(days=15)).strftime("%Y-%m-%d")
        c=db()
        c.execute("""INSERT INTO problems(case_id,title,category,description,locality,address,latitude,longitude,
                     reporter_id,authority,status,verification_count,evidence_count,deadline,created_at)
                     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                  (case_id,title,category,desc,locality,address,lat,lon,u["id"],authority_for(category),
                   "community_verification",1,0,deadline,now()))
        pid=c.execute("SELECT last_insert_rowid()").fetchone()[0]
        add_timeline(c,pid,"community_verification","Problem reported; awaiting independent locality verification.")
        files=request.files.getlist("images")
        count=0
        for f in files:
            if f and "." in f.filename and f.filename.rsplit(".",1)[1].lower() in ALLOWED:
                name=uuid.uuid4().hex+"_"+secure_filename(f.filename)
                f.save(os.path.join(UPLOAD_DIR,name))
                c.execute("INSERT INTO evidence(problem_id,user_id,image_path,note,created_at) VALUES(?,?,?,?,?)",
                          (pid,u["id"],name,"Initial citizen evidence",now())); count+=1
        c.execute("UPDATE problems SET evidence_count=evidence_count+? WHERE id=?", (count,pid))
        c.commit(); c.close()
        return redirect(url_for("problem", pid=pid))
    return render_template("report.html", user=u)

@app.route("/problem/<int:pid>")
def problem(pid):
    u=current_user(); c=db()
    p=c.execute("""SELECT p.*,u.name reporter FROM problems p JOIN users u ON u.id=p.reporter_id WHERE p.id=?""",(pid,)).fetchone()
    if not p: c.close(); return "Not found",404
    ev=c.execute("SELECT e.*,u.name FROM evidence e JOIN users u ON u.id=e.user_id WHERE e.problem_id=? ORDER BY e.id DESC",(pid,)).fetchall()
    tl=c.execute("SELECT * FROM timeline WHERE problem_id=? ORDER BY id",(pid,)).fetchall()
    c.close(); return render_template("problem.html",problem=p,evidence=ev,timeline=tl,user=u)

@app.route("/problem/<int:pid>/verify", methods=["POST"])
def verify(pid):
    u=current_user()
    if not u: return redirect(url_for("login"))
    choice=request.form["choice"]; note=request.form.get("note","")
    c=db()
    try:
        c.execute("INSERT INTO verifications(problem_id,user_id,choice,note,created_at) VALUES(?,?,?,?,?)",
                  (pid,u["id"],choice,note,now()))
        if choice=="confirm":
            c.execute("UPDATE problems SET verification_count=verification_count+1 WHERE id=?", (pid,))
            # Demo threshold: 3 verified locality citizens. Make this configurable in production.
            p=c.execute("SELECT * FROM problems WHERE id=?",(pid,)).fetchone()
            if p["verification_count"] >= 3 and p["status"]=="community_verification":
                c.execute("UPDATE problems SET status='submitted' WHERE id=?",(pid,))
                add_timeline(c,pid,"submitted","Community verification threshold reached. Case prepared for responsible authority.","JanSetu")
        c.commit()
    except sqlite3.IntegrityError:
        flash("You have already verified this case.","error")
    c.close(); return redirect(url_for("problem",pid=pid))

@app.route("/problem/<int:pid>/evidence", methods=["POST"])
def add_evidence(pid):
    u=current_user()
    if not u: return redirect(url_for("login"))
    f=request.files.get("image")
    if not f or "." not in f.filename or f.filename.rsplit(".",1)[1].lower() not in ALLOWED:
        flash("Please upload a JPG, PNG or WEBP image.","error"); return redirect(url_for("problem",pid=pid))
    name=uuid.uuid4().hex+"_"+secure_filename(f.filename); f.save(os.path.join(UPLOAD_DIR,name))
    c=db(); c.execute("INSERT INTO evidence(problem_id,user_id,image_path,note,created_at) VALUES(?,?,?,?,?)",
                      (pid,u["id"],name,request.form.get("note",""),now()))
    c.execute("UPDATE problems SET evidence_count=evidence_count+1 WHERE id=?",(pid,))
    c.commit(); c.close(); return redirect(url_for("problem",pid=pid))

@app.route("/problem/<int:pid>/status", methods=["POST"])
def status_update(pid):
    u=current_user()
    if not u: return redirect(url_for("login"))
    status=request.form["status"]; note=request.form.get("note","")
    c=db(); c.execute("UPDATE problems SET status=? WHERE id=?",(status,pid))
    add_timeline(c,pid,status,note,"Authority (demo)")
    if status=="closed": c.execute("UPDATE problems SET closed_at=? WHERE id=?",(now(),pid))
    c.commit(); c.close(); return redirect(url_for("problem",pid=pid))

@app.route("/problem/<int:pid>/reopen", methods=["POST"])
def reopen(pid):
    u=current_user()
    if not u: return redirect(url_for("login"))
    reason=request.form["reason"].strip()
    c=db(); p=c.execute("SELECT * FROM problems WHERE id=?",(pid,)).fetchone()
    if not p or p["status"]!="closed":
        c.close(); return redirect(url_for("problem",pid=pid))
    deadline=(datetime.utcnow()+timedelta(days=15)).strftime("%Y-%m-%d")
    c.execute("UPDATE problems SET status='reopened', reopened_at=?, reopen_reason=?, deadline=? WHERE id=?",
              (now(),reason,deadline,pid))
    add_timeline(c,pid,"reopened","Case reopened by verified citizen: "+reason,"Citizen")
    c.commit(); c.close(); return redirect(url_for("problem",pid=pid))

@app.route("/api/problems")
def api_problems():
    c=db(); rows=c.execute("""SELECT case_id,title,category,locality,authority,status,
                              verification_count,evidence_count,deadline,created_at FROM problems
                              ORDER BY id DESC""").fetchall(); c.close()
    return jsonify([dict(r) for r in rows])

@app.route("/uploads/<path:name>")
def uploads(name):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_DIR,name)

if __name__=="__main__":
    init_db()
    app.run(host="0.0.0.0",port=int(os.environ.get("PORT",5000)),debug=True)
