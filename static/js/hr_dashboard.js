/* ═══════════════════════
   TAB SWITCH
═══════════════════════ */
function switchTab(tab, sectionId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(sectionId).classList.add('active');
}


/* ═══════════════════════
   DETAIL MODAL
═══════════════════════ */
function openDetailModal(data) {

  const {
    type, name, init, email, course, year,
    role, company, location, duration, stipend,
    appliedOn, decisionOn, score, skills,
    feedback         // rejection reason text (optional)
  } = data;

  // Accept any common CV field name your backend might send
  const cvUrl = data.cvUrl || data.cv_url || data.cv || data.resume_url || data.resume || '';

  /* ── Banner ── */
  document.getElementById('dm-avatar').textContent = init || (name ? name[0].toUpperCase() : '?');
  document.getElementById('dm-name').textContent   = name  || '';
  document.getElementById('dm-email').textContent  = email || '';

  /* ── Chips ── */
  const chips   = [course, year, role && company ? role + ' · ' + company : (role || company)].filter(Boolean);
  const chipsEl = document.getElementById('dm-chips');
  if (chipsEl) {
    chipsEl.innerHTML = chips.map((c, i) =>
      `<span class="dm-chip${i === 2 ? ' hi' : ''}">${escHtml(c)}</span>`
    ).join('');
  }

  /* ── Status strip ── */
  const isApproved = type === 'approved';
  const strip = document.getElementById('dm-status-strip');
  strip.className = 'dm-status-strip ' + (isApproved ? 'approved' : 'rejected');

  document.getElementById('dm-strip-icon').textContent = isApproved ? '✓' : '✕';
  document.getElementById('dm-strip-text').textContent =
    isApproved ? 'Application Approved' : 'Application Rejected';
  document.getElementById('dm-strip-sub').textContent =
    isApproved
      ? `Offer letter issued on ${decisionOn || '—'}`
      : `Decision made on ${decisionOn || '—'}`;

  /* ── Strip action: offer letter button ── */
  const stripAction = document.getElementById('dm-strip-action');
  stripAction.innerHTML = isApproved
    ? `<button class="dm-offer-btn"
         onclick="openLetterModal(
           '${esc(name)}','${esc(role)}','${esc(company)}',
           '${esc(location)}','${esc(duration)}','${esc(stipend)}','${esc(skills)}'
         )">View Offer Letter</button>`
    : '';

  /* ── Score ── */
  const s = Math.min(100, Math.max(0, parseInt(score) || 0));
  document.getElementById('dm-score-num').textContent   = s + '%';
  document.getElementById('dm-score-fill').style.width  = s + '%';

  /* ── Info grid ── */
  document.getElementById('dm-role').textContent     = role     || '—';
  document.getElementById('dm-company').textContent  = company  || '—';
  document.getElementById('dm-location').textContent = location || '—';
  document.getElementById('dm-duration').textContent = duration || '—';
  document.getElementById('dm-stipend').textContent  = stipend  || '—';
  document.getElementById('dm-applied').textContent  = appliedOn|| '—';
  document.getElementById('dm-course').textContent   = course   || '—';
  document.getElementById('dm-year').textContent     = year     || '—';
  document.getElementById('dm-email2').textContent   = email    || '—';

    /* ── CV link ── */

  const cvLinkEl = document.getElementById('dm-cv-link');
  if (cvLinkEl) {
    if (cvUrl && cvUrl.trim() !== '') {
      cvLinkEl.href = cvUrl;
      cvLinkEl.style.display = 'inline-flex';
      cvLinkEl.style.alignItems = 'center';
    } else {
      cvLinkEl.style.display = 'none';
    }
  }

  /* ── Skills ── */
  const skillsArr = skills
    ? skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  document.getElementById('dm-skills').innerHTML =
    skillsArr.length
      ? skillsArr.map(sk => `<span class="skill-tag">${escHtml(sk)}</span>`).join('')
      : '<span style="color:var(--ink4);font-size:12px">No skills extracted</span>';

  /* ── Timeline ── */
  buildTimeline(type, appliedOn, decisionOn);

  /* ── Rejection feedback ── */
  const fbSection = document.getElementById('dm-feedback-section');
  if (fbSection) {
    if (!isApproved && feedback) {
      fbSection.style.display = '';
      document.getElementById('dm-feedback-text').textContent = feedback;
    } else {
      fbSection.style.display = 'none';
    }
  }

  /* ── Footer ── */
  document.getElementById('dm-footer-info').innerHTML =
    `Applied: <strong>${appliedOn || '—'}</strong> · Decision: <strong>${decisionOn || '—'}</strong>`;

  const footerActions = document.getElementById('dm-footer-actions');
  footerActions.innerHTML = isApproved
    ? `<button class="dm-footer-btn primary"
         onclick="openLetterModal(
           '${esc(name)}','${esc(role)}','${esc(company)}',
           '${esc(location)}','${esc(duration)}','${esc(stipend)}','${esc(skills)}'
         )">Download Offer Letter</button>`
    : '';

  /* ── Open ── */
  document.getElementById('detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}


/* ═══════════════════════
   TIMELINE BUILDER
═══════════════════════ */
function buildTimeline(type, appliedOn, decisionOn) {
  const el = document.getElementById('dm-timeline');
  if (!el) return;

  const isApproved = type === 'approved';

  // Steps are always: Applied → Under Review → (Shortlisted →) Approved / Rejected
  const steps = [
    {
      label:    'Application Submitted',
      date:     appliedOn || '—',
      done:     true,
      icon:     '📋',
    },
    {
      label:    'Under Review',
      date:     appliedOn ? 'Shortly after submission' : '—',
      done:     true,
      icon:     '🔍',
    },
    {
      label:    'Shortlisted',
      date:     decisionOn ? 'Before final decision' : '—',
      done:     true,
      icon:     '⭐',
    },
    {
      label:    isApproved ? 'Offer Extended' : 'Application Rejected',
      date:     decisionOn || '—',
      done:     true,
      icon:     isApproved ? '🎉' : '✕',
      final:    true,
      approved: isApproved,
    },
  ];

  el.innerHTML = steps.map((step, i) => `
    <div class="tl-row">
      <div class="tl-left">
        <div class="tl-icon ${step.final ? (step.approved ? 'tl-approved' : 'tl-rejected') : 'tl-done'}">
          ${step.icon}
        </div>
        ${i < steps.length - 1 ? '<div class="tl-line tl-line-done"></div>' : ''}
      </div>
      <div class="tl-content">
        <div class="tl-label ${step.final ? (step.approved ? 'tl-label-approved' : 'tl-label-rejected') : ''}">
          ${escHtml(step.label)}
        </div>
        <div class="tl-date">${escHtml(step.date)}</div>
      </div>
    </div>
  `).join('');
}


/* ═══════════════════════
   CV VIEWER MODAL
═══════════════════════ */
function openCvViewer(cvUrl, studentName) {
  // Remove existing viewer if any
  const existing = document.getElementById('cv-viewer-overlay');
  if (existing) existing.remove();

  const isPdf = cvUrl.toLowerCase().endsWith('.pdf');

  const overlay = document.createElement('div');
  overlay.id = 'cv-viewer-overlay';
  overlay.className = 'cv-viewer-overlay';
  overlay.innerHTML = `
    <div class="cv-viewer-modal" onclick="event.stopPropagation()">
      <div class="cv-viewer-header">
        <div class="cv-viewer-title">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          CV — ${escHtml(studentName || 'Student')}
        </div>
        <div class="cv-viewer-actions">
          <a href="${cvUrl}" download class="cv-dl-btn" title="Download CV">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </a>
          <button class="cv-close-btn" onclick="closeCvViewer()" title="Close">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="cv-viewer-body">
        ${isPdf
          ? `<iframe src="${cvUrl}" class="cv-iframe" title="CV Preview"></iframe>`
          : `<div class="cv-img-wrap">
               <img src="${cvUrl}" class="cv-img" alt="CV Preview"
                 onerror="this.parentElement.innerHTML='<div class=cv-load-err>Cannot preview this file type.<br><a href=\\'${cvUrl}\\' download>Download instead</a></div>'">
             </div>`
        }
      </div>
    </div>`;

  overlay.addEventListener('click', closeCvViewer);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeCvViewer() {
  const overlay = document.getElementById('cv-viewer-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 220);
}


/* ═══════════════════════
   OFFER LETTER MODAL
═══════════════════════ */


/* ═══════════════════════
   HELPERS
═══════════════════════ */
function escHtml(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// For use inside inline onclick="" attributes (must avoid single-quotes breaking HTML)
function esc(s) {
  return String(s || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
}


/* ═══════════════════════
   KEYBOARD ESC CLOSE
═══════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCvViewer();
    closeDetailModal();
    closeLetterModal();
  }
});

  /* ═══════════════════ STATE ═══════════════════ */
  let _amData = [], _amFilter = 'all', _amSearch = '', _amJobId = null;
  let pendingDeleteId = null;

  /* ═══════════════════ TAB SWITCH ═══════════════════ */
  function switchTab(tab, sectionId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(sectionId).classList.add('active');

    const scheduleBtn         = document.getElementById("scheduleBtn");
    const shortlistScheduleBtn = document.getElementById("shortlist-schedule-btn");
    const jobSelected         = selectedJobId !== null;

    if (sectionId === "rejected-section") {
      if (scheduleBtn)          scheduleBtn.style.display          = "none";
      if (shortlistScheduleBtn) shortlistScheduleBtn.style.display = "none";
    } else {
      // only show if a job is selected
      if (scheduleBtn)          scheduleBtn.style.display          = jobSelected ? "inline-block" : "none";
      if (shortlistScheduleBtn) shortlistScheduleBtn.style.display = jobSelected ? "inline-flex"  : "none";
    }
  }

  /* ═══════════════════ PAGE NAV ═══════════════════ */
  function showPage(name, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');
    if (btn) btn.classList.add('active');
    closeAllDropdowns();
    if (window.innerWidth <= 768) closeSidebar();
    window.scrollTo(0, 0);

     if (name === 'interviews') initCalendarIfNeeded();
  }

  /* ═══════════════════ SIDEBAR ═══════════════════ */
  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  }

  /* ═══════════════════ DATE ═══════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    const d = new Date();
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const suf    = n => n + (n%10==1&&n!==11?'st':n%10==2&&n!==12?'nd':n%10==3&&n!==13?'rd':'th');
    const el = document.getElementById('dash-date');
    if (el) el.textContent = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + suf(d.getDate()) + ' · InternHub HR Portal';
    const today = new Date().toISOString().split('T')[0];
    const di = document.getElementById('deadlineInput');
    if (di) di.setAttribute('min', today);
    renderRankList();
    renderSocialCards();
  });

  /* ═══════════════════ APPROVE / REJECT ROWS ═══════════════════ */
  function approveRow(btn) {
    const td = btn.closest('td'), row = btn.closest('tr'), pill = row.querySelector('.s-pill');
    if (pill) { pill.className = 's-pill s-approved'; pill.textContent = 'Approved'; }
    td.innerHTML = '<button class="btn btn-outline" style="height:30px;padding:0 12px;font-size:11px">View Letter</button>';
  }
  function rejectRow(btn) {
    const td = btn.closest('td'), row = btn.closest('tr'), pill = row.querySelector('.s-pill');
    if (pill) { pill.className = 's-pill s-rejected'; pill.textContent = 'Rejected'; }
    td.innerHTML = '<button class="btn btn-ghost" style="height:30px;padding:0 12px;font-size:11px">Feedback</button>';
  }

  /* ═══════════════════ APP FILTER & SEARCH ═══════════════════ */
  function filterApps(tab, status) {
    document.querySelectorAll('#page-applications .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('#apps-tbody tr').forEach(row => {
      row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
  }
  function searchApps(val) {
    const q = val.toLowerCase();
    document.querySelectorAll('#apps-tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  /* ═══════════════════ SIMPLE STUDENT MODAL ═══════════════════ */
  function openModal(name, initials, email, course, role, company, date, match, skills, status) {
    document.getElementById('m-avatar').textContent  = initials;
    document.getElementById('m-name').textContent    = name;
    document.getElementById('m-email').textContent   = email;
    document.getElementById('m-email2').textContent  = email;
    document.getElementById('m-role').textContent    = role;
    document.getElementById('m-company').textContent = company;
    document.getElementById('m-date').textContent    = date;
    document.getElementById('m-match').textContent   = match;
    document.getElementById('m-course').textContent  = course;
    document.getElementById('m-tags').innerHTML = `<span class="modal-tag">${course}</span><span class="modal-tag">CV Uploaded ✓</span>`;
    document.getElementById('m-skills').innerHTML = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
    const statusMap = { review:['s-review','Under Review'], pending:['s-pending','Pending'], approved:['s-approved','Approved'], rejected:['s-rejected','Rejected'] };
    const [cls, lbl] = statusMap[status] || ['s-pending','Pending'];
    document.getElementById('m-status-pill').innerHTML = `<span class="s-pill ${cls}">${lbl}</span>`;
    const actEl = document.getElementById('m-actions');
    if (status === 'pending' || status === 'review') {
      actEl.innerHTML = `<button class="btn btn-ghost" style="border-color:rgba(255,255,255,.2);color:var(--muted)">View CV</button><button class="btn" style="background:var(--white);color:var(--black);font-size:12px" onclick="closeModal()">Approve</button>`;
    } else if (status === 'approved') {
      actEl.innerHTML = `<button class="btn" style="background:var(--white);color:var(--black);font-size:12px" onclick="closeModal();openLetterModal('${esc(name)}','${esc(role)}','${esc(company)}','','','','')">View Letter</button>`;
    } else {
      actEl.innerHTML = `<button class="btn btn-ghost" style="border-color:rgba(255,255,255,.2);color:var(--muted)">View Feedback</button>`;
    }
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ═══════════════════ DETAIL MODAL ═══════════════════ */
  function openDetailModal(data) {
    const { type, name, init, email, course, year, role, company, location, duration,
            stipend, appliedOn, decisionOn, score, skills, feedback, letterData } = data;

    document.getElementById('dm-avatar').textContent = init || (name ? name[0].toUpperCase() : '?');
    document.getElementById('dm-name').textContent   = name  || '';
    document.getElementById('dm-email').textContent  = email || '';

    const chips = [course, year, role && company ? role + ' · ' + company : (role || company)].filter(Boolean);
    document.getElementById('dm-chips').innerHTML = chips.map((c, i) =>
      `<span class="dm-chip${i === 2 ? ' hi' : ''}">${escHtml(c)}</span>`
    ).join('');

    const isApproved = type === 'approved';
    const strip = document.getElementById('dm-status-strip');
    strip.className = 'dm-status-strip ' + (isApproved ? 'approved' : 'rejected');
    document.getElementById('dm-strip-icon').textContent = isApproved ? '✓' : '✕';
    document.getElementById('dm-strip-text').textContent = isApproved ? 'Application Approved' : 'Application Rejected';
    document.getElementById('dm-strip-sub').textContent  = isApproved ? `Offer letter issued on ${decisionOn||'—'}` : `Decision made on ${decisionOn||'—'}`;

    const ld = letterData || {};
    document.getElementById('dm-strip-action').innerHTML = isApproved
      ? `<button class="dm-offer-btn" onclick="openLetterModal('${esc(ld.name||name)}','${esc(ld.role||role)}','${esc(ld.company||company)}','${esc(ld.location||location)}','${esc(ld.duration||duration)}','${esc(ld.stipend||stipend)}','${esc(ld.skills||skills)}')">View Offer Letter</button>`
      : '';

    const s = Math.min(100, Math.max(0, parseInt(score) || 0));
    document.getElementById('dm-score-num').textContent  = s + '%';
    document.getElementById('dm-score-fill').style.width = s + '%';

    document.getElementById('dm-role').textContent     = role     || '—';
    document.getElementById('dm-company').textContent  = company  || '—';
    document.getElementById('dm-location').textContent = location || '—';
    document.getElementById('dm-duration').textContent = duration || '—';
    document.getElementById('dm-stipend').textContent  = stipend  || '—';
    document.getElementById('dm-applied').textContent  = appliedOn|| '—';
    document.getElementById('dm-course').textContent   = course   || '—';
    document.getElementById('dm-year').textContent     = year     || '—';
    document.getElementById('dm-email2').textContent   = email    || '—';

    const skillsArr = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    document.getElementById('dm-skills').innerHTML = skillsArr.length
      ? skillsArr.map(sk => `<span class="skill-tag">${escHtml(sk)}</span>`).join('')
      : '<span style="color:var(--muted);font-size:12px">No skills extracted</span>';

    // Timeline
    buildTimeline(type, appliedOn, decisionOn);

    // Feedback
    const fbSection = document.getElementById('dm-feedback-section');
    if (!isApproved && feedback) {
      fbSection.style.display = '';
      document.getElementById('dm-feedback-text').textContent = feedback;
    } else {
      fbSection.style.display = 'none';
    }

    document.getElementById('dm-footer-info').innerHTML =
      `Applied: <strong>${appliedOn||'—'}</strong> · Decision: <strong>${decisionOn||'—'}</strong>`;

    document.getElementById('dm-footer-actions').innerHTML = isApproved
      ? `<button class="dm-footer-btn primary" onclick="openLetterModal('${esc(ld.name||name)}','${esc(ld.role||role)}','${esc(ld.company||company)}','${esc(ld.location||location)}','${esc(ld.duration||duration)}','${esc(ld.stipend||stipend)}','${esc(ld.skills||skills)}')">Download Offer Letter</button>`
      : '';

    document.getElementById('detail-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    document.getElementById('detail-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ═══════════════════ TIMELINE ═══════════════════ */
  function buildTimeline(type, appliedOn, decisionOn) {
    var el = document.getElementById('dm-timeline');
    if (!el) return;

    var isApproved = (type === 'approved');
    var aDate = (appliedOn  && appliedOn  !== 'None' && appliedOn  !== 'undefined' && appliedOn  !== '') ? appliedOn  : '—';
    var dDate = (decisionOn && decisionOn !== 'None' && decisionOn !== 'undefined' && decisionOn !== '') ? decisionOn : '—';

    var checkSvg = '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
    var crossSvg = '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';

    var steps = [
      {
        label:   'Application Submitted',
        date:    aDate,
        badge:   'Received',
        bClass:  'blue',
        dotCls:  'done',
        icon:    checkSvg,
        lineDim: false
      },
      {
        label:   'Under Review',
        date:    'Shortly after submission',
        badge:   'In Progress',
        bClass:  'yellow',
        dotCls:  'done',
        icon:    checkSvg,
        lineDim: false
      },
      {
        label:   'Shortlisted',
        date:    'Before final decision',
        badge:   'Selected',
        bClass:  'green',
        dotCls:  'done',
        icon:    checkSvg,
        lineDim: !isApproved
      },
      {
        label:   isApproved ? 'Offer Extended' : 'Application Rejected',
        date:    dDate,
        badge:   isApproved ? 'Approved ✓' : 'Rejected',
        bClass:  isApproved ? 'green' : 'red',
        dotCls:  isApproved ? 'done' : 'rejected',
        icon:    isApproved ? checkSvg : crossSvg,
        lineDim: true
      }
    ];

    /* build HTML */
    var html = '<div class="ihtl-wrap">';

    for (var i = 0; i < steps.length; i++) {
      var s      = steps[i];
      var isLast = (i === steps.length - 1);
      var delay  = (i * 0.13).toFixed(2);
      var lDelay = (i * 0.13 + 0.18).toFixed(2);

      html += '<div class="ihtl-step" style="animation-delay:' + delay + 's;">';

        /* rail */
        html += '<div class="ihtl-rail">';
          html += '<div class="ihtl-dot ' + s.dotCls + '" style="animation-delay:' + delay + 's;">' + s.icon + '</div>';
          if (!isLast) {
            html += '<div class="ihtl-line' + (s.lineDim ? ' dim' : '') + '" style="animation-delay:' + lDelay + 's;"></div>';
          }
        html += '</div>';

        /* content */
        html += '<div class="ihtl-content">';
          html += '<div class="ihtl-label' + (!isApproved && i === 3 ? ' rejected-lbl' : '') + '">' + s.label + '</div>';
          html += '<div class="ihtl-date">' + s.date + '</div>';
          html += '<span class="ihtl-badge ' + s.bClass + '">' + s.badge + '</span>';
        html += '</div>';

      html += '</div>'; /* end step */
    }

    html += '</div>'; /* end wrap */
    el.innerHTML = html;
  }

  /* ═══════════════════ OFFER LETTER MODAL ═══════════════════ */
  function openLetterModal(name, role, company, location, duration, stipend, skills) {
    const today     = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    const startDate = new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    const ref       = 'IH-' + (Math.floor(Math.random()*9000)+1000);

    document.getElementById('letter-body').innerHTML = `
      <div style="border:2px solid #0a0a0a;padding:32px 36px;font-family:'DM Sans',sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #e5e5e5">
          <div>
            <div style="font-size:22px;font-weight:900;letter-spacing:-.04em">InternHub</div>
            <div style="font-size:11px;color:#6b6b6b;margin-top:2px">HR Department · Internship Division</div>
          </div>
          <div style="text-align:right;font-size:11px;color:#6b6b6b">
            <div>Date: ${today}</div>
            <div style="margin-top:3px">Ref: ${ref}</div>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b6b6b;margin-bottom:2px">To</div>
          <div style="font-size:15px;font-weight:700">${escHtml(name)}</div>
        </div>

        <div style="font-size:16px;font-weight:800;margin-bottom:16px;letter-spacing:-.02em;text-transform:uppercase">Offer of Internship</div>

        <p style="margin:0 0 14px;font-size:13px;line-height:1.8">Dear <strong>${escHtml(name)}</strong>,</p>
        <p style="margin:0 0 14px;font-size:13px;line-height:1.8">We are pleased to offer you the position of <strong>${escHtml(role)}</strong> at <strong>${escHtml(company)}</strong> through the InternHub placement programme. This offer is subject to the terms and conditions outlined below.</p>

        <div style="background:#f9f9f9;padding:18px 20px;margin:18px 0;display:grid;grid-template-columns:1fr 1fr;gap:12px 28px">
          ${[
            ['Role',         role],
            ['Company',      company],
            ['Location',     location || '—'],
            ['Duration',     duration || '—'],
            ['Stipend',      stipend  || '—'],
            ['Joining Date', startDate],
          ].map(([l,v]) => `
            <div>
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b6b6b">${l}</div>
              <div style="font-size:13px;font-weight:600;margin-top:2px">${escHtml(v)}</div>
            </div>`).join('')}
        </div>

        ${skills ? `<p style="margin:0 0 14px;font-size:13px;line-height:1.8">The role will primarily require proficiency in: <strong>${escHtml(skills)}</strong>.</p>` : ''}

        <p style="margin:0 0 14px;font-size:13px;line-height:1.8">Please confirm your acceptance by replying to this letter within <strong>3 working days</strong>. Failure to respond within this period may result in the offer being withdrawn.</p>
        <p style="margin:0 0 24px;font-size:13px;line-height:1.8">We look forward to having you on board and wish you a rewarding internship experience.</p>

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e5e5;display:flex;justify-content:space-between;align-items:flex-end">
          <div>
            <div style="font-weight:700;font-size:13px">Priya Sharma</div>
            <div style="font-size:11px;color:#6b6b6b">HR Manager · InternHub</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#6b6b6b;margin-bottom:4px">Authorised Signature</div>
            <div style="font-size:20px;font-style:italic;color:#0a0a0a;font-family:Georgia,serif">Priya S.</div>
          </div>
        </div>
      </div>`;

    document.getElementById('letter-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLetterModal() {
    document.getElementById('letter-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function printLetter() {
    const content = document.getElementById('letter-body').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Offer Letter</title>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>body{font-family:'DM Sans',sans-serif;padding:40px;max-width:700px;margin:0 auto;}</style>
      </head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }

  /* ═══════════════════ FEEDBACK MODAL ═══════════════════ */
  function openFeedbackModal(name, initials, role, company, reason) {
    document.getElementById('fb-avatar').textContent = initials;
    document.getElementById('fb-name').textContent   = name;
    document.getElementById('fb-role').textContent   = role + ' · ' + company;
    document.getElementById('fb-reason').textContent = reason || 'No reason specified.';
    document.getElementById('fb-message').value      = '';
    document.getElementById('feedback-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeFeedbackModal() {
    document.getElementById('feedback-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  function sendFeedback() {
    showToast('Feedback sent to student successfully!');
    closeFeedbackModal();
  }

  /* ═══════════════════ CV VIEWER ═══════════════════ */
  function openCvViewer(cvUrl, studentName) {
    const existing = document.getElementById('cv-viewer-overlay');
    if (existing) existing.remove();
    const isPdf = cvUrl.toLowerCase().endsWith('.pdf');
    const overlay = document.createElement('div');
    overlay.id = 'cv-viewer-overlay';
    overlay.className = 'cv-viewer-overlay';
    overlay.innerHTML = `
      <div class="cv-viewer-modal" onclick="event.stopPropagation()">
        <div class="cv-viewer-header">
          <div class="cv-viewer-title"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>CV — ${escHtml(studentName||'Student')}</div>
          <div class="cv-viewer-actions">
            <a href="${cvUrl}" download class="cv-dl-btn"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Download</a>
            <button class="cv-close-btn" onclick="closeCvViewer()"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
        </div>
        <div class="cv-viewer-body">${isPdf
          ? `<iframe src="${cvUrl}" class="cv-iframe" title="CV Preview"></iframe>`
          : `<div class="cv-img-wrap"><img src="${cvUrl}" class="cv-img" alt="CV Preview" onerror="this.parentElement.innerHTML='<div class=cv-load-err>Cannot preview this file.<br><a href=\\'${cvUrl}\\' download>Download instead</a></div>'"></div>`
        }</div>
      </div>`;
    overlay.addEventListener('click', closeCvViewer);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('open'));
  }
  function closeCvViewer() {
    const overlay = document.getElementById('cv-viewer-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 220);
  }

  /* ═══════════════════ JOB FILTER ═══════════════════ */
  function filterJobs(tab, status) {
    document.querySelectorAll('#page-jobposting .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('#job-cards-container .job-card').forEach(card => {
      card.style.display = (status === 'all' || card.dataset.status === status) ? '' : 'none';
    });
  }

  /* ═══════════════════ DROPDOWN ═══════════════════ */
  function closeAllDropdowns() {
    document.querySelectorAll('.edit-dropdown-wrap.open').forEach(d => d.classList.remove('open'));
  }
  function toggleEditDropdown(id) {
    const wrap = document.getElementById('dropdown-' + id);
    const isOpen = wrap.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) wrap.classList.add('open');
  }
  document.addEventListener('click', e => { if (!e.target.closest('.edit-dropdown-wrap')) closeAllDropdowns(); });

  /* ═══════════════════ EDIT FORM ═══════════════════ */
  function openEditForm(jobId) {
    const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
    document.getElementById('edit-job-id').value        = card.dataset.id;
    document.getElementById('edit-job-title').value     = card.dataset.title;
    document.getElementById('edit-company').value       = card.dataset.company;
    document.getElementById('edit-location').value      = card.dataset.location;
    document.getElementById('edit-duration').value      = card.dataset.duration;
    document.getElementById('edit-stipend').value       = card.dataset.stipend;
    document.getElementById('edit-deadline').value      = card.dataset.deadline;
    document.getElementById('edit-skills').value        = card.dataset.skills;
    document.getElementById('edit-description').value   = card.dataset.description;
    document.getElementById('edit-status').value        = card.dataset.statusVal;
    document.getElementById('edit-job-form-overlay').style.display = 'flex';
  }
  function closeEditForm() {
    document.getElementById('edit-job-form-overlay').style.display = 'none';
  }

  /* ═══════════════════ CLOSE POSTING ═══════════════════ */
  function closeJobToStatus(jobId) {
    closeAllDropdowns();
    const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
    if (!card) return;
    if (!confirm('Close this job posting?')) return;
    card.dataset.status = card.dataset.statusVal = 'closed';
    const badge = card.querySelector('.job-status-badge');
    badge.textContent = 'Closed'; badge.className = 'job-status-badge badge-closed';
    const dropWrap = card.querySelector('.edit-dropdown-wrap');
    if (dropWrap) {
      dropWrap.querySelector('button').innerHTML = 'Actions <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M19 9l-7 7-7-7"/></svg>';
      dropWrap.querySelector('.edit-dropdown-menu').innerHTML = `<button class="edit-dropdown-item delete" onclick="event.stopPropagation();openDeleteConfirm('${jobId}','${card.dataset.title}')"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg>Delete Posting</button>`;
    }
    showToast('Job posting closed.');
  }

  /* ═══════════════════ DELETE ═══════════════════ */
  function openDeleteConfirm(jobId, jobTitle) {
    closeAllDropdowns();
    pendingDeleteId = jobId;
    document.getElementById('delete-job-title-text').textContent = `"${jobTitle}"`;
    document.getElementById('delete-confirm-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDeleteConfirm() {
    pendingDeleteId = null;
    document.getElementById('delete-confirm-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  function executeDelete() {
    if (!pendingDeleteId) return;
    const jobId = pendingDeleteId;
    fetch('/delete_job/', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-CSRFToken': getCsrf() },
      body: JSON.stringify({ job_id: jobId })
    })
    .then(r => r.json())
    .then(data => { if (data.success) { removeJobCard(jobId); showToast('Job posting deleted.'); } else showToast('Failed to delete.',true); })
    .catch(() => { removeJobCard(jobId); showToast('Deleted (UI only).'); });
    closeDeleteConfirm();
  }
  function removeJobCard(jobId) {
    const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
    if (!card) return;
    card.style.cssText += 'transition:opacity .25s,transform .25s;opacity:0;transform:scale(.97)';
    setTimeout(() => {
      card.remove(); updateJobCounters();
      if (!document.querySelectorAll('#job-cards-container .job-card').length) {
        document.getElementById('job-cards-container').innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📋</div><div class="empty-state-title">No job postings yet</div><div class="empty-state-sub">Click "New Job Post" to create your first listing</div></div>`;
      }
    }, 280);
  }
  function updateJobCounters() {
    const cards = document.querySelectorAll('#job-cards-container .job-card');
    let total=0,open=0,draft=0,closed=0;
    cards.forEach(c => { total++; if(c.dataset.status==='open')open++; if(c.dataset.status==='draft')draft++; if(c.dataset.status==='closed')closed++; });
    ['total','open','draft','closed'].forEach(k => { const el=document.getElementById('stat-'+k); if(el) el.textContent=eval(k); });
    ['all','open','draft','closed'].forEach(k => { const el=document.getElementById('tab-count-'+k); if(el) el.textContent=k==='all'?total:eval(k); });
  }

  /* ═══════════════════ NEW JOB SUBMIT ═══════════════════ */
  document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = { job_title:this.querySelector("[name='job_title']").value, company:this.querySelector("[name='company']").value, location:this.querySelector("[name='location']").value, duration:this.querySelector("[name='duration']").value, stipend:this.querySelector("[name='stipend']").value, deadline:this.querySelector("[name='deadline']").value, skills:this.querySelector("[name='skills']").value, description:this.querySelector("[name='description']").value, status:this.querySelector("[name='status']").value };
    fetch('/add_job/', { method:'POST', headers:{'Content-Type':'application/json','X-CSRFToken':getCsrf()}, body:JSON.stringify(fd) })
    .then(r=>r.json()).then(data=>{ if(data.success){addJobCard(data.job);updateJobCounters();this.reset();closeJobForm();showToast('Job posting published!');} })
    .catch(()=>{ const cs=this.querySelector("[name='company']"); addJobCardManual(fd,'temp-'+Date.now(),cs.options[cs.selectedIndex]?.text||''); updateJobCounters(); this.reset(); closeJobForm(); showToast('Job post created (UI only)!'); });
  });

  function addJobCard(job) {
    const skillsHTML=(job.skills||'').split(',').map(s=>`<span class="skill-tag">${s.trim()}</span>`).join('');
    const bc=job.status==='open'?'badge-open':job.status==='draft'?'badge-draft':'badge-closed';
    const sl=job.status?(job.status[0].toUpperCase()+job.status.slice(1)):'Open';
    const jid=job.id||('temp-'+Date.now());
    const emptyMsg=document.getElementById('empty-jobs-msg'); if(emptyMsg)emptyMsg.remove();
    document.getElementById('job-cards-container').insertAdjacentHTML('afterbegin',`
      <div class="job-card" data-status="${job.status}" data-id="${jid}" data-title="${job.title||''}" data-company="${job.company_id||''}" data-company-name="${job.company||''}" data-location="${job.location||''}" data-duration="${job.duration||''}" data-stipend="${job.stipend||''}" data-deadline="${job.deadline||''}" data-skills="${job.skills||''}" data-description="${job.description||''}" data-status-val="${job.status}">
        <div class="job-card-header"><div><div class="job-card-title">${job.title||''}</div><div class="job-card-company">${job.company||''}</div></div><span class="job-status-badge ${bc}">${sl}</span></div>
        <div class="job-meta-row"><span class="job-meta-item">${job.location||''}</span><span class="job-meta-item">${job.duration||''}</span><span class="job-meta-item">${job.stipend||''}</span></div>
        <div class="job-skills-row">${skillsHTML}</div>
        <div class="job-card-footer"><div class="job-apps-count"><strong>0</strong> Applications</div>
        <div style="display:flex;gap:6px;align-items:center"><div class="edit-dropdown-wrap" id="dropdown-${jid}">
          <button class="btn btn-ghost" style="height:28px;padding:0 10px;font-size:10px;display:flex;align-items:center;gap:5px" onclick="event.stopPropagation();toggleEditDropdown('${jid}')">Edit <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M19 9l-7 7-7-7"/></svg></button>
          <div class="edit-dropdown-menu">
            <button class="edit-dropdown-item" onclick="event.stopPropagation();openEditForm('${jid}')">Edit Details</button>
            <button class="edit-dropdown-item" onclick="event.stopPropagation();closeJobToStatus('${jid}')">Close Posting</button>
            <div class="edit-dropdown-divider"></div>
            <button class="edit-dropdown-item delete" onclick="event.stopPropagation();openDeleteConfirm('${jid}','${job.title||''}')">Delete Posting</button>
          </div></div></div></div>
      </div>`);
  }
  function addJobCardManual(fd, jid, companyName) { addJobCard({id:jid,title:fd.job_title,company:companyName,company_id:fd.company,location:fd.location,duration:fd.duration,stipend:fd.stipend,deadline:fd.deadline,skills:fd.skills,description:fd.description,status:fd.status}); }

  /* ═══════════════════ TOAST ═══════════════════ */
  function showToast(message, isError=false) {
    const ex=document.getElementById('toast-notif'); if(ex)ex.remove();
    const t=document.createElement('div'); t.id='toast-notif';
    t.style.cssText=`position:fixed;bottom:28px;right:28px;z-index:9999;background:${isError?'var(--danger)':'var(--black)'};color:var(--white);padding:12px 20px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2);display:flex;align-items:center;gap:10px;max-width:320px;animation:toastIn .25s ease both`;
    t.innerHTML=`<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">${isError?'<path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>':'<path stroke-linecap="round" d="M5 13l4 4L19 7"/>'}</svg>${message}`;
    document.body.appendChild(t);
    const st=document.createElement('style'); st.textContent='@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}'; document.head.appendChild(st);
    setTimeout(()=>{ t.style.cssText+=';transition:opacity .25s,transform .25s;opacity:0;transform:translateY(12px)'; setTimeout(()=>t.remove(),280); }, 3000);
  }

  /* ═══════════════════ SOCIAL ═══════════════════ */
  const socialData = [
    { platform:'linkedin', platformName:'LinkedIn', content:'🚀 InternHub is hiring! ML Engineer Intern for a 6-month role at Microsoft (Hybrid, Bangalore). Skills: Python, ML, TensorFlow. Apply today! #Internship #ML #Microsoft', date:'Feb 18, 2025', likes:142, reposts:38, status:'posted' },
    { platform:'twitter',  platformName:'Twitter/X', content:'📢 Frontend Developer Intern @ Google India — Remote | 3-6 months | React, JavaScript, CSS. Apply via InternHub 👉 #FrontendDev #Google #Internship', date:'Feb 17, 2025', likes:89, reposts:22, status:'posted' },
    { platform:'instagram',platformName:'Instagram', content:'🎓 Data Analyst Intern at TCS Mumbai. Python & SQL skills required. 3-month paid internship. Link in bio to apply via InternHub.', date:'Feb 16, 2025', likes:203, reposts:0, status:'posted' },
    { platform:'linkedin', platformName:'LinkedIn', content:'🔔 Backend Developer Intern at Amazon Bangalore! Django, Python, REST API. 4-6 months | ₹18,000/month.', date:'Feb 22, 2025 · 10:00 AM', likes:0, reposts:0, status:'scheduled' },
    { platform:'twitter',  platformName:'Twitter/X', content:'💼 DevOps Internship coming soon! Stay tuned for opportunities at Wipro Hyderabad. #DevOps #Internship', date:'—', likes:0, reposts:0, status:'draft' },
  ];
  function renderSocialCards(filter='all') {
    const container=document.getElementById('social-cards-container'); if(!container)return;
    const filtered=filter==='all'?socialData:socialData.filter(p=>p.platform===filter);
    container.innerHTML=filtered.map(p=>`
      <div class="social-post-card">
        <div class="social-post-header">
          <div class="social-platform-icon platform-${p.platform}">${p.platform==='linkedin'?'in':p.platform==='twitter'?'X':'📷'}</div>
          <div><div class="social-platform-name">${p.platformName}</div></div>
          <span class="social-post-date">${p.date}</span>
        </div>
        <div class="social-post-body">${p.content}</div>
        <div class="social-post-footer">
          <div class="social-stats">
            <span class="social-stat"><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg><strong>${p.likes}</strong></span>
            ${p.platform!=='instagram'?`<span class="social-stat"><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><strong>${p.reposts}</strong></span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="social-status-badge ${p.status==='posted'?'posted':p.status==='scheduled'?'scheduled-post':'draft-post'}">${p.status}</span>
            ${p.status!=='posted'?`<button class="btn btn-dark" style="height:26px;padding:0 10px;font-size:10px">Post Now</button>`:`<button class="btn btn-ghost" style="height:26px;padding:0 10px;font-size:10px">Edit</button>`}
          </div>
        </div>
      </div>`).join('');
  }
  function filterSocial(tab, platform) {
    document.querySelectorAll('#page-social .tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    renderSocialCards(platform);
  }

  /* ═══════════════════ FORM HELPERS ═══════════════════ */
  function openJobForm()       { document.getElementById('job-form-overlay').classList.add('open'); document.body.style.overflow='hidden'; }
  function closeJobForm()      { document.getElementById('job-form-overlay').classList.remove('open'); document.body.style.overflow=''; }
  function openInterviewForm() { document.getElementById('interview-form-overlay').classList.add('open'); document.body.style.overflow='hidden'; }
  function closeInterviewForm(){ document.getElementById('interview-form-overlay').classList.remove('open'); document.body.style.overflow=''; }
  function submitInterviewForm(){ showToast('Interview scheduled!'); closeInterviewForm(); }
  function openSocialForm()    { document.getElementById('social-form-overlay').classList.add('open'); document.body.style.overflow='hidden'; }
  function closeSocialForm()   { document.getElementById('social-form-overlay').classList.remove('open'); document.body.style.overflow=''; }
  function submitSocialForm()  { showToast('Post published successfully!'); closeSocialForm(); }

  /* ═══════════════════ APPLICANTS MODAL ═══════════════════ */
  function openApplicantsModal(jobId) {
    _amJobId=jobId; _amFilter='all'; _amSearch=''; _amData=[];
    const si=document.getElementById('am-search-input'); if(si)si.value='';
    const modal=document.getElementById('appModal'); modal.classList.add('open'); modal.style.display='flex'; document.body.style.overflow='hidden';
    document.getElementById('am-list').innerHTML='<div class="am-loading"><div class="am-spinner"></div></div>';
    fetch(`/view_applications/${jobId}/`).then(r=>r.json()).then(data=>{
      _amData=data.applications||[];
      document.getElementById('am-job-title').textContent=data.job_title||'Job Posting';
      document.getElementById('am-job-meta').textContent=data.job_meta||'';
      document.getElementById('am-count-num').textContent=_amData.length;
      const chipsEl=document.getElementById('am-banner-chips');
      chipsEl.innerHTML=[{label:data.status||'Open',hi:true},{label:data.location||'',hi:false},{label:data.stipend||'',hi:false},{label:data.deadline?'Deadline: '+data.deadline:'',hi:false}].filter(c=>c.label).map(c=>`<span class="am-chip${c.hi?' hi':''}">${c.label}</span>`).join('');
      amRenderPipeline(); amRenderList();
    }).catch(()=>{ document.getElementById('am-list').innerHTML='<div class="am-empty"><div class="am-empty-icon">⚠️</div><div class="am-empty-title">Could not load applicants</div></div>'; });
  }
  function closeApplicantsModal() {
    const modal=document.getElementById('appModal'); modal.style.display='none'; modal.classList.remove('open'); document.body.style.overflow='';
  }
  function amRenderPipeline() {
    const total=_amData.length||1, counts={pending:0,review:0,approved:0,rejected:0};
    _amData.forEach(a=>{ if(counts[a.status]!==undefined)counts[a.status]++; });
    document.getElementById('am-pipeline').innerHTML=Object.entries(counts).map(([k,v])=>`<div class="am-pipe-seg ${k}" style="flex:${v||0.05}" title="${k}: ${v}"></div>`).join('');
  }
  function amFilter() { _amSearch=document.getElementById('am-search-input').value.toLowerCase(); amRenderList(); }
  function amRenderList() {
    const visible=_amData.filter(a=>{ const fOk=_amFilter==='all'||a.status===_amFilter; const sOk=!_amSearch||a.name.toLowerCase().includes(_amSearch)||a.email.toLowerCase().includes(_amSearch); return fOk&&sOk; });
    document.getElementById('am-vis-count').textContent=visible.length;
    document.getElementById('am-tot-count').textContent=_amData.length;
    const listEl=document.getElementById('am-list');
    if(!visible.length){ listEl.innerHTML='<div class="am-empty"><div class="am-empty-icon">🔍</div><div class="am-empty-title">No applicants found</div></div>'; return; }
    const STATUS_LABEL={pending:'Pending',review:'Under Review',approved:'Approved',rejected:'Rejected'};
    const BG=['#0a0a0a','#3d3d3d','#6b6b6b','#1a1a1a','#a0a0a0'], FG=['#fff','#fff','#fff','#fff','#0a0a0a'];
    listEl.innerHTML=visible.map((a,i)=>{
      const initials=a.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const bg=BG[i%BG.length], fg=FG[i%FG.length];
      const isActionable=a.status==='pending'||a.status==='review';
      const isApproved=a.status==='approved';
      const actionBtns=isActionable?`<button class="am-btn am-btn-approve" onclick="amApprove(${a.id||i},this)"><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M5 13l4 4L19 7"/></svg>Approve</button><button class="am-btn am-btn-reject" onclick="amReject(${a.id||i},this)"><svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>Reject</button>`:'';
      const detailTags=[a.course,a.year,a.match?`${a.match}% Match`:null].filter(Boolean).map(t=>`<span class="am-ptag">${t}</span>`).join('');
      return `<div class="am-card" id="am-card-${a.id||i}"><div class="am-card-accent ${a.status}"></div><div class="am-card-inner"><div class="am-avatar-wrap"><div class="am-avatar" style="background:${bg};color:${fg}">${initials}</div></div><div class="am-profile"><div class="am-pname">${a.name}</div><div class="am-pemail">${a.email}</div><div class="am-ptags">${detailTags}</div></div><div class="am-date-block"><div class="am-date-val">${amFormatDate(a.date)}</div><div class="am-date-lbl">Applied</div></div><div class="am-status-block"><span class="am-spill ${a.status}">${STATUS_LABEL[a.status]||a.status}</span></div><div class="am-actions-block">${actionBtns}</div></div></div>`;
    }).join('');
  }
  function amApprove(appId, btn) {
    const card=btn.closest('.am-card');
    fetch('/update_application_status/',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':getCsrf()},body:JSON.stringify({id:appId,status:'approved'})})
    .then(r=>r.json()).then(data=>{ if(data.success)amUpdateStatus(appId,'approved',card); else amShowToast('Error'); }).catch(()=>amShowToast('Server error'));
  }
  function amReject(appId, btn) {
    const card=btn.closest('.am-card');
    fetch('/update_application_status/',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':getCsrf()},body:JSON.stringify({id:appId,status:'rejected'})})
    .then(r=>r.json()).then(data=>{ if(data.success)amUpdateStatus(appId,'rejected',card); else amShowToast('Error'); }).catch(()=>amShowToast('Server error'));
  }
  function amUpdateStatus(appId,newStatus,card) {
    _amData.forEach(a=>{ if(a.id==appId)a.status=newStatus; });
    amRenderPipeline();
    if(card){ card.style.cssText+='transition:opacity .2s,transform .2s;opacity:0;transform:translateX(10px)'; setTimeout(()=>amRenderList(),220); } else amRenderList();
    amShowToast(newStatus==='approved'?'Applicant approved ✓':'Applicant rejected');
  }
  function amFormatDate(dateStr) {
    if(!dateStr)return'—';
    try{ return new Date(dateStr).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }catch{return dateStr;}
  }
  function amShowToast(msg) {
    const t=document.createElement('div'); t.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;background:#0a0a0a;color:#fff;padding:11px 18px;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2)'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>{t.style.cssText+='transition:opacity .25s;opacity:0';setTimeout(()=>t.remove(),250);},2500);
  }
  document.getElementById('appModal').addEventListener('click',function(e){if(e.target===this)closeApplicantsModal();});

  /* ═══════════════════ HELPERS ═══════════════════ */
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function esc(s)     { return String(s||'').replace(/'/g,"\\'").replace(/\n/g,' '); }
  function getCsrf()  {
    let v=null; if(document.cookie){document.cookie.split(';').forEach(c=>{c=c.trim();if(c.startsWith('csrftoken='))v=decodeURIComponent(c.substring('csrftoken='.length));});}
    return v;
  }

  /* ═══════════════════ ESC KEY ═══════════════════ */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(); closeJobForm(); closeEditForm(); closeDeleteConfirm();
      closeInterviewForm(); closeSocialForm(); closeDetailModal();
      closeLetterModal(); closeFeedbackModal(); closeCvViewer();
      closeAllDropdowns();
      if(document.getElementById('appModal').style.display==='flex') closeApplicantsModal();
    }
  });

  const CSRF = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

  function updateStatus(appId, status, btn) {
    fetch("{% url 'update_application_status' %}", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": CSRF },
      body: JSON.stringify({ id: appId, status: status })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const row = btn.closest('tr');
        row.style.opacity = '0.4';
        row.style.pointerEvents = 'none';
        btn.closest('.action-pair').innerHTML =
          `<span class="badge-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
      }
    });
  }

  function approveAll() {
    const rows = [...document.querySelectorAll('#page-pending tbody tr')]
      .filter(r => r.style.pointerEvents !== 'none');

    if (!rows.length) return alert("No pending applications.");

    const requests = rows.map(row =>
      fetch("{% url 'update_application_status' %}", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": CSRF },
        body: JSON.stringify({ id: row.dataset.appId, status: "approved" })
      })
    );

    Promise.all(requests).then(() => {
      rows.forEach(row => {
        row.style.opacity = '0.4';
        row.style.pointerEvents = 'none';
        const actionPair = row.querySelector('.action-pair');
        if (actionPair) actionPair.innerHTML = `<span class="badge-status approved">Approved</span>`;
      });
    });
  }

  function markPopupActive(name) {
    document.querySelectorAll('.popup-item').forEach(p => p.classList.remove('active-page'));
    var map = { profile: 0, password: 1 };
    var items = document.querySelectorAll('.popup-item');
    if (map[name] !== undefined && items[map[name]]) items[map[name]].classList.add('active-page');
  }

  document.getElementById("passwordForm").addEventListener("submit", function(e) {
      e.preventDefault();
      let formData = new FormData(this);
      let msgBox   = document.getElementById("passwordMessage");
      let btn      = this.querySelector("button[type='submit']");

      btn.disabled    = true;
      btn.textContent = "Updating…";

      fetch("/change_password/", {
          method: "POST",
          headers: { "X-CSRFToken": getCookie("csrftoken") },
          body: formData
      })
      .then(r => {
          if (!r.ok) throw new Error("Server error: " + r.status);
          return r.json();
      })
      .then(data => {
          if (data.status === "success") {
              msgBox.innerHTML = `<div style="background:#e7ffe7;color:#0a7a0a;padding:10px;text-align:center;margin-bottom:12px;">${data.message}</div>`;
              this.reset();
          } else {
              msgBox.innerHTML = `<div style="background:#ffe6e6;color:#d10000;padding:10px;text-align:center;margin-bottom:12px;">${data.message}</div>`;
          }
      })
      .catch(err => {
          msgBox.innerHTML = `<div style="background:#ffe6e6;color:#d10000;padding:10px;text-align:center;margin-bottom:12px;">Network error. Please try again.</div>`;
      })
      .finally(() => {
          btn.disabled    = false;
          btn.textContent = "Update Password";
      });
  });

  const today = new Date();
  let curYear  = today.getFullYear();
  let curMonth = today.getMonth() + 1;
  window.selectedAppId = null;
  window.selectedJobId = null;
  let stageState = { mcq: "empty", machine: "empty", hr: "empty" };

  function openApplicantProcessModal(appId, name, jobTitle) {
    console.log("appId received:", appId, typeof appId);
    if (!appId) {
        alert("No app ID — check your HTML button");
        return;
    }
    selectedAppId = appId;

    ["mcq", "machine", "hr"].forEach(stage => {
        document.getElementById(stage + "_date").value = "";
        setStageState(stage, "empty");
    });

    document.getElementById("pm-job-tag").innerText = name + " · " + jobTitle;
    document.getElementById("pm-footer-status").innerText = "";
    document.getElementById("processModal").style.display = "flex";
    loadProcess(appId);   // ← pass appId not selectedJobId
  } 

  function handleModalOutsideClick(event) {
    // only close if clicking the dark overlay itself, not the modal card
    if (event.target === document.getElementById("processModal")) {
        closeProcessModal();
    }
  }

  // ── MUST BE DEFINED BEFORE handleStageAction ──────────
  async function sendStageRequest(stage, date, action) {
    const btn = document.getElementById(stage + "_action_btn");
    const originalText = btn.innerText;
    btn.innerText = "...";
    btn.disabled = true;

    const payload = {
        job_id: selectedJobId,  // ← job_id instead of app_id
        stage:  stage,
        date:   date,
        action: action
    };

    try {
        const res = await fetch("/save-process/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "success") {
            if (action === "remove") {
                document.getElementById(stage + "_date").value = "";
                setStageState(stage, "empty");
                showFooterStatus("Removed ✓", "#dc2626");
            } else {
                setStageState(stage, "saved");
                showFooterStatus("Saved ✓", "#16a34a");
            }
        } else {
            alert("Error: " + (data.message || "Unknown error"));
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        alert("Something went wrong.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
    btn.disabled = false;
}

  async function handleStageAction(stage) {
      const dateVal = document.getElementById(stage + "_date").value;
      const state   = stageState[stage];
      console.log("handleStageAction:", stage, "state:", state);

      if (state === "saved") {
          await sendStageRequest(stage, null, "remove");
      } else if (state === "dirty") {
          if (!dateVal) { alert("Please select a date."); return; }
          await sendStageRequest(stage, dateVal, "update");
      } else if (state === "new") {
          if (!dateVal) { alert("Please select a date."); return; }
          await sendStageRequest(stage, dateVal, "apply");
      }
  }


  function setStageState(stage, state) {
      stageState[stage] = state;
      const btn = document.getElementById(stage + "_action_btn");
      const row = document.getElementById("pm-stage-" + stage);
      if (!btn || !row) return;

      row.classList.remove("applied");
      if (state === "empty") {
          btn.style.display = "none";
          btn.innerText = "Apply";
          btn.className = "pm-stage-btn";
      } else if (state === "saved") {
          btn.style.display = "inline-block";
          btn.innerText = "Remove";
          btn.className = "pm-stage-btn remove-btn";
          row.classList.add("applied");
      } else if (state === "dirty") {
          btn.style.display = "inline-block";
          btn.innerText = "Update";
          btn.className = "pm-stage-btn update-btn";
      } else if (state === "new") {
          btn.style.display = "inline-block";
          btn.innerText = "Apply";
          btn.className = "pm-stage-btn";
      }
  }

  function showFooterStatus(msg, color) {
      const el = document.getElementById("pm-footer-status");
      if (!el) return;
      el.innerText = msg;
      el.style.color = color || "#888";
      setTimeout(() => { el.innerText = ""; }, 3000);
  }

function filterByJob(jobId) {
  selectedJobId = jobId === "all" ? null : parseInt(jobId);

  const shortlistSelect = document.querySelector("#page-shortlist .job-filter");
  const ranklistSelect  = document.getElementById("ranklist-job-select");
  if (shortlistSelect) shortlistSelect.value = jobId;
  if (ranklistSelect)  ranklistSelect.value  = jobId;

  const cards = document.querySelectorAll(".approved-card");
  cards.forEach(card => {
    card.style.display = (jobId === "all" || card.dataset.job == jobId) ? "block" : "none";
  });

  // ── shortlist schedule btn ─────────────────
  const shortlistScheduleBtn = document.getElementById("shortlist-schedule-btn");
  if (shortlistScheduleBtn) {
    shortlistScheduleBtn.style.display = (jobId === "all" || !jobId) ? "none" : "inline-flex";
  }

  // ── scheduleBtn (process modal) ────────────
  const scheduleBtn = document.getElementById("scheduleBtn");
  if (scheduleBtn) {
    scheduleBtn.style.display = (jobId === "all" || !jobId) ? "none" : "inline-block";
  }

  // ── ranklist stats + schedule btn ──────────
  const statsEl          = document.getElementById("ranklist-stats");
  const rankScheduleBtn  = document.getElementById("schedule-interview-btn");
  if (jobId === "all" || !jobId) {
    if (statsEl)         statsEl.style.display         = "none";
    if (rankScheduleBtn) rankScheduleBtn.style.display  = "none";
  } else {
    if (statsEl)         statsEl.style.display         = "flex";
    if (rankScheduleBtn) rankScheduleBtn.style.display  = "inline-flex";
  }

  // ── job pill ───────────────────────────────
  const pill  = document.getElementById("ranklist-job-pill");
  const label = document.getElementById("ranklist-job-label");
  if (pill && label) {
    if (jobId === "all") {
      pill.style.display = "none";
    } else {
      const select = document.getElementById("ranklist-job-select");
      if (select) {
        label.textContent  = select.options[select.selectedIndex].text;
        pill.style.display = "flex";
      }
    }
  }

  renderRankList(jobId);
}

function renderRankList(jobId) {
  const container = document.getElementById("ranklist-container");
  if (!container) return;

  if (!jobId || jobId === "all") {
    container.innerHTML = `<p style="color:var(--muted);padding:32px;text-align:center;font-size:13px">Select a job above to view the rank list.</p>`;
    return;
  }

  container.innerHTML = `<p style="color:var(--muted);padding:32px;text-align:center;font-size:13px">Loading…</p>`;

  fetch(`/get_ranklist/?job_id=${jobId}`)
    .then(r => r.json())
    .then(data => {
      const students = data.students || [];
      if (!students.length) {
        container.innerHTML = `<p style="color:var(--muted);padding:32px;text-align:center;font-size:13px">No approved applicants for this job.</p>`;
        return;
      }
      container.innerHTML = buildRankTable(students);
    })
    .catch(() => {
      // Fallback: read from already-rendered approved cards on shortlist page
      const cards = [...document.querySelectorAll(`.approved-card[data-job="${jobId}"]`)];
      if (!cards.length) {
        container.innerHTML = `<p style="color:var(--muted);padding:32px;text-align:center;font-size:13px">No approved applicants found.</p>`;
        return;
      }
      const students = cards.map(card => ({
        name:        card.querySelector(".ac-name")?.textContent || "—",
        course:      card.querySelector(".ac-meta")?.textContent?.split("·")[0]?.trim() || "—",
        email:       card.querySelector(".ac-meta")?.textContent?.split("·")[1]?.trim() || "—",
        score:       Math.floor(Math.random() * 30) + 70,  // fallback
        skills:      [...card.querySelectorAll(".skill-tag")].map(t => t.textContent),
        approved_on: card.querySelector(".ac-info-val")?.textContent || "—",
        cv_url:      card.querySelector("a[href]")?.href || "",
        app_id:      card.dataset.appId,
      }));
      students.sort((a, b) => b.score - a.score);
      container.innerHTML = buildRankTable(students);
    });
}

function buildRankTable(students) {
  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  students = [...students].sort((a, b) => {
    const getTotal = s => {
      const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
      const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
      const count   = [mcq, machine].filter(v => v !== null).length;
      return count ? ((mcq || 0) + (machine || 0)) / count : -1;
    };
    return getTotal(b) - getTotal(a);
  });

  const mcqScores     = students.map(s => parseFloat(s.mcq_score)).filter(v => !isNaN(v));
  const machineScores = students.map(s => parseFloat(s.machine_score)).filter(v => !isNaN(v));
  const totals        = students.map(s => {
    const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
    const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
    const count   = [mcq, machine].filter(v => v !== null).length;
    return count ? ((mcq || 0) + (machine || 0)) / count : null;
  }).filter(v => v !== null);

  const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) + '%' : '—';
  const top = arr => arr.length ? Math.max(...arr).toFixed(1) + '%' : '—';

  const statsEl = document.getElementById('ranklist-stats');
  if (statsEl) {
    statsEl.style.display = 'flex';
    document.getElementById('stat-total').textContent   = students.length;
    document.getElementById('stat-mcq').textContent     = avg(mcqScores);
    document.getElementById('stat-machine').textContent = avg(machineScores);
    document.getElementById('stat-top').textContent     = top(totals);
  }

  const avatarColors = [
    { bg:'#E6F1FB', color:'#185FA5' },
    { bg:'#E1F5EE', color:'#0F6E56' },
    { bg:'#EEEDFE', color:'#3C3489' },
    { bg:'#FAEEDA', color:'#854F0B' },
    { bg:'#FAECE7', color:'#993C1D' },
  ];

  return `
  <div class="rl-table-wrap">
    <div style="overflow-x:auto">
      <table class="rl-table">
        <thead>
          <tr>
            <th style="width:48px;text-align:center">#</th>
            <th>Student</th>
            <th>MCQ Score</th>
            <th>Machine Test</th>
            <th>Total %</th>
            <th>Approved On</th>
            <th>Interview</th>
            <th>CV</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s, i) => {
            const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
            const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
            const count   = [mcq, machine].filter(v => v !== null).length;
            const total   = count ? (((mcq || 0) + (machine || 0)) / count).toFixed(1) : null;
            const av      = avatarColors[i % avatarColors.length];
            const rankCls = i === 0 ? 'rl-rank-1' : i === 1 ? 'rl-rank-2' : i === 2 ? 'rl-rank-3' : '';
            const isTop5  = i < 5 && total !== null;

            return `
            <tr class="rl-row ${isTop5 ? 'rl-row-top5' : ''}"
                onclick="openCandidateModal(${JSON.stringify(s).replace(/"/g, '&quot;')})"
                style="cursor:pointer; ${isTop5 ? 'background:linear-gradient(90deg,#f0fdf4 0%,#fff 100%);border-left:3px solid #16a34a;' : ''}">
              <td style="text-align:center">
                <span class="${rankCls}" style="font-size:14px">${i + 1}</span>
                ${isTop5 ? `<div style="width:7px;height:7px;border-radius:50%;background:#16a34a;margin:3px auto 0"></div>` : ''}
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="rl-avatar" style="background:${av.bg};color:${av.color}">${initials(s.name)}</div>
                  <div>
                    <div style="font-size:13px;font-weight:600">${s.name}</div>
                    <div style="font-size:11px;color:var(--muted);margin-top:1px">${s.course}</div>
                  </div>
                </div>
              </td>
              <td>
                ${mcq !== null
                  ? `<div style="display:flex;align-items:center;gap:8px">
                       <div class="rl-bar-track"><div class="rl-bar-mcq" style="width:${mcq}%"></div></div>
                       <span style="font-size:13px;font-weight:600">${mcq}%</span>
                     </div>`
                  : `<span style="font-size:12px;color:var(--muted)">Not taken</span>`}
              </td>
              <td>
                ${machine !== null
                  ? `<div style="display:flex;align-items:center;gap:8px">
                       <div class="rl-bar-track"><div class="rl-bar-mac" style="width:${machine}%"></div></div>
                       <span style="font-size:13px;font-weight:600">${machine}%</span>
                     </div>`
                  : `<span style="font-size:12px;color:var(--muted)">Not taken</span>`}
              </td>
              <td>
                ${total !== null
                  ? `<span style="font-size:15px;font-weight:700;color:${isTop5 ? '#16a34a' : 'inherit'}">${total}%</span>`
                  : `<span style="font-size:12px;color:var(--muted)">—</span>`}
              </td>
              <td style="font-size:12px;color:var(--muted)">${s.approved_on || '—'}</td>
              <td>
                ${s.interview_result === 'passed'
                  ? `<span style="font-size:12px;font-weight:600;color:#16a34a">✓ Passed</span>`
                  : s.interview_result === 'rejected'
                  ? `<span style="font-size:12px;font-weight:600;color:#c0392b">✗ Failed</span>`
                  : `<span style="font-size:12px;color:var(--muted)">Pending</span>`}
              </td>
              <td>
                ${s.cv_url
                  ? `<a href="${s.cv_url}" target="_blank" onclick="event.stopPropagation()"
                        style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;
                               border-radius:6px;border:1px solid var(--border);font-size:11px;
                               color:var(--black);text-decoration:none;background:var(--white)">
                       View CV
                     </a>`
                  : `<span style="font-size:11px;color:var(--muted)">—</span>`}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function exportRanklist() {
  const jobId = document.getElementById("ranklist-job-select")?.value;
  if (!jobId || jobId === "all") { showToast("Select a job first."); return; }
  const rows = [...document.querySelectorAll("#ranklist-container table tbody tr")];
  if (!rows.length) { showToast("No data to export."); return; }
  let csv = "Rank,Name,Course,Score,Approved On\n";
  rows.forEach((row, i) => {
    const cells = [...row.querySelectorAll("td")];
    const name  = row.querySelector(".app-student-name")?.textContent || "";
    const meta  = row.querySelector(".app-student-meta")?.textContent?.split("·")[0]?.trim() || "";
    const score = cells[2]?.textContent?.trim().replace(/\s+/g, " ").split(" ")[1] || "";
    const date  = cells[4]?.textContent?.trim() || "";
    csv += `${i + 1},"${name}","${meta}","${score}","${date}"\n`;
  });
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "ranklist.csv";
  a.click();
}

// ── Schedule mcq/machine test ───────────────────────────────────────────

  function openProcessModal() {
    if (!selectedJobId) {
      alert("Select a job first");
      return;
    }

    ["mcq", "machine"].forEach(stage => {
      document.getElementById(stage + "_date").value = "";
      setStageState(stage, "empty");
    });

    const select = document.querySelector(".job-filter");
    const selectedText = select.options[select.selectedIndex].text;
    document.getElementById("pm-job-tag").innerText = selectedText;
    document.getElementById("pm-footer-status").innerText = "";
    document.getElementById("processModal").style.display = "flex";
    loadProcess(selectedJobId + "/?type=job");
  }

  function closeProcessModal() {
    document.getElementById("processModal").style.display = "none";
    document.getElementById("pm-footer-status").innerText = "";
    const btn = document.getElementById("apply-all-btn");
    if (btn) {
      btn.innerText = "Apply All";
      btn.style.background = "";
      btn.disabled = false;
    }
  }

  function loadProcess(appId) {
    fetch("/get-process/" + appId)
      .then(res => res.json())
      .then(data => {
        if (data.mcq_date) {
          document.getElementById("mcq_date").value = data.mcq_date.replace(" ", "T").slice(0, 16);
          setStageState("mcq", "saved");
        }
        if (data.machine_test_date) {
          document.getElementById("machine_date").value = data.machine_test_date.replace(" ", "T").slice(0, 16);
          setStageState("machine", "saved");
        }
      })
      .catch(err => console.error("loadProcess failed:", err));
  }

  async function applyAll() {
    const mcq     = document.getElementById("mcq_date").value;
    const machine = document.getElementById("machine_date").value;

    const toSave = [
      { stage: "mcq",     date: mcq },
      { stage: "machine", date: machine },
    ].filter(s => s.date && stageState[s.stage] !== "saved");

    if (toSave.length === 0) {
      showFooterStatus("Nothing new to save.", "#888");
      return;
    }

    const btn = document.getElementById("apply-all-btn");
    const statusEl = document.getElementById("pm-footer-status");
    btn.innerText = "Saving...";
    btn.disabled = true;
    statusEl.innerText = "";

    try {
      for (const s of toSave) {
        const action = stageState[s.stage] === "dirty" ? "update" : "apply";
        const res = await fetch("/save-process/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
          },
          body: JSON.stringify({
            app_id: selectedAppId,
            stage:  s.stage,
            date:   s.date,
            action: action
          })
        });
        const data = await res.json();
        if (data.status !== "success") {
          alert("Error saving " + s.stage + ": " + (data.message || "Unknown error"));
          btn.innerText = "Apply All";
          btn.disabled = false;
          return;
        }
        setStageState(s.stage, "saved");
      }

      btn.innerText = "Saved ✓";
      btn.style.background = "#16a34a";
      showFooterStatus("All stages saved!", "#16a34a");
      setTimeout(() => {
        btn.innerText = "Apply All";
        btn.style.background = "";
        btn.disabled = false;
      }, 2000);

    } catch (err) {
      console.error("applyAll error:", err);
      btn.innerText = "Apply All";
      btn.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    ["mcq", "machine"].forEach(stage => {
      const input = document.getElementById(stage + "_date");
      if (!input) return;
      input.addEventListener("change", function () {
        if (!this.value) {
          setStageState(stage, "empty");
        } else if (stageState[stage] === "saved") {
          setStageState(stage, "dirty");
        } else if (stageState[stage] === "empty") {
          setStageState(stage, "new");
        }
      });
    });
  });
  

  
  function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          document.cookie.split(';').forEach(cookie => {
              cookie = cookie.trim();
              if (cookie.startsWith(name + '=')) {
                  cookieValue = decodeURIComponent(cookie.split('=')[1]);
              }
          });
      }
      return cookieValue;
  }
  // ── Calendar ───────────────────────────────────────────
  window.initCalendarIfNeeded = function() {
      if (window._calendarInitialized) { loadCalendar(curYear, curMonth); return; }
      window._calendarInitialized = true;
      updateTodayLabel();
      loadCalendar(curYear, curMonth);
      setInterval(() => loadCalendar(curYear, curMonth), 60000);
  };

  async function loadCalendar(year, month) {
      showCalLoading(true);
      try {
          const res  = await fetch(`/hr/api/calendar/?year=${year}&month=${month}`);
          const data = await res.json();
          renderCalendar(data);
          renderTodayList(data.today_events);
          renderStats(data.stats, data.events.length);
      } catch (err) {
          console.error('Calendar load failed:', err);
          const el = document.getElementById('calLoading');
          if (el) el.innerHTML = `<div style="color:#c0392b">Failed to load. <a href="#" onclick="loadCalendar(${year},${month})">Retry</a></div>`;
          showCalLoading(true);
      }
  }

  function renderCalendar(data) {
      const { year, month, month_name, days_in_month, first_weekday, events } = data;
      document.getElementById('cal-month-label').textContent = `${month_name} ${year}`;
      const eventMap = {};
      events.forEach(e => {
      const d = new Date(e.date + 'T00:00:00').getDate();
      if (!eventMap[d]) eventMap[d] = [];
      // Only add if job_title not already present for this day
      const alreadyExists = eventMap[d].some(existing => existing.job_title === e.job_title);
      if (!alreadyExists) eventMap[d].push(e);
  });
      const offset = (first_weekday + 1) % 7;
      let html = '';
      const prevMonthDays = daysInMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
      for (let i = offset - 1; i >= 0; i--) {
          html += `<div class="cal-day other-month"><div class="cal-day-num">${prevMonthDays - i}</div></div>`;
      }
      for (let d = 1; d <= days_in_month; d++) {
          const isToday = (year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate());
          const dayEvents = eventMap[d] || [];
          html += `<div class="cal-day ${isToday ? 'today' : ''}"><div class="cal-day-num">${d}</div>`;
          dayEvents.slice(0, 2).forEach(e => {
              const statusClass = e.status === 'active' ? 'interview' : 'pending';
              const shortName = e.job_title || e.candidate;
              html += `<div class="cal-event ${statusClass}" onclick="openDayDetail(${d}, ${JSON.stringify(dayEvents).replace(/"/g,'&quot;')})" style="cursor:pointer">${esc(shortName)}</div>`;
          });
          if (dayEvents.length > 2) {
              html += `<div class="cal-event" style="background:transparent;color:#888;font-size:10px;cursor:pointer" onclick="openDayDetail(${d}, ${JSON.stringify(dayEvents).replace(/"/g,'&quot;')})">+${dayEvents.length - 2} more</div>`;
          }
          html += `</div>`;
      }
      const totalCells = offset + days_in_month;
      const remaining  = (7 - (totalCells % 7)) % 7;
      for (let d = 1; d <= remaining; d++) {
          html += `<div class="cal-day other-month"><div class="cal-day-num">${d}</div></div>`;
      }
      document.getElementById('calDays').innerHTML = html;
      showCalLoading(false);
  }

  function renderTodayList(events) {
      const list = document.getElementById('todayList');
      if (!list) return;
      if (!events || events.length === 0) {
          list.innerHTML = `<div style="text-align:center;padding:40px;color:#888;font-size:13px"><div style="font-size:28px;margin-bottom:8px">📭</div>No interviews scheduled for today.</div>`;
          return;
      }
      list.innerHTML = events.map(e => {
          const canJoin = e.status !== 'ended';
          return `
          <div class="interview-row">
              <div><div class="interview-time">${esc(e.time)}</div></div>
              <div class="interview-divider"></div>
              <div class="interview-details">
                  <div class="interview-name">${esc(e.candidate || 'Candidate')}</div>
                  <div class="interview-meta">${esc(e.job_title)} · ${esc(e.company)} · HR Round</div>
              </div>
              <span class="interview-type type-hr">HR</span>
              ${getStatusPill(e.status)}
              <div class="action-pair" style="margin-left:8px">
                  ${canJoin
                      ? `<a href="${esc(e.room_url)}" class="btn btn-dark" style="height:30px;padding:0 12px;font-size:11px;text-decoration:none">Join</a>`
                      : `<span class="btn btn-outline" style="height:30px;padding:0 12px;font-size:11px;opacity:.5">Ended</span>`}
              </div>
          </div>`;
      }).join('');
  }

  function renderStats(stats, monthCount) {
      const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
      setEl('stat-today', stats.today ?? 0);
      setEl('stat-week',  stats.week  ?? 0);
  }

  window.changeMonth = function(dir) {
      if (dir === 0) { curYear = today.getFullYear(); curMonth = today.getMonth() + 1; }
      else {
          curMonth += dir;
          if (curMonth > 12) { curMonth = 1; curYear++; }
          if (curMonth < 1)  { curMonth = 12; curYear--; }
      }
      loadCalendar(curYear, curMonth);
  };

  window.openDayDetail = function(day, events) {
    const existing = document.getElementById('dayPopup');
    if (existing) existing.remove();
    const existingBd = document.getElementById('dayPopupBd');
    if (existingBd) existingBd.remove();

    // Group events by job_title
    const jobMap = {};
    events.forEach(e => {
        if (!jobMap[e.job_title]) {
            jobMap[e.job_title] = { ...e, candidates: [] };
        }
        jobMap[e.job_title].candidates.push(e.candidate);
    });

    const bd = document.createElement('div');
    bd.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:9998';
    const popup = document.createElement('div');
    popup.id = 'dayPopup';
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:12px;padding:24px;min-width:320px;max-width:480px;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,.15);font-family:inherit;max-height:80vh;overflow-y:auto';

    popup.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="font-weight:700;font-size:15px">Day ${day} — Interviews</div>
            <button onclick="document.getElementById('dayPopup').remove();document.getElementById('dayPopupBd').remove()" 
                    style="border:none;background:none;font-size:18px;cursor:pointer">×</button>
        </div>
        ${Object.values(jobMap).map(group => `
            <div style="padding:14px;border:1px solid #eee;border-radius:8px;margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <div style="font-weight:700;font-size:14px">${esc(group.job_title)}</div>
                    <div style="font-size:11px;color:#888">${esc(group.time)}</div>
                </div>
                <div style="font-size:12px;color:#666;margin-bottom:10px">${esc(group.company)}</div>
                <div style="margin-bottom:10px">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:6px">
                        ${group.candidates.length} Candidate${group.candidates.length > 1 ? 's' : ''}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:5px">
                        ${group.candidates.map(c => `
                            <span style="font-size:11px;font-weight:600;padding:3px 9px;background:#f5f5f5;border:1px solid #eee;color:#3d3d3d">
                                ${esc(c)}
                            </span>
                        `).join('')}
                    </div>
                </div>
                ${group.status !== 'ended'
                    ? `<a href="${esc(group.room_url)}" style="display:inline-block;padding:6px 16px;background:#111;color:#fff;font-size:12px;font-weight:600;text-decoration:none">Join Room →</a>`
                    : `<span style="font-size:11px;color:#888;font-weight:600">ENDED</span>`}
            </div>`).join('')}`;

    bd.id = 'dayPopupBd';
    bd.onclick = () => { popup.remove(); bd.remove(); };
    document.body.appendChild(bd);
    document.body.appendChild(popup);
};

  function showCalLoading(show) {
      const l = document.getElementById('calLoading');
      const d = document.getElementById('calDays');
      if (l) l.style.display = show ? 'block' : 'none';
      if (d) d.style.visibility = show ? 'hidden' : 'visible';
  }

  function updateTodayLabel() {
      const el = document.getElementById('today-date-label');
      if (!el) return;
      el.textContent = today.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  function daysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

  function getStatusPill(status) {
      const map = {
          'active':      '<span class="s-pill s-approved" style="margin-left:8px">Active</span>',
          'waiting':     '<span class="s-pill s-scheduled" style="margin-left:8px">Waiting</span>',
          'not_started': '<span class="s-pill s-scheduled" style="margin-left:8px">Scheduled</span>',
          'ended':       '<span class="s-pill" style="margin-left:8px;opacity:.5">Ended</span>',
      };
      return map[status] || '<span class="s-pill s-pending" style="margin-left:8px">Pending</span>';
  }

  function esc(s) {
      if (!s) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  if (!document.getElementById('calSpinnerStyle')) {
      const s = document.createElement('style');
      s.id = 'calSpinnerStyle';
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
  }
  console.log(typeof openApplicantProcessModal);
  console.log(selectedAppId);

  document.querySelectorAll('button').forEach(b => { 
    if (b.innerText.trim() === 'Schedule') 
        console.log(b.getAttribute('onclick')); 
  });


    let _currentCandidate = null;

    function openCandidateModal(s) {
      _currentCandidate = s;

      function initials(n) { return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }

      // Header
      document.getElementById('cdAvatar').textContent  = initials(s.name);
      document.getElementById('cdName').textContent    = s.name;
      document.getElementById('cdEmail').textContent   = s.email || '';
      document.getElementById('cdCourseBadge').textContent = s.course || '';

      // Interview badge
      const badge = document.getElementById('cdInterviewBadge');
      if (s.interview_result === 'passed')
        badge.innerHTML = `<span style="padding:3px 12px;background:#16a34a;border-radius:20px;font-size:11px;font-weight:700;color:#fff">✓ PASSED</span>`;
      else if (s.interview_result === 'failed')
        badge.innerHTML = `<span style="padding:3px 12px;background:#c0392b;border-radius:20px;font-size:11px;font-weight:700;color:#fff">✗ FAILED</span>`;
      else
        badge.innerHTML = `<span style="padding:3px 12px;background:#444;border-radius:20px;font-size:11px;font-weight:700;color:#aaa">PENDING</span>`;

      // CV button
      const cvBtn = document.getElementById('cdCvBtn');
      if (s.cv_url) { cvBtn.href = s.cv_url; cvBtn.style.display = 'inline-block'; }
      else { cvBtn.style.display = 'none'; }

      // Student Details
      document.getElementById('cdDetailEmail').textContent  = s.email          || '—';
      document.getElementById('cdPhone').textContent        = s.phone          || '—';
      document.getElementById('cdCourse').textContent       = s.course         || '—';
      document.getElementById('cdApproved').textContent     = s.approved_on    || '—';
      document.getElementById('cdInterviewDate').textContent = s.interview_date || '—';
      document.getElementById('cdMatchScore').textContent   = s.match_score != null ? s.match_score + '%' : '—';

      // Skills
      const skillsEl = document.getElementById('cdSkills');
      if (s.skills && s.skills.trim()) {
        skillsEl.innerHTML = s.skills.split(',').map(sk => sk.trim()).filter(Boolean).map(sk =>
          `<span style="padding:4px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:20px;font-size:11px;font-weight:600;color:#475569">${sk}</span>`
        ).join('');
      } else {
        skillsEl.innerHTML = `<span style="font-size:12px;color:#aaa">No skills listed</span>`;
      }

      // Scores
      const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
      const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
      const count   = [mcq, machine].filter(v => v !== null).length;
      const total   = count ? (((mcq||0)+(machine||0))/count).toFixed(1) : null;

      document.getElementById('cdMcq').textContent        = mcq     !== null ? mcq.toFixed(1)     + '%' : '—';
      document.getElementById('cdMachine').textContent    = machine !== null ? machine.toFixed(1)  + '%' : '—';
      document.getElementById('cdTotal').textContent      = total   !== null ? total               + '%' : '—';
      document.getElementById('cdMcqDate').textContent    = s.mcq_date     || '';
      document.getElementById('cdMachineDate').textContent = s.machine_date || '';

      // HR Feedback
      const feedbackSection = document.getElementById('cdFeedbackSection');
      if (s.interview_feedback && s.interview_feedback.trim()) {
        document.getElementById('cdFeedback').textContent = s.interview_feedback;
        feedbackSection.style.display = 'block';
      } else {
        feedbackSection.style.display = 'none';
      }

      // AI Analysis
      const analysisSection = document.getElementById('cdAnalysisSection');
      const offerSection    = document.getElementById('cdOfferSection');
      document.getElementById('offerLetterBox').style.display = 'none';

      if (s.interview_result === 'passed' && s.interview_analysis) {
        const a = typeof s.interview_analysis === 'string'
          ? JSON.parse(s.interview_analysis) : s.interview_analysis;

        document.getElementById('cdAiOverall').textContent = `${a.overall_score}/10`;
        document.getElementById('cdAiComm').textContent    = `${a.communication_score}/10`;
        document.getElementById('cdAiTech').textContent    = `${a.technical_score}/10`;
        document.getElementById('cdAiConf').textContent    = `${a.confidence_score}/10`;
        document.getElementById('cdAiSummary').textContent = a.summary;
        document.getElementById('cdAiNotes').textContent   = a.hiring_notes;

        document.getElementById('cdAiStrengths').innerHTML = a.strengths.map(t =>
          `<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;margin-bottom:5px"><span style="color:#16a34a;flex-shrink:0">✓</span>${t}</div>`
        ).join('');
        document.getElementById('cdAiWeaknesses').innerHTML = a.weaknesses.map(t =>
          `<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;margin-bottom:5px"><span style="color:#c0392b;flex-shrink:0">✗</span>${t}</div>`
        ).join('');

       

        analysisSection.style.display = 'block';
        offerSection.style.display    = 'block';
        buildOfferLetter(s, total);
      } else {
        analysisSection.style.display = 'none';
        offerSection.style.display    = 'none';
      }

      document.getElementById('cdModalBg').classList.add('open');
    }

    function closeCandidateModal(e) {
      if (e.target === document.getElementById('cdModalBg'))
        document.getElementById('cdModalBg').classList.remove('open');
    }

    function toggleOfferLetter() {
      const box = document.getElementById('offerLetterBox');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    function buildOfferLetter(s, total) {
      const today    = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
      const jobLabel = document.getElementById('ranklist-job-label')?.textContent || 'the applied position';
      document.getElementById('olDate').textContent = today;
      document.getElementById('olBody').innerHTML = `
        <p>Dear <strong>${s.name}</strong>,</p>
        <p>We are pleased to inform you that after a thorough evaluation of your performance
        in our recruitment process — including the MCQ assessment, machine test, and personal
        interview — you have been selected for the position of <strong>${jobLabel}</strong>.</p>
        <p>Your overall assessment score of <strong>${total || '—'}%</strong> and your
        interview performance reflect the qualities and skills we value in our team.</p>
        <p>Please confirm your acceptance of this offer within <strong>7 working days</strong>
        from the date of this letter.</p>
        <p>We look forward to welcoming you aboard.</p>
        <br><p>Warm regards,</p>
      `;
    }

    function printOfferLetter() {
      const content = document.getElementById('offerLetterBox').innerHTML;
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>Offer Letter — ${_currentCandidate?.name || ''}</title>
        <style>body{font-family:Georgia,serif;padding:60px;font-size:14px;line-height:1.9;max-width:700px;margin:auto}button{display:none}</style>
        </head><body>${content}</body></html>
      `);
      win.document.close();
      win.print();
    }


    function openScheduleModal() {
      const rankSelect      = document.getElementById('ranklist-job-select');
      const shortlistSelect = document.querySelector('#page-shortlist .job-filter');
      const select          = (rankSelect && rankSelect.value !== 'all') ? rankSelect : shortlistSelect;
      const label           = select ? select.options[select.selectedIndex].text : '—';

      document.getElementById('schedule-job-tag').textContent = label;
      document.getElementById('sch-datetime').value    = '';
      document.getElementById('sch-error').textContent = '';

      // ── Clear old preview ──
      const oldPreview = document.getElementById('slot-preview-wrap');
      if (oldPreview) oldPreview.remove();

      const btn       = document.getElementById('sch-confirm-btn');
      const removeBtn = document.getElementById('sch-remove-btn');

      btn.textContent         = 'Apply';
      btn.style.background    = '';
      btn.disabled            = false;
      btn.style.display       = 'inline-block';
      removeBtn.style.display = 'none'; 

      document.getElementById('schedule-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';

      if (!selectedJobId) return;

      // ── Helper: build preview once we have both date + students ──
      function buildAndShowPreview(existingDatetime, students) {
        const sorted = [...students].sort((a, b) => {
          const getTotal = s => {
            const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
            const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
            const count   = [mcq, machine].filter(v => v !== null).length;
            return count ? ((mcq || 0) + (machine || 0)) / count : -1;
          };
          return getTotal(b) - getTotal(a);
        });
        const top5  = sorted.slice(0, 5);
        const slots = buildInterviewSlots(existingDatetime, top5);
        showSlotPreview(slots);
      }

      // ── Fetch existing schedule date ──
      fetch(`/get-process/${selectedJobId}/?type=job`)
        .then(r => r.json())
        .then(data => {
          if (!data.hr_interview_date) {
            // No schedule yet — just show empty modal
            btn.style.display       = 'inline-block';
            btn.textContent         = 'Apply';
            removeBtn.style.display = 'none';
            document.getElementById('sch-datetime').dataset.original = '';
            return;
          }

          const existingDatetime = data.hr_interview_date.replace(' ', 'T').slice(0, 16);
          document.getElementById('sch-datetime').value              = existingDatetime;
          document.getElementById('sch-datetime').dataset.original   = existingDatetime;
          btn.style.display       = 'none';
          removeBtn.style.display = 'inline-block';

          // ── Use cache if available, otherwise fetch ranklist ──
          if (cachedRankStudents.length) {
            buildAndShowPreview(existingDatetime, cachedRankStudents);
          } else {
            fetch(`/get_ranklist/?job_id=${selectedJobId}`)
              .then(r => r.json())
              .then(rankData => {
                cachedRankStudents = rankData.students || [];  // ← update cache
                if (cachedRankStudents.length) {
                  buildAndShowPreview(existingDatetime, cachedRankStudents);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    function closeScheduleModal() {
      document.getElementById('schedule-overlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    // Watch date change → switch btn label
    document.addEventListener('DOMContentLoaded', function () {
      const dtInput = document.getElementById('sch-datetime');
      if (!dtInput) return;

      dtInput.addEventListener('change', function () {
        const btn       = document.getElementById('sch-confirm-btn');
        const removeBtn = document.getElementById('sch-remove-btn');
        const original  = this.dataset.original || '';

        if (!this.value) {
          // cleared
          btn.textContent      = 'Apply';
          btn.style.display    = original ? 'none' : 'inline-block';
          removeBtn.style.display = original ? 'inline-block' : 'none';
        } else if (original && this.value !== original) {
          // date changed from existing → Update
          btn.textContent      = 'Update';
          btn.style.display    = 'inline-block';
          btn.style.background = '';
          removeBtn.style.display = 'none';
        } else if (!original && this.value) {
          // new date selected → Apply
          btn.textContent      = 'Apply';
          btn.style.display    = 'inline-block';
          removeBtn.style.display = 'none';
        } else {
          // back to original
          btn.style.display       = 'none';
          removeBtn.style.display = 'inline-block';
        }
      });
    });

    function submitSchedule() {
      const datetime  = document.getElementById('sch-datetime').value;
      const errorEl   = document.getElementById('sch-error');
      const btn       = document.getElementById('sch-confirm-btn');
      const removeBtn = document.getElementById('sch-remove-btn');
      const original  = document.getElementById('sch-datetime').dataset.original || '';

      if (!datetime) {
        errorEl.textContent = 'Please select a date and time.';
        return;
      }

      const isUpdate  = btn.textContent === 'Update';
      btn.textContent = 'Saving...';
      btn.disabled    = true;
      errorEl.textContent = '';

      // ── Step 1: fetch ranklist to get top 5 sorted students ──
      fetch(`/get_ranklist/?job_id=${selectedJobId}`)
        .then(r => r.json())
        .then(data => {
          const allStudents = data.students || [];

          // ── Step 2: sort by total % descending ──
          const sorted = [...allStudents].sort((a, b) => {
            const getTotal = s => {
              const mcq     = s.mcq_score     != null ? parseFloat(s.mcq_score)     : null;
              const machine = s.machine_score != null ? parseFloat(s.machine_score) : null;
              const count   = [mcq, machine].filter(v => v !== null).length;
              return count ? ((mcq || 0) + (machine || 0)) / count : -1;
            };
            return getTotal(b) - getTotal(a);
          });

          // ── Step 3: take top 5 only ──
          const top5 = sorted.slice(0, 5);

          console.log("TOP 5 SORTED:", top5.map(s => ({
            name:    s.name,
            app_id:  s.app_id,
            total:   ((parseFloat(s.mcq_score||0) + parseFloat(s.machine_score||0)) / 2).toFixed(1)
          })));

          if (!top5.length) {
            errorEl.textContent = 'No approved students found for this job.';
            btn.textContent = isUpdate ? 'Update' : 'Apply';
            btn.disabled    = false;
            return;
          }

          // ── Step 4: build slots with fixed office times ──
          const slots = buildInterviewSlots(datetime, top5);

          console.log("SLOTS BEING SENT:", JSON.stringify(slots, null, 2));

          // ── Step 5: send to backend ──
          fetch('/save-process/', {
            method:  'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken':  getCookie('csrftoken')
            },
            body: JSON.stringify({
              job_id: selectedJobId,
              stage:  'hr',
              date:   datetime,
              action: isUpdate ? 'update' : 'apply',
              slots:  slots
            })
          })
          .then(r => r.json())
          .then(result => {
            if (result.status === 'success') {
              document.getElementById('sch-datetime').dataset.original = datetime;
              btn.style.display       = 'none';
              btn.disabled            = false;
              removeBtn.style.display = 'inline-block';
              errorEl.textContent     = '';
              showSlotPreview(slots);
              showToast(isUpdate ? 'Interviews rescheduled!' : 'Interviews scheduled for Top 5!');
            } else {
              errorEl.textContent = result.message || 'Something went wrong.';
              btn.textContent     = isUpdate ? 'Update' : 'Apply';
              btn.disabled        = false;
            }
          })
          .catch(() => {
            errorEl.textContent = 'Save failed. Please try again.';
            btn.textContent     = isUpdate ? 'Update' : 'Apply';
            btn.disabled        = false;
          });
        })
        .catch(() => {
          errorEl.textContent = 'Could not fetch student list.';
          btn.textContent     = isUpdate ? 'Update' : 'Apply';
          btn.disabled        = false;
        });
    }

    function removeSchedule() {
      const errorEl   = document.getElementById('sch-error');
      const removeBtn = document.getElementById('sch-remove-btn');
      const btn       = document.getElementById('sch-confirm-btn');

      if (!confirm('Remove the scheduled interview date?')) return;

      removeBtn.textContent = 'Removing...';
      removeBtn.disabled    = true;

      fetch('/save-process/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({
          job_id: selectedJobId,
          stage:  'hr',
          date:   null,
          action: 'remove'
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          document.getElementById('sch-datetime').value           = '';
          document.getElementById('sch-datetime').dataset.original = '';
          btn.textContent         = 'Apply';
          btn.style.display       = 'none';
          removeBtn.style.display = 'none';
          removeBtn.textContent   = 'Remove';
          removeBtn.disabled      = false;
          errorEl.textContent     = '';
          showToast('Interview schedule removed.');
        } else {
          errorEl.textContent   = data.message || 'Could not remove.';
          removeBtn.textContent = 'Remove';
          removeBtn.disabled    = false;
        }
      })
      .catch(() => {
        errorEl.textContent   = 'Server error.';
        removeBtn.textContent = 'Remove';
        removeBtn.disabled    = false;
      });
    }

    // ── Build interview time slots for top 5 ──────────────────────────────
    function buildInterviewSlots(datetimeStr, top5students) {
      const slotStartMinutes = [
        9  * 60,   // 09:00  → rank 1
        10 * 60,   // 10:00  → rank 2  (15 min break after rank 1)
        11 * 60,   // 11:00  → rank 3  (15 min break after rank 2)
        12 * 60,   // 12:00  → rank 4  (15 min break after rank 3)
        14 * 60,   // 14:00  → rank 5  (1 hr lunch break after rank 4)
      ];

      // Only use the DATE part — ignore whatever time HR picked
      const baseDate = datetimeStr.split('T')[0];  // "2026-03-26"

      return top5students.map((student, index) => {
        const startMin     = slotStartMinutes[index];
        const endMin       = startMin + 45;
        const startStr     = minsToTime(startMin);   // "09:00"
        const endStr       = minsToTime(endMin);     // "09:45"
        const slotDatetime = `${baseDate}T${startStr}`;  // "2026-03-26T09:00"

        console.log(`Slot ${index+1}: app_id=${student.app_id}, time=${slotDatetime}`);

        return {
          rank:     index + 1,
          app_id:   student.app_id,
          name:     student.name,
          start:    startStr,
          end:      endStr,
          datetime: slotDatetime,
        };
      });
    }

  function minsToTime(totalMins) {
    const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
    const m = (totalMins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  function showSlotPreview(slots) {
    const existing = document.getElementById('slot-preview-wrap');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id = 'slot-preview-wrap';
    wrap.style.cssText = `
      margin: 14px 0 0;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    `;

    const breakNote = i => {
      if (i === 3) return `<span style="font-size:10px;color:#f59e0b;font-weight:600;margin-left:6px">🍽 1hr lunch after</span>`;
      if (i < 4)  return `<span style="font-size:10px;color:#888;margin-left:6px">☕ 15min break after</span>`;
      return '';
    };

    wrap.innerHTML = `
      <div style="background:#f0fdf4; padding:10px 16px; border-bottom:1px solid #dcfce7;
                  font-size:11px; font-weight:700; text-transform:uppercase;
                  letter-spacing:.07em; color:#16a34a; display:flex; align-items:center; gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:#16a34a;display:inline-block"></span>
        Top ${slots.length} Interview Slots Assigned
      </div>
      ${slots.map((slot, i) => `
        <div style="display:flex; align-items:center; gap:12px; padding:11px 16px;
                    border-bottom:1px solid #f0f0f0; background:#fff;
                    ${i < 5 ? 'border-left:3px solid #16a34a;' : ''}">
          <div style="width:24px; height:24px; border-radius:50%; background:#16a34a;
                      color:#fff; font-size:10px; font-weight:800;
                      display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${slot.rank}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:12px; font-weight:700; color:#0a0a0a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${slot.name || 'Rank ' + slot.rank}
            </div>
            <div style="font-size:11px; color:#6b6b6b; margin-top:1px; display:flex; align-items:center; flex-wrap:wrap;">
              ${formatSlotTime(slot.start)} → ${formatSlotTime(slot.end)}
              ${breakNote(i)}
            </div>
          </div>
          <div style="font-size:12px; font-weight:800; color:#16a34a; white-space:nowrap;">
            ${formatSlotTime(slot.start)}
          </div>
        </div>
      `).join('')}
    `;

    const modalBody = document.querySelector('#schedule-overlay .pm-body');
    if (modalBody) modalBody.appendChild(wrap);
  }
  
  function formatSlotTime(timeStr) {
    // "09:00" → "9:00 AM", "14:00" → "2:00 PM"
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }