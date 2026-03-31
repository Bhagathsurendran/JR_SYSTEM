# InternHub (JR_System) Codebase Analysis

## 1. APP OVERVIEW
**What is this application?** 
InternHub is a comprehensive hiring, assessment, and job-portal platform bridging the gap between students/candidates and companies. It allows candidates to upload their CVs (where skills are automatically extracted using NLP), apply for jobs, and track their application. Companies (HR) can post jobs, filter candidates based on automated skill-matching, schedule tests, and conduct online assessments (MCQs and Live Coding/Machine Tests) and Video Interviews.

**Problem Solved:** Streamlines the tech hiring process by combining job posting, resume parsing, candidate skill-matching, and automated multi-stage technical assessments into a single platform.

**Tech Stack:**
- **Backend:** Python, Django 5.2.10, Django REST Framework, Django Channels (for async/websockets).
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS within Django Templates).
- **Database:** PostgreSQL (configured in [settings.py](file:///d:/cybersquare/main_project/jr_system/jr_system/settings.py), though a fallback [db.sqlite3](file:///d:/cybersquare/main_project/jr_system/db.sqlite3) exists).
- **External Services/APIs:** 
  - **Judge0 API**: For compiling and executing code submissions in the Machine Test.
  - **Spacy z& PyMuPDF (fitz)**: For Natural Language Processing (NLP) to extract technical skills from uploaded CVs/PDFs.
  - **Meta Graph API**: Facebook/Instagram integration for companies.
  - **Google OAuth**: Supported via `allauth`.

**Architecture Pattern:** 
**MVT (Model-View-Template)** monolith typical of Django applications. It is a monolithic application with distinct Django "apps" separating the core logic (`register` for auth/jobs), multiple choice examinations (`mcq_exam`), and coding assessments (`m_test`).

**High-Level Summary:**
Think of this application as "LinkedIn meets HackerRank". Users create profiles by uploading resumes; the app uses AI to read the resume and tag their skills. HR recruiters post jobs. When users apply, the app shows how well their skills match the job. If the recruiter likes them, they can push a button to send the candidate an automated coding test or multiple-choice quiz, and then schedule a live interview. 

---

## 2. HOW TO RUN THE APP
**Prerequisites:**
- Python 3.9+
- PostgreSQL server running locally (Port 5432).
- Node/Redis (Redis is configured in [settings.py](file:///d:/cybersquare/main_project/jr_system/jr_system/settings.py) for Django Channels on `127.0.0.1:6379`).

**Step-by-Step Setup:**
1. Clone the repository and navigate to `d:\cybersquare\main_project\jr_system`.
2. Create and activate a Virtual Environment.
3. Install dependencies: 
   `pip install django djangorestframework django-allauth channels channels-redis psycopg2-binary requests PyMuPDF spacy`
4. Download the Spacy English language model:
   `python -m spacy download en_core_web_sm`
5. Map your PostgreSQL credentials in [jr_system/settings.py](file:///d:/cybersquare/main_project/jr_system/jr_system/settings.py) (Currently expects DB `jr_system`, user `postgres`, password `Bhagath@2003`).
6. Run migrations: `python manage.py migrate`
7. Run the development server: `python manage.py runserver`

**Development vs Production:**
- **Dev:** Run using `python manage.py runserver`. Need Redis running locally for Channels/WebSockets.
- **Prod:** Deploy using `daphne` or `uvicorn` (ASGI) since Django Channels is utilized. DEBUG should be set to `False`.

**Important Environment Variables / Keys:**
Currently, keys are hardcoded in the codebase (⚠️ **Warning**: Security Risk):
- `SECRET_KEY` in [settings.py](file:///d:/cybersquare/main_project/jr_system/jr_system/settings.py).
- `EMAIL_HOST_USER` & `EMAIL_HOST_PASSWORD` (Hardcoded Gmail SMTP).
- `APP_ID` & `APP_SECRET` in [register/views.py](file:///d:/cybersquare/main_project/jr_system/register/views.py) for Meta API Authentication.

**Common Errors & Fixes:**
- *Spacy Model Error:* Ensure `en_core_web_sm` is downloaded before running.
- *Redis Connection Error:* If Redis is not running, Channels/WebSockets will crash.
- *Judge0 API Timeout:* Free instances of Judge0 may time out. Overcome this by hosting a local Judge0 instance or buying an API key.

---

## 3. USER TYPES, ROLES & PERMISSIONS

| User Type | Role / Purpose | Permissions (Can Do) | Restrictions (Cannot Do) | Auth Logic |
|-----------|---------------|----------------------|-----------------------|------------|
| **Admin** (`role="admin"`) | Platform superuser/owner. | View all users and companies. Add/edit/delete companies and candidate accounts. Access [admin_dashboard](file:///d:/cybersquare/main_project/jr_system/register/views.py#228-247). Connect Meta APIs for companies. | Cannot apply for jobs or take tests. | Session-based login ([user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15) table check against plaintext passwords - ⚠️ **Warning: Passwords are not hashed in [user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15) table.**). |
| **HR** (`role="hr"`) | Recruiter managing jobs for a specific company. | Post/edit/delete jobs. View applicants. Approve/reject applications. Schedule MCQs, Machine tests, and HR Interviews. See calendar of processes. | Cannot manage other companies, delete other HRs, or take exams. | Session-based login ([user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15)). Linked to [Employee](file:///d:/cybersquare/main_project/jr_system/register/models.py#16-33) company table. |
| **Student/User** (`role="user"`) | Job seeker. | Upload CV. View matching jobs. Apply for jobs. Take MCQ exams. Take Machine tests. View results. | Cannot view other candidates' data or post jobs. | Session login ([user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15)). Django `User` via `allauth` for Google login. |
| **Django Admin** | System management. | Full DB access via `/admin/`. | None. | Django standard auth. |

---

## 4. FEATURES & FUNCTIONALITIES

1. **AI Resume Parsing**: Extracts tech skills natively from PDF resumes using PyMuPDF and Spacy NLP against a predefined taxonomy (`register/views.py: extract_skills_from_cv`). Used by `User`.
2. **Skill-Match Scoring**: Automatically computes a `%` match between candidate skills and job requirements. Used by `User` & `HR`.
3. **Job Board & Application Flow**: CRUD operations for jobs, with "toggle apply" mechanics. Used by `All Users`.
4. **Application Pipeline Management**: Move candidates between Pending -> Approved -> MCQ -> Machine Test -> HR Interview. Used by `HR`.
5. **MCQ Examination**: A randomized 20-question quiz pulled from a bank of 60 default Python/Django questions with a 60% passing mark. (`mcq_exam` app). Used by `User`.
6. **Machine Coding Test Sandbox**: Live code editor allowing users to compile and run C, C++, Python, Java, or JS against test cases via the Judge0 compiler. Users must solve >= 2 out of 3 randomized algorithms. (`m_test` app). Used by `User`.
7. **Automated Notification & Emails**: Triggers SMTP emails and in-app notifications whenever applicants are moved between hiring stages. Used by `System`.
8. **Meta Social Connect**: Allows Admin/HR to link a company's Facebook/Instagram pages via OAuth tokens. (`register/views.py: connect_meta`). Used by `Admin`/`HR`.

---

## 5. API / FUNCTION REFERENCE

| Method/Route | Description | Parameters / Inputs | Output / Return | Auth Required |
|--------------|-------------|---------------------|-----------------|---------------|
| `POST /insert_data/` | Registers a student user & parses CV. | `name`, [email](file:///d:/cybersquare/main_project/jr_system/register/views.py#920-1067), `phone`, [cv](file:///d:/cybersquare/main_project/jr_system/register/views.py#51-82) (PDF), `photo` | Creates DB record, sends email. | No |
| `POST /m_test/api/submit/<id>/` | Submits code to Judge0 for grading. | `{ code, lang }` JSON | Accepted/Wrong Answer, memory, cpu time, % score. | Yes |
| `POST /m_test/api/run/` | Dry-runs code in sandbox sandbox. | `{ code, lang, stdin }` JSON | Stdout, stderr, compile errors. | Yes |
| `POST /save-process/` | HR moves candidate to a test/interview stage. | `{ job_id, app_id, stage, date, action }` | Success JSON, shoots email. | Yes (HR) |
| `GET /meta-callback/` | Callback from Facebook Login. | `code` (URL param) | Redirects w/ FB Pages/Tokens. | Yes (Admin) |
| `POST /mcq_exam/submit/` | Auto-grades MCQ Exam. | `{ answers: {}, time_taken }` | Score, pass/fail status, correct answers. | Yes (User) |
| `GET /hr/api/calendar/` | Populates HR Interview calendar. | `year`, `month` | JSON list of scheduled events. | Yes (HR) |

---

## 6. APP FLOW (End-to-End)
**Candidate Journey:**
1. **Entry**: Candidate lands on `/reg/`, uploads PDF CV. *Spacy* extracts skills. System emails a generated plaintext password.
2. **Core Actions**: Candidate logs in (`/login_user/`), enters [user_dashboard](file:///d:/cybersquare/main_project/jr_system/register/views.py#157-210). Views recommended jobs based on matching skills logic. Clicks "Apply".
3. **Assessment**: Candidate is notified via email of an upcoming test. Clicks link in dashboard -> [start_exam](file:///d:/cybersquare/main_project/jr_system/mcq_exam/views.py#76-86). Takes MCQ (`mcq_exam`), then Machine Test (`m_test`). 
4. **Interview**: Candidate dashboard renders a lobby link (`/interview/lobby/<uuid>/`). Candidate joins WebRTC room.

**HR Journey:**
1. **Entry**: HR logs into [hr_dashboard](file:///d:/cybersquare/main_project/jr_system/interview/views.py#18-27).
2. **Core Actions**: Posts job. Reviews applicants in the pool. Clicks "Schedule MCQ" for strong candidates.
3. **Assessment Grading**: Checks back in applicant tracking to see automated MCQ & Machine Test scores.
4. **Interview**: Schedules an HR Interview date. Uses the Calendar integration. Enters `/interview/room/` to interview the candidate, and saves candidate notes.

---

## 7. DATABASE / DATA MODELS

### App: `register`
- **[user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15)**: Custom model holding `full_name`, `Email`, `phoneno`, `course`, `cv_url`, `user_pass`, `role`, [skills](file:///d:/cybersquare/main_project/jr_system/register/views.py#51-82). Purpose: Central identity model for roles.
- **[Employee](file:///d:/cybersquare/main_project/jr_system/register/models.py#16-33)**: Holds Company profiles (`company_name`, [email](file:///d:/cybersquare/main_project/jr_system/register/views.py#920-1067), `website`, FB/IG tokens).
- **[Job](file:///d:/cybersquare/main_project/jr_system/register/models.py#34-59)**: Holds job postings linked to an [Employee](file:///d:/cybersquare/main_project/jr_system/register/models.py#16-33) (Company) and a [user_detail](file:///d:/cybersquare/main_project/jr_system/register/models.py#4-15) (HR rep). Includes [skills](file:///d:/cybersquare/main_project/jr_system/register/views.py#51-82), `stipend`, `deadline`, [status](file:///d:/cybersquare/main_project/jr_system/register/views.py#812-825).
- **[application](file:///d:/cybersquare/main_project/jr_system/register/models.py#60-87)**: The "junction" table bridging Users to Jobs. Tracks hiring pipeline: `match_score`, [status](file:///d:/cybersquare/main_project/jr_system/register/views.py#812-825), `mcq_score`, `machine_test_score`, stage dates, and a unique `interview_room_id` (UUID).
- **[Notification](file:///d:/cybersquare/main_project/jr_system/register/models.py#88-97)**: Tracks unread alerts for users.

### App: `m_test`
- **[Submission](file:///d:/cybersquare/main_project/jr_system/m_test/models.py#5-50)**: Logs coding test attempts (`problem_id`, `language`, `code`, `verdict`, `passed` test cases). Links to Django standard `User`.

### App: [interview](file:///d:/cybersquare/main_project/jr_system/register/views.py#1175-1255) ⚠️ **WARNING**
- **`InterviewRoom`**: This model is entirely **commented out** in [interview/models.py](file:///d:/cybersquare/main_project/jr_system/interview/models.py). However, views in [interview/views.py](file:///d:/cybersquare/main_project/jr_system/interview/views.py) attempt to query it (`InterviewRoom.objects.get(...)`). If a user tries to access `/interview/lobby/<id>/`, **the application will crash with a `NameError/Exception`**. 

---

## 8. USE CASES (Real-World Scenarios)

1. **AI Resume Data Ingestion**
   - *Actor:* Student
   - *Goal:* Create an account quickly without manual data entry.
   - *Steps:* Upload CV PDF. Backend opens PDF natively via PyMuPDF, searches for 60+ programming buzzwords. Saves matched words to `user_detail.skills`.
   - *Outcome:* Student's profile is automatically tagged as "Python, Django, SQL".
   
2. **HR Applicant Funnel Check**
   - *Actor:* HR
   - *Goal:* Filter candidates.
   - *Steps:* Logs in -> Views list of applications. Sorts candidates by `match_score` (computed by intersecting user skills with job skills).
   - *Outcome:* HR ignores 20% matches and approves 90% matches.
   
3. **Candidate Coding Examination**
   - *Actor:* Candidate
   - *Goal:* Pass technical filter.
   - *Steps:* Receives Dashboard link -> Enters `m_test` Arena. Types equivalent of "Two Sum" in Python. Hits "Submit". Backend proxies code to Judge0 via REST HTTP.
   - *Outcome:* Code is compiled, checked against expected output, candidate gets 100%, score attached to application.
   
4. **Company Social Account Binding**
   - *Actor:* System Admin
   - *Goal:* Link Company to Meta to push job postings to FB pages (presumably future feature).
   - *Steps:* Navigates to Admin settings -> Click "Connect Meta" -> Navigates to Facebook OAuth -> Returns to `/meta-callback` -> Exchanges tokens.
   - *Outcome:* 60-day Long-Lived FB token is persisted to [Employee](file:///d:/cybersquare/main_project/jr_system/register/models.py#16-33) model.

5. **HR Candidate Interview**
   - *Actor:* HR & Candidate
   - *Goal:* Do face-to-face video chat.
   - *Steps:* Click UUID room link generated in Application table -> Loads `/interview/lobby/` -> Enter [room](file:///d:/cybersquare/main_project/jr_system/interview/views.py#93-113).
   - *Outcome:* Both parties connect. HR takes notes and marks "Ended". (Requires codebase fix due to commented out classes).

---

## 9. END-TO-END TEST CASE

**Test Scenario: Create Company -> Extract Resume Skills -> Apply -> Take Coding Test**

**Sample Data Required:** 
- Email: `tester1@example.com`
- Password: `Password123`
- PDF File: Fake CV containing "Python, Rest API, Django".

**STEP 1:** [Admin Action] Navigate to `/login/` with admin credentials, go to Admin Dashboard, click "Add Company". Input "Acme Corp".
→ **Expected:** "Acme Corp" appears in company table.

**STEP 2:** [HR Action] Login as HR for Acme Corp. Click "Create Job". Add title "Backend Dev", skills "Python, Django, PostgreSQL", status "open".
→ **Expected:** Job successfully lists on the open job board.

**STEP 3:** [Candidate Action] Go to `/reg/`. Upload `tester1@example.com` details and the fake PDF CV.
→ **Expected:** User is registered, receives password email. Database [skills](file:///d:/cybersquare/main_project/jr_system/register/views.py#51-82) column records "Python, Rest API, Django".

**STEP 4:** [Candidate Action] Login as `tester1@example.com`. Navigate to Dashboard. Find "Backend Dev" job.
→ **Expected:** Job shows a Match Score of ~66% (matched Python, Django).

**STEP 5:** [Candidate Action] Click "Apply" on "Backend Dev".
→ **Expected:** Status changes to Applied. Application object generated in DB.

**STEP 6:** [HR Action] Login as HR. Go to Pending Applications. Find `tester1@example.com`. Approve and Schedule "Machine Test".
→ **Expected:** Notification sent. `application.machine_test_date` populated.

**STEP 7:** [Candidate Action] Login, click the Machine Test notification. Get redirected to `/m_test/arena/`. Solve 2 algorithm questions. Click Submit.
→ **Expected:** Call goes to Judge0. Results return "Accepted". `application.machine_test_score` updates in DB to reflect a passing grade.

---

## 10. FOLDER STRUCTURE EXPLANATION

- `/jr_system/` - The root Django configuration directory. Houses `settings.py`, core database routing, and ASGI/WSGI wrappers.
- `/register/` - **The monolith's core application**. Unintuitively named, this app houses *everything* except exams. It handles Auth, Job Board logic, Applicant Tracking, Social Integrations, and Email triggers. 
- `/mcq_exam/` - Sub-app containing logic strictly for presenting 20 randomized questions and grading them. 
- `/m_test/` - Sub-app integrating with Judge0. Contains hardcoded python objects carrying LeetCode-style algorithm questions and handles JSON payloads to external compilers.
- `/interview/` - Sub-app intended to handle WebRTC/videoconferencing and live interviewing.
- `/templates/` & `/static/` - Global directories for HTML rendering and CSS/JS assets. 

⚠️ **CRITICAL FINDINGS & WARNINGS TO FLAG:**
1. **Broken Interview App**: The `InterviewRoom` model is entirely commented out in `interview/models.py`. The `interview/views.py` aggressively tries to import it and query it, guaranteeing a 500 Server Error if those routes are hit.
2. **Security Vulnerability (Plaintext Passwords)**: The `user_detail` table stores `user_pass` in a standard CharField without Django's `make_password()` hashing wrapper. Passwords are sent via unencrypted SMTP. In production, this is a massive liability.
3. **Hardcoded Secrets**: AWS keys/tokens absent but `SECRET_KEY`, Database credentials, SMTP App Passwords, and Meta API Keys are heavily hardcoded into `settings.py` and `register/views.py`.
4. **Logic Mix**: Django custom users (`user_detail`) vs Standard `allauth` Auth models (`User`/`SocialAccount`). The application relies on `user_detail` for its core portal logic, but parts of the system (like the `Submission` data tracking) rely on the default Django `User`. 
