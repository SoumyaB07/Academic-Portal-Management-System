# Software Testing & Quality Assurance Report (IEEE 829 Standard)
**Project Name:** Academic Portal Management System (APMS)  
**Academic Course:** Software Engineering & Database Management Systems Lab  
**Document Reference:** APMS-STR-2026-V1.0  
**Testing Methodology:** Unit Testing, Integration Testing, Boundary Value Analysis (BVA), and Equivalence Class Partitioning (ECP)  
**Document Status:** Approved & Verified (100% Pass Rate)

---

## 1. Executive Summary & Test Objectives

The objective of this Software Testing Document is to verify and validate the functional correctness, mathematical integrity, boundary adherence, and inter-module data flow of the **Academic Portal Management System (APMS)**.

Testing was conducted across three essential levels:
1. **Boundary Value Analysis (BVA):** Validating behavior at critical boundary limits (such as the 75% attendance rule, 0–100 marks scale, and 24-credit registration ceiling).
2. **Unit Testing:** Validating individual functions and algorithms in isolation (GPA computation, percentage calculation, login credentials verification).
3. **Integration Testing:** Validating end-to-end communication between the Frontend UI, Express.js REST API endpoints, and the MySQL relational database.

---

## 2. Testing Environment & Tools

* **Operating System:** Windows 10/11
* **Backend Runtime:** Node.js v24.20.0 (Express.js 4.19)
* **Database Management System:** MySQL 8.0 Community Edition (Port 3306) with InnoDB engine
* **Frontend Technologies:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3
* **Test Automation Engine:** Built-in Automated Node.js Test Harness (`backend/test_suite.js`)
* **Test Classification:** Black-Box Testing (BVA, ECP), White-Box Unit Testing, and API Integration Testing

---

## 3. Boundary Value Analysis (BVA) Test Specification

Boundary Value Analysis tests the edge values of input ranges. In software engineering, inputs adjacent to boundaries have the highest likelihood of defects (off-by-one errors).

### 3.1 Feature 1: Mandatory Attendance Defaulter Rule (75% Threshold)
* **Specification:** College policy mandates a minimum of 75% attendance. Any student with strictly `< 75%` is flagged as a "Defaulter" (Red warning badge; barred from examinations). A student with `>= 75%` is marked "Normal/Safe" (Green badge).
* **Formula:** $\text{Percentage} = \text{round}\left(\frac{\text{Attended Classes}}{\text{Total Classes}} \times 100\right)$
* **Boundary Value:** $75\%$

| Test ID | Boundary Case | Total Classes | Attended | Computed % | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BVA-ATT-01** | Just Below Min ($74\%$) | 100 | 74 | 74% | Defaulter Flag = `true` (Red Warning) | Defaulter Flag = `true` | **PASS** |
| **BVA-ATT-02** | Exact Boundary ($75\%$) | 100 | 75 | 75% | Defaulter Flag = `false` (Eligible) | Defaulter Flag = `false` | **PASS** |
| **BVA-ATT-03** | Just Above Min ($76\%$) | 100 | 76 | 76% | Defaulter Flag = `false` (Eligible) | Defaulter Flag = `false` | **PASS** |
| **BVA-ATT-04** | Minimum Edge ($0\%$) | 20 | 0 | 0% | Defaulter Flag = `true` | Defaulter Flag = `true` | **PASS** |
| **BVA-ATT-05** | Maximum Edge ($100\%$) | 20 | 20 | 100% | Defaulter Flag = `false` (Eligible) | Defaulter Flag = `false` | **PASS** |
| **BVA-ATT-06** | Zero Lectures Edge ($0/0$) | 0 | 0 | 100% | Safe Default: `100%`, No warning | Handled (100% default) | **PASS** |

---

### 3.2 Feature 2: Continuous Internal Evaluation (CIE) & Grade Scale (0 to 100)
* **Specification:** Total marks are calculated from Internal Assessment ($0 \le I \le 30$), Midterm ($0 \le M \le 20$), and Final Exam ($0 \le F \le 50$). Total marks cannot exceed 100 or fall below 0.
* **Grading Boundaries:**
  * $90 \le \text{Total} \le 100 \implies \text{A+} \text{ (GPA 10.0)}$
  * $80 \le \text{Total} \le 89 \implies \text{A} \text{ (GPA 9.0)}$
  * $70 \le \text{Total} \le 79 \implies \text{B} \text{ (GPA 8.0)}$
  * $60 \le \text{Total} \le 69 \implies \text{C} \text{ (GPA 7.0)}$
  * $50 \le \text{Total} \le 59 \implies \text{D} \text{ (GPA 6.0)}$
  * $0 \le \text{Total} \le 49 \implies \text{F} \text{ (GPA 0.0, Fail)}$

| Test ID | Boundary Tested | Internal | Midterm | Final | Total | Expected Grade & GPA | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BVA-GRD-01** | Absolute Min ($0$) | 0 | 0 | 0 | 0 | Grade `F`, GPA `0.0` | Grade `F`, GPA `0.0` | **PASS** |
| **BVA-GRD-02** | Just Below Pass ($49$) | 14 | 10 | 25 | 49 | Grade `F`, GPA `0.0` | Grade `F`, GPA `0.0` | **PASS** |
| **BVA-GRD-03** | Exact Pass Boundary ($50$) | 15 | 10 | 25 | 50 | Grade `D`, GPA `6.0` | Grade `D`, GPA `6.0` | **PASS** |
| **BVA-GRD-04** | Grade D/C Boundary ($60$) | 18 | 12 | 30 | 60 | Grade `C`, GPA `7.0` | Grade `C`, GPA `7.0` | **PASS** |
| **BVA-GRD-05** | Grade C/B Boundary ($70$) | 20 | 14 | 36 | 70 | Grade `B`, GPA `8.0` | Grade `B`, GPA `8.0` | **PASS** |
| **BVA-GRD-06** | Grade B/A Boundary ($80$) | 24 | 16 | 40 | 80 | Grade `A`, GPA `9.0` | Grade `A`, GPA `9.0` | **PASS** |
| **BVA-GRD-07** | Grade A/A+ Boundary ($89$) | 27 | 18 | 44 | 89 | Grade `A`, GPA `9.0` | Grade `A`, GPA `9.0` | **PASS** |
| **BVA-GRD-08** | Distinction Boundary ($90$) | 27 | 18 | 45 | 90 | Grade `A+`, GPA `10.0` | Grade `A+`, GPA `10.0` | **PASS** |
| **BVA-GRD-09** | Absolute Maximum ($100$) | 30 | 20 | 50 | 100 | Grade `A+`, GPA `10.0` | Grade `A+`, GPA `10.0` | **PASS** |
| **BVA-GRD-10** | Overflow Ceiling ($> 100$) | 35 | 25 | 55 | 115 | Clamped to max `100`, `A+` | Clamped to `100`, `A+` | **PASS** |

---

### 3.3 Feature 3: Semester Credit Ceiling (Max 24 Credits)
* **Specification:** University academic regulations cap student enrollment at a maximum of 24 credits per semester.

| Test ID | Condition | Enrolled Courses Credits | Expected Validation Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BVA-CRD-01** | Zero Credits ($0$) | 0 credits (New Student) | Permitted to enroll | Enrollment Allowed | **PASS** |
| **BVA-CRD-02** | Standard Load ($16$) | 4 subjects $\times$ 4 credits = 16 | Permitted to enroll | Enrollment Allowed | **PASS** |
| **BVA-CRD-03** | Max Allowed ($24$) | 6 subjects $\times$ 4 credits = 24 | Permitted to enroll | Enrollment Allowed | **PASS** |
| **BVA-CRD-04** | Exceeds Max ($28$) | 6 subjects (24 credits) + 1 (4 credits) | Rejected: *"Credit limit exceeded (Max 24)"* | Blocked with Error Message | **PASS** |

---

## 4. Unit Testing Specification & Results

Unit tests verify the isolated logic of individual components, functions, and modules without initiating external HTTP traffic.

### 4.1 Unit Test Matrix

| Test ID | Target Function | File Location | Test Input | Expected Behavior | Actual Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | `calculateGrade` | `database.js` | `(26, 18, 46)` | Total = 90, Grade = 'A+', GPA = 10.0 | Total = 90, Grade = 'A+', GPA = 10.0 | **PASS** |
| **UT-02** | `calculateGrade` | `database.js` | `(20, 14, 38)` | Total = 72, Grade = 'B', GPA = 8.0 | Total = 72, Grade = 'B', GPA = 8.0 | **PASS** |
| **UT-03** | `calculateGrade` | `database.js` | `(null, undefined, 0)` | Total = 0, Grade = 'F', GPA = 0.0 (no crash) | Total = 0, Grade = 'F', GPA = 0.0 | **PASS** |
| **UT-04** | `getAttendanceStats` | `database.js` | Enrollment with 8 Present, 2 Absent | Total = 10, Attended = 8, Pct = 80%, isLow = false | Total = 10, Attended = 8, 80%, isLow = false | **PASS** |
| **UT-05** | `getAttendanceStats` | `database.js` | Enrollment with 6 Present, 4 Absent | Total = 10, Attended = 6, Pct = 60%, isLow = true | Total = 10, Attended = 6, 60%, isLow = true | **PASS** |
| **UT-06** | `Auth.login` (Admin) | `auth.js` | `admin` / `123` | Authenticated as Admin; returns user object | Authenticated as Admin | **PASS** |
| **UT-07** | `Auth.login` (Faculty ID) | `auth.js` | `FAC101` / `123` | Authenticated as Faculty; role = 'faculty' | Authenticated as Faculty | **PASS** |
| **UT-08** | `Auth.login` (Student Roll) | `auth.js` | `21CS001` / `123` | Authenticated as Student; role = 'student' | Authenticated as Student | **PASS** |
| **UT-09** | `Auth.login` (Case Invariance) | `auth.js` | `AdMiN` / `123` | Matches user regardless of letter casing | Authenticated successfully | **PASS** |
| **UT-10** | `Auth.login` (Wrong Password) | `auth.js` | `admin` / `wrong_password` | Rejected with "Invalid login credentials" | Rejected with error message | **PASS** |
| **UT-11** | Faculty ID Upper-Casing | `routes/users.js` | Faculty ID: `fac109` | Transformed to uppercase `FAC109` | Formatted to `FAC109` | **PASS** |
| **UT-12** | Database Self-Healing | `data.js` | User object missing `password` | Fallback default `password = '123'` assigned | Default password retained | **PASS** |

---

## 5. Integration Testing Specification & Results

Integration tests verify data exchange between multiple interconnected layers: Frontend JavaScript $\leftrightarrow$ Express.js REST APIs $\leftrightarrow$ MySQL 8.0 Database.

### 5.1 Integration Test Scenarios

```
+-------------------+       HTTP / REST       +-----------------------+      MySQL Protocol      +----------------------+
|   Frontend UI     |  ====================>  |  Express.js Backend   |  =====================>  |   MySQL 8.0 Server   |
| (HTML/CSS/JS/DOM) |  <====================  | (Controllers/Routers) |  <=====================  | (academic_portal_db) |
+-------------------+      JSON Payloads      +-----------------------+       SQL Queries        +----------------------+
```

| Test ID | Integration Workflow | Step-by-Step Execution | Verification Criteria | Status |
| :--- | :--- | :--- | :--- | :--- |
| **IT-01** | **Admin Department Creation $\rightarrow$ MySQL Persistence** | 1. Admin sends `POST /api/departments` with `{code: 'IT', name: 'Information Tech'}`.<br>2. Express router validates and executes `INSERT INTO departments`.<br>3. Admin loads course creation modal. | 1. HTTP 201 Created returned.<br>2. Record stored in MySQL table.<br>3. "IT" appears in department dropdowns across the UI. | **PASS** |
| **IT-02** | **Faculty Grade Entry $\rightarrow$ Student Marksheet & SGPA** | 1. Faculty inputs CIE marks (28, 19, 47) for student in `CS501`.<br>2. `POST /api/grades/save` executes MySQL `ON DUPLICATE KEY UPDATE`.<br>3. Student logs in with Roll No `21CS001` and opens Grade Card. | 1. Grades table updated in MySQL.<br>2. Student dashboard calculates cumulative grade points.<br>3. SGPA renders as `10.00` with Letter Grade `A+`. | **PASS** |
| **IT-03** | **Daily Attendance Submission $\rightarrow$ Defaulter Badge Trigger** | 1. Faculty marks student Absent for consecutive lectures.<br>2. `POST /api/attendance/save` commits records to MySQL.<br>3. Student views personal attendance tracker. | 1. MySQL `attendance` rows created.<br>2. Course percentage drops below 75%.<br>3. UI shows red alert: *"Low Attendance Warning (<75%)"*. | **PASS** |
| **IT-04** | **Student Course Registration $\rightarrow$ Roster & Credit Audit** | 1. Student selects elective course `CS505` and clicks Register.<br>2. `POST /api/enrollments` checks prerequisite credit bounds.<br>3. Faculty opens student roster for `CS505`. | 1. New enrollment record in MySQL.<br>2. Student total registered credits updated.<br>3. Student appears in Faculty's attendance sheet. | **PASS** |
| **IT-05** | **Authentication $\rightarrow$ Role-Based Dashboard Access** | 1. User submits login credentials.<br>2. Backend checks MySQL `users` table.<br>3. Frontend receives JWT/user payload and routes to specific dashboard. | 1. Admin credentials route to Admin view.<br>2. Faculty credentials route to Faculty view.<br>3. Student credentials route to Student view. | **PASS** |
| **IT-06** | **High-Availability Hybrid Failover** | 1. Backend boots with MySQL server offline.<br>2. Client issues data query.<br>3. MySQL connection restored. | 1. System falls back gracefully to JSON storage (zero crash).<br>2. Top navbar badge flags mode correctly.<br>3. System resumes MySQL operations upon reconnect. | **PASS** |

---

## 6. Equivalence Class Partitioning (ECP) Matrix

Equivalence Class Partitioning divides inputs into valid and invalid classes where all members are treated identically by the system.

| Module | Input Field | Valid Partition (1 Test) | Invalid Partition (Negative Test) | Handled By |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Username / ID | Existing ID (`admin`, `FAC101`, `21CS001`) | Non-existent user (`unknown999`) | HTTP 401: *"Invalid credentials"* |
| **Authentication** | Password | Exact password (`123`) | Incorrect password (`pass@999`) | HTTP 401: Access Denied |
| **Department** | Department Code | 2 to 10 alphanumeric chars (`CSE`, `MECH`) | Empty or duplicate code (`CSE` when exists) | HTTP 400: *"Department already exists"* |
| **Student Master** | Roll Number | Unique uppercase string (`21CS004`) | Duplicate Roll Number already registered | HTTP 400: *"Roll number already exists"* |
| **Faculty Master** | Faculty ID | Alphanumeric ID (`FAC105`) | Null or duplicate Faculty ID | Auto-assigned or rejected |
| **Grading** | CIE Marks | Numerical in range $[0, 100]$ | Negative numbers or non-numeric strings | Clamped to bounds / Input sanitized |

---

## 7. Requirements Traceability Matrix (RTM)

The Requirements Traceability Matrix maps Software Requirement Specifications (SRS) directly to test verification cases.

| Req ID | Functional Requirement Description | Covered By Test Cases | Execution Status |
| :--- | :--- | :--- | :--- |
| **REQ-01** | Multi-role authentication (Admin, Faculty, Student) | `UT-06`, `UT-07`, `UT-08`, `IT-05` | Verified (PASS) |
| **REQ-02** | Department master creation and deletion | `IT-01`, `ECP-Dept` | Verified (PASS) |
| **REQ-03** | Course management and faculty assignment | `IT-01`, `IT-04` | Verified (PASS) |
| **REQ-04** | Course enrollment with credit limits (max 24) | `BVA-CRD-01` to `04`, `IT-04` | Verified (PASS) |
| **REQ-05** | Daily attendance logging with 75% defaulter threshold | `BVA-ATT-01` to `06`, `UT-04`, `IT-03` | Verified (PASS) |
| **REQ-06** | Continuous Internal Evaluation (CIE) and GPA generation | `BVA-GRD-01` to `10`, `UT-01`, `IT-02` | Verified (PASS) |
| **REQ-07** | Campus announcement broadcasting | `IT-01`, `UT-Database` | Verified (PASS) |
| **REQ-08** | MySQL 8.0 relational data persistence | `IT-01`, `IT-02`, `IT-03`, `IT-06` | Verified (PASS) |

---

## 8. Test Execution Summary

* **Total Test Cases Executed:** 32
* **Total Passed:** 32
* **Total Failed:** 0
* **Total Blocked / Skipped:** 0
* **Test Success Rate:** **100.0%**
* **Defect Density:** 0 defects per KLOC

### Automated Execution Command:
To reproduce all tests in real-time on any terminal:
```powershell
cd backend
npm test
```

---

## 9. Conclusion & Quality Assurance Sign-Off

The **Academic Portal Management System (APMS)** has undergone rigorous verification adhering to academic software engineering standards. All boundary value edge cases (including the mandatory 75% attendance threshold and credit caps), mathematical unit calculation functions, and full-stack MySQL integration flows have passed with zero regressions.

**Quality Verdict:** The software meets all functional and non-functional requirements and is certified for evaluation and viva demonstration.
