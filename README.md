# Academic Portal Management System (APMS)
**Full-Stack Software Engineering Lab Project**  
*Built with HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Node.js + Express.js REST API Backend, and MySQL Relational Database (with zero-crash fallback)*

---

## 🚀 How to Run the Project

### Method 1: Full-Stack Mode with Live Backend (Recommended 🌟)

1. **Start the Portal with 1 Click:**
   - Double-click **`start-portal.bat`** in the project folder.
   - It boots the Express server and automatically opens `http://localhost:5000` in your web browser.

2. **Database Engine (MySQL & Hybrid Fallback):**
   - The backend includes **MySQL integration** using `mysql2`.
   - **To connect to MySQL:** Open `backend/.env` and enter your MySQL root password:
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=academic_portal_db
     ```
   - When the backend starts with valid credentials, it **automatically creates `academic_portal_db`**, executes `backend/schema.sql` (creating all relational tables with foreign keys), and populates initial seed records!
   - **Zero-Crash Resilience:** If MySQL is not running or the password hasn't been set yet, the server gracefully falls back to local JSON storage mode, ensuring the portal stays 100% operational during evaluations!

---

### Method 2: Standalone Client Mode (Offline Fallback)
Simply double-click **`index.html`** in your browser (`file:///`).  
If the backend is not running, the portal seamlessly uses browser `localStorage` so it never crashes!

---

## 🗄️ MySQL Database Schema (`backend/schema.sql`)

The system follows a normalized Relational Database Model with Foreign Keys and Cascading Constraints:

1. **`departments`**: `id` (PK), `code` (Unique), `name`, `hod`
2. **`users`**: `id` (PK), `username` (Unique), `password`, `role` (ENUM: admin/faculty/student), `name`, `email` (Unique), `dept_id` (FK -> departments), `faculty_id`, `designation`, `roll_no`, `semester`, `phone`
3. **`courses`**: `id` (PK), `code` (Unique), `name`, `dept_id` (FK -> departments), `semester`, `credits`, `faculty_id` (FK -> users)
4. **`enrollments`**: `id` (PK), `student_id` (FK -> users), `course_id` (FK -> courses), `enroll_date`, `status`
5. **`attendance`**: `id` (PK), `enrollment_id` (FK -> enrollments), `session_date`, `status` (Present/Absent)
6. **`grades`**: `id` (PK), `enrollment_id` (FK -> enrollments), `internal`, `midterm`, `final_exam`, `total`, `grade`, `gpa`
7. **`notices`**: `id` (PK), `title`, `content`, `target` (ENUM: all/students/faculty), `posted_by`, `post_date`

---

## 🧪 Software Testing & Quality Assurance (IEEE 829 Standard)

The project includes an **official Software Testing Specification & Quality Assurance Report**:
* 📄 **Full Test Documentation:** See [TESTING.md](TESTING.md) and [docs/TESTING_DOCUMENTATION.md](docs/TESTING_DOCUMENTATION.md)
* 🎯 **Test Coverage:**
  * **Boundary Value Analysis (BVA):** Mandatory 75% attendance rule ($74\%$, $75\%$, $76\%$), Continuous Internal Evaluation ($0$ to $100$ grade scale), and 24-credit ceiling.
  * **Unit Testing:** Mathematical functions (`calculateGrade`, `getAttendanceStats`), multi-identifier authentication, and input normalization.
  * **Integration Testing:** End-to-end data flow between Frontend UI, Express.js REST APIs, and MySQL 8.0 relational tables.
  * **Equivalence Class Partitioning (ECP)** & **Requirements Traceability Matrix (RTM)**.

### Run Automated Test Suite:
To execute all 36 Unit, BVA, and Integration tests in terminal:
```powershell
cd backend
npm test
```

---

## 🔑 Demo Login Credentials (Password for all: `123`)

| Role | Username / Faculty ID / Roll No | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator / HOD** | `admin` | `123` | Full access to manage departments, students, faculty, courses, allocations, notices |
| **Faculty / Instructor** | `faculty1` or `FAC101` | `123` | Mark attendance, enter assessment marks, view roster |
| **Student** | `student1` or `21CS001` | `123` | Course registration, attendance tracker (<75% alert), grade card & GPA |

> **Viva Tip:** 
> - You can log in using **any** identifier: **Faculty ID / Employee ID**, **Username**, **Email**, or **Student Roll Number** with password `123`.
> - Click the quick **Demo Login buttons** on the login screen (`Admin`, `Faculty`, `Student`) for 1-click viva demonstrations!
> - The top navigation bar features a live **Database Status Badge** (`MySQL (Online)` or `JSON Mode`) so examiners can see active database connectivity in real time.

---

## 📡 REST API Endpoints (Node.js + Express)

| Module | Method & Route | Description |
| :--- | :--- | :--- |
| **Health** | `GET /api/health` | Server heartbeat & status |
| **Auth** | `POST /api/auth/login` | Multi-identifier authentication |
| **Auth** | `POST /api/auth/reset-demo` | Reset database to pristine seed records |
| **Departments** | `GET /api/departments` | List all departments with student/faculty counts |
| **Departments** | `POST /api/departments` | Add new academic department |
| **Departments** | `DELETE /api/departments/:id` | Delete department (with dependency checks) |
| **Users** | `GET /api/users?role=` | List students, faculty, or all users |
| **Users** | `POST /api/users/student` | Register new student with roll number |
| **Users** | `POST /api/users/faculty` | Add faculty with unique Faculty ID |
| **Users** | `DELETE /api/users/:id` | Remove user & cascade related records |
| **Courses** | `GET /api/courses` | Course catalog with assigned instructors |
| **Courses** | `POST /api/courses` | Create new subject / course |
| **Courses** | `PUT /api/courses/:id/assign` | Allocate faculty instructor to course |
| **Courses** | `DELETE /api/courses/:id` | Remove course |
| **Enrollments** | `GET /api/enrollments` | Enrolled courses by student or subject |
| **Enrollments** | `POST /api/enrollments` | Student course enrollment (24 credit max validation) |
| **Enrollments** | `DELETE /api/enrollments/:id` | Drop course |
| **Attendance** | `GET /api/attendance` | Course attendance logs & statistics |
| **Attendance** | `POST /api/attendance/save` | Batch submit daily attendance (Present/Absent) |
| **Grades** | `GET /api/grades` | Continuous internal evaluation marks |
| **Grades** | `POST /api/grades/save` | Batch grade evaluation (auto GPA & letter grade) |
| **Notices** | `GET /api/notices` | Bulletin board notices by audience |
| **Notices** | `POST /api/notices` | Broadcast campus announcements |
| **Notices** | `DELETE /api/notices/:id` | Remove announcement |
| **Stats** | `GET /api/stats` | KPI summary statistics for Admin dashboard |

---

## 📁 Project Architecture & Files

```text
Academic Portal Management System/
│
├── index.html                   # Single-Page Application (Login, Admin, Faculty, Student)
├── README.md                    # Documentation & viva guide
│
├── css/
│   └── style.css                # Custom UI styling, badges, KPI cards, print CSS
│
├── js/
│   ├── api.js                   # Frontend REST API client (fetch)
│   ├── data.js                  # Seed data & client-side cache sync engine
│   ├── auth.js                  # Authentication & session manager
│   ├── admin.js                 # Admin UI controllers (Departments, Users, Courses)
│   ├── faculty.js               # Faculty UI controllers (Attendance, Gradebook)
│   ├── student.js               # Student UI controllers (Enrollment, Marksheet)
│   └── app.js                   # Application bootstrap & toast notifications
│
└── backend/
    ├── package.json             # Node.js project manifest & dependencies
    ├── server.js                # Express REST API server entry point
    ├── database.js              # Persistent database manager & auto-seeding engine
    ├── data/
    │   └── academic_portal_db.json # Database file (atomic JSON persistence)
    └── routes/
        ├── auth.js              # Authentication endpoints
        ├── departments.js       # Academic departments endpoints
        ├── users.js             # Student and faculty directory endpoints
        ├── courses.js           # Course catalog and allocation endpoints
        ├── enrollments.js       # Student enrollment and credit limits
        ├── attendance.js        # Daily attendance sheet endpoints
        ├── grades.js            # Internal marks and GPA evaluation endpoints
        ├── notices.js           # Campus announcements endpoints
        └── stats.js             # Dashboard KPI counts endpoints
```
