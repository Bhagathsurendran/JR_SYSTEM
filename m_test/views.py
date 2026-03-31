from register.models import application
import json
import copy
import random
import requests
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# ═══════════════════════════════════════════════════
#  10 PROBLEMS  (difficulty field removed)
# ═══════════════════════════════════════════════════
PROBLEMS = {
    1: {
        "id": 1,
        "title": "Two Sum — Sorted Array",
        "tags": ["Array", "Two Pointers"],
        "description": (
            "Given a <strong>sorted</strong> array <code>nums</code> and a target integer, "
            "return the 1-based indices of the two numbers that add up to target."
        ),
        "examples": [{"input": "nums=[2,7,11,15], target=9", "output": "[1, 2]", "explanation": "2+7=9"}],
        "constraints": {"Array Length": "2 ≤ n ≤ 10⁴", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Use two pointers — one at each end. Move inward based on the sum.",
        "approach": "Two Pointers",
        "test_cases": [{"input": "2 7 11 15\n9", "expected": "[1, 2]"}],
        "solution": {
            "approach": "Two Pointers",
            "explanation": "Left and right pointers converge on the answer.",
            "time": "O(n)", "space": "O(1)",
            "code": {
                "C++":    "vector<int> twoSum(vector<int>& nums, int target) { ... }",
                "Python": "def two_sum(nums, target): ...",
            },
        },
    },
    2: {
        "id": 2,
        "title": "Valid Parentheses",
        "tags": ["String", "Stack"],
        "description": "Given a string of brackets, determine if it is valid (every opener is closed in the correct order).",
        "examples": [{"input": 's="()[]{}"', "output": "true", "explanation": "All matched correctly."}],
        "constraints": {"Length": "1 ≤ n ≤ 10⁴", "Time": "O(n)", "Space": "O(n)"},
        "hint": "Use a stack. Push openers, pop and match on closers.",
        "approach": "Stack",
        "test_cases": [{"input": "()[]{}", "expected": "true"}],
        "solution": {
            "approach": "Stack",
            "explanation": "Stack-based matching; empty stack at end = valid.",
            "time": "O(n)", "space": "O(n)",
            "code": {"Python": "def is_valid(s): ...", "C++": "bool isValid(string s) { ... }"},
        },
    },
    3: {
        "id": 3,
        "title": "Reverse Linked List",
        "tags": ["Linked List"],
        "description": "Reverse a singly linked list given as space-separated integers. Output reversed values.",
        "examples": [{"input": "1 2 3 4 5", "output": "5 4 3 2 1", "explanation": "Each link reversed."}],
        "constraints": {"Length": "0 ≤ n ≤ 5000", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Use three pointers: prev, curr, next.",
        "approach": "Iterative Three-Pointer",
        "test_cases": [{"input": "5\n1 2 3 4 5", "expected": "5 4 3 2 1"}],
        "solution": {
            "approach": "Iterative",
            "explanation": "Flip pointers one by one. prev becomes the new head.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def reverse_list(head): ...", "C++": "ListNode* reverseList(ListNode* head) { ... }"},
        },
    },
    4: {
        "id": 4,
        "title": "Binary Search",
        "tags": ["Array", "Binary Search"],
        "description": "Given a <strong>sorted</strong> array and a target, return the index of target or -1 if not found.",
        "examples": [{"input": "nums=[-1,0,3,5,9,12], target=9", "output": "4", "explanation": "9 is at index 4."}],
        "constraints": {"Array Length": "1 ≤ n ≤ 10⁴", "Time": "O(log n)", "Space": "O(1)"},
        "hint": "Maintain lo and hi pointers. Check mid each iteration.",
        "approach": "Binary Search",
        "test_cases": [{"input": "-1 0 3 5 9 12\n9", "expected": "4"}],
        "solution": {
            "approach": "Binary Search",
            "explanation": "Classic binary search — halve the search space each step.",
            "time": "O(log n)", "space": "O(1)",
            "code": {"Python": "def search(nums, target): ...", "C++": "int search(vector<int>& nums, int target) { ... }"},
        },
    },
    5: {
        "id": 5,
        "title": "Maximum Subarray",
        "tags": ["Array", "Dynamic Programming"],
        "description": "Given an integer array, find the contiguous subarray with the largest sum and return the sum.",
        "examples": [{"input": "nums=[-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "[4,-1,2,1] has sum 6."}],
        "constraints": {"Array Length": "1 ≤ n ≤ 10⁵", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Kadane's algorithm: track current sum and global max.",
        "approach": "Kadane's Algorithm",
        "test_cases": [{"input": "-2 1 -3 4 -1 2 1 -5 4", "expected": "6"}],
        "solution": {
            "approach": "Kadane's Algorithm",
            "explanation": "Reset current sum to 0 when it goes negative.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def max_subarray(nums): ...", "C++": "int maxSubArray(vector<int>& nums) { ... }"},
        },
    },
    6: {
        "id": 6,
        "title": "Climbing Stairs",
        "tags": ["Dynamic Programming"],
        "description": "You climb a staircase with <code>n</code> steps, taking 1 or 2 steps at a time. How many distinct ways can you reach the top?",
        "examples": [{"input": "n=5", "output": "8", "explanation": "8 distinct ways to climb 5 stairs."}],
        "constraints": {"n": "1 ≤ n ≤ 45", "Time": "O(n)", "Space": "O(1)"},
        "hint": "It's a Fibonacci sequence. ways(n) = ways(n-1) + ways(n-2).",
        "approach": "Dynamic Programming",
        "test_cases": [{"input": "5", "expected": "8"}],
        "solution": {
            "approach": "DP / Fibonacci",
            "explanation": "Track previous two values and roll forward.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def climb_stairs(n): ...", "C++": "int climbStairs(int n) { ... }"},
        },
    },
    7: {
        "id": 7,
        "title": "Palindrome Check",
        "tags": ["String", "Two Pointers"],
        "description": "Given a string, determine if it is a palindrome considering only alphanumeric characters, ignoring case.",
        "examples": [{"input": '"A man a plan a canal Panama"', "output": "true", "explanation": "Alphanumeric: amanaplanacanalpanama — palindrome."}],
        "constraints": {"Length": "1 ≤ n ≤ 2×10⁵", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Filter to alphanumeric, convert to lowercase, then check with two pointers.",
        "approach": "Two Pointers",
        "test_cases": [{"input": "A man a plan a canal Panama", "expected": "true"}],
        "solution": {
            "approach": "Two Pointers",
            "explanation": "Skip non-alphanumeric characters while comparing from both ends.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def is_palindrome(s): ...", "C++": "bool isPalindrome(string s) { ... }"},
        },
    },
    8: {
        "id": 8,
        "title": "Best Time to Buy and Sell Stock",
        "tags": ["Array", "Greedy"],
        "description": "Given stock prices by day, find the maximum profit from one buy and one sell (buy before sell). Return 0 if no profit.",
        "examples": [{"input": "prices=[7,1,5,3,6,4]", "output": "5", "explanation": "Buy at 1, sell at 6 = profit 5."}],
        "constraints": {"Length": "1 ≤ n ≤ 10⁵", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Track the minimum price seen so far and the max profit at each day.",
        "approach": "Greedy Single Pass",
        "test_cases": [{"input": "7 1 5 3 6 4", "expected": "5"}],
        "solution": {
            "approach": "Greedy",
            "explanation": "At each step: profit = price - min_so_far. Track max profit.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def max_profit(prices): ...", "C++": "int maxProfit(vector<int>& prices) { ... }"},
        },
    },
    9: {
        "id": 9,
        "title": "Majority Element",
        "tags": ["Array", "Sorting"],
        "description": "Given an array of size n, find the element that appears more than ⌊n/2⌋ times. It always exists.",
        "examples": [{"input": "nums=[2,2,1,1,1,2,2]", "output": "2", "explanation": "2 appears 4 times out of 7."}],
        "constraints": {"Length": "1 ≤ n ≤ 5×10⁴", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Boyer-Moore Voting Algorithm: maintain a candidate and a count.",
        "approach": "Boyer-Moore Voting",
        "test_cases": [{"input": "2 2 1 1 1 2 2", "expected": "2"}],
        "solution": {
            "approach": "Boyer-Moore Voting",
            "explanation": "Increment count for candidate, decrement for others; switch candidate when count hits 0.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def majority_element(nums): ...", "C++": "int majorityElement(vector<int>& nums) { ... }"},
        },
    },
    10: {
        "id": 10,
        "title": "Fibonacci Number",
        "tags": ["Recursion", "Dynamic Programming"],
        "description": "Given <code>n</code>, return F(n) where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
        "examples": [{"input": "n=10", "output": "55", "explanation": "F(10) = 55."}],
        "constraints": {"n": "0 ≤ n ≤ 30", "Time": "O(n)", "Space": "O(1)"},
        "hint": "Use iteration with two variables rather than recursion to stay O(n).",
        "approach": "Iterative DP",
        "test_cases": [{"input": "10", "expected": "55"}],
        "solution": {
            "approach": "Iterative",
            "explanation": "Roll two variables forward n times — no recursion needed.",
            "time": "O(n)", "space": "O(1)",
            "code": {"Python": "def fib(n): ...", "C++": "int fib(int n) { ... }"},
        },
    },
}

# ── Language skeleton templates ──
SKELETONS = {
    "C": """\
#include <stdio.h>

int main() {
    // your solution here

    return 0;
}""",
    "C++": """\
#include <bits/stdc++.h>
using namespace std;

int main() {
    // your solution here

    return 0;
}""",
    "Python": """\
import sys
input = sys.stdin.readline

def solve():
    # your solution here
    pass

solve()""",
    "Java": """\
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        // your solution here
    }
}""",
    "JS": """\
const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
let idx = 0;

// your solution here
""",
}

# ── Judge0 config ──
JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"
LANG_CFG = {
    "C":      {"id": 103},
    "C++":    {"id": 105},
    "Python": {"id": 100},
    "Java":   {"id": 91},
    "JS":     {"id": 102},
}

TOTAL_PROBLEMS = 3  # total questions in one exam session


# ══════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════

def _normalize(s):
    lines = [l.strip() for l in s.replace("\r", "").split("\n") if l.strip()]
    last = lines[-1] if lines else ""
    return last.replace("True", "true").replace("False", "false")


def _call_judge0(code, lang, stdin=""):
    payload = {
        "language_id": LANG_CFG[lang]["id"],
        "source_code": code,
    }
    if stdin.strip():
        payload["stdin"] = stdin

    r = requests.post(
        JUDGE0_URL,
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


def _parse_judge0(d):
    sid         = (d.get("status") or {}).get("id", 3)
    is_ce       = sid == 6
    stdout      = (d.get("stdout")         or "").strip()
    stderr      = (d.get("stderr")         or "").strip()
    compile_out = (d.get("compile_output") or "").strip()
    return {
        "stdout":      stdout,
        "stderr":      "" if is_ce else stderr,
        "compile_err": (compile_out or stderr) if is_ce else "",
        "exit_code":   0 if sid in (3, 4) else 1,
        "cpu_time":    d.get("time",   "?"),
        "memory":      d.get("memory", "?"),
    }


# ══════════════════════════════════════════════════════
#  VIEWS
# ══════════════════════════════════════════════════════

def exam_start(request, job_id, user_id):
    print(f"Starting exam for job_id: {job_id}")
    print(f"Starting exam for user_id: {user_id}")

    try:
        app_obj = application.objects.get(job_id=job_id, user_id=user_id)
        print(f"Application ID: {app_obj.id}")
    except application.DoesNotExist:
        print(f"[exam_start] ERROR: No application found for job_id={job_id}, user_id={user_id}")
        return redirect('user_dashboard')

    # Store both job_id and user_id so we can re-fetch later if session loses app_id
    request.session['app_id']      = app_obj.id
    request.session['exam_job_id'] = job_id       
    request.session['exam_user_id'] = user_id     
    request.session['solved_count']    = 0
    request.session['solved_problems'] = []
    request.session.modified = True

    print(f"[exam_start] Session app_id set to: {request.session['app_id']}")

    context = {
        "title": "Machine Test",
        "exam_type": "Coding Assessment",
        "exam": {
            "total_questions": TOTAL_PROBLEMS,
            "duration_minutes": 30,
            "pass_mark": 67,
            "pass_score": 2,
            "rules": [
                {"text": "Write code to solve each problem in your chosen language."},
                {"text": "Timer starts immediately upon entering the arena."},
                {"text": "Exam auto-submits when the timer reaches zero."},
                {"text": "Do not refresh or close the browser tab."},
                {
                    "text": "Use the Input tab to provide stdin before running.",
                    "sub": "The test case input is pre-loaded automatically for each problem.",
                },
            ],
            "notice": (
                "You will get 3 random questions. "
                "Solve each one and click Submit. "
                "The timer starts as soon as you enter the exam."
            ),
        },
    }
    return render(request, "m_test/start_exam.html", context)


def arena(request):
    all_ids = list(PROBLEMS.keys())
    random.shuffle(all_ids)
    chosen_ids = random.sample(all_ids, TOTAL_PROBLEMS)
    request.session["exam_problem_ids"] = chosen_ids
    request.session.modified = True

    exam_problems = {
        str(i + 1): copy.deepcopy(PROBLEMS[pid])
        for i, pid in enumerate(chosen_ids)
    }
    for prob in exam_problems.values():
        prob.pop("difficulty", None)
        prob["starter"] = SKELETONS

    context = {
        "problem":        list(exam_problems.values())[0],
        "problem_id":     1,
        "total":          TOTAL_PROBLEMS,
        "problems_json":  json.dumps(exam_problems),
        "skeletons_json": json.dumps(SKELETONS),
    }
    return render(request, "m_test/arena.html", context)


def reset_exam(request):
    request.session.flush()
    return redirect("exam_start")


def result(request):
    """
    Show final result page.
    Score is read from session (set by api_submit when all problems attempted).
    """
    score      = request.session.get('final_score', 0)          # 0–100
    solved     = request.session.get('solved_count', 0)         # 0–3
    total      = TOTAL_PROBLEMS
    passed     = solved >= 2                                     # pass mark = 2/3

    context = {
        "title":   "Exam Result",
        "score":   score,
        "solved":  solved,
        "total":   total,
        "passed":  passed,
        "percent": score,
    }
    return render(request, "m_test/result.html", context)


# ══════════════════════════════════════════════════════
#  API — run  (no verdict, just execute)
# ══════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def api_run(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)

    code  = body.get("code", "").strip()
    lang  = body.get("lang", "C++")
    stdin = body.get("stdin", "")

    if not code:
        return JsonResponse({"ok": False, "error": "No code provided"}, status=400)
    if lang not in LANG_CFG:
        return JsonResponse({"ok": False, "error": f"Unsupported language: {lang}"}, status=400)

    try:
        raw    = _call_judge0(code, lang, stdin)
        result = _parse_judge0(raw)
    except requests.Timeout:
        return JsonResponse({"ok": False, "error": "Compiler API timed out"}, status=504)
    except requests.RequestException as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=502)

    return JsonResponse({"ok": True, "result": result})


# ══════════════════════════════════════════════════════
#  API — submit  (verdict + score tracking)
# ══════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
@csrf_exempt
@require_http_methods(["POST"])
def api_submit(request, problem_id):
    chosen_ids = request.session.get("exam_problem_ids", [])
    try:
        real_id = chosen_ids[int(problem_id) - 1]
    except (IndexError, ValueError):
        return JsonResponse({"ok": False, "error": "Invalid problem index"}, status=400)

    problem = PROBLEMS.get(real_id)
    if not problem:
        return JsonResponse({"ok": False, "error": "Problem not found"}, status=404)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)

    code = body.get("code", "").strip()
    lang = body.get("lang", "C++")

    if not code:
        return JsonResponse({"ok": False, "error": "No code provided"}, status=400)
    if lang not in LANG_CFG:
        return JsonResponse({"ok": False, "error": f"Unsupported language: {lang}"}, status=400)

    tc = problem["test_cases"][0]

    try:
        raw = _call_judge0(code, lang, stdin=tc["input"])
        res = _parse_judge0(raw)
    except requests.Timeout:
        return JsonResponse({"ok": False, "error": "Compiler timed out"}, status=504)
    except requests.RequestException as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=502)


    if res["compile_err"]:
        return JsonResponse({
            "ok": True, "verdict": "compile_error",
            "label": "Compile Error", "passed": False,
            "compile_err": res["compile_err"],
        })

    if res["exit_code"] != 0:
        return JsonResponse({
            "ok": True, "verdict": "runtime_error",
            "label": "Runtime Error", "passed": False,
            "stderr": res["stderr"],
        })

    actual   = _normalize(res["stdout"])
    expected = _normalize(tc["expected"])
    passed   = actual == expected

    # ── Score tracking ──
    solved_problems = request.session.get('solved_problems', [])

    if passed and real_id not in solved_problems:
        solved_problems.append(real_id)
        request.session['solved_problems'] = solved_problems

    solved_count  = len(solved_problems)
    score_percent = int((solved_count / TOTAL_PROBLEMS) * 100)

    request.session['solved_count'] = solved_count
    request.session['final_score']  = score_percent
    request.session.modified = True

    # ── Save to DB (always save current score, not just on pass) ──
    app_id = request.session.get('app_id')

    app_obj = None

    if app_id:
        try:
            app_obj = application.objects.get(id=app_id)
        except application.DoesNotExist:
            app_obj = None

    # Fallback: use job_id + user_id stored in session
    if app_obj is None:
        job_id_fb  = request.session.get('exam_job_id')
        user_id_fb = request.session.get('exam_user_id')
        if job_id_fb and user_id_fb:
            try:
                app_obj = application.objects.get(
                    job_id=job_id_fb,
                    user_id=user_id_fb
                )
                request.session['app_id'] = app_obj.id
                request.session.modified  = True
            except application.DoesNotExist:
                print(f"[api_submit] Fallback also failed - no application found")

    # Save score regardless of passed/failed (so partial scores are tracked)
    if app_obj:
        app_obj.machine_test_score = score_percent
        app_obj.save()
    else:
        print(f"[api_submit] ❌ Could not find application - session data: app_id={request.session.get('app_id')}, job_id={request.session.get('exam_job_id')}, user_id={request.session.get('exam_user_id')}")

    return JsonResponse({
        "ok":            True,
        "verdict":       "accepted" if passed else "wrong_answer",
        "label":         "Accepted" if passed else "Wrong Answer",
        "passed":        passed,
        "actual":        res["stdout"],
        "expected":      tc["expected"],
        "cpu_time":      res["cpu_time"],
        "memory":        res["memory"],
        "solved_count":  solved_count,
        "total":         TOTAL_PROBLEMS,
        "score_percent": score_percent,
    })
    
    
    
    
    chosen_ids = request.session.get("exam_problem_ids", [])
    try:
        real_id = chosen_ids[int(problem_id) - 1]
    except (IndexError, ValueError):
        return JsonResponse({"ok": False, "error": "Invalid problem index"}, status=400)

    problem = PROBLEMS.get(real_id)
    if not problem:
        return JsonResponse({"ok": False, "error": "Problem not found"}, status=404)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)

    code = body.get("code", "").strip()
    lang = body.get("lang", "C++")

    if not code:
        return JsonResponse({"ok": False, "error": "No code provided"}, status=400)
    if lang not in LANG_CFG:
        return JsonResponse({"ok": False, "error": f"Unsupported language: {lang}"}, status=400)

    tc = problem["test_cases"][0]

    try:
        raw    = _call_judge0(code, lang, stdin=tc["input"])
        res    = _parse_judge0(raw)
    except requests.Timeout:
        return JsonResponse({"ok": False, "error": "Compiler timed out"}, status=504)
    except requests.RequestException as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=502)

    if res["compile_err"]:
        return JsonResponse({
            "ok": True, "verdict": "compile_error",
            "label": "Compile Error", "passed": False,
            "compile_err": res["compile_err"],
        })

    if res["exit_code"] != 0:
        return JsonResponse({
            "ok": True, "verdict": "runtime_error",
            "label": "Runtime Error", "passed": False,
            "stderr": res["stderr"],
        })

    actual   = _normalize(res["stdout"])
    expected = _normalize(tc["expected"])
    passed   = actual == expected

    # ── Score tracking ────────────────────────────────────────
    solved_problems = request.session.get('solved_problems', [])

    if passed and real_id not in solved_problems:
        # Only count each problem once even if re-submitted
        solved_problems.append(real_id)
        request.session['solved_problems'] = solved_problems

    solved_count = len(solved_problems)
    request.session['solved_count'] = solved_count

    # Percentage score  e.g. 2/3 solved → 67%
    score_percent = int((solved_count / TOTAL_PROBLEMS) * 100)
    request.session['final_score'] = score_percent
    request.session.modified = True

    # ── Save to DB whenever a new problem is solved ───────────
    if passed:
        app_id = request.session.get('app_id')
        if app_id:
            try:
                app_obj = application.objects.get(id=app_id)
                app_obj.machine_test_score = score_percent
                app_obj.save()
                print(f"[machine_test] app_id={app_id} score saved → {score_percent}%")
            except application.DoesNotExist:
                print(f"[machine_test] WARNING: application id={app_id} not found")

    return JsonResponse({
        "ok":           True,
        "verdict":      "accepted" if passed else "wrong_answer",
        "label":        "Accepted" if passed else "Wrong Answer",
        "passed":       passed,
        "actual":       res["stdout"],
        "expected":     tc["expected"],
        "cpu_time":     res["cpu_time"],
        "memory":       res["memory"],
        # ── send live score back to frontend ──
        "solved_count": solved_count,
        "total":        TOTAL_PROBLEMS,
        "score_percent": score_percent,
    })