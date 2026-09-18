let token: string | null = localStorage.getItem('js_token');

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('js_token', t);
  else localStorage.removeItem('js_token');
}
export function getToken() { return token; }

async function request(method: string, url: string, body?: any, form = false): Promise<any> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!form) headers['Content-Type'] = 'application/json';
  const res = await fetch(`/api${url}`, {
    method,
    headers,
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });
  let data: any = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (url: string) => request('GET', url),
  post: (url: string, body?: any) => request('POST', url, body),
  postForm: (url: string, fd: FormData) => request('POST', url, fd, true),
};
