from django.contrib import admin
from django.urls import path,include
from . import views
from mcq_exam.views import start_exam
from m_test.views import exam_start

urlpatterns = [
    path('',views.login,name="login"),
    path('reg/',views.reg,name="reg"),
    path('insert_data/',views.insert_data,name="insert_data"),
    path('user_dashboard/',views.user_dashboard,name="user_dashboard"),
    path('hr_dashboard/',views.hr_dashboard,name="hr_dashboard"),
    path('logout/',views.logout,name="logout"),
    path('login_user/',views.login_user,name="login_user"),
    path('change_password/', views.change_password, name="change_password"),

    path('add-hr/', views.add_hr, name='add_hr'),
    path('get-hr/<int:id>/', views.get_hr, name='get_hr'),
    
    path('admin/edit-user/<int:id>/', views.edit_user, name='edit_user'),
    path('admin/get-user/<int:id>/', views.get_user, name='get_user'),
    path('admin/delete-user/<int:id>/', views.delete_user, name='delete_user'),
    
    
    path('forgot_password/',                views.forgot_password,  name='forgot_password'),
    path('forgot_password/send-otp/',       views.send_otp,         name='forgot_send_otp'),
    path('forgot_password/verify-otp/',     views.verify_otp,       name='forgot_verify_otp'),
    path('forgot_password/reset-password/', views.reset_password,   name='forgot_reset_password'),
    
    path("update_profile/", views.update_profile, name="update_profile"),
    path("admin_dashboard/", views.admin_dashboard, name="admin_dashboard"),
    path("add_company/", views.add_company, name="add_company"),
    path("view_company/<int:id>/", views.view_company, name="view_company"),
    path("delete_company/<int:id>/", views.view_company, name="view_company"),
    path('edit_company/<int:id>/', views.edit_company, name='edit_company'),
    path('delete_company/<int:id>/', views.delete_company, name='delete_company'),
    path("add_job/", views.add_job, name="add_job"),
    path("edit_job/", views.edit_job, name="edit_job"),
    path("connect-meta/<int:company_id>/", views.connect_meta, name="connect_meta"),
    path("meta-callback/", views.meta_callback, name="meta_callback"),
    path('toggle-apply/', views.toggle_apply_job, name='toggle_apply_job'),
    path("view_applications/<int:job_id>/", views.view_applications, name="view_applications"),
    path("update_application_status/", views.update_application_status, name="update_application_status"),
    path("save-process/", views.save_process, name="save_process"),
    path("get-process/<int:id>/", views.get_process, name="get_process"),
    path('mark_all_read/', views.mark_all_read, name='mark_all_read'),
    path('delete_notification/', views.delete_notification, name='delete_notification'),
        
    path('mcq_exam/<int:job_id>/<int:user_id>/',start_exam,name='mcq_exam'),
    path('m_test/<int:job_id>/<int:user_id>/',exam_start,name='machine_test'),
    
    path('hr/api/calendar/', views.api_calendar_interviews, name='api_calendar_interviews'),
    path('get_ranklist/', views.get_ranklist, name='get_ranklist'),
     path('google-login-callback/', views.google_login_callback, name='google_login_callback'),
    
    # path('assessment/hr/<int:job_id>/',
    #      # Simple redirect / info page for the HR interview
    #      include('your_main_app.urls'),
    #      name='hr_interview'),
]

