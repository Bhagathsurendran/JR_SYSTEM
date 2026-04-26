import json
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings


def interview_home(request):
    return render(request, 'ai_interview/home.html')


def interview_room(request):
    job_role = request.GET.get('job_role', 'Software Engineer')
    return render(request, 'ai_interview/room.html', {'job_role': job_role})


@csrf_exempt
@require_http_methods(["POST"])
def get_realtime_token(request):
    try:
        data = json.loads(request.body)
        job_role = data.get('job_role', 'Software Engineer')

        system_prompt = f"""You are a professional interviewer conducting a job interview for a {job_role} position.

Your behavior:
- Ask ONE clear interview question at a time
- Mix technical, behavioral, and situational questions relevant to {job_role}
- After the candidate answers, give brief encouraging feedback (1-2 sentences)
- Then naturally move to the next question
- Be warm, professional, and encouraging
- After 5-6 questions, give a final performance summary

Start by warmly greeting the candidate and asking your first question.
Keep responses concise — this is a spoken conversation."""

        # Request ephemeral token from OpenAI
        response = requests.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-realtime-preview-2024-12-17",
                "voice": "alloy",
                "instructions": system_prompt,
                "input_audio_transcription": {"model": "whisper-1"},
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 800,
                },
            }
        )

        if response.status_code != 200:
            return JsonResponse({
                'success': False,
                'error': f'OpenAI API error: {response.text}'
            }, status=500)

        session_data = response.json()
        return JsonResponse({
            'success': True,
            'client_secret': session_data['client_secret']['value'],
            'session_id': session_data['id'],
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)