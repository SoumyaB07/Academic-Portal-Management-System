// Academic Portal Management System - LocalStorage & Seed Data Engine

const SEED_DATA = {
  users: [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Dr. Arthur Vance (HOD / Admin)', email: 'admin@college.edu' },
    { id: 2, username: 'faculty1', facultyId: 'FAC101', password: '123', role: 'faculty', name: 'Prof. Rajesh Sharma', email: 'rsharma@college.edu', deptId: 1, designation: 'Associate Professor', phone: '9876543210' },
    { id: 3, username: 'faculty2', facultyId: 'FAC102', password: '123', role: 'faculty', name: 'Dr. Priya Nair', email: 'pnair@college.edu', deptId: 1, designation: 'Assistant Professor', phone: '9876543211' },
    { id: 4, username: 'student1', password: '123', role: 'student', name: 'Aarav Patel', rollNo: '21CS001', deptId: 1, semester: 5, email: 'aarav@college.edu', phone: '9123456780' },
    { id: 5, username: 'student2', password: '123', role: 'student', name: 'Ananya Iyer', rollNo: '21CS002', deptId: 1, semester: 5, email: 'ananya@college.edu', phone: '9123456781' },
    { id: 6, username: 'student3', password: '123', role: 'student', name: 'Rohan Verma', rollNo: '21CS003', deptId: 1, semester: 5, email: 'rohan@college.edu', phone: '9123456782' }
  ],
  departments: [
    { id: 1, code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Arthur Vance' },
    { id: 2, code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. M. Venkat' },
    { id: 3, code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. K. R. Rao' }
  ],
  courses: [
    { id: 1, code: 'CS501', name: 'Software Engineering', deptId: 1, semester: 5, credits: 4, facultyId: 2 },
    { id: 2, code: 'CS502', name: 'Database Management Systems', deptId: 1, semester: 5, credits: 4, facultyId: 3 },
    { id: 3, code: 'CS503', name: 'Design & Analysis of Algorithms', deptId: 1, semester: 5, credits: 4, facultyId: 2 },
    { id: 4, code: 'CS504', name: 'Web Technologies Lab', deptId: 1, semester: 5, credits: 2, facultyId: 3 },
    { id: 5, code: 'CS505', name: 'Computer Networks', deptId: 1, semester: 5, credits: 3, facultyId: null }
  ],
  enrollments: [
    { id: 1, studentId: 4, courseId: 1, date: '2026-08-01', status: 'Enrolled' },
    { id: 2, studentId: 4, courseId: 2, date: '2026-08-01', status: 'Enrolled' },
    { id: 3, studentId: 4, courseId: 3, date: '2026-08-01', status: 'Enrolled' },
    { id: 4, studentId: 4, courseId: 4, date: '2026-08-01', status: 'Enrolled' },
    { id: 5, studentId: 5, courseId: 1, date: '2026-08-01', status: 'Enrolled' },
    { id: 6, studentId: 5, courseId: 2, date: '2026-08-01', status: 'Enrolled' },
    { id: 7, studentId: 6, courseId: 1, date: '2026-08-01', status: 'Enrolled' }
  ],
  attendance: [
    { id: 1, enrollmentId: 1, date: '2026-09-01', status: 'Present' },
    { id: 2, enrollmentId: 1, date: '2026-09-03', status: 'Present' },
    { id: 3, enrollmentId: 1, date: '2026-09-08', status: 'Present' },
    { id: 4, enrollmentId: 1, date: '2026-09-10', status: 'Absent' },
    { id: 5, enrollmentId: 1, date: '2026-09-15', status: 'Present' },
    { id: 6, enrollmentId: 1, date: '2026-09-17', status: 'Present' },
    { id: 7, enrollmentId: 1, date: '2026-09-22', status: 'Present' },
    { id: 8, enrollmentId: 1, date: '2026-09-24', status: 'Present' },
    { id: 9, enrollmentId: 1, date: '2026-09-29', status: 'Present' },
    { id: 10, enrollmentId: 1, date: '2026-10-01', status: 'Present' },
    { id: 11, enrollmentId: 2, date: '2026-09-02', status: 'Present' },
    { id: 12, enrollmentId: 2, date: '2026-09-04', status: 'Absent' },
    { id: 13, enrollmentId: 2, date: '2026-09-09', status: 'Absent' },
    { id: 14, enrollmentId: 2, date: '2026-09-11', status: 'Present' },
    { id: 15, enrollmentId: 2, date: '2026-09-16', status: 'Absent' },
    { id: 16, enrollmentId: 2, date: '2026-09-18', status: 'Present' },
    { id: 17, enrollmentId: 2, date: '2026-09-23', status: 'Absent' },
    { id: 18, enrollmentId: 2, date: '2026-09-25', status: 'Present' },
    { id: 19, enrollmentId: 2, date: '2026-09-30', status: 'Present' },
    { id: 20, enrollmentId: 2, date: '2026-10-01', status: 'Absent' },
    { id: 21, enrollmentId: 3, date: '2026-09-01', status: 'Present' },
    { id: 22, enrollmentId: 3, date: '2026-09-08', status: 'Present' },
    { id: 23, enrollmentId: 3, date: '2026-09-15', status: 'Present' },
    { id: 24, enrollmentId: 3, date: '2026-09-22', status: 'Present' },
    { id: 25, enrollmentId: 4, date: '2026-09-05', status: 'Present' },
    { id: 26, enrollmentId: 4, date: '2026-09-12', status: 'Present' },
    { id: 27, enrollmentId: 4, date: '2026-09-19', status: 'Present' },
    { id: 28, enrollmentId: 4, date: '2026-09-26', status: 'Present' }
  ],
  grades: [
    { id: 1, enrollmentId: 1, internal: 26, midterm: 18, finalExam: 46, total: 90, grade: 'A+', gpa: 10.0 },
    { id: 2, enrollmentId: 2, internal: 20, midterm: 14, finalExam: 38, total: 72, grade: 'B', gpa: 8.0 },
    { id: 3, enrollmentId: 3, internal: 28, midterm: 19, finalExam: 47, total: 94, grade: 'A+', gpa: 10.0 },
    { id: 4, enrollmentId: 4, internal: 29, midterm: 18, finalExam: 48, total: 95, grade: 'A+', gpa: 10.0 }
  ],
  notices: [
    { id: 1, title: 'Mid-Semester Examination Schedule', content: 'Mid-term exams for Semester 5 will commence from October 15, 2026. Detailed timetable is available on the department bulletin.', target: 'all', postedBy: 'Dr. Arthur Vance', date: '2026-09-28' },
    { id: 2, title: 'Mandatory 75% Attendance Notice', content: 'Students with attendance below 75% will not be permitted to sit for the End-Semester Examination without medical board clearance.', target: 'students', postedBy: 'Academic Cell', date: '2026-09-25' },
    { id: 3, title: 'Faculty Assessment Entry Window', content: 'All faculty members are requested to complete Continuous Internal Evaluation (CIE) entry by the 10th of October.', target: 'faculty', postedBy: 'Principal Office', date: '2026-09-20' }
  ]
};

const DB_KEY = 'APMS_DATA_STORE';

const DB = {
  init() {
    if (!localStorage.getItem(DB_KEY)) {
      this.resetDemoData();
    } else {
      const data = this.getAll();
      let modified = false;
      if (Array.isArray(data.users)) {
        data.users.forEach(u => {
          if (!u.password) {
            u.password = '123';
            modified = true;
          }
          if (u.role === 'faculty') {
            if (!u.facultyId) {
              u.facultyId = u.username ? u.username.toUpperCase() : `FAC${u.id}`;
              modified = true;
            }
            if (!u.username) {
              u.username = u.facultyId.toLowerCase();
              modified = true;
            }
          }
          if (u.role === 'student' && !u.username && u.rollNo) {
            u.username = u.rollNo.toLowerCase();
            modified = true;
          }
        });
      }
      if (modified) this.save(data);
    }
  },

  async syncFromBackend() {
    if (typeof API === 'undefined') return false;
    try {
      const isOnline = await API.checkHealth();
      if (!isOnline) return false;

      const [depts, users, courses, enrollments, attendance, grades, notices] = await Promise.all([
        API.getDepartments(),
        API.getUsers(),
        API.getCourses(),
        API.getEnrollments(),
        API.getAttendance(),
        API.getGrades(),
        API.getNotices()
      ]);

      const currentUsers = this.get('users') || [];
      const safeMergedUsers = (users || []).map(bu => {
        const local = currentUsers.find(lu => lu.id === bu.id || (lu.username && lu.username.toLowerCase() === (bu.username || '').toLowerCase()));
        return {
          ...bu,
          password: bu.password || (local && local.password) || '123'
        };
      });

      const data = {
        departments: depts || [],
        users: safeMergedUsers,
        courses: courses || [],
        enrollments: enrollments || [],
        attendance: attendance || [],
        grades: grades || [],
        notices: notices || []
      };
      this.save(data);
      return true;
    } catch (e) {
      console.warn('Backend sync failed, continuing with local cache:', e);
      return false;
    }
  },

  getAll() {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : SEED_DATA;
    } catch (e) {
      console.error('Error reading localStorage, reverting to seed', e);
      return SEED_DATA;
    }
  },

  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  resetDemoData() {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
  },

  get(table) {
    const data = this.getAll();
    const records = data[table] || [];
    if (table === 'users' && Array.isArray(records)) {
      return records.map(u => ({
        ...u,
        password: u.password || '123'
      }));
    }
    return records;
  },

  set(table, records) {
    const data = this.getAll();
    data[table] = records;
    this.save(data);
  },

  nextId(table) {
    const records = this.get(table);
    if (!records.length) return 1;
    return Math.max(...records.map(r => r.id || 0)) + 1;
  },

  // Academic Helper Calculations
  getAttendanceStats(enrollmentId) {
    const logs = this.get('attendance').filter(a => a.enrollmentId === enrollmentId);
    const total = logs.length;
    const attended = logs.filter(a => a.status === 'Present').length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;
    return {
      total,
      attended,
      percentage,
      isLow: total > 0 && percentage < 75
    };
  },

  calculateGrade(internal, midterm, finalExam) {
    const total = Math.min(100, Math.round(Number(internal || 0) + Number(midterm || 0) + Number(finalExam || 0)));
    let grade = 'F';
    let gpa = 0.0;
    if (total >= 90) { grade = 'A+'; gpa = 10.0; }
    else if (total >= 80) { grade = 'A'; gpa = 9.0; }
    else if (total >= 70) { grade = 'B'; gpa = 8.0; }
    else if (total >= 60) { grade = 'C'; gpa = 7.0; }
    else if (total >= 50) { grade = 'D'; gpa = 6.0; }
    else { grade = 'F'; gpa = 0.0; }
    return { total, grade, gpa };
  }
};

DB.init();
