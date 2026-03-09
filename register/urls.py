from django.contrib import admin
from django.urls import path,include
from . import views

urlpatterns = [
    path('',views.login,name="login"),
    path('reg/',views.reg,name="reg"),
    path('insert_data/',views.insert_data,name="insert_data"),
    path('user_dashboard/',views.user_dashboard,name="user_dashboard"),
    path('hr_dashboard/',views.hr_dashboard,name="hr_dashboard"),
    path('logout/',views.logout,name="logout"),
    path('login_user/',views.login_user,name="login_user"),
    path('change_password/', views.change_password, name="change_password"),
    path('forgot_password/', views.forgot_password, name="forgot_password"),
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
    path("get-process/<int:job_id>/", views.get_process, name="get_process"),
    path('mark_all_read/', views.mark_all_read, name='mark_all_read'),
    path('delete_notification/', views.delete_notification, name='delete_notification'),
]
