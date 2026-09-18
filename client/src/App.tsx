import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, homeFor } from './store';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import { Spinner } from './components/ui';

import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

import CitizenDashboard from './pages/citizen/Dashboard';
import ReportProblem from './pages/citizen/ReportProblem';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import Notifications from './pages/citizen/Notifications';
import CivilScore from './pages/citizen/CivilScore';
import Profile from './pages/shared/Profile';

import JsDashboard from './pages/jsmember/Dashboard';
import AvailableAssignments from './pages/jsmember/AvailableAssignments';
import MyAssignments from './pages/jsmember/MyAssignments';
import JsReports from './pages/jsmember/Reports';
import TrustScore from './pages/jsmember/TrustScore';

import GovDashboard from './pages/gov/Dashboard';
import GovComplaints from './pages/gov/Complaints';
import GovReview from './pages/gov/Review';
import GovReports from './pages/gov/Reports';
import GovActions from './pages/gov/Actions';
import GovMap from './pages/gov/Map';
import GovDeadlines from './pages/gov/Deadlines';
import GovProjects from './pages/gov/Projects';

import ContractorDashboard from './pages/contractor/Dashboard';
import Opportunities from './pages/contractor/Opportunities';
import MyBids from './pages/contractor/MyBids';
import ContractorProjects from './pages/contractor/Projects';
import Performance from './pages/contractor/Performance';

import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminComplaints from './pages/admin/Complaints';
import AdminOrgs from './pages/admin/Orgs';
import AdminRules from './pages/admin/Rules';
import AdminAudit from './pages/admin/Audit';

function Guard({ roles, children }: { roles: string[]; children: any }) {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner text="Loading JanSetu…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

function DashGuard({ role, children }: { role: string; children: any }) {
  return <Guard roles={[role]}><DashboardLayout>{children}</DashboardLayout></Guard>;
}

export default function App() {
  const { bootstrap, ready } = useAuth();
  useEffect(() => { bootstrap(); }, []);
  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Spinner text="Loading JanSetu…" /></div>;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/citizen-report" element={<Guard roles={['citizen']}><ReportProblem full /></Guard>} />
        <Route path="/citizen" element={<DashGuard role="citizen"><CitizenDashboard /></DashGuard>} />
        <Route path="/citizen/report" element={<DashGuard role="citizen"><ReportProblem /></DashGuard>} />
        <Route path="/citizen/complaints" element={<DashGuard role="citizen"><MyComplaints /></DashGuard>} />
        <Route path="/citizen/complaints/:id" element={<DashGuard role="citizen"><ComplaintDetail /></DashGuard>} />
        <Route path="/citizen/notifications" element={<DashGuard role="citizen"><Notifications /></DashGuard>} />
        <Route path="/citizen/score" element={<DashGuard role="citizen"><CivilScore /></DashGuard>} />
        <Route path="/citizen/profile" element={<DashGuard role="citizen"><Profile /></DashGuard>} />

        <Route path="/jsmember" element={<DashGuard role="jsmember"><JsDashboard /></DashGuard>} />
        <Route path="/jsmember/assignments" element={<DashGuard role="jsmember"><AvailableAssignments /></DashGuard>} />
        <Route path="/jsmember/my-assignments" element={<DashGuard role="jsmember"><MyAssignments /></DashGuard>} />
        <Route path="/jsmember/reports" element={<DashGuard role="jsmember"><JsReports /></DashGuard>} />
        <Route path="/jsmember/score" element={<DashGuard role="jsmember"><TrustScore /></DashGuard>} />
        <Route path="/jsmember/profile" element={<DashGuard role="jsmember"><Profile /></DashGuard>} />

        <Route path="/gov" element={<DashGuard role="government"><GovDashboard /></DashGuard>} />
        <Route path="/gov/complaints" element={<DashGuard role="government"><GovComplaints /></DashGuard>} />
        <Route path="/gov/complaints/:id" element={<DashGuard role="government"><GovReview /></DashGuard>} />
        <Route path="/gov/reports" element={<DashGuard role="government"><GovReports /></DashGuard>} />
        <Route path="/gov/actions" element={<DashGuard role="government"><GovActions /></DashGuard>} />
        <Route path="/gov/map" element={<DashGuard role="government"><GovMap /></DashGuard>} />
        <Route path="/gov/deadlines" element={<DashGuard role="government"><GovDeadlines /></DashGuard>} />
        <Route path="/gov/projects" element={<DashGuard role="government"><GovProjects /></DashGuard>} />

        <Route path="/contractor" element={<DashGuard role="contractor"><ContractorDashboard /></DashGuard>} />
        <Route path="/contractor/opportunities" element={<DashGuard role="contractor"><Opportunities /></DashGuard>} />
        <Route path="/contractor/bids" element={<DashGuard role="contractor"><MyBids /></DashGuard>} />
        <Route path="/contractor/projects" element={<DashGuard role="contractor"><ContractorProjects /></DashGuard>} />
        <Route path="/contractor/performance" element={<DashGuard role="contractor"><Performance /></DashGuard>} />
        <Route path="/contractor/profile" element={<DashGuard role="contractor"><Profile /></DashGuard>} />

        <Route path="/admin" element={<DashGuard role="admin"><AdminOverview /></DashGuard>} />
        <Route path="/admin/users" element={<DashGuard role="admin"><AdminUsers /></DashGuard>} />
        <Route path="/admin/complaints" element={<DashGuard role="admin"><AdminComplaints /></DashGuard>} />
        <Route path="/admin/orgs" element={<DashGuard role="admin"><AdminOrgs /></DashGuard>} />
        <Route path="/admin/rules" element={<DashGuard role="admin"><AdminRules /></DashGuard>} />
        <Route path="/admin/audit" element={<DashGuard role="admin"><AdminAudit /></DashGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

