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
    path("delete_job/", views.delete_job, name="delete_job"),
]
