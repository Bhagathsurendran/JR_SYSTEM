from rest_framework import serializers
from .models import Submission

#Submission serializers

class SubmissionSerializer(serializers.ModelSerializer):
    """Full submission record — used for listing / detail views."""
    user      = serializers.StringRelatedField(read_only=True)
    is_accepted = serializers.BooleanField(read_only=True)
    pass_rate   = serializers.FloatField(read_only=True)

    class Meta:
        model  = Submission
        fields = [
            "id", "user", "problem_id", "language",
            "code", "verdict", "passed", "total",
            "is_accepted", "pass_rate", "submitted_at",
        ]
        read_only_fields = ["id", "submitted_at"]


class SubmissionCreateSerializer(serializers.Serializer):
    """Validates the POST body for /api/run/ and /api/submit/."""
    code = serializers.CharField(min_length=1, max_length=64_000)
    lang = serializers.ChoiceField(choices=["C", "C++", "Python", "Java", "JS"])

#Problem serializers(plain dict-based, no DB model needed)

class ExampleSerializer(serializers.Serializer):
    input       = serializers.CharField()
    output      = serializers.CharField()
    explanation = serializers.CharField()

class TestCaseSerializer(serializers.Serializer):
    input    = serializers.CharField()
    expected = serializers.CharField()

class SolutionSerializer(serializers.Serializer):
    approach    = serializers.CharField()
    explanation = serializers.CharField()
    time        = serializers.CharField()
    space       = serializers.CharField()
    code        = serializers.DictField(child=serializers.CharField())

class ProblemSerializer(serializers.Serializer):
    """Serializes the PROBLEMS dict entries for API responses."""
    id          = serializers.IntegerField()
    title       = serializers.CharField()
    difficulty  = serializers.ChoiceField(choices=["Easy", "Medium", "Hard"])
    tags        = serializers.ListField(child=serializers.CharField())
    description = serializers.CharField()
    examples    = ExampleSerializer(many=True)
    constraints = serializers.DictField(child=serializers.CharField())
    hint        = serializers.CharField()
    approach    = serializers.CharField()
    test_cases  = TestCaseSerializer(many=True)
    solution    = SolutionSerializer()
    # starter code dict is optional in list responses
    starter     = serializers.DictField(child=serializers.CharField(), required=False)

class ProblemListSerializer(serializers.Serializer):
    """Lightweight serializer for the problem list (no starter/solution)."""
    id         = serializers.IntegerField()
    title      = serializers.CharField()
    difficulty = serializers.CharField()
    tags       = serializers.ListField(child=serializers.CharField())

# Run/Submit response serializers

class RunResultSerializer(serializers.Serializer):
    stdout      = serializers.CharField(allow_blank=True)
    stderr      = serializers.CharField(allow_blank=True)
    compile_err = serializers.CharField(allow_blank=True)
    exit_code   = serializers.IntegerField()
    cpu_time    = serializers.CharField()
    memory      = serializers.CharField()

class CaseResultSerializer(serializers.Serializer):
    index    = serializers.IntegerField()
    verdict  = serializers.CharField()
    label    = serializers.CharField()
    passed   = serializers.BooleanField()
    actual   = serializers.CharField(required=False, allow_blank=True)
    expected = serializers.CharField(required=False, allow_blank=True)
    cpu_time = serializers.CharField(required=False)
    memory   = serializers.CharField(required=False)

class SubmitSummarySerializer(serializers.Serializer):
    verdict = serializers.CharField()
    label   = serializers.CharField()
    passed  = serializers.IntegerField()
    total   = serializers.IntegerField()
    lang    = serializers.CharField()

class SubmitResponseSerializer(serializers.Serializer):
    ok           = serializers.BooleanField()
    summary      = SubmitSummarySerializer()
    case_results = CaseResultSerializer(many=True)
