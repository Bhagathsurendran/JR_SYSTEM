from django.urls import path
from . import views
from register.views import user_dashboard

urlpatterns = [
    path('',        views.exam_start, name='exam_start'),
    path('start/',  views.exam_start, name='exam_start'),
    path('arena/',  views.arena,      name='arena'),
    path('result/', views.result,     name='result'),  

    # Reset — pick new 3 random questions
    path('reset/',  views.reset_exam, name='reset_exam'),

    # API endpoints
    path('api/run/',              views.api_run,    name='api_run'),
    path('api/submit/<int:problem_id>/', views.api_submit, name='api_submit'),
    
    path('user_dashboard/',user_dashboard,name='user_dashboard'),
]