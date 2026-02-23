from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponse
from .models import user_detail,Employee,Job
from django.utils.crypto import get_random_string
import string
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
import json


def reg(request):
    return render(request, 'reg.html')

def insert_data(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        phoneno = request.POST.get("phone")
        course = request.POST.get("course")
        
        
        cv_url = None
        profile_url = None

        fs = FileSystemStorage()

        cv = request.FILES.get('cv')
        if cv:
            file = fs.save(fs.get_available_name(cv.name), cv)
            cv_url = fs.url(file)

        profile = request.FILES.get('photo')
        if profile:
            file = fs.save(fs.get_available_name(profile.name), profile)
            profile_url = fs.url(file)
            
        password = get_random_string(10, string.ascii_letters + string.digits)
        user=user_detail(full_name=name,Email=email,phoneno=phoneno,course=course,cv_url=cv_url,profile_url=profile_url,user_pass=password)
        user.save()
            
        subject = "Your InternHub Login Password"
        message = f"""
        Hi {name},

        Your InternHub account has been created successfully 🎉

        Email: {email}
        Password: {password}

        Please change your password after login 🔐

        Regards,
            InternHub Team
                """

        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return render(request, 'login.html')
    
def user_dashboard(request):    
    if request.session.get('role') != 'user':
        return redirect('login')

    user_id = request.session.get('userid')
    user = user_detail.objects.get(id=user_id)
    
    return render(request, "user_dashboard.html", {"user": user})

def login(request):
    return render(request, 'login.html')

def logout(request):
    request.session.flush() 
    return redirect('login')  

def login_user(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        
        try:
            user = user_detail.objects.get(Email=email, user_pass=password)
            request.session['userid'] = user.id
            request.session['role'] = user.role
            request.session['name'] = user.full_name
            
            if user.role == "user":
                return redirect('user_dashboard')
            elif user.role == "admin":
                return redirect('admin_dashboard')
            else:
                return redirect('hr_dashboard')
                
            
        except user_detail.DoesNotExist:
              return render(request, 'login.html', {'error': 'Invalid email or password '}) 
def change_password(request):
    if not request.session.get('userid'):
        return JsonResponse({'status':'error','message':'Login required'})

    if request.method == "POST":
        current = request.POST.get("current_password")
        new = request.POST.get("new_password")
        confirm = request.POST.get("confirm_password")

        user = user_detail.objects.get(id=request.session['userid'])

        if user.user_pass != current:
            return JsonResponse({'status':'error','message':'Current password incorrect '})

        if new != confirm:
            return JsonResponse({'status':'error','message':'Passwords do not match '})

        if len(new) < 8:
            return JsonResponse({'status':'error','message':'Minimum 8 characters required '})

        user.user_pass = new
        user.save()

        return JsonResponse({'status':'success','message':'Password updated successfully ✅'})

def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get("email")

        try:
            user = user_detail.objects.get(Email=email)

            # SEND EMAIL
            subject = "Your InternHub Login Password"
            message = f"""
            Hi {user.full_name},

            Your InternHub account password is: {user.user_pass}

            Please change your password after login 🔐

            Regards,
                InternHub Team
                    """

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return render(request, 'forgot_password.html', {
                'msg': 'Password sent to your email ✅'
            })
        except user_detail.DoesNotExist:
              return render(request, 'forgot_password.html', {'error': 'Email does not exist ❌'}) 

    return render(request, 'forgot_password.html')

def update_profile(request):

    if 'user_id' not in request.session:
        return redirect('login')

    user = user_detail.objects.get(id=request.session['user_id'])

    if request.method == "POST":
        user.full_name = request.POST.get("name")
        user.Email = request.POST.get("email")
        user.phoneno = request.POST.get("phone")
        user.course = request.POST.get("course")

        # update profile image if uploaded
        profile = request.FILES.get('photo')
        if profile:
            fs = FileSystemStorage()
            filename = fs.save(profile.name, profile)
            user.profile_url = fs.url(filename)

        user.save()

    return redirect('dashboard')

def admin_dashboard(request):

    if request.session.get('role') != 'admin':
        return redirect('login')

    admin_id = request.session.get('userid')
    admin = user_detail.objects.get(id=admin_id)

    users = user_detail.objects.all().order_by('id')
    emp = Employee.objects.all().order_by('id')
    
    emp_count = Employee.objects.all().count()
    user_count = user_detail.objects.all().count()

    context = {
        "admin": admin,
        "users": users,
        "emp":emp,
        "emp_count": emp_count,
        "user_count": user_count,
    }

    return render(request, "admin_dashboard.html", context)

# Company
def add_company(request):
    if request.method == "POST":
        company_name = request.POST.get("company_name")
        email = request.POST.get("email")
        website = request.POST.get("website")
        location = request.POST.get("location")

        Employee.objects.create(
            company_name=company_name,
            email=email,
            website=website,
            location=location
        )

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})

def view_company(request, id):
    print("234")
    c = Employee.objects.get(id=id)
    
    data = {
        "company_name": c.company_name,
        "email": c.email,
        "website": c.website,
        "location": c.location,
        "created": c.created_at.strftime("%d %b %Y"),
    }
    return JsonResponse(data)

def edit_company(request, id):
    if request.method == "POST":
        try:
            company = Employee.objects.get(id=id)

            company.company_name = request.POST.get("company_name")
            company.email = request.POST.get("email")
            company.website = request.POST.get("website")
            company.location = request.POST.get("location")
            company.save()

            return JsonResponse({
                "success": True,
                "id": company.id,
                "company_name": company.company_name,
                "email": company.email,
                "website": company.website,
                "location": company.location,
            })

        except Employee.DoesNotExist:
            return JsonResponse({"success": False, "message": "Company not found"})

def delete_company(request, id):
    if request.method == "POST":
        try:
            company = Employee.objects.get(id=id)
            company.delete()
            return JsonResponse({"success": True})
        except Employee.DoesNotExist:
            return JsonResponse({"success": False})

def hr_dashboard(request):
    company = Employee.objects.all()
    job = Job.objects.all().order_by('id')
    
    # Pre-process skills so template doesn't need to call split()
    job_list = []
    for j in job:
        j.skills_list = [s.strip() for s in j.skills.split(',') if s.strip()]
        job_list.append(j)

    return render(request, 'hr_dashboard.html', {
        'company':    company,
        'job':        job_list,
        'job_total':  job.count(),
        'job_open':   job.filter(status='open').count(),
        'job_draft':  job.filter(status='draft').count(),
        'job_closed': job.filter(status='closed').count(),
    })
    
def add_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            employee_obj = Employee.objects.get(id=data["company"])

            job = Job.objects.create(
                job_title = data.get("job_title"),
                company_id = employee_obj,  
                location = data.get("location"),
                duration = data.get("duration"),
                stipend = data.get("stipend"),
                deadline = data.get("deadline"),
                skills = data.get("skills"),
                description = data.get("description"),
                status = data.get("status"),
            )

            return JsonResponse({
                "success": True,
                "job": {
                    "title": job.job_title,
                    "company": job.company_id.company_name, 
                    "location": job.location,
                    "duration": job.duration,
                    "stipend": job.stipend,
                    "status": job.status,
                    "skills": job.skills.split(",")
                }
            })

        except Exception as e:
            print("ERROR:", e)
            return JsonResponse({"success": False})

    return JsonResponse({"success": False})

def edit_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            job = Job.objects.get(id=data.get("job_id"))

            job.job_title   = data.get("job_title")
            job.company_id  = data.get("company")
            job.location    = data.get("location")
            job.duration    = data.get("duration")
            job.stipend     = data.get("stipend")
            job.deadline    = data.get("deadline") or None
            job.skills      = data.get("skills")
            job.description = data.get("description")
            job.status      = data.get("status")

            job.save()

            return JsonResponse({"success": True})

        except Job.DoesNotExist:
            return JsonResponse({"success": False, "error": "Job not found"})

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

    return JsonResponse({"success": False})

def delete_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            job_id = data.get("job_id")

            job = Job.objects.get(id=job_id)
            job.delete()

            return JsonResponse({"success": True})

        except Job.DoesNotExist:
            return JsonResponse({"success": False, "error": "Job not found"})

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})

    return JsonResponse({"success": False})

