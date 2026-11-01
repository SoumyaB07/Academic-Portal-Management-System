// Academic Portal Management System - Main Application Orchestrator

const App = {
  init() {
    this.bindEvents();
    this.checkSession();
    this.updateDbStatusBadge();
  },

  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        try {
          const res = await Auth.login(u, p);
          if (res && res.success) {
            const backendBadge = res.isBackend ? ' (Backend Online)' : ' (Offline Mode)';
            this.showToast(`Welcome back, ${res.user.name}!${backendBadge}`, 'success');
            this.checkSession();
          } else {
            this.showToast((res && res.message) || 'Invalid login credentials', 'danger');
          }
        } catch (err) {
          console.error('Login submit error:', err);
          this.showToast('Login error occurred. Please try again.', 'danger');
        }
      });
    }

    // Demo Buttons
    document.querySelectorAll('.btn-demo-login').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const role = e.currentTarget.getAttribute('data-role');
        const usernameMap = {
          'admin': 'admin',
          'faculty': 'faculty1',
          'student': 'student1'
        };
        const u = usernameMap[role];
        try {
          const res = await Auth.quickLogin(u);
          if (res && res.success) {
            const backendBadge = res.isBackend ? ' (Backend Online)' : ' (Offline Mode)';
            this.showToast(`Logged in as Demo ${role.toUpperCase()}: ${res.user.name}${backendBadge}`, 'success');
            this.checkSession();
          } else {
            this.showToast((res && res.message) || `Demo login for ${role} failed`, 'danger');
          }
        } catch (err) {
          console.error('Demo login error:', err);
          this.showToast('Demo login error. Please check console.', 'danger');
        }
      });
    });

    // Logout Button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
      });
    }

    // Reset Demo Data Button
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Reset entire portal to default sample data? All newly added students/marks will be restored to default.')) {
          if (await API.checkHealth()) {
            await API.resetDemo();
          }
          DB.resetDemoData();
          this.showToast('Portal reset to initial demo data!', 'info');
          this.checkSession();
        }
      });
    }
  },

  checkSession() {
    const user = Auth.getCurrentUser();
    const authSec = document.getElementById('auth-section');
    const adminSec = document.getElementById('admin-section');
    const facSec = document.getElementById('faculty-section');
    const studSec = document.getElementById('student-section');
    const navUserArea = document.getElementById('nav-user-area');
    const navUserName = document.getElementById('nav-user-name');
    const navUserRole = document.getElementById('nav-user-role');

    // Hide all main sections
    [authSec, adminSec, facSec, studSec].forEach(el => {
      if (el) el.classList.add('d-none');
    });

    if (!user) {
      // Show login
      if (authSec) authSec.classList.remove('d-none');
      if (navUserArea) navUserArea.classList.add('d-none');
      return;
    }

    // User is logged in
    if (navUserArea) navUserArea.classList.remove('d-none');
    if (navUserName) navUserName.innerText = user.name;
    if (navUserRole) {
      navUserRole.innerText = user.role.toUpperCase();
      const roleColorMap = {
        'admin': 'bg-warning text-dark',
        'faculty': 'bg-info text-dark',
        'student': 'bg-success text-white'
      };
      navUserRole.className = `badge ${roleColorMap[user.role] || 'bg-secondary'}`;
    }

    // Show appropriate dashboard
    if (user.role === 'admin') {
      if (adminSec) adminSec.classList.remove('d-none');
      Admin.render();
    } else if (user.role === 'faculty') {
      if (facSec) facSec.classList.remove('d-none');
      Faculty.render();
    } else if (user.role === 'student') {
      if (studSec) studSec.classList.remove('d-none');
      Student.render();
    }
  },

  async updateDbStatusBadge() {
    const badge = document.getElementById('nav-db-badge');
    if (!badge) return;
    try {
      const isOnline = typeof API !== 'undefined' && (await API.checkHealth());
      if (isOnline) {
        if (API.isMySQL) {
          badge.className = 'badge bg-success text-white small ms-2';
          badge.innerHTML = '<i class="bi bi-database-check"></i> MySQL (Online)';
          badge.title = 'Active Database: MySQL (academic_portal_db)';
        } else {
          badge.className = 'badge bg-warning text-dark small ms-2';
          badge.innerHTML = '<i class="bi bi-database"></i> JSON Mode (Online)';
          badge.title = 'Active Database: JSON Storage. Set MySQL password in backend/.env to connect MySQL';
        }
      } else {
        badge.className = 'badge bg-secondary text-white small ms-2';
        badge.innerHTML = '<i class="bi bi-hdd"></i> Offline (LocalStorage)';
        badge.title = 'Backend server offline: running in browser standalone mode';
      }
    } catch (e) {
      badge.className = 'badge bg-secondary text-white small ms-2';
      badge.innerHTML = '<i class="bi bi-hdd"></i> Offline';
    }
  },

  showToast(message, type = 'primary') {
    const toastEl = document.getElementById('app-toast');
    const toastBody = document.getElementById('app-toast-body');
    if (!toastEl || !toastBody) return;

    toastBody.innerText = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
