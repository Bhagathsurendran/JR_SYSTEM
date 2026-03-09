from django.db import models
from django.contrib.auth.models import User


class Submission(models.Model):
    """Records every code submission a user makes."""
    VERDICT_CHOICES = [
        ("accepted",      "Accepted"),
        ("wrong_answer",  "Wrong Answer"),
        ("runtime_error", "Runtime Error"),
        ("compile_error", "Compile Error"),
        ("time_limit",    "Time Limit Exceeded"),
        ("error",         "Error"),
    ]

    LANG_CHOICES = [
        ("C",      "C"),
        ("C++",    "C++"),
        ("Python", "Python"),
        ("Java",   "Java"),
        ("JS",     "JavaScript"),
    ]
    user         = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="submissions")
    problem_id   = models.PositiveIntegerField(db_index=True)
    language     = models.CharField(max_length=16, choices=LANG_CHOICES)
    code         = models.TextField()
    verdict      = models.CharField(max_length=20, choices=VERDICT_CHOICES)
    passed       = models.PositiveIntegerField(default=0)   # test cases passed
    total        = models.PositiveIntegerField(default=0)   # total test cases
    submitted_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ["-submitted_at"]
        indexes  = [
            models.Index(fields=["problem_id", "verdict"]),
            models.Index(fields=["user", "problem_id"]),
        ]
    def __str__(self):
        user_label = self.user.username if self.user else "anonymous"
        return f"[{self.verdict.upper()}] Problem {self.problem_id} by {user_label} ({self.language})"

    @property
    def is_accepted(self):
        return self.verdict == "accepted"

    @property
    def pass_rate(self):
        if self.total == 0:
            return 0.0
        return round(self.passed / self.total * 100, 1)