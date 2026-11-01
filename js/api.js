// Academic Portal Management System - Frontend REST API Client
const API_BASE_URL = (window.location.port === '5000' || window.location.host.includes(':5000'))
  ? '/api'
  : 'http://localhost:5000/api';

const API = {
  baseUrl: API_BASE_URL,
  isBackendAvailable: null,
  isMySQL: false,
  dbName: '',
  lastHealthCheck: 0,

  async checkHealth(force = false) {
    const now = Date.now();
    // Cache health result for 10 seconds to avoid repeating failed network requests
    if (!force && this.isBackendAvailable !== null && (now - this.lastHealthCheck < 10000)) {
      return this.isBackendAvailable;
    }
    this.lastHealthCheck = now;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await res.json();
      this.isBackendAvailable = (data && data.status === 'ONLINE');
      this.isMySQL = !!(data && data.isMySQL);
      this.dbName = (data && data.database) || '';
      return this.isBackendAvailable;
    } catch (e) {
      this.isBackendAvailable = false;
      this.isMySQL = false;
      this.dbName = '';
      return false;
    }
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timer);
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn(`[API] Network error connecting to ${endpoint}:`, err.message);
      return { success: false, message: 'Could not connect to backend server. Make sure "npm start" is running on port 5000.' };
    }
  },

  // Authentication
  async login(credential, password) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential, password })
    });
  },

  async resetDemo() {
    return await this.request('/auth/reset-demo', { method: 'POST' });
  },

  // Departments
  async getDepartments() {
    const res = await this.request('/departments');
    return res.data || [];
  },

  async addDepartment(deptData) {
    return await this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
  },

  async deleteDepartment(id) {
    return await this.request(`/departments/${id}`, { method: 'DELETE' });
  },

  // Users (Students & Faculty)
  async getUsers(role) {
    const q = role ? `?role=${role}` : '';
    const res = await this.request(`/users${q}`);
    return res.data || [];
  },

  async addStudent(studentData) {
    return await this.request('/users/student', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  async addFaculty(facultyData) {
    return await this.request('/users/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  },

  async deleteUser(id) {
    return await this.request(`/users/${id}`, { method: 'DELETE' });
  },

  // Courses
  async getCourses() {
    const res = await this.request('/courses');
    return res.data || [];
  },

  async addCourse(courseData) {
    return await this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  async assignFaculty(courseId, facultyId) {
    return await this.request(`/courses/${courseId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ facultyId })
    });
  },

  async deleteCourse(id) {
    return await this.request(`/courses/${id}`, { method: 'DELETE' });
  },

  // Enrollments
  async getEnrollments(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await this.request(`/enrollments${q ? '?' + q : ''}`);
    return res.data || [];
  },

  async enrollCourse(studentId, courseId) {
    return await this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId })
    });
  },

  async dropCourse(enrollmentId) {
    return await this.request(`/enrollments/${enrollmentId}`, { method: 'DELETE' });
  },

  // Attendance
  async getAttendance(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await this.request(`/attendance${q ? '?' + q : ''}`);
    return res.data || [];
  },

  async saveAttendance(date, records) {
    return await this.request('/attendance/save', {
      method: 'POST',
      body: JSON.stringify({ date, records })
    });
  },

  // Grades
  async getGrades(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await this.request(`/grades${q ? '?' + q : ''}`);
    return res.data || [];
  },

  async saveGrades(records) {
    return await this.request('/grades/save', {
      method: 'POST',
      body: JSON.stringify({ records })
    });
  },

  // Notices
  async getNotices(target) {
    const q = target ? `?target=${target}` : '';
    const res = await this.request(`/notices${q}`);
    return res.data || [];
  },

  async addNotice(noticeData) {
    return await this.request('/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  },

  async deleteNotice(id) {
    return await this.request(`/notices/${id}`, { method: 'DELETE' });
  },

  // Stats
  async getStats() {
    const res = await this.request('/stats');
    return res.data || { departmentsCount: 0, studentsCount: 0, facultyCount: 0, coursesCount: 0, noticesCount: 0 };
  }
};
