from django.urls import path
from . import views

urlpatterns = [
    path('lobby/<uuid:room_id>/',  views.lobby,      name='lobby'),
    path('room/<uuid:room_id>/',   views.room,        name='room'),
    path('save_audio/<uuid:room_id>/',  views.save_audio, name='save_audio'),
    path('end/<uuid:room_id>/',    views.end_room,    name='end_room'),
    path('notes/<uuid:room_id>/',  views.save_notes,  name='save_notes'),
    path('ended/<uuid:room_id>/',  views.ended,       name='ended'),
    
]