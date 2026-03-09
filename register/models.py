from django.db import models

class user_detail(models.Model):
    id=models.AutoField(primary_key=True)
    full_name=models.CharField(max_length=100)
    Email=models.EmailField(unique=True)
    phoneno=models.CharField(max_length=15)
    course=models.CharField(max_length=100)
    cv_url=models.CharField(max_length=200)
    profile_url=models.CharField(max_length=200)
    user_pass=models.CharField(max_length=100)  
    role=models.CharField(max_length=20, default="user")
    skills = models.TextField(blank=True, null=True)
    
class Employee(models.Model):
    company_name = models.CharField(max_length=200)
    email = models.EmailField(max_length=150, blank=True, null=True)
    website = models.URLField(max_length=150, blank=True, null=True)
    location = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    role=models.CharField(max_length=20, default="emp")
    
    # META CONNECTION FIELDS
    fb_page_id = models.CharField(max_length=255, blank=True, null=True)
    ig_account_id = models.CharField(max_length=255, blank=True, null=True)
    page_access_token = models.TextField(blank=True, null=True)
    is_meta_connected = models.BooleanField(default=False)
    

    def __str__(self):
        return self.company_name
    
class Job(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('draft', 'Draft'),
        ('closed', 'Closed'),
    )

    job_title = models.CharField(max_length=200)
    company_id = models.ForeignKey(Employee, on_delete=models.CASCADE)
    hr_id = models.ForeignKey(user_detail, on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    duration = models.CharField(max_length=100)
    stipend = models.CharField(max_length=100)

    deadline = models.DateField()

    skills = models.TextField(help_text="Comma separated skills")
    description = models.TextField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job_title

class application(models.Model):
    user_id = models.ForeignKey(user_detail, on_delete=models.CASCADE)
    job_id = models.ForeignKey(Job, on_delete=models.CASCADE)
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        default='pending',
        choices=[
            ('pending','Pending'),
            ('approved','Approved'),
            ('rejected','Rejected')
        ]
    )
    
    def __str__(self):
        return f"{self.user_id.full_name} - {self.job_id.job_title}"

class JobProcess(models.Model):

    job = models.ForeignKey(Job, on_delete=models.CASCADE)

    mcq_date = models.DateTimeField(null=True, blank=True)
    machine_test_date = models.DateTimeField(null=True, blank=True)
    hr_interview_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.job.job_title

class Notification(models.Model):
    user = models.ForeignKey(user_detail, on_delete=models.CASCADE)
    job  = models.ForeignKey(Job, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.full_name}"
    
# class RegisterUserDetail(models.Model):
#     ROLE_CHOICES = (
#         ('user', 'User'),
#         ('hr', 'HR'),
#         ('admin', 'Admin'),
#     )

#     full_name = models.CharField(max_length=100)
#     Email = models.EmailField(unique=True)
#     phoneno = models.CharField(max_length=15)
#     course = models.CharField(max_length=100)
#     cv_url = models.FileField(upload_to='media/')
#     profile_url = models.ImageField(upload_to='media/')
#     user_pass = models.CharField(max_length=100)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

#     def __str__(self):
#         return self.full_name
    
# class HRDetail(models.Model):
#     user = models.OneToOneField(
#         RegisterUserDetail,
#         on_delete=models.CASCADE,
#         related_name='hr_profile'
#     )
#     department = models.CharField(max_length=100)
#     joining_date = models.DateField(auto_now_add=True)

#     def __str__(self):
#         return f"HR - {self.user.full_name}"

# class AdminDetail(models.Model):
#     user = models.OneToOneField(
#         RegisterUserDetail,
#         on_delete=models.CASCADE,
#         related_name='admin_profile'
#     )
#     access_level = models.CharField(max_length=50, default='full')

#     def __str__(self):
#         return f"Admin - {self.user.full_name}"


# Create your models here.
