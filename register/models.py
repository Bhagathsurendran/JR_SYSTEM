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
    
class Employee(models.Model):
    company_name = models.CharField(max_length=200)
    email = models.EmailField(max_length=150, blank=True, null=True)
    website = models.URLField(max_length=150, blank=True, null=True)
    location = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    role=models.CharField(max_length=20, default="emp")

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
