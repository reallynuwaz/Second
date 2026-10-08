/* ===================== ตั้งค่า URL ของ backend =====================
   ถ้ารัน backend ในเครื่องตัวเอง (npm run dev) ใช้ localhost:5000 ตามนี้ได้เลย
   ถ้าเอาไป deploy จริง (เช่นขึ้น Render) ให้เปลี่ยนบรรทัดนี้เป็น URL ของ backend ที่ deploy ไว้ */
const API_BASE = 'http://localhost:5000/api';

/* ===================== จัดการ token + ข้อมูลผู้ใช้ที่ล็อกอินอยู่ =====================
   เก็บไว้ใน localStorage เพื่อให้จำการล็อกอินได้ข้ามหน้า/ปิดเบราว์เซอร์แล้วเปิดใหม่ */
function getToken(){ return localStorage.getItem('second_token'); }
function getUser(){
  try{ return JSON.parse(localStorage.getItem('second_user') || 'null'); }catch(e){ return null; }
}
function saveAuth(token, user){
  localStorage.setItem('second_token', token);
  localStorage.setItem('second_user', JSON.stringify(user));
}
function clearAuth(){
  localStorage.removeItem('second_token');
  localStorage.removeItem('second_user');
}
function isLoggedIn(){ return !!getToken(); }

/* ===================== ตัวเรียก API กลาง ===================== */
async function apiRequest(path, options = {}){
  const headers = options.headers || {};
  if(!options.isFormData) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if(token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers,
    body: options.isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
  });

  const data = await res.json().catch(() => ({}));
  if(!res.ok){
    throw new Error(data.message || 'เกิดข้อผิดพลาด (' + res.status + ')');
  }
  return data;
}

/* ===================== ฟังก์ชันเรียก API แต่ละตัว ===================== */
const API = {
  register: (name, email, password) =>
    apiRequest('/auth/register', { method: 'POST', body: { name, email, password } }),

  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: { email, password } }),

  getListings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest('/listings' + (qs ? '?' + qs : ''));
  },

  getCategories: () => apiRequest('/listings/categories'),

  getListing: (id) => apiRequest('/listings/' + id),

  createListing: (formData) =>
    apiRequest('/listings', { method: 'POST', body: formData, isFormData: true }),

  markSold: (id) => apiRequest('/listings/' + id + '/sold', { method: 'PATCH' }),

  deleteListing: (id) => apiRequest('/listings/' + id, { method: 'DELETE' })
};

/* ===================== path รูปภาพ ===================== */
// backend ส่ง path แบบ "/uploads/xxx.jpg" กลับมา ต้องต่อกับ host ของ backend เอง (ไม่ใช่ของหน้าเว็บ)
function imageUrl(path){
  if(!path) return '';
  const backendHost = API_BASE.replace(/\/api$/, '');
  return backendHost + path;
}
