from datetime import datetime

from django.shortcuts import render, redirect ,get_object_or_404
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse, JsonResponse
from .models import JobProcess, user_detail, Employee, Job ,application,Notification
from django.utils.crypto import get_random_string
from django.db.models import Count,Q
import string
from django.core.mail import send_mail
from django.conf import settings
import json
import requests
import fitz
import os
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

# ══════════════════════════════════════════
# PASTE YOUR REAL VALUES HERE
# ══════════════════════════════════════════
REDIRECT_URI = "http://127.0.0.1:8000/meta-callback/"
APP_ID     = "1234567890123456" 
APP_SECRET = "abc123def456..."  

SKILLS_LIST = [
    'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'swift',
    'kotlin', 'typescript', 'golang', 'rust', 'scala', 'r',
    'html', 'css', 'react', 'angular', 'vue', 'django', 'flask',
    'node.js', 'express', 'bootstrap', 'tailwind', 'rest api', 'graphql',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'pandas', 'numpy', 'scikit-learn', 'matplotlib', 'data analysis',
    'natural language processing', 'nlp', 'computer vision', 'opencv',
    'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'firebase',
    'aws', 'azure', 'google cloud', 'docker', 'kubernetes', 'git', 'github',
    'linux', 'ci/cd', 'jenkins','excel', 'powerpoint', 'figma', 'photoshop', 
    'tableau', 'power bi','agile', 'scrum', 'jira', 'communication', 'leadership',
    'teamwork',
]

# ─── REGISTER ───────────────────────────
def reg(request):
    return render(request, 'reg.html')

def extract_skills_from_cv(cv_file):
    """Extract skills from uploaded CV PDF file."""
    try:
        # Read PDF bytes
        pdf_bytes = cv_file.read()
        cv_file.seek(0)  # Reset file pointer after reading

        # Open PDF with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # Extract all text from all pages
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        # Convert to lowercase for matching
        text_lower = full_text.lower()

        # Match against skills list
        found_skills = []
        for skill in SKILLS_LIST:
            if skill.lower() in text_lower:
                # Store in proper case
                found_skills.append(skill.title())

        # Remove duplicates and return as comma-separated string
        unique_skills = list(dict.fromkeys(found_skills))
        return ', '.join(unique_skills)

    except Exception as e:
        print(f"Skill extraction error: {e}")
        return ""

def insert_data(request):
    if request.method == "POST":
        name     = request.POST.get("name")
        email    = request.POST.get("email")
        phoneno  = request.POST.get("phone")
        course   = request.POST.get("course")
        cv_url      = None
        profile_url = None
        fs = FileSystemStorage()

        cv = request.FILES.get('cv')
        if cv:
            
            extracted_skills = extract_skills_from_cv(cv)
            cv.seek(0)
            
            file   = fs.save(fs.get_available_name(cv.name), cv)
            cv_url = fs.url(file)

        profile = request.FILES.get('photo')
        if profile:
            file        = fs.save(fs.get_available_name(profile.name), profile)
            profile_url = fs.url(file)

        password = get_random_string(10, string.ascii_letters + string.digits)
        user = user_detail(
            full_name=name, Email=email, phoneno=phoneno,
            course=course, cv_url=cv_url, profile_url=profile_url,
            user_pass=password, skills=extracted_skills,
        )
        user.save()

        send_mail(
            "Your InternHub Login Password",
            f"Hi {name},\n\nYour account is ready!\nEmail: {email}\nPassword: {password}\n\nRegards,\nInternHub Team",
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return render(request, 'login.html')

# ─── LOGIN / LOGOUT ─────────────────────
def login(request):
    return render(request, 'login.html')


def logout(request):
    request.session.flush()
    return redirect('login')


def login_user(request):
    if request.method == "POST":
        email    = request.POST.get("email")
        password = request.POST.get("password")
        try:
            user = user_detail.objects.get(Email=email, user_pass=password)
            request.session['userid'] = user.id
            request.session['role']   = user.role
            request.session['name']   = user.full_name

            if user.role == "user":
                return redirect('user_dashboard')
            elif user.role == "admin":
                return redirect('admin_dashboard')
            else:
                return redirect('hr_dashboard')
        except user_detail.DoesNotExist:
            return render(request, 'login.html', {'error': 'Invalid email or password'})


# ─── DASHBOARDS ─────────────────────────

def user_dashboard(request):

    if request.session.get('role') != 'user':
        return redirect('login')

    user = user_detail.objects.get(id=request.session.get('userid'))
    companies = Employee.objects.all()
    
    user_id = request.session.get('userid')

    notifications = Notification.objects.filter(user_id=user_id).order_by('-created_at')
    
    print("165")
    print(notifications.count())
    
    for n in notifications:
        print(f"Notification: {n.message} (Job: {n.job.job_title if n.job else 'N/A'})")
    
    user_skills = []
    if user.skills:
        user_skills = [s.strip().lower() for s in user.skills.split(",")]

    jobs = Job.objects.filter(status='open').order_by('id')

    for job in jobs:
        if job.skills:
            job.skill_list = [s.strip() for s in job.skills.split(",")]
            job_skill_lower = [s.strip().lower() for s in job.skills.split(",")]
        else:
            job.skill_list = []
            job_skill_lower = []

        if job_skill_lower:
            common_skills = set(user_skills) & set(job_skill_lower)
            match_percent = int((len(common_skills) / len(job_skill_lower)) * 100)
        else:
            match_percent = 0

        job.match = match_percent

    applied_jobs = application.objects.filter(
        user_id=user
    ).values_list('job_id_id', flat=True)

    applied_job_ids = list(applied_jobs)

    return render(request, "user_dashboard.html", {
        "user": user,
        "jobs": jobs,
        "skills": user_skills,
        "company": companies,
        "applied_job_ids": applied_job_ids,
        'notifications': notifications,
        'unread_count': notifications.filter(is_read=False).count(),
    })
    
@require_POST
def mark_all_read(request):
    user_id = request.session.get('userid')
    Notification.objects.filter(user_id=user_id, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'ok'})

@require_POST
def delete_notification(request):
    user_id = request.session.get('userid')
    notif_id = request.POST.get('notif_id')
    try:
        notif = Notification.objects.get(id=notif_id, user_id=user_id)
        notif.delete()
        return JsonResponse({'status': 'deleted'})
    except Notification.DoesNotExist:
        return JsonResponse({'status': 'error'}, status=404)

def admin_dashboard(request):
    if request.session.get('role') != 'admin':
        return redirect('login')

    admin      = user_detail.objects.get(id=request.session.get('userid'))
    users      = user_detail.objects.all().order_by('id')
    emp        = Employee.objects.all().order_by('id')
    emp_count  = Employee.objects.count()
    hr_count   = user_detail.objects.filter(role='hr').count()
    student_count = user_detail.objects.exclude(role__in=['hr','emp','admin']).count()

    return render(request, "admin_dashboard.html", {
        "admin": admin,
        "users": users,
        "emp": emp,
        "emp_count": emp_count,
        "hr_count": hr_count,
        "student_count": student_count,
    })

def hr_dashboard(request):

    company = Employee.objects.all()
    hr_id = request.session.get('userid')
    print(f"HR ID in session: {hr_id}")
    job_queryset = Job.objects.all().order_by('id').annotate(
        app_count=Count('application', filter=Q(application__status='pending'))
    )
    
    hr_jobs = Job.objects.filter(hr_id=1, status='open').select_related('company_id')
    

    job_list = []
    for j in job_queryset:
        if j.skills:
            j.skills_list = [s.strip() for s in j.skills.split(',') if s.strip()]
        else:
            j.skills_list = []
        job_list.append(j)

    # ⭐ NEW PART — APPROVED APPLICATIONS
    approved_apps = application.objects.filter(status='approved').select_related('user_id', 'job_id').order_by('-applied_at')

    approved_list = []
    for app in approved_apps:

        user = app.user_id
        job  = app.job_id
        approved_list.append({
            "job_id": job.id,
            "name": user.full_name,
            "email": user.Email,
            "course": user.course,
            "cv_url": user.cv_url,  # Just to show how to access CV URL if needed
            "skills": user.skills,
            "applied_on": app.applied_at,
            "approved_on": app.updated_at if hasattr(app,'updated_at') else app.applied_at,
            "job_title": job.job_title,
            "company": job.company_id.company_name if job.company_id else "N/A",
            "location": job.location,
            "duration": job.duration,
            "stipend": job.stipend,
        })


     # =====================================================
    # ⭐ REJECTED APPLICATIONS  (NEW PART)
    # =====================================================
        rejected_apps = application.objects.filter(status='rejected') \
            .select_related('user_id', 'job_id') \
            .order_by('-applied_at')

        rejected_list = []
        for app in rejected_apps:
            user = app.user_id
            job  = app.job_id

            rejected_list.append({
                "job_id": job.id,
                "name": user.full_name,
                "email": user.Email,
                "course": user.course,
                "year": getattr(user, "year", ""),
                "skills": user.skills,
                "applied_on": app.applied_at,
                "rejected_on": app.updated_at if hasattr(app,'updated_at') else app.applied_at,
                "reason": getattr(app, "feedback", "Insufficient skill match"),
                "job_title": job.job_title,
                "company": job.company_id.company_name if job.company_id else "N/A",
                "location": job.location,
                "duration": job.duration,
                "stipend": job.stipend,
            })

    return render(request, 'hr_dashboard.html', {
        'company': company,
        'job': job_list,
        'approved_apps': approved_list,  
        'rejected_apps': rejected_list, 
        'hr_jobs': hr_jobs,
        'job_total': job_queryset.count(),
        'job_open': job_queryset.filter(status='open').count(),
        'job_draft': job_queryset.filter(status='draft').count(),
        'job_closed': job_queryset.filter(status='closed').count(),
        'total_apps_count': application.objects.count(),
        'approved_apps_count': len(approved_list),
        'rejected_apps_count': len(rejected_list),
        'pending_apps_count': application.objects.filter(status='pending').count(),
    })

# ─── PASSWORD ───────────────────────────
def change_password(request):
    if not request.session.get('userid'):
        return JsonResponse({'status': 'error', 'message': 'Login required'})

    if request.method == "POST":
        current = request.POST.get("current_password")
        new     = request.POST.get("new_password")
        confirm = request.POST.get("confirm_password")
        user    = user_detail.objects.get(id=request.session['userid'])

        if user.user_pass != current:
            return JsonResponse({'status': 'error', 'message': 'Current password incorrect'})
        if new != confirm:
            return JsonResponse({'status': 'error', 'message': 'Passwords do not match'})
        if len(new) < 8:
            return JsonResponse({'status': 'error', 'message': 'Minimum 8 characters required'})

        user.user_pass = new
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Password updated successfully'})

def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get("email")
        try:
            user = user_detail.objects.get(Email=email)
            send_mail(
                "Your InternHub Login Password",
                f"Hi {user.full_name},\n\nYour password is: {user.user_pass}\n\nRegards,\nInternHub Team",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return render(request, 'forgot_password.html', {'msg': 'Password sent to your email ✅'})
        except user_detail.DoesNotExist:
            return render(request, 'forgot_password.html', {'error': 'Email does not exist ❌'})
    return render(request, 'forgot_password.html')

# ─── USER CRUD ───────────────────────────
def update_profile(request):
    if 'userid' not in request.session:
        return redirect('login')

    user = user_detail.objects.get(id=request.session['userid'])
    if request.method == "POST":
        user.full_name = request.POST.get("name")
        user.Email     = request.POST.get("email")
        user.phoneno   = request.POST.get("phone")
        user.course    = request.POST.get("course")

        profile = request.FILES.get('photo')
        if profile:
            fs = FileSystemStorage()
            filename = fs.save(profile.name, profile)
            user.profile_url = fs.url(filename)
        user.save()
    return redirect('dashboard')


def get_user(request, id):
    try:
        u = user_detail.objects.get(id=id)
        return JsonResponse({
            'id':          u.id,
            'full_name':   u.full_name,
            'Email':       u.Email,
            'phoneno':     u.phoneno or '',
            'course':      u.course or '',
            'role':        u.role,
            'profile_url': u.profile_url or '',
        })
    except user_detail.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)


def edit_user(request, id):
    if request.method == "POST":
        try:
            u = user_detail.objects.get(id=id)
            u.full_name = request.POST.get('full_name', u.full_name)
            u.Email     = request.POST.get('Email', u.Email)
            u.phoneno   = request.POST.get('phoneno', u.phoneno)
            u.course    = request.POST.get('course', u.course)
            u.save()
            return JsonResponse({'success': True})
        except user_detail.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User not found'})
    return JsonResponse({'success': False})


def delete_user(request, id):
    try:
        u = user_detail.objects.get(id=id)
        u.delete()
    except user_detail.DoesNotExist:
        pass
    return redirect('admin_dashboard')


# ─── COMPANY CRUD ───────────────────────
def add_company(request):
    if request.method == "POST":
        Employee.objects.create(
            company_name=request.POST.get("company_name"),
            email=request.POST.get("email"),
            website=request.POST.get("website"),
            location=request.POST.get("location"),
        )
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


def view_company(request, id):
    try:
        c = Employee.objects.get(id=id)
        return JsonResponse({
            "id":           c.id,
            "company_name": c.company_name,
            "email":        c.email,
            "website":      c.website,
            "location":     c.location,
            "created":      c.created_at.strftime("%d %b %Y"),
            # ⭐ Meta connection status
            "is_meta_connected": c.is_meta_connected,
            "fb_page_id":        c.fb_page_id or '',
            "ig_account_id":     c.ig_account_id or '',
        })
    except Employee.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


def edit_company(request, id):
    if request.method == "POST":
        try:
            company              = Employee.objects.get(id=id)
            company.company_name = request.POST.get("company_name")
            company.email        = request.POST.get("email")
            company.website      = request.POST.get("website")
            company.location     = request.POST.get("location")
            company.save()
            return JsonResponse({
                "success":      True,
                "id":           company.id,
                "company_name": company.company_name,
                "email":        company.email,
                "website":      company.website,
                "location":     company.location,
            })
        except Employee.DoesNotExist:
            return JsonResponse({"success": False, "message": "Company not found"})
    return JsonResponse({"success": False})


def delete_company(request, id):
    if request.method == "POST":
        try:
            Employee.objects.get(id=id).delete()
            return JsonResponse({"success": True})
        except Employee.DoesNotExist:
            return JsonResponse({"success": False})
    return JsonResponse({"success": False})


# ─── JOB CRUD ───────────────────────────
def add_job(request):
    hr_id = request.session.get('userid')
    if request.method == "POST":
        try:
            data         = json.loads(request.body)
            employee_obj = Employee.objects.get(id=data["company"])
            job = Job.objects.create(
                job_title   = data.get("job_title"),
                company_id  = employee_obj,
                location    = data.get("location"),
                duration    = data.get("duration"),
                stipend     = data.get("stipend"),
                deadline    = data.get("deadline"),
                skills      = data.get("skills"),
                description = data.get("description"),
                status      = data.get("status"),
                hr_id       = user_detail.objects.get(id=hr_id)
            )
            return JsonResponse({"success": True, "job": {
                "title":    job.job_title,
                "company":  job.company_id.company_name,
                "location": job.location,
                "status":   job.status,
            }})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False})


def edit_job(request):
    if request.method == "POST":
        try:
            data            = json.loads(request.body)
            job             = Job.objects.get(id=data.get("job_id"))
            job.job_title   = data.get("job_title")
            job.location    = data.get("location")
            job.duration    = data.get("duration")
            job.stipend     = data.get("stipend")
            job.deadline    = data.get("deadline") or None
            job.skills      = data.get("skills")
            job.description = data.get("description")
            job.status      = data.get("status")
            job.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False})


def delete_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            Job.objects.get(id=data.get("job_id")).delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False})

def connect_meta(request, company_id):
    """
    Step 1: Store company_id in session, redirect user to Facebook login
    """
    # Save which company is connecting
    request.session["connecting_company_id"] = company_id

    # Build Facebook OAuth URL
    fb_login_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth"
        f"?client_id={APP_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=pages_show_list,pages_manage_posts,"
        f"instagram_basic,instagram_content_publish"
        f"&response_type=code"
    )

    # This redirects user to Facebook login page
    return redirect(fb_login_url)


def get_long_lived_token(short_token):
    """
    Convert short-lived token (1 hour) to long-lived token (60 days)
    """
    response = requests.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        params={
            "grant_type":        "fb_exchange_token",
            "client_id":         APP_ID,
            "client_secret":     APP_SECRET,
            "fb_exchange_token": short_token,
        }
    ).json()

    return response.get("access_token")

def meta_callback(request):
    """
    Step 2: Facebook redirects back here with a 'code'
    We exchange it for tokens and save everything to DB
    """

    # Get the company we're connecting
    company_id = request.session.get("connecting_company_id")

    if not company_id:
        return redirect('/admin-dashboard/')

    try:
        company = Employee.objects.get(id=company_id)
    except Employee.DoesNotExist:
        return redirect('/admin-dashboard/')

    # Check for errors from Facebook
    error = request.GET.get("error")
    if error:
        error_reason = request.GET.get("error_reason", "Unknown error")
        # Redirect back with error message
        return redirect(f'/admin-dashboard/?meta_error={error_reason}')

    # Get the authorization code from URL
    code = request.GET.get("code")
    if not code:
        return redirect('/admin-dashboard/')

    try:
        # ── STEP A: Exchange code for short-lived token ──
        token_response = requests.get(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            params={
                "client_id":     APP_ID,
                "redirect_uri":  REDIRECT_URI,
                "client_secret": APP_SECRET,
                "code":          code,
            }
        ).json()

        short_token = token_response.get("access_token")
        if not short_token:
            return redirect('/admin-dashboard/?meta_error=token_failed')

        # ── STEP B: Convert to long-lived token (60 days) ──
        long_token = get_long_lived_token(short_token)
        if not long_token:
            return redirect('/admin-dashboard/?meta_error=longtoken_failed')

        # ── STEP C: Get Facebook Pages owned by user ──
        pages_response = requests.get(
            "https://graph.facebook.com/v18.0/me/accounts",
            params={"access_token": long_token}
        ).json()

        pages = pages_response.get("data", [])
        if not pages:
            return redirect('/admin-dashboard/?meta_error=no_pages')

        # Use the first page (you can later let user choose)
        page        = pages[0]
        page_id     = page["id"]
        page_token  = page["access_token"]
        page_name   = page.get("name", "")

        # ── STEP D: Get Instagram Business Account linked to the Page ──
        ig_response = requests.get(
            f"https://graph.facebook.com/v18.0/{page_id}",
            params={
                "fields":       "instagram_business_account",
                "access_token": page_token,
            }
        ).json()

        ig_id = None
        if "instagram_business_account" in ig_response:
            ig_id = ig_response["instagram_business_account"]["id"]

        # ── STEP E: Save everything to database ──
        company.fb_page_id        = page_id
        company.ig_account_id     = ig_id  # can be None if no IG linked
        company.page_access_token = page_token
        company.is_meta_connected = True
        company.save()

        # Clear session
        del request.session["connecting_company_id"]

        # Redirect back to admin with success
        return redirect('/admin-dashboard/?meta_success=1')

    except Exception as e:
        print(f"Meta callback error: {e}")
        return redirect('/admin-dashboard/?meta_error=server_error')
    
def apply_job(request):
    if request.method == "POST":
        user_id = request.session.get('userid')
        job_id = request.POST.get('job_id')

        user_obj = user_detail.objects.get(id=user_id)
        job_obj  = Job.objects.get(id=job_id)

        already = application.objects.filter(
            user_id=user_obj,
            job_id=job_obj
        ).exists()

        if not already:
            application.objects.create(
                user_id=user_obj,
                job_id=job_obj
            )
            return JsonResponse({"status":"success"})

        return JsonResponse({"status":"exists"})
    
def toggle_apply_job(request):
    if request.method == "POST":
        user_id = request.session.get('userid')
        job_id = request.POST.get('job_id')

        user_obj = user_detail.objects.get(id=user_id)
        job_obj  = Job.objects.get(id=job_id)

        existing = application.objects.filter(
            user_id=user_obj,
            job_id=job_obj
        ).first()
        if existing:
            existing.delete()
            return JsonResponse({"status":"removed"})
        else:
            application.objects.create(
                user_id=user_obj,
                job_id=job_obj
            )
            return JsonResponse({"status":"applied"})
    
def view_applications(request, job_id):

    applications = application.objects.filter(job_id=job_id).select_related('user_id')
    data = []

    for app in applications:
        data.append({
            "id": app.id,
            "name": app.user_id.full_name,
            "email": app.user_id.Email,
            "date": app.applied_at.strftime("%b %d, %Y"),
            "status": app.status
        })
        
    return JsonResponse({"applications": data})


@csrf_exempt
def update_application_status(request):
    if request.method == "POST":
        data = json.loads(request.body)

        app_id = data.get("id")
        status = data.get("status")

        app = application.objects.get(id=app_id)
        app.status = status
        app.save()

        return JsonResponse({"success": True})

def save_process(request):

    data = json.loads(request.body)

    job_id = int(data.get("job_id"))
    stage = data.get("stage")
    date = data.get("date")
    action = data.get("action")

    process, created = JobProcess.objects.get_or_create(job_id=job_id)

    # Convert date string to datetime
    if date:
        date = datetime.strptime(date, "%Y-%m-%dT%H:%M")

    # APPLY / UPDATE
    if action in ["apply", "update"]:

        if stage == "mcq":
            process.mcq_date = date

        elif stage == "machine":
            process.machine_test_date = date

        elif stage == "hr":
            process.hr_interview_date = date

        process.save()

        # ── NOTIFICATIONS ──
        stage_labels = {"mcq": "MCQ Test", "machine": "Machine Test", "hr": "HR Interview"}
        job = process.job
        formatted_date = date.strftime("%B %d, %Y at %I:%M %p")
        message = (f"📅 {stage_labels.get(stage)} for '{job.job_title}' has been "
                   f"{'scheduled' if action == 'apply' else 'rescheduled'} on {formatted_date}.")
        approved_apps = application.objects.filter(job_id=job, status='approved').select_related('user_id')
        Notification.objects.bulk_create([
            Notification(user=app.user_id, job=job, message=message, is_read=False)
            for app in approved_apps
        ])
        # ── END NOTIFICATIONS ──
        send_notification_emails(
            approved_apps,
            subject=f"InternHub: {stage_labels.get(stage)} — {job.job_title}",
            message=message,
            stage_label=stage_labels.get(stage),
            job=job,
            action=action
        )
    # REMOVE
    elif action == "remove":

        if stage == "mcq":
            process.mcq_date = None

        elif stage == "machine":
            process.machine_test_date = None

        elif stage == "hr":
            process.hr_interview_date = None

        # ── NOTIFICATIONS ──
        stage_labels = {"mcq": "MCQ Test", "machine": "Machine Test", "hr": "HR Interview"}
        job = process.job
        message = f"❌ {stage_labels.get(stage)} for '{job.job_title}' has been cancelled."
        approved_apps = application.objects.filter(job_id=job, status='approved').select_related('user_id')
        Notification.objects.bulk_create([
            Notification(user=app.user_id, job=job, message=message, is_read=False)
            for app in approved_apps
        ])
        # ── END NOTIFICATIONS ──
        
        send_notification_emails(
            approved_apps,
            subject=f"InternHub: {stage_labels.get(stage)} Cancelled — {job.job_title}",
            message=message,
            stage_label=stage_labels.get(stage),
            job=job,
            action="remove"
        )
                
        # delete row if all empty
        if not any([
            process.mcq_date,
            process.machine_test_date,
            process.hr_interview_date
        ]):
            process.delete()
        else:
            process.save()

    return JsonResponse({"status": "success"})

from django.core.mail import EmailMultiAlternatives

def send_notification_emails(approved_apps, subject, message, stage_label, job, action):
    
    for app in approved_apps:
        user = app.user_id
        if not user.Email:
            continue

        # HTML Email Template
        if action == "remove":
            icon = "❌"
            color = "#dc2626"
            badge_bg = "#fff0f0"
            badge_color = "#dc2626"
            badge_text = "CANCELLED"
            action_text = f"Unfortunately, the <strong>{stage_label}</strong> for <strong>{job.job_title}</strong> has been cancelled."
            footer_note = "Please check your dashboard for updates or contact your HR."
        else:
            icon = "📅"
            color = "#0a0a0a"
            badge_bg = "#f0fdf4"
            badge_color = "#16a34a"
            badge_text = "SCHEDULED" if action == "apply" else "RESCHEDULED"
            action_text = f"Your <strong>{stage_label}</strong> for <strong>{job.job_title}</strong> has been <strong>{'scheduled' if action == 'apply' else 'rescheduled'}</strong>."
            footer_note = "Please be prepared and log in to your dashboard for more details."

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'DM Sans',Arial,sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;">

                <!-- HEADER -->
                <tr>
                  <td style="background:#0a0a0a;padding:28px 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;background:#ffffff;padding:4px 10px;font-size:13px;font-weight:900;color:#0a0a0a;letter-spacing:-0.02em;">IH</span>
                          <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.02em;margin-left:10px;">InternHub</span>
                          <span style="color:#6b6b6b;font-size:9px;font-weight:600;border:1px solid #3d3d3d;padding:2px 7px;margin-left:8px;text-transform:uppercase;letter-spacing:0.04em;">Beta</span>
                        </td>
                        <td align="right">
                          <span style="background:{badge_bg};color:{badge_color};font-size:9px;font-weight:700;padding:4px 10px;letter-spacing:0.08em;text-transform:uppercase;border:1px solid {badge_color};">{badge_text}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ICON BAR -->
                <tr>
                  <td style="background:{color};padding:20px 36px;text-align:center;font-size:28px;">
                    {icon}
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:36px 36px 28px;">

                    <p style="font-size:22px;font-weight:900;color:#0a0a0a;margin:0 0 8px;letter-spacing:-0.03em;">
                      Hi {user.full_name},
                    </p>
                    <p style="font-size:14px;color:#6b6b6b;margin:0 0 28px;line-height:1.6;">
                      {action_text}
                    </p>

                    <!-- INFO BOX -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border:1px solid #ebebeb;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:14px;border-bottom:1px solid #ebebeb;">
                                <div style="font-size:9px;font-weight:700;color:#a0a0a0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Position</div>
                                <div style="font-size:14px;font-weight:700;color:#0a0a0a;">{job.job_title}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #ebebeb;">
                                <div style="font-size:9px;font-weight:700;color:#a0a0a0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Company</div>
                                <div style="font-size:14px;font-weight:600;color:#3d3d3d;">{job.company_id.company_name if job.company_id else 'N/A'}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:14px;padding-bottom:14px;border-bottom:1px solid #ebebeb;">
                                <div style="font-size:9px;font-weight:700;color:#a0a0a0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Stage</div>
                                <div style="font-size:14px;font-weight:600;color:#3d3d3d;">{stage_label}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:14px;">
                                <div style="font-size:9px;font-weight:700;color:#a0a0a0;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Details</div>
                                <div style="font-size:14px;color:#3d3d3d;">{message}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:12px;color:#a0a0a0;margin:0;line-height:1.7;">
                      {footer_note}
                    </p>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#0a0a0a;padding:20px 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size:11px;color:#6b6b6b;">© 2026 InternHub · All rights reserved</span>
                        </td>
                        <td align="right">
                          <span style="font-size:11px;color:#6b6b6b;">Do not reply to this email</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>

        </body>
        </html>
        """

        email_msg = EmailMultiAlternatives(
            subject=subject,
            body=message,  # plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.Email]
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send(fail_silently=True)
        
def get_process(request,job_id):
    try:
        process = JobProcess.objects.get(job_id=job_id)

        data = {
            "mcq_date": process.mcq_date,
            "machine_test_date": process.machine_test_date,
            "hr_interview_date": process.hr_interview_date
        }

    except JobProcess.DoesNotExist:

        data = {
            "mcq_date": None,
            "machine_test_date": None,
            "hr_interview_date": None
        }

    return JsonResponse(data)