import uuid
from django.db import models
from django.contrib.auth.models import User


# class InterviewRoom(models.Model):
#     STATUS_CHOICES = [
#         ('waiting',   'Waiting'),
#         ('active',    'Active'),
#         ('ended',     'Ended'),
#     ]

#     room_id     = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     title       = models.CharField(max_length=200, default='Interview')
#     hr_user     = models.ForeignKey(User, related_name='hr_rooms',        on_delete=models.CASCADE)
#     candidate   = models.ForeignKey(User, related_name='candidate_rooms', on_delete=models.CASCADE)
#     status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
#     scheduled_at = models.DateTimeField(null=True, blank=True)
#     created_at  = models.DateTimeField(auto_now_add=True)
#     ended_at    = models.DateTimeField(null=True, blank=True)
#     notes       = models.TextField(blank=True)          # HR private notes

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.title} | {self.hr_user.username} ↔ {self.candidate.username}"

#     def get_room_url(self):
#         return f"/interview/room/{self.room_id}/"
