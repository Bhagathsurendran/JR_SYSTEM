from django.urls import path
from . import views
from register.views import user_dashboard

urlpatterns = [
    path('', views.start_exam, name='start_exam'),
    path('exam/', views.exam_view, name='exam'),
    path('submit/', views.submit_exam, name='submit_exam'),
    path('user_dashboard/',user_dashboard,name='user_dashboard'),
    
    
]
