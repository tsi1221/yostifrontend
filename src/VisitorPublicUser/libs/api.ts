// src/libs/api.ts

const API = import.meta.env.VITE_API_URL;

// Helper: handle HTTP errors
async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Request failed");
  }
  return res.json();
}

// ================================
// Fetch all students
// ================================
export async function fetchSource() {
  const res = await fetch(`${API}/students`);
  return handleResponse(res);
}

// ================================
// Create a new student account
// ================================
export async function createAccount(data: any) {
  const res = await fetch(`${API}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

// ================================
// Update student info
// ================================
export async function updateSupport(id: string, data: any) {
  const res = await fetch(`${API}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

// ================================
// Delete student
// ================================
export async function deleteStudent(id: string) {
  const res = await fetch(`${API}/students/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}
