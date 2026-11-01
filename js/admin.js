// Academic Portal Management System - Administrator Module

const Admin = {
  selectedStudentDept: 'all',
  selectedFacultyDept: 'all',

  async render() {
    try {
      if (typeof API !== 'undefined' && API.isBackendAvailable) {
        await DB.syncFromBackend();
      }
    } catch (e) {
      console.warn('Admin sync error:', e);
    }
    this.populateDeptDropdowns();
    this.renderStats();
    this.renderDepartments();
    this.renderStudentFilterPills();
    this.renderStudents();
    this.renderFacultyFilterPills();
    this.renderFaculty();
    this.renderCourses();
    this.renderNotices();
  },

  populateDeptDropdowns() {
    const depts = DB.get('departments');
    const optionsHtml = depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('');

    ['new-stud-dept', 'new-fac-dept', 'new-course-dept'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = optionsHtml;
    });
  },

  renderStats() {
    const users = DB.get('users');
    const courses = DB.get('courses');
    const notices = DB.get('notices');
    const depts = DB.get('departments');

    const studentCount = users.filter(u => u.role === 'student').length;
    const facultyCount = users.filter(u => u.role === 'faculty').length;

    const elS = document.getElementById('stat-admin-students');
    const elF = document.getElementById('stat-admin-faculty');
    const elC = document.getElementById('stat-admin-courses');
    const elN = document.getElementById('stat-admin-notices');
    const elD = document.getElementById('stat-admin-depts');

    if (elS) elS.innerText = studentCount;
    if (elF) elF.innerText = facultyCount;
    if (elC) elC.innerText = courses.length;
    if (elN) elN.innerText = notices.length;
    if (elD) elD.innerText = depts.length;
  },

  renderDepartments() {
    const depts = DB.get('departments');
    const courses = DB.get('courses');
    const students = DB.get('users').filter(u => u.role === 'student');
    const faculty = DB.get('users').filter(u => u.role === 'faculty');
    const tbody = document.getElementById('admin-dept-tbody');
    if (!tbody) return;

    if (depts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No departments found. Click "Add Department" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = depts.map(d => {
      const courseCount = courses.filter(c => c.deptId === d.id).length;
      const studentCount = students.filter(s => s.deptId === d.id).length;
      const facultyCount = faculty.filter(f => f.deptId === d.id).length;

      return `
        <tr>
          <td><span class="badge bg-primary fs-6 font-monospace">${d.code}</span></td>
          <td>
            <a href="javascript:void(0)" class="fw-bold text-decoration-none text-dark" onclick="Admin.openDepartmentDetails(${d.id})" title="Click to open ${d.code} branch details">
              ${d.name} <i class="bi bi-box-arrow-up-right small text-primary ms-1"></i>
            </a>
          </td>
          <td>${d.hod || 'To Be Appointed'}</td>
          <td>
            <button class="btn btn-sm btn-outline-info" onclick="Admin.viewBranchFaculty(${d.id})" title="View faculty staff of ${d.code}">
              <i class="bi bi-person-workspace"></i> ${facultyCount} Faculty
            </button>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-success" onclick="Admin.viewBranchStudents(${d.id})" title="View students enrolled in ${d.code}">
              <i class="bi bi-people"></i> ${studentCount} Students
            </button>
          </td>
          <td><span class="badge bg-light text-dark border">${courseCount} Courses</span></td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary me-1" onclick="Admin.openDepartmentDetails(${d.id})" title="View complete branch details & rosters">
              <i class="bi bi-eye"></i> Open Branch
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteDepartment(${d.id})" title="Delete department">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async addDepartment(event) {
    event.preventDefault();
    const code = document.getElementById('new-dept-code').value.trim().toUpperCase();
    const name = document.getElementById('new-dept-name').value.trim();
    const hod = document.getElementById('new-dept-hod').value.trim();

    if (!code || !name) {
      alert('Please enter department code and name.');
      return;
    }

    if (await API.checkHealth()) {
      const res = await API.addDepartment({ code, name, hod });
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const depts = DB.get('departments');
      if (depts.some(d => d.code.toLowerCase() === code.toLowerCase())) {
        alert('A department with this code already exists!');
        return;
      }
      depts.push({
        id: DB.nextId('departments'),
        code,
        name,
        hod: hod || 'To Be Appointed'
      });
      DB.set('departments', depts);
    }

    const modalEl = document.getElementById('addDepartmentModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    document.getElementById('add-dept-form').reset();

    App.showToast(`Department "${code} - ${name}" added successfully!`, 'success');
    await this.render();
  },

  async deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department?')) return;

    if (await API.checkHealth()) {
      const res = await API.deleteDepartment(id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const courses = DB.get('courses');
      const students = DB.get('users').filter(u => u.deptId === id);
      const faculty = DB.get('users').filter(u => u.deptId === id);

      if (courses.some(c => c.deptId === id) || students.length > 0 || faculty.length > 0) {
        alert('Cannot delete this department because students, faculty, or courses are already assigned to it! Please reassign or delete them first.');
        return;
      }
      let depts = DB.get('departments').filter(d => d.id !== id);
      DB.set('departments', depts);
    }

    App.showToast('Department removed successfully.', 'info');
    await this.render();
  },

  // ==================== BRANCH / DEPARTMENT GROUPING & FILTERING ====================

  renderStudentFilterPills() {
    const container = document.getElementById('admin-stud-dept-filter');
    if (!container) return;

    const depts = DB.get('departments');
    const students = DB.get('users').filter(u => u.role === 'student');

    const isAll = this.selectedStudentDept === 'all';
    let html = `
      <button class="btn btn-sm ${isAll ? 'btn-primary' : 'btn-outline-secondary'}" onclick="Admin.filterStudentsByDept('all')">
        All Branches <span class="badge ${isAll ? 'bg-white text-primary' : 'bg-secondary'}">${students.length}</span>
      </button>
    `;

    depts.forEach(d => {
      const count = students.filter(s => s.deptId === d.id).length;
      const isActive = String(this.selectedStudentDept) === String(d.id);
      html += `
        <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}" onclick="Admin.filterStudentsByDept('${d.id}')">
          ${d.code} <span class="badge ${isActive ? 'bg-white text-primary' : 'bg-secondary'}">${count}</span>
        </button>
      `;
    });

    container.innerHTML = html;
  },

  filterStudentsByDept(deptId) {
    this.selectedStudentDept = deptId;
    this.renderStudentFilterPills();
    this.renderStudents();
  },

  renderFacultyFilterPills() {
    const container = document.getElementById('admin-fac-dept-filter');
    if (!container) return;

    const depts = DB.get('departments');
    const faculty = DB.get('users').filter(u => u.role === 'faculty');

    const isAll = this.selectedFacultyDept === 'all';
    let html = `
      <button class="btn btn-sm ${isAll ? 'btn-primary' : 'btn-outline-secondary'}" onclick="Admin.filterFacultyByDept('all')">
        All Departments <span class="badge ${isAll ? 'bg-white text-primary' : 'bg-secondary'}">${faculty.length}</span>
      </button>
    `;

    depts.forEach(d => {
      const count = faculty.filter(f => f.deptId === d.id).length;
      const isActive = String(this.selectedFacultyDept) === String(d.id);
      html += `
        <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}" onclick="Admin.filterFacultyByDept('${d.id}')">
          ${d.code} <span class="badge ${isActive ? 'bg-white text-primary' : 'bg-secondary'}">${count}</span>
        </button>
      `;
    });

    container.innerHTML = html;
  },

  filterFacultyByDept(deptId) {
    this.selectedFacultyDept = deptId;
    this.renderFacultyFilterPills();
    this.renderFaculty();
  },

  // Open Students Tab Pre-filtered to a Department
  viewBranchStudents(deptId) {
    this.selectedStudentDept = String(deptId);
    const tabBtn = document.querySelector('button[data-bs-target="#tab-adm-students"]');
    if (tabBtn) {
      bootstrap.Tab.getOrCreateInstance(tabBtn).show();
    }
    this.renderStudentFilterPills();
    this.renderStudents();
  },

  // Open Faculty Tab Pre-filtered to a Department
  viewBranchFaculty(deptId) {
    this.selectedFacultyDept = String(deptId);
    const tabBtn = document.querySelector('button[data-bs-target="#tab-adm-faculty"]');
    if (tabBtn) {
      bootstrap.Tab.getOrCreateInstance(tabBtn).show();
    }
    this.renderFacultyFilterPills();
    this.renderFaculty();
  },

  // Open Complete Branch Overview Modal
  openDepartmentDetails(deptId) {
    const depts = DB.get('departments');
    const dept = depts.find(d => d.id === Number(deptId));
    if (!dept) return;

    const allUsers = DB.get('users');
    const allCourses = DB.get('courses');

    const faculty = allUsers.filter(u => u.role === 'faculty' && u.deptId === dept.id);
    const students = allUsers.filter(u => u.role === 'student' && u.deptId === dept.id);
    const courses = allCourses.filter(c => c.deptId === dept.id);

    // Header info
    document.getElementById('view-dept-modal-title').innerHTML = `<i class="bi bi-building"></i> ${dept.name} (${dept.code})`;
    document.getElementById('view-dept-modal-subtitle').innerText = `Academic Branch & Departmental Roster (${dept.code})`;
    document.getElementById('view-dept-hod').innerText = dept.hod || 'To Be Appointed';
    document.getElementById('view-dept-fac-count').innerText = faculty.length;
    document.getElementById('view-dept-stud-count').innerText = students.length;
    document.getElementById('view-dept-course-count').innerText = courses.length;

    document.getElementById('pill-branch-fac-count').innerText = faculty.length;
    document.getElementById('pill-branch-stud-count').innerText = students.length;
    document.getElementById('pill-branch-course-count').innerText = courses.length;

    // Populate Faculty table
    const facTbody = document.getElementById('view-branch-faculty-tbody');
    if (faculty.length === 0) {
      facTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No faculty assigned to this department yet.</td></tr>';
    } else {
      facTbody.innerHTML = faculty.map(f => `
        <tr>
          <td><span class="badge bg-light text-dark border font-monospace">${f.facultyId || f.username}</span></td>
          <td><strong>${f.name}</strong></td>
          <td><span class="badge bg-info-subtle text-info-emphasis">${f.designation || 'Instructor'}</span></td>
          <td>${f.email}</td>
          <td>${f.phone || 'N/A'}</td>
        </tr>
      `).join('');
    }

    // Populate Students table
    const studTbody = document.getElementById('view-branch-students-tbody');
    if (students.length === 0) {
      studTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No students registered in this branch yet.</td></tr>';
    } else {
      studTbody.innerHTML = students.map(s => `
        <tr>
          <td><span class="badge bg-light text-dark border font-monospace">${s.rollNo || s.username}</span></td>
          <td><strong>${s.name}</strong></td>
          <td>Semester ${s.semester || 1}</td>
          <td>${s.email}</td>
          <td>${s.phone || 'N/A'}</td>
        </tr>
      `).join('');
    }

    // Populate Courses table
    const crsTbody = document.getElementById('view-branch-courses-tbody');
    if (courses.length === 0) {
      crsTbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No courses offered by this department yet.</td></tr>';
    } else {
      crsTbody.innerHTML = courses.map(c => {
        const teacher = allUsers.find(u => u.id === c.facultyId);
        return `
          <tr>
            <td><strong class="font-monospace">${c.code}</strong></td>
            <td>${c.name}</td>
            <td>Semester ${c.semester}</td>
            <td>${c.credits} Credits</td>
            <td>${teacher ? `<span class="text-success"><i class="bi bi-person-check"></i> ${teacher.name}</span>` : '<span class="text-danger fst-italic">Not Assigned</span>'}</td>
          </tr>
        `;
      }).join('');
    }

    document.getElementById('view-dept-footer-note').innerHTML = `
      <span class="text-muted">Showing all members belonging to branch: <strong>${dept.code}</strong></span>
    `;

    const modal = new bootstrap.Modal(document.getElementById('viewDepartmentModal'));
    modal.show();
  },

  // ==================== STUDENTS DIRECTORY ====================

  renderStudents() {
    const allStudents = DB.get('users').filter(u => u.role === 'student');
    const depts = DB.get('departments');
    const tbody = document.getElementById('admin-student-tbody');
    const titleEl = document.getElementById('admin-stud-table-title');
    const summaryEl = document.getElementById('admin-stud-filter-summary');
    if (!tbody) return;

    let filtered = allStudents;
    let selectedDeptObj = null;

    if (this.selectedStudentDept !== 'all') {
      selectedDeptObj = depts.find(d => String(d.id) === String(this.selectedStudentDept));
      if (selectedDeptObj) {
        filtered = allStudents.filter(s => String(s.deptId) === String(this.selectedStudentDept));
      }
    }

    // Update title & summary
    if (titleEl) {
      titleEl.innerHTML = selectedDeptObj
        ? `<i class="bi bi-people-fill text-primary"></i> Students of Branch: <span class="badge bg-primary fs-6">${selectedDeptObj.code}</span> (${selectedDeptObj.name})`
        : `<i class="bi bi-people-fill text-primary"></i> Student Master Directory (All Branches)`;
    }

    if (summaryEl) {
      summaryEl.innerHTML = selectedDeptObj
        ? `Showing <strong>${filtered.length}</strong> of ${allStudents.length} students &bull; <a href="javascript:void(0)" class="text-primary text-decoration-none" onclick="Admin.filterStudentsByDept('all')"><i class="bi bi-x-circle"></i> View All</a>`
        : `Showing <strong>${filtered.length}</strong> total registered students`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = selectedDeptObj
        ? `<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>No students registered in <strong>${selectedDeptObj.code}</strong> yet. Click "Register New Student" to add one!</td></tr>`
        : `<tr><td colspan="6" class="text-center text-muted py-3">No students found. Add one above!</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const dept = depts.find(d => d.id === s.deptId) || { code: 'N/A' };
      return `
        <tr>
          <td><span class="badge bg-light text-dark border font-monospace">${s.rollNo || s.username || 'N/A'}</span></td>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge bg-primary-subtle text-primary">${dept.code}</span></td>
          <td>Semester ${s.semester || 1}</td>
          <td>${s.email}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteStudent(${s.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async addStudent(event) {
    event.preventDefault();
    const name = document.getElementById('new-stud-name').value.trim();
    const rollNo = document.getElementById('new-stud-roll').value.trim().toUpperCase();
    const deptId = Number(document.getElementById('new-stud-dept').value);
    const semester = Number(document.getElementById('new-stud-sem').value);
    const email = document.getElementById('new-stud-email').value.trim();

    if (!name || !rollNo || !email) {
      alert('Please fill out all required fields.');
      return;
    }

    if (await API.checkHealth()) {
      const res = await API.addStudent({ name, rollNo, deptId, semester, email, password: '123' });
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const users = DB.get('users');
      if (users.some(u => u.username.toLowerCase() === rollNo.toLowerCase())) {
        alert('A student with this Roll Number already exists!');
        return;
      }
      users.push({
        id: DB.nextId('users'),
        username: rollNo,
        password: '123',
        role: 'student',
        name,
        rollNo,
        deptId,
        semester,
        email
      });
      DB.set('users', users);
    }

    const modalEl = document.getElementById('addStudentModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    document.getElementById('add-student-form').reset();

    App.showToast('Student Added Successfully! (Default password is 123)', 'success');
    await this.render();
  },

  async deleteStudent(id) {
    if (!confirm('Are you sure you want to remove this student? All their enrollments and attendance records will be removed.')) return;

    if (await API.checkHealth()) {
      const res = await API.deleteUser(id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let users = DB.get('users').filter(u => u.id !== id);
      DB.set('users', users);

      let enrollments = DB.get('enrollments');
      const removedEnrollIds = enrollments.filter(e => e.studentId === id).map(e => e.id);
      enrollments = enrollments.filter(e => e.studentId !== id);
      DB.set('enrollments', enrollments);

      let att = DB.get('attendance').filter(a => !removedEnrollIds.includes(a.enrollmentId));
      DB.set('attendance', att);

      let grades = DB.get('grades').filter(g => !removedEnrollIds.includes(g.enrollmentId));
      DB.set('grades', grades);
    }

    App.showToast('Student record deleted.', 'info');
    await this.render();
  },

  // ==================== FACULTY DIRECTORY ====================

  renderFaculty() {
    const allFaculty = DB.get('users').filter(u => u.role === 'faculty');
    const depts = DB.get('departments');
    const tbody = document.getElementById('admin-faculty-tbody');
    const titleEl = document.getElementById('admin-fac-table-title');
    const summaryEl = document.getElementById('admin-fac-filter-summary');
    if (!tbody) return;

    let filtered = allFaculty;
    let selectedDeptObj = null;

    if (this.selectedFacultyDept !== 'all') {
      selectedDeptObj = depts.find(d => String(d.id) === String(this.selectedFacultyDept));
      if (selectedDeptObj) {
        filtered = allFaculty.filter(f => String(f.deptId) === String(this.selectedFacultyDept));
      }
    }

    // Update title & summary
    if (titleEl) {
      titleEl.innerHTML = selectedDeptObj
        ? `<i class="bi bi-person-workspace text-primary"></i> Faculty Staff of Department: <span class="badge bg-primary fs-6">${selectedDeptObj.code}</span> (${selectedDeptObj.name})`
        : `<i class="bi bi-person-workspace text-primary"></i> Faculty Staff Directory (All Departments)`;
    }

    if (summaryEl) {
      summaryEl.innerHTML = selectedDeptObj
        ? `Showing <strong>${filtered.length}</strong> of ${allFaculty.length} faculty &bull; <a href="javascript:void(0)" class="text-primary text-decoration-none" onclick="Admin.filterFacultyByDept('all')"><i class="bi bi-x-circle"></i> View All</a>`
        : `Showing <strong>${filtered.length}</strong> total faculty staff`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = selectedDeptObj
        ? `<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>No faculty members assigned to <strong>${selectedDeptObj.code}</strong> yet. Click "Add Faculty Member" to assign one!</td></tr>`
        : `<tr><td colspan="6" class="text-center text-muted py-3">No faculty found. Add one above!</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(f => {
      const dept = depts.find(d => d.id === f.deptId) || { code: 'N/A' };
      const displayId = f.facultyId || f.username || `FAC-${f.id}`;
      return `
        <tr>
          <td>
            <span class="badge bg-primary-subtle text-primary border font-monospace fs-6">${displayId}</span>
            <div class="small text-muted mt-1">Username: <code>${f.username}</code></div>
          </td>
          <td><strong>${f.name}</strong></td>
          <td><span class="badge bg-info-subtle text-info-emphasis">${dept.code}</span></td>
          <td>${f.designation || 'Instructor'}</td>
          <td>${f.email}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteFaculty(${f.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async addFaculty(event) {
    event.preventDefault();
    const facIdInput = document.getElementById('new-fac-id');
    const facId = facIdInput ? facIdInput.value.trim().toUpperCase() : '';
    const name = document.getElementById('new-fac-name').value.trim();
    const deptId = Number(document.getElementById('new-fac-dept').value);
    const designation = document.getElementById('new-fac-desig').value.trim();
    const email = document.getElementById('new-fac-email').value.trim();
    const passInput = document.getElementById('new-fac-pass');
    const password = (passInput && passInput.value.trim()) || '123';

    if (!facId || !name || !email) {
      alert('Please fill out Faculty ID, Name, and Email.');
      return;
    }

    if (await API.checkHealth()) {
      const res = await API.addFaculty({
        facultyId: facId,
        name,
        deptId,
        designation,
        email,
        password
      });
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const users = DB.get('users');
      if (users.some(u => 
        (u.facultyId && u.facultyId.toLowerCase() === facId.toLowerCase()) || 
        (u.username && u.username.toLowerCase() === facId.toLowerCase())
      )) {
        alert(`A faculty member with ID "${facId}" already exists! Please use a unique Faculty ID.`);
        return;
      }

      users.push({
        id: DB.nextId('users'),
        facultyId: facId,
        username: facId.toLowerCase(),
        password,
        role: 'faculty',
        name,
        deptId,
        designation: designation || 'Assistant Professor',
        email
      });
      DB.set('users', users);
    }

    const modalEl = document.getElementById('addFacultyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    document.getElementById('add-faculty-form').reset();

    App.showToast(`Faculty Added! Login Username: "${facId}", Password: "${password}"`, 'success');
    await this.render();
  },

  async deleteFaculty(id) {
    if (!confirm('Remove this faculty member? Assigned courses will be unassigned.')) return;

    if (await API.checkHealth()) {
      const res = await API.deleteUser(id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let users = DB.get('users').filter(u => u.id !== id);
      DB.set('users', users);

      let courses = DB.get('courses');
      courses.forEach(c => {
        if (c.facultyId === id) c.facultyId = null;
      });
      DB.set('courses', courses);
    }

    App.showToast('Faculty member removed.', 'info');
    await this.render();
  },

  // ==================== COURSES & ALLOCATION ====================

  renderCourses() {
    const courses = DB.get('courses');
    const depts = DB.get('departments');
    const faculty = DB.get('users').filter(u => u.role === 'faculty');
    const tbody = document.getElementById('admin-course-tbody');
    if (!tbody) return;

    const facSelect = document.getElementById('alloc-fac-select');
    if (facSelect) {
      facSelect.innerHTML = '<option value="">-- Select Teacher --</option>' + 
        faculty.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    }

    if (courses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No courses found.</td></tr>';
      return;
    }

    tbody.innerHTML = courses.map(c => {
      const dept = depts.find(d => d.id === c.deptId) || { code: 'N/A' };
      const teacher = faculty.find(f => f.id === c.facultyId);
      return `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.name}</td>
          <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${dept.code}</span></td>
          <td>Sem ${c.semester}</td>
          <td>${c.credits} Credits</td>
          <td>
            ${teacher ? `<span class="text-success font-monospace"><i class="bi bi-person-check"></i> ${teacher.name}</span>` : '<span class="text-danger fst-italic"><i class="bi bi-exclamation-circle"></i> Not Assigned</span>'}
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="Admin.openAllocateModal(${c.id})">
              <i class="bi bi-person-plus"></i> Assign
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteCourse(${c.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async addCourse(event) {
    event.preventDefault();
    const code = document.getElementById('new-course-code').value.trim().toUpperCase();
    const name = document.getElementById('new-course-name').value.trim();
    const deptId = Number(document.getElementById('new-course-dept').value);
    const semester = Number(document.getElementById('new-course-sem').value);
    const credits = Number(document.getElementById('new-course-credits').value);

    if (!code || !name) {
      alert('Please fill out course code and name.');
      return;
    }

    if (await API.checkHealth()) {
      const res = await API.addCourse({ code, name, deptId, semester, credits });
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const courses = DB.get('courses');
      if (courses.some(c => c.code.toLowerCase() === code.toLowerCase())) {
        alert('A course with this code already exists!');
        return;
      }

      courses.push({
        id: DB.nextId('courses'),
        code,
        name,
        deptId,
        semester,
        credits,
        facultyId: null
      });
      DB.set('courses', courses);
    }

    const modalEl = document.getElementById('addCourseModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    document.getElementById('add-course-form').reset();

    App.showToast('Course Created Successfully!', 'success');
    await this.render();
  },

  openAllocateModal(courseId) {
    const course = DB.get('courses').find(c => c.id === courseId);
    if (!course) return;
    document.getElementById('alloc-course-id').value = course.id;
    document.getElementById('alloc-course-name-lbl').innerText = `${course.code}: ${course.name}`;
    document.getElementById('alloc-fac-select').value = course.facultyId || '';
    
    const modal = new bootstrap.Modal(document.getElementById('allocateFacultyModal'));
    modal.show();
  },

  async saveAllocation(event) {
    event.preventDefault();
    const courseId = Number(document.getElementById('alloc-course-id').value);
    const facultyId = document.getElementById('alloc-fac-select').value ? Number(document.getElementById('alloc-fac-select').value) : null;

    if (await API.checkHealth()) {
      const res = await API.assignFaculty(courseId, facultyId);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const courses = DB.get('courses');
      const course = courses.find(c => c.id === courseId);
      if (course) {
        course.facultyId = facultyId;
        DB.set('courses', courses);
      }
    }

    const modalEl = document.getElementById('allocateFacultyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    App.showToast('Faculty allocated to course!', 'success');
    await this.render();
  },

  async deleteCourse(id) {
    if (!confirm('Delete this course? Associated student enrollments will also be removed.')) return;

    if (await API.checkHealth()) {
      const res = await API.deleteCourse(id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let courses = DB.get('courses').filter(c => c.id !== id);
      DB.set('courses', courses);
      let enrollments = DB.get('enrollments').filter(e => e.courseId !== id);
      DB.set('enrollments', enrollments);
    }

    App.showToast('Course removed.', 'info');
    await this.render();
  },

  // ==================== CAMPUS NOTICES ====================

  renderNotices() {
    const notices = DB.get('notices');
    const container = document.getElementById('admin-notice-list');
    if (!container) return;

    if (notices.length === 0) {
      container.innerHTML = '<p class="text-muted text-center py-3">No announcements published.</p>';
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="notice-card ${n.target === 'students' ? 'urgent' : ''}">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="mb-1 font-semibold text-primary">${n.title}</h6>
          <div>
            <span class="badge bg-secondary text-uppercase" style="font-size:0.7rem;">${n.target}</span>
            <button class="btn btn-sm btn-link text-danger p-0 ms-2" onclick="Admin.deleteNotice(${n.id})">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <p class="mb-1 text-muted text-sm">${n.content}</p>
        <div class="text-xs text-secondary mt-1">
          <i class="bi bi-clock"></i> Posted on ${n.date} by <strong>${n.postedBy}</strong>
        </div>
      </div>
    `).join('');
  },

  async addNotice(event) {
    event.preventDefault();
    const title = document.getElementById('new-notice-title').value.trim();
    const target = document.getElementById('new-notice-target').value;
    const content = document.getElementById('new-notice-content').value.trim();

    if (!title || !content) {
      alert('Please enter title and content.');
      return;
    }

    const postedBy = (Auth.getCurrentUser() && Auth.getCurrentUser().name) || 'Admin';

    if (await API.checkHealth()) {
      const res = await API.addNotice({ title, target, content, postedBy });
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      const notices = DB.get('notices');
      notices.unshift({
        id: DB.nextId('notices'),
        title,
        target,
        content,
        postedBy,
        date: new Date().toISOString().split('T')[0]
      });
      DB.set('notices', notices);
    }

    document.getElementById('new-notice-title').value = '';
    document.getElementById('new-notice-content').value = '';
    App.showToast('Notice published to portal!', 'success');
    await this.render();
  },

  async deleteNotice(id) {
    if (await API.checkHealth()) {
      await API.deleteNotice(id);
      await DB.syncFromBackend();
    } else {
      let notices = DB.get('notices').filter(n => n.id !== id);
      DB.set('notices', notices);
    }
    App.showToast('Notice deleted.', 'info');
    await this.render();
  }
};
