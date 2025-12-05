// API base configuration
const API_BASE_URL = "https://restful-api-e-rapor-production.up.railway.app/api" // Gunakan proxy API untuk development
// const API_BASE_URL = "http://localhost:4000/api"; // Ganti dengan URL lokal saat development

const PUBLIC_PATHS = ['/login', '/register', '/unauthorized'];
interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: options.method || "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  const currentPath = window.location.pathname;

  if (!response.ok) {
    // 1. Cek status 401 (Unauthorized)
    if (response.status === 401) {
      
      // 2. Cegah Redirect di Halaman Publik
      // Hanya redirect jika user sedang berada di halaman yang TIDAK ADA di daftar PUBLIC_PATHS
      if (!PUBLIC_PATHS.includes(currentPath)) {
        console.error("Sesi Kedaluwarsa. Redirect ke halaman login...");
        window.location.href = '/login'; 
      } else {
        console.warn(`401 terjadi di path publik (${currentPath}). Mengabaikan redirect.`);
      }

      throw new Error("Unauthorized: Maaf, user atau password anda salah!!");
    }

    // Untuk error selain 401, proses seperti biasa
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  logout: () => apiCall("/auth/logout", { method: "POST" }),
  getProfile: () => apiCall<{ user: any }>("/auth/me"),
  register: (data: any) =>
    apiCall<{ user: any }>("/auth/registerUser", {
      method: "POST",
      body: data,
    }),
  registerSiswa: (data: any) =>
    apiCall<{ user: any }>("/auth/register", {
      method: "POST",
      body: data,
    }),
  authMe: () => apiCall("/auth/me"),
};

// Kelas endpoints
export const kelasApi = {
  getAll: () => apiCall<any[]>("/kelas"),//
  getById: (id: string) => apiCall(`/kelas/${id}`),
  create: (data: any) => apiCall("/kelas", { method: "POST", body: data }),//
  update: (id: string, data: any) =>
    apiCall(`/kelas/${id}`, { method: "PUT", body: data }),//
  delete: (id: string) => apiCall(`/kelas/${id}`, { method: "DELETE" }),//
  addSiswa: (kelasId: string, siswaId: string) =>
    apiCall(`/kelas/${kelasId}/siswa/${siswaId}`, { method: "POST" }),//
  removeSiswa: (kelasId: string, siswaId: string) =>
    apiCall(`/kelas/${kelasId}/siswa/${siswaId}`, { method: "DELETE" }),//
  getKelasByGuruId: (guruId: string) =>
    apiCall(`/kelas/guru/${guruId}`),//
};

// Mapel endpoints
export const mapelApi = {
  getAll: () => apiCall<any[]>("/mapel"),//
  getById: (id: string) => apiCall(`/mapel/${id}`),
  create: (data: any) => apiCall("/mapel", { method: "POST", body: data }),//
  update: (id: string, data: any) =>
    apiCall(`/mapel/${id}`, { method: "PUT", body: data }),//
  delete: (id: string) => apiCall(`/mapel/${id}`, { method: "DELETE" }),//
};

// Nilai endpoints
export const nilaiApi = {
  getAll: () => apiCall<any[]>("/nilai"),
  getByStudent: (studentId: string) => apiCall(`/nilai/student/${studentId}`),
  getByClass: (classId: string) => apiCall(`/nilai/class/${classId}`),
  create: (data: any) => apiCall("/nilai", { method: "POST", body: data }),
  update: (id: string, data: any) =>
    apiCall(`/nilai/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiCall(`/nilai/${id}`, { method: "DELETE" }),
  createNilai: (
    siswaId: string,
    mapelId: string,
    semester: string,
    data: any
  ) =>
    apiCall(`/nilai/siswa/${siswaId}/mapel/${mapelId}/semester/${semester}`, {
      method: "POST",
      body: data,
    }),
  getNilaiByKelas: (kelasId: string) =>
    apiCall(`/nilai/kelas/${kelasId}/nilai`),
  getNilaiBySiswa: (siswaId: string, semester?: string) =>
    apiCall(
      `/nilai/siswa/${siswaId}${semester ? `?semester=${semester}` : ""}`
    ),
};


// Users endpoints
export const usersApi = {
  getAll: () => apiCall<any[]>("/users"), //
  getById: (id: string) => apiCall(`/users/${id}`),
  create: (data: any) =>
    apiCall("/auth/register", { method: "POST", body: data }),
  update: (id: string, data: any) =>
    apiCall(`/users/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiCall(`/users/${id}`, { method: "DELETE" }),
  getSiswa: () => apiCall<any[]>("/users/siswa/all"),//
  updatePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) =>
    apiCall(
      `/users/${userId}/password`,
      {
        method: "PUT",
        body: {
          oldPassword,
          newPassword,
          confirmPassword,
        },
      }
    ),
};

export const guruMapelApi = {
  getAllGuru: () => apiCall<any[]>("/users/guru/all"),
  getMapelKelasByGuru: (guruId: string) =>
    apiCall(`/guru/${guruId}/mapel-kelas`),
  assignGuruToMapelKelas: (guruId: string, mapelId: string, kelasId: string) =>
    apiCall(`/guru/${guruId}/mapel/${mapelId}/kelas/${kelasId}`, {
      method: "POST",
    }),//
};

// Audit log endpoints
export const auditApi = {
  getLogs: (userId?: string) => 
  apiCall<any[]>(`/audit${userId ? `?userId=${userId}` : ""}`),
};
