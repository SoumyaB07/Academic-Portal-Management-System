// Academic Portal Management System - Student Module

const Student = {
  async render() {
    try {
      if (typeof API !== 'undefined' && API.isBackendAvailable) {
        await DB.syncFromBackend();
      }
    } catch (e) {
      console.warn('Student sync error:', e);
    }
    const user = Auth.getCurrentUser();
    if (!user) return;

    this.renderHeaderAndKPIs(user);
    this.renderRegistration(user);
    this.renderAttendance(user);
    this.renderResults(user);
    this.renderNotices();
  },

  renderHeaderAndKPIs(user) {
    const enrollments = DB.get('enrollments').filter(e => e.studentId === user.id);
    const allCourses = DB.get('courses');
    const myCourses = allCourses.filter(c => enrollments.some(e => e.courseId === c.id));

    const totalCredits = myCourses.reduce((acc, c) => acc + (c.credits || 0), 0);

    // Compute overall attendance across all enrolled courses
    let totalClasses = 0;
    let attendedClasses = 0;
    enrollments.forEach(e => {
      const stats = DB.getAttendanceStats(e.id);
      totalClasses += stats.total;
      attendedClasses += stats.attended;
    });

    const overallAttPct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
    const isOverallLow = totalClasses > 0 && overallAttPct < 75;

    // Compute SGPA
    const allGrades = DB.get('grades');
    let totalGradePoints = 0;
    let gradedCredits = 0;

    enrollments.forEach(e => {
      const course = allCourses.find(c => c.id === e.courseId);
      const grade = allGrades.find(g => g.enrollmentId === e.id);
      if (course && grade && grade.total > 0) {
        totalGradePoints += (grade.gpa * course.credits);
        gradedCredits += course.credits;
      }
    });

    const currentSGPA = gradedCredits > 0 ? (totalGradePoints / gradedCredits).toFixed(2) : '0.00';

    // Update KPI UI
    const elCourses = document.getElementById('stat-stud-courses');
    const elCredits = document.getElementById('stat-stud-credits');
    const elAtt = document.getElementById('stat-stud-att');
    const elGpa = document.getElementById('stat-stud-gpa');
    const alertBanner = document.getElementById('stud-low-att-alert');

    if (elCourses) elCourses.innerText = myCourses.length;
    if (elCredits) elCredits.innerText = totalCredits;
    if (elAtt) {
      elAtt.innerText = `${overallAttPct}%`;
      elAtt.className = isOverallLow ? 'text-danger fw-bold' : 'text-success fw-bold';
    }
    if (elGpa) elGpa.innerText = currentSGPA;

    if (alertBanner) {
      if (isOverallLow) {
        alertBanner.classList.remove('d-none');
        alertBanner.innerHTML = `
          <div class="alert alert-danger d-flex align-items-center mb-4 shadow-sm" role="alert">
            <i class="bi bi-exclamation-octagon-fill fs-4 me-3"></i>
            <div>
              <strong>Attendance Warning:</strong> Your overall attendance is <strong>${overallAttPct}%</strong>, which is below the mandatory <strong>75%</strong> requirement. Please consult your instructors immediately.
            </div>
          </div>
        `;
      } else {
        alertBanner.classList.add('d-none');
      }
    }
  },

  renderRegistration(user) {
    const tbody = document.getElementById('stud-reg-tbody');
    if (!tbody) return;

    const allCourses = DB.get('courses');
    const depts = DB.get('departments');
    const faculty = DB.get('users').filter(u => u.role === 'faculty');
    const enrollments = DB.get('enrollments');
    const myEnrollments = enrollments.filter(e => e.studentId === user.id);

    const availableCourses = allCourses.filter(c => c.deptId === user.deptId || c.semester === user.semester);

    if (availableCourses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No courses available for registration.</td></tr>';
      return;
    }

    tbody.innerHTML = availableCourses.map(c => {
      const dept = depts.find(d => d.id === c.deptId) || { code: 'N/A' };
      const teacher = faculty.find(f => f.id === c.facultyId) || { name: 'To Be Announced' };
      const isEnrolled = myEnrollments.some(e => e.courseId === c.id);

      return `
        <tr>
          <td><strong class="font-monospace">${c.code}</strong></td>
          <td>${c.name}</td>
          <td><span class="badge bg-light text-dark border">${dept.code}</span></td>
          <td>Semester ${c.semester}</td>
          <td>${c.credits} Credits</td>
          <td><small class="text-secondary"><i class="bi bi-person"></i> ${teacher.name}</small></td>
          <td class="text-end">
            ${isEnrolled ? `
              <span class="badge bg-success-subtle text-success me-2"><i class="bi bi-check2"></i> Enrolled</span>
              <button class="btn btn-sm btn-outline-danger" onclick="Student.dropCourse(${c.id})">
                <i class="bi bi-x-circle"></i> Drop
              </button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="Student.enrollCourse(${c.id})">
                <i class="bi bi-plus-circle"></i> Enroll
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  async enrollCourse(courseId) {
    const user = Auth.getCurrentUser();
    const course = DB.get('courses').find(c => c.id === courseId);
    if (!course) return;

    if (await API.checkHealth()) {
      const res = await API.enrollCourse(user.id, course.id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let enrollments = DB.get('enrollments');
      const myCourseIds = enrollments.filter(e => e.studentId === user.id).map(e => e.courseId);
      const myCourses = DB.get('courses').filter(c => myCourseIds.includes(c.id));
      const currentCredits = myCourses.reduce((acc, c) => acc + c.credits, 0);

      if (currentCredits + course.credits > 24) {
        alert(`Cannot enroll: Maximum semester limit is 24 credits! (Current: ${currentCredits}, Attempting: +${course.credits})`);
        return;
      }

      enrollments.push({
        id: DB.nextId('enrollments'),
        studentId: user.id,
        courseId: course.id,
        date: new Date().toISOString().split('T')[0],
        status: 'Enrolled'
      });
      DB.set('enrollments', enrollments);
    }

    App.showToast(`Successfully enrolled in ${course.code}: ${course.name}!`, 'success');
    await this.render();
  },

  async dropCourse(courseId) {
    const user = Auth.getCurrentUser();
    if (!confirm('Are you sure you want to drop this course? Associated attendance and marks will be cleared.')) return;

    const enrollments = DB.get('enrollments');
    const toDrop = enrollments.find(e => e.studentId === user.id && e.courseId === courseId);
    if (!toDrop) return;

    if (await API.checkHealth()) {
      const res = await API.dropCourse(toDrop.id);
      if (!res.success) {
        alert(res.message);
        return;
      }
      await DB.syncFromBackend();
    } else {
      let updatedEnrollments = enrollments.filter(e => e.id !== toDrop.id);
      DB.set('enrollments', updatedEnrollments);

      let att = DB.get('attendance').filter(a => a.enrollmentId !== toDrop.id);
      DB.set('attendance', att);

      let grades = DB.get('grades').filter(g => g.enrollmentId !== toDrop.id);
      DB.set('grades', grades);
    }

    App.showToast('Course dropped successfully.', 'info');
    await this.render();
  },

  renderAttendance(user) {
    const tbody = document.getElementById('stud-att-tbody');
    if (!tbody) return;

    const enrollments = DB.get('enrollments').filter(e => e.studentId === user.id);
    const allCourses = DB.get('courses');
    const faculty = DB.get('users').filter(u => u.role === 'faculty');

    if (enrollments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">You are not enrolled in any courses.</td></tr>';
      return;
    }

    tbody.innerHTML = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.courseId) || { code: 'N/A', name: 'N/A', facultyId: null };
      const teacher = faculty.find(f => f.id === course.facultyId) || { name: 'To Be Announced' };
      const stats = DB.getAttendanceStats(e.id);

      return `
        <tr>
          <td><strong class="font-monospace">${course.code}</strong></td>
          <td>${course.name}</td>
          <td><small class="text-secondary"><i class="bi bi-person"></i> ${teacher.name}</small></td>
          <td><span class="font-monospace">${stats.attended} / ${stats.total}</span> Classes</td>
          <td style="min-width: 180px;">
            <div class="d-flex align-items-center gap-2">
              <div class="progress flex-grow-1 progress-att">
                <div class="progress-bar ${stats.isLow ? 'bg-danger' : 'bg-success'}" style="width: ${stats.percentage}%"></div>
              </div>
              <strong class="font-monospace ${stats.isLow ? 'text-danger' : 'text-success'}">${stats.percentage}%</strong>
            </div>
          </td>
          <td>
            ${stats.isLow ? '<span class="badge-low-attendance"><i class="bi bi-exclamation-triangle"></i> &lt; 75% Warning</span>' : '<span class="badge-good-attendance"><i class="bi bi-check-circle"></i> Eligible</span>'}
          </td>
        </tr>
      `;
    }).join('');
  },

  renderResults(user) {
    const tbody = document.getElementById('stud-results-tbody');
    if (!tbody) return;

    const enrollments = DB.get('enrollments').filter(e => e.studentId === user.id);
    const allCourses = DB.get('courses');
    const allGrades = DB.get('grades');

    // Header info on report card
    const nameEl = document.getElementById('report-student-name');
    const rollEl = document.getElementById('report-student-roll');
    const semEl = document.getElementById('report-student-sem');
    if (nameEl) nameEl.innerText = user.name;
    if (rollEl) rollEl.innerText = user.rollNo || user.username || 'N/A';
    if (semEl) semEl.innerText = `Semester ${user.semester || 5}`;

    if (enrollments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">No results published yet.</td></tr>';
      return;
    }

    let totalPoints = 0;
    let totalCredits = 0;
    let hasFailed = false;

    tbody.innerHTML = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.courseId) || { code: 'N/A', name: 'N/A', credits: 0 };
      const grade = allGrades.find(g => g.enrollmentId === e.id) || { internal: 0, midterm: 0, finalExam: 0, total: 0, grade: 'Pending', gpa: 0 };

      if (grade.grade === 'F') hasFailed = true;
      if (grade.total > 0) {
        totalPoints += (grade.gpa * course.credits);
        totalCredits += course.credits;
      }

      return `
        <tr>
          <td><strong class="font-monospace">${course.code}</strong></td>
          <td>${course.name}</td>
          <td>${course.credits}</td>
          <td class="text-center font-monospace">${grade.internal} / 30</td>
          <td class="text-center font-monospace">${grade.midterm} / 20</td>
          <td class="text-center font-monospace">${grade.finalExam} / 50</td>
          <td class="text-center font-monospace fw-bold">${grade.total} / 100</td>
          <td class="text-center">
            <span class="badge ${grade.grade === 'F' ? 'bg-danger' : (grade.grade === 'Pending' ? 'bg-secondary' : 'bg-success')}">
              ${grade.grade}
            </span>
          </td>
          <td class="text-center font-monospace">${grade.gpa.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    const reportSgpa = document.getElementById('report-final-sgpa');
    const reportCredits = document.getElementById('report-final-credits');
    const reportStatus = document.getElementById('report-final-status');

    if (reportSgpa) reportSgpa.innerText = sgpa;
    if (reportCredits) reportCredits.innerText = totalCredits;
    if (reportStatus) {
      if (hasFailed) {
        reportStatus.innerHTML = '<span class="text-danger fw-bold"><i class="bi bi-x-circle"></i> REAPPEAR / ARREAR</span>';
      } else if (Number(sgpa) >= 8.5) {
        reportStatus.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-award"></i> FIRST CLASS WITH DISTINCTION</span>';
      } else if (Number(sgpa) >= 6.5) {
        reportStatus.innerHTML = '<span class="text-primary fw-bold"><i class="bi bi-check-circle"></i> FIRST CLASS</span>';
      } else {
        reportStatus.innerHTML = '<span class="text-secondary fw-bold">PASS</span>';
      }
    }
  },

  renderNotices() {
    const notices = DB.get('notices').filter(n => n.target === 'all' || n.target === 'students');
    const container = document.getElementById('stud-notice-list');
    if (!container) return;

    if (notices.length === 0) {
      container.innerHTML = '<p class="text-muted text-center py-3">No announcements for students.</p>';
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="notice-card ${n.target === 'students' ? 'urgent' : ''}">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="mb-1 font-semibold text-primary">${n.title}</h6>
          <span class="badge bg-secondary text-uppercase" style="font-size:0.7rem;">${n.target}</span>
        </div>
        <p class="mb-1 text-muted text-sm">${n.content}</p>
        <div class="text-xs text-secondary mt-1">
          <i class="bi bi-clock"></i> Posted on ${n.date} by <strong>${n.postedBy}</strong>
        </div>
      </div>
    `).join('');
  }
};
