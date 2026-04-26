from django.urls import path
from . import views

app_name = 'ai_interview'

urlpatterns = [
    path('', views.interview_home, name='home'),
    path('room/', views.interview_room, name='room'),
    path('api/token/', views.get_realtime_token, name='token'),
]