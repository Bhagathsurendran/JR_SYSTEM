from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, Http404, HttpResponse
from django.views.decorators.http import require_POST
import json
from django.core.files.base import ContentFile

from register.models import application, user_detail
import threading
from .ai_analysis import transcribe_audio, analyze_interview


def index(request, room_id):
    return HttpResponse(f"Interview app index. room_id: {room_id}")


def lobby(request, room_id):
    user_id = request.session.get('userid')
    role    = request.session.get('role')

    if not user_id:
        return redirect('login')

    application_obj = get_object_or_404(application, interview_room_id=room_id)
    current_user    = get_object_or_404(user_detail, id=user_id)

    is_hr        = (role == 'hr')
    is_candidate = (application_obj.user_id.id == user_id)

    if not (is_hr or is_candidate):
        raise Http404

    context = {
        'application_obj': application_obj,
        'room_id':         str(room_id),
        'is_hr':           is_hr,
        'role':            'hr' if is_hr else 'candidate',
        'my_name':         current_user.full_name,
        'candidate':       application_obj.user_id,
        'hr_user':         application_obj.job_id.hr_id,
    }
    return render(request, 'interview/lobby.html', context)


def room(request, room_id):
    user_id = request.session.get('userid')
    role    = request.session.get('role')

    if not user_id:
        return redirect('login')

    application_obj = get_object_or_404(application, interview_room_id=room_id)
    current_user    = get_object_or_404(user_detail, id=user_id)

    is_hr        = (role == 'hr')
    is_candidate = (application_obj.user_id.id == user_id)

    if not (is_hr or is_candidate):
        raise Http404

    candidate  = application_obj.user_id
    job        = application_obj.job_id
    hr_user    = job.hr_id

    context = {
        'application_obj': application_obj,
        'room_id':         str(room_id),
        'is_hr':           is_hr,
        'role':            'hr' if is_hr else 'candidate',
        'my_name':         current_user.full_name,
        'candidate':       candidate,
        'hr_user':         hr_user,
        'room_title':      f"{candidate.full_name} — {job.job_title}",
        'room_notes':      application_obj.interview_feedback or '',
    }
    return render(request, 'interview/room.html', context)


def ended(request, room_id):
    user_id = request.session.get('userid')
    role    = request.session.get('role')

    if not user_id:
        return redirect('login')

    application_obj = get_object_or_404(application, interview_room_id=room_id)
    is_hr = (role == 'hr')

    context = {
        'application_obj': application_obj,
        'room_id':         str(room_id),
        'is_hr':           is_hr, 
    }
    return render(request, 'interview/ended.html', context)


@require_POST
def end_room(request, room_id):
    if request.session.get('role') != 'hr':
        raise Http404
    application_obj = get_object_or_404(application, interview_room_id=room_id)
    try:
        body     = json.loads(request.body)
        result   = body.get('result', '')
        feedback = body.get('feedback', '')
        application_obj.status='interview_completed'
        application_obj.interview_result=result
        application_obj.interview_feedback = feedback
        application_obj.save()
    except Exception:
        print(result)
        application_obj.status = 'interview_completed'
        application_obj.interview_result=result
        application_obj.save()
    return JsonResponse({'ok': True})


@require_POST
def save_notes(request, room_id):
    if request.session.get('role') != 'hr':
        raise Http404
    application_obj = get_object_or_404(application, interview_room_id=room_id)
    try:
        body = json.loads(request.body)
        application_obj.interview_feedback = body.get('notes', '')
        application_obj.save()
        return JsonResponse({'ok': True})
    except Exception:
        return JsonResponse({'ok': False}, status=400)


def create_room(request):
    return redirect('/')

@require_POST
def save_audio(request, room_id):
    user_id = request.session.get('userid')
    if not user_id or request.session.get('role') != 'hr':
        return JsonResponse({'ok': False}, status=403)

    application_obj = get_object_or_404(application, interview_room_id=room_id)
    audio_file = request.FILES.get('audio')

    if not audio_file:
        return JsonResponse({'ok': False}, status=400)

    # Save the audio file
    application_obj.interview_recording.save(
        f"recording_{room_id}.webm",
        ContentFile(audio_file.read()),
        save=True
    )

    # Run analysis in background so it doesn't block the response
    thread = threading.Thread(
        target=run_analysis,
        args=(application_obj.id,)
    )
    thread.daemon = True
    thread.start()

    return JsonResponse({'ok': True})


def run_analysis(application_id):
    """Runs in background thread after audio is saved"""
    try:
        application_obj = application.objects.get(id=application_id)
        print(f"[AI] Starting analysis for application {application_id}")

        audio_path = application_obj.interview_recording.path
        print(f"[AI] Audio path: {audio_path}")

        import os
        if not os.path.exists(audio_path):
            print(f"[AI] ERROR: Audio file does not exist at {audio_path}")
            return

        print(f"[AI] File size: {os.path.getsize(audio_path)} bytes")

        job_title = application_obj.job_id.job_title

        # Step 1: Transcribe
        print("[AI] Starting transcription...")
        transcript = transcribe_audio(audio_path)
        print(175)
        print(f"[AI] Transcript: {transcript[:300]}")

        application_obj.interview_transcript = transcript
        application_obj.save()
        print("[AI] Transcript saved to DB")

        # Step 2: Analyze
        print("[AI] Starting Claude analysis...")
        analysis = analyze_interview(transcript, job_title)
        print(f"[AI] Analysis result: {analysis}")

        application_obj.interview_analysis = analysis
        application_obj.save()

        print(f"[AI] Analysis complete for application {application_id}")

    except Exception as e:
        import traceback
        print(f"[AI] Analysis failed: {e}")
        print(traceback.format_exc())