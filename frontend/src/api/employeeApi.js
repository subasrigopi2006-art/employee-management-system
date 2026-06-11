const BASE = "https://employee-management-system-m2il.onrender.com/api";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const getEmployees   = (search = "") =>
  request(`${BASE}/employees${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const getEmployee    = (id)       => request(`${BASE}/employees/${id}`);
export const createEmployee = (data)     => request(`${BASE}/employees`, { method: "POST", body: JSON.stringify(data) });
export const updateEmployee = (id, data) => request(`${BASE}/employees/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEmployee = (id)       => request(`${BASE}/employees/${id}`, { method: "DELETE" });
export const getStats       = ()         => request(`${BASE}/stats`);

// Auth
export const loginUser = (email, password) =>
  request(`${BASE}/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) });

// Performance
export const addPerformanceReview = (id, data) =>
  request(`${BASE}/employees/${id}/performance`, { method: "POST", body: JSON.stringify(data) });

export const getPerformanceScores = () =>
  request(`${BASE}/performance`);

// Salary
export const updateSalary = (id, salary) =>
  request(`${BASE}/employees/${id}/salary`, { method: "PUT", body: JSON.stringify({ salary }) });

// Attendance
export const getAttendance        = (date)          => request(`${BASE}/attendance?date=${date}`);
export const getAttendanceSummary = (date)          => request(`${BASE}/attendance/summary?date=${date}`);
export const markAttendance       = (data)          => request(`${BASE}/attendance`, { method: "POST", body: JSON.stringify(data) });
export const markBulkAttendance   = (date, records) => request(`${BASE}/attendance/bulk`, { method: "POST", body: JSON.stringify({ date, records }) });
