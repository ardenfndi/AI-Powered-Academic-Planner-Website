export async function register(name: string, email: string, password: string, school?: string, department?: string) {
  const res = await fetch("http://localhost:4000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, school: school ?? null, department: department ?? null }),
  });
  return res;
}

export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function logout() {
  const res = await fetch("http://localhost:4000/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  return res;
}

export async function getCurrentUser() {
  const res = await fetch("http://localhost:4000/api/auth/me", {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  try {
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}
