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

  /* ── CV Status & viewer button ── */
  const cvStatusEl = document.getElementById('dm-cv-status');
  if (cvStatusEl) {
    if (cvUrl && cvUrl.trim() !== '') {
      cvStatusEl.innerHTML =
        `<span style="color:var(--success,#216321);font-weight:700">Uploaded ✓</span>
         <button class="dm-cv-btn" onclick="openCvViewer('${esc(cvUrl)}', '${esc(name)}')">
           <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
             <path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
             <path stroke-linecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
           </svg>
           View CV
         </button>`;
    } else {
      cvStatusEl.innerHTML = `<span style="color:#aaaaaa">Not uploaded</span>`;
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

    const scheduleBtn = document.getElementById("scheduleBtn");

    if(sectionId === "rejected-section"){
        scheduleBtn.style.display = "none";
    } else {
        scheduleBtn.style.display = "inline-block";
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

  /* ═══════════════════ RANK LIST ═══════════════════ */
  const rankData = [
    { name:'Priya Nair', init:'PN', course:'IT · 2nd Year', role:'Frontend Dev', company:'Google India', score:94, bg:'var(--mid)' },
    { name:'Arun Kumar', init:'AK', course:'CS · 3rd Year', role:'ML Engineer', company:'Microsoft', score:87, bg:'var(--black)' },
    { name:'Meena Raj', init:'MR', course:'CS · 4th Year', role:'Backend Dev', company:'Amazon', score:82, bg:'var(--light)', col:'var(--black)' },
    { name:'Ravi Shankar', init:'RS', course:'DS · 3rd Year', role:'Data Analyst', company:'TCS', score:79, bg:'var(--subtle)' },
    { name:'Sanjay T.', init:'ST', course:'CS · 3rd Year', role:'ML Engineer', company:'Microsoft', score:71, bg:'var(--dark)' },
    { name:'Kiran Patel', init:'KP', course:'AI · 2nd Year', role:'Full Stack Dev', company:'Wipro', score:68, bg:'var(--ghost)', col:'var(--muted)' },
  ];
  function renderRankList() {
    const container=document.getElementById('ranklist-container'); if(!container)return;
    const medals=['gold','silver','bronze'];
    container.innerHTML=rankData.map((r,i)=>`
      <div class="rank-card" onclick="openModal('${r.name}','${r.init}','${r.name.toLowerCase().replace(' ','')}@college.edu','${r.course.split(' · ')[0]}','${r.role} Intern','${r.company}','Jan 2025','${r.score}%',['Python','ML'],'pending')">
        <div class="rank-num ${medals[i]||''}">${i+1}</div>
        <div class="stu-avatar" style="background:${r.bg};color:${r.col||'var(--white)'}">${r.init}</div>
        <div class="rank-bar-wrap">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div><div class="app-student-name">${r.name}</div><div class="app-student-meta">${r.course} · ${r.role} at ${r.company}</div></div>
          </div>
          <div class="rank-bar-track"><div class="rank-bar-fill" style="width:${r.score}%"></div></div>
        </div>
        <div style="text-align:right;flex-shrink:0"><div class="rank-score">${r.score}%</div><div class="rank-score-lbl">Match</div></div>
        ${i<3?`<button class="btn btn-dark" style="height:30px;padding:0 12px;font-size:11px;flex-shrink:0" onclick="event.stopPropagation()">Shortlist</button>`:`<button class="btn btn-ghost" style="height:30px;padding:0 12px;font-size:11px;flex-shrink:0" onclick="event.stopPropagation()">Review</button>`}
      </div>`).join('');
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
