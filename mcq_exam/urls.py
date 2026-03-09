from django.urls import path
from . import views

urlpatterns = [
    path('', views.start_exam, name='start_exam'),
    path('exam/', views.exam_view, name='exam'),
    path('submit/', views.submit_exam, name='submit_exam'),
]
