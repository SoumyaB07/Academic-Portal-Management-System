// Academic Portal Management System - Authentication & Session Management

const AUTH_KEY = 'APMS_CURRENT_USER';

const Auth = {
  getCurrentUser() {
    const u = sessionStorage.getItem(AUTH_KEY);
    return u ? JSON.parse(u) : null;
  },

  setCurrentUser(user) {
    if (user) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
  },

  async login(credential, password) {
    if (!credential || !password) {
      return { success: false, message: 'Please enter both your Username/ID and password.' };
    }

    const cleanInputPass = String(password).trim();

    // Try live Node.js backend first if available
    try {
      const isOnline = (typeof API !== 'undefined') && (await API.checkHealth());
      if (isOnline) {
        const res = await API.login(credential, password);
        if (res && res.success && res.user) {
          this.setCurrentUser(res.user);
          return { success: true, user: res.user, isBackend: true };
        }
        if (res && res.message && !res.message.includes('Could not connect')) {
          return { success: false, message: res.message };
        }
      }
    } catch (err) {
      console.warn('Backend login attempt encountered an issue, falling back to local database:', err);
    }

    // Fallback: LocalStorage database (standalone or offline mode)
    const cleanTerm = credential.trim().toLowerCase();
    const users = DB.get('users');

    const user = users.find(u => {
      const matchUsername = u.username && u.username.toLowerCase() === cleanTerm;
      const matchFacultyId = u.facultyId && u.facultyId.toLowerCase() === cleanTerm;
      const matchRollNo = u.rollNo && u.rollNo.toLowerCase() === cleanTerm;
      const matchEmail = u.email && u.email.toLowerCase() === cleanTerm;
      const matchFormattedFacId = (u.role === 'faculty' && (`fac-${u.id}` === cleanTerm || `fac00${u.id}` === cleanTerm));

      const isMatch = matchUsername || matchFacultyId || matchRollNo || matchEmail || matchFormattedFacId;
      const expectedPass = String(u.password || '123').trim();
      return isMatch && (expectedPass === cleanInputPass);
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid login credentials! You can log in using your Faculty ID, Username, or Email (Default password: 123).'
      };
    }

    this.setCurrentUser(user);
    return { success: true, user, isBackend: false };
  },

  async quickLogin(username) {
    return await this.login(username, '123');
  },

  logout() {
    this.setCurrentUser(null);
    window.location.reload();
  }
};
