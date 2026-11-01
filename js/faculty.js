// Academic Portal Management System - Faculty / Instructor Module

const Faculty = {
  activeCourseId: null,

  async render() {
    try {
      if (typeof API !== 'undefined' && API.isBackendAvailable) {
        await DB.syncFromBackend();
      }
    } catch (e) {
      console.warn('Faculty sync error:', e);
    }
    const user = Auth.getCurrentUser();
    if (!user) return;

    const allCourses = DB.get('courses');
    const myCourses = allCourses.filter(c => c.facultyId === user.id);

    // Render Stats
    const enrollments = DB.get('enrollments');
    const myCourseIds = myCourses.map(c => c.id);
    const myEnrollments = enrollments.filter(e => myCourseIds.includes(e.courseId));

    const statCourses = document.getElementById('stat-fac-courses');
    const statStudents = document.getElementById('stat-fac-students');
    if (statCourses) statCourses.innerText = myCourses.length;
    if (statStudents) statStudents.innerText = myEnrollments.length;

    // Course selector
    const selectEl = document.getElementById('faculty-course-select');
    if (selectEl) {
      if (myCourses.length === 0) {
        selectEl.innerHTML = '<option value="">No Courses Assigned by Administrator</option>';
        this.renderEmpty();
        return;
      }

      selectEl.innerHTML = myCourses.map(c => 
        `<option value="${c.id}" ${c.id === this.activeCourseId ? 'selected' : ''}>${c.code}: ${c.name} (${c.credits} Credits)</option>`
      ).join('');

      if (!this.activeCourseId || !myCourses.some(c => c.id === this.activeCourseId)) {
        this.activeCourseId = myCourses[0].id;
      }
      selectEl.value = this.activeCourseId;
    }

    // Set today date for attendance if empty
    const dateInput = document.getElementById('att-lecture-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    this.renderCourseData();
  },

  onCourseChange() {
    const selectEl = document.getElementById('faculty-course-select');
    this.activeCourseId = Number(selectEl.value);
    this.renderCourseData();
  },

  renderEmpty() {
    const rTbody = document.getElementById('fac-roster-tbody');
    const aTbody = document.getElementById('fac-attendance-tbody');
    const gTbody = document.getElementById('fac-gradebook-tbody');
    const msg = '<tr><td colspan="7" class="text-center text-muted py-4">No assigned courses found. Contact Administrator to allocate subjects.</td></tr>';
    if (rTbody) rTbody.innerHTML = msg;
    if (aTbody) aTbody.innerHTML = msg;
    if (gTbody) gTbody.innerHTML = msg;
  },

  renderCourseData() {
    if (!this.activeCourseId) return;
    this.renderRoster();
    this.renderAttendanceSheet();
    this.renderGradebook();
  },

  getCourseStudents() {
    const enrollments = DB.get('enrollments').filter(e => e.courseId === this.activeCourseId);
    const users = DB.get('users');
    return enrollments.map(e => {
      const student = users.find(u => u.id === e.studentId) || { name: 'Unknown', rollNo: 'N/A', email: '' };
      const stats = DB.getAttendanceStats(e.id);
      return {
        enrollmentId: e.id,
        studentId: e.studentId,
        name: student.name,
        rollNo: student.rollNo || student.username,
        email: student.email,
        stats
      };
    });
  },

  renderRoster() {
    const tbody = document.getElementById('fac-roster-tbody');
    if (!tbody) return;

    const list = this.getCourseStudents();
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No students enrolled in this course yet.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td><span class="badge bg-light text-dark border font-monospace">${s.rollNo}</span></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.email}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="progress flex-grow-1 progress-att">
              <div class="progress-bar ${s.stats.isLow ? 'bg-danger' : 'bg-success'}" style="width: ${s.stats.percentage}%"></div>
            </div>
            <span class="small font-monospace">${s.stats.percentage}%</span>
          </div>
        </td>
        <td>
          ${s.stats.isLow ? '<span class="badge-low-attendance"><i class="bi bi-exclamation-triangle"></i> &lt; 75% Shortage</span>' : '<span class="badge-good-attendance"><i class="bi bi-check-circle"></i> Good</span>'}
        </td>
      </tr>
    `).join('');
  },

  renderAttendanceSheet() {
    const tbody = document.getElementById('fac-attendance-tbody');
    if (!tbody) return;

    const list = this.getCourseStudents();
    const dateInput = document.getElementById('att-lecture-date');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
    const allAttendance = DB.get('attendance');

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No enrolled students to mark attendance.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((s) => {
      const existing = allAttendance.find(a => a.enrollmentId === s.enrollmentId && a.date === selectedDate);
      const isPresent = existing ? existing.status === 'Present' : true;

      return `
        <tr>
          <td><span class="badge bg-light text-dark border font-monospace">${s.rollNo}</span></td>
          <td><strong>${s.name}</strong></td>
          <td>
            <span class="${s.stats.isLow ? 'text-danger fw-bold' : 'text-success'} font-monospace">
              ${s.stats.attended} / ${s.stats.total} (${s.stats.percentage}%)
            </span>
          </td>
          <td>
            <div class="btn-group" role="group">
              <input type="radio" class="btn-check" name="att_status_${s.enrollmentId}" id="p_${s.enrollmentId}" value="Present" ${isPresent ? 'checked' : ''}>
              <label class="btn btn-sm btn-outline-success px-3" for="p_${s.enrollmentId}"><i class="bi bi-check"></i> Present</label>

              <input type="radio" class="btn-check" name="att_status_${s.enrollmentId}" id="a_${s.enrollmentId}" value="Absent" ${!isPresent ? 'checked' : ''}>
              <label class="btn btn-sm btn-outline-danger px-3" for="a_${s.enrollmentId}"><i class="bi bi-x"></i> Absent</label>
            </div>
          </td>
          <td>
            ${s.stats.isLow ? '<span class="text-danger small"><i class="bi bi-bell-fill"></i> Low Attendance</span>' : '<span class="text-muted small">Normal</span>'}
          </td>
        </tr>
      `;
    }).join('');
  },

  markAll(status) {
    const list = this.getCourseStudents();
    list.forEach(s => {
      const radio = document.querySelector(`input[name="att_status_${s.enrollmentId}"][value="${status}"]`);
      if (radio) radio.checked = true;
    });
    App.showToast(`Marked all students as ${status}. Click 'Save Attendance' to confirm.`, 'info');
  },

  async saveAttendance() {
    const list = this.getCourseStudents();
    const dateInput = document.getElementById('att-lecture-date');
    const selectedDate = dateInput ? dateInput.value : '';

    if (!selectedDate) {
      alert('Please select a valid date for attendance.');
      return;
    }

    const records = list.map(s => {
      const selectedRadio = document.querySelector(`input[name="att_status_${s.enrollmentId}"]:checked`);
      const status = selectedRadio ? selectedRadio.value : 'Present';
      return { enrollmentId: s.enrollmentId, status };
    });

    if (await API.checkHealth()) {
      const res = await API.saveAttendance(selectedDate, records);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let allAttendance = DB.get('attendance');
      records.forEach(r => {
        const existingIdx = allAttendance.findIndex(a => a.enrollmentId === r.enrollmentId && a.date === selectedDate);
        if (existingIdx >= 0) {
          allAttendance[existingIdx].status = r.status;
        } else {
          allAttendance.push({
            id: DB.nextId('attendance'),
            enrollmentId: r.enrollmentId,
            date: selectedDate,
            status: r.status
          });
        }
      });
      DB.set('attendance', allAttendance);
    }

    App.showToast(`Attendance for ${selectedDate} saved successfully!`, 'success');
    await this.render();
  },

  renderGradebook() {
    const tbody = document.getElementById('fac-gradebook-tbody');
    if (!tbody) return;

    const list = this.getCourseStudents();
    const allGrades = DB.get('grades');

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No students found.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(s => {
      const grade = allGrades.find(g => g.enrollmentId === s.enrollmentId) || { internal: 0, midterm: 0, finalExam: 0, total: 0, grade: 'F', gpa: 0 };

      return `
        <tr id="grade-row-${s.enrollmentId}">
          <td><span class="badge bg-light text-dark border font-monospace">${s.rollNo}</span></td>
          <td><strong>${s.name}</strong></td>
          <td style="max-width: 90px;">
            <input type="number" min="0" max="30" class="form-control form-control-sm text-center" 
                   id="int_${s.enrollmentId}" value="${grade.internal}" 
                   oninput="Faculty.updateRowGrade(${s.enrollmentId})">
          </td>
          <td style="max-width: 90px;">
            <input type="number" min="0" max="20" class="form-control form-control-sm text-center" 
                   id="mid_${s.enrollmentId}" value="${grade.midterm}" 
                   oninput="Faculty.updateRowGrade(${s.enrollmentId})">
          </td>
          <td style="max-width: 90px;">
            <input type="number" min="0" max="50" class="form-control form-control-sm text-center" 
                   id="fin_${s.enrollmentId}" value="${grade.finalExam}" 
                   oninput="Faculty.updateRowGrade(${s.enrollmentId})">
          </td>
          <td class="text-center">
            <strong id="tot_${s.enrollmentId}">${grade.total}</strong> / 100
          </td>
          <td class="text-center">
            <span class="badge ${grade.grade === 'F' ? 'bg-danger' : 'bg-success'}" id="grd_${s.enrollmentId}">
              ${grade.grade}
            </span>
          </td>
          <td class="text-center font-monospace" id="gpa_${s.enrollmentId}">
            ${grade.gpa.toFixed(1)}
          </td>
        </tr>
      `;
    }).join('');
  },

  updateRowGrade(enrollmentId) {
    const internal = Number(document.getElementById(`int_${enrollmentId}`).value) || 0;
    const midterm = Number(document.getElementById(`mid_${enrollmentId}`).value) || 0;
    const finalExam = Number(document.getElementById(`fin_${enrollmentId}`).value) || 0;

    const res = DB.calculateGrade(internal, midterm, finalExam);
    document.getElementById(`tot_${enrollmentId}`).innerText = res.total;
    const badge = document.getElementById(`grd_${enrollmentId}`);
    badge.innerText = res.grade;
    badge.className = `badge ${res.grade === 'F' ? 'bg-danger' : 'bg-success'}`;
    document.getElementById(`gpa_${enrollmentId}`).innerText = res.gpa.toFixed(1);
  },

  async saveAllGrades() {
    const list = this.getCourseStudents();
    const records = list.map(s => {
      const internal = Number(document.getElementById(`int_${s.enrollmentId}`).value) || 0;
      const midterm = Number(document.getElementById(`mid_${s.enrollmentId}`).value) || 0;
      const finalExam = Number(document.getElementById(`fin_${s.enrollmentId}`).value) || 0;
      return { enrollmentId: s.enrollmentId, internal, midterm, finalExam };
    });

    if (await API.checkHealth()) {
      const res = await API.saveGrades(records);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let allGrades = DB.get('grades');
      records.forEach(r => {
        const res = DB.calculateGrade(r.internal, r.midterm, r.finalExam);
        const existingIdx = allGrades.findIndex(g => g.enrollmentId === r.enrollmentId);
        if (existingIdx >= 0) {
          allGrades[existingIdx] = { ...allGrades[existingIdx], ...r, ...res };
        } else {
          allGrades.push({
            id: DB.nextId('grades'),
            ...r,
            ...res
          });
        }
      });
      DB.set('grades', allGrades);
    }

    App.showToast('All examination marks and grades saved successfully!', 'success');
    await this.render();
  }
};
