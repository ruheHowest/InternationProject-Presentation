/* ══════════════════════════════════════════
   VitalRoute — Mobile App Prototype Logic
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation ──
  const navItems = document.querySelectorAll('.nav-item');
  const screens  = document.querySelectorAll('.screen');

  function switchScreen(targetId) {
    const current = document.querySelector('.screen.active');
    const target  = document.getElementById('screen-' + targetId);
    if (!target || current === target) return;

    current.classList.remove('active');
    current.classList.add('exit-left');
    setTimeout(() => current.classList.remove('exit-left'), 400);

    target.classList.add('active');

    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-screen="${targetId}"]`)?.classList.add('active');
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
  });

  // Avatar -> profile
  document.getElementById('avatarBtn')?.addEventListener('click', () => switchScreen('profile'));

  // Alert -> pod
  document.getElementById('alertCard')?.addEventListener('click', () => switchScreen('pod'));


  // ── Status Bar Clock ──
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('statusTime').textContent = h + ':' + m;
  }
  updateClock();
  setInterval(updateClock, 30000);


  // ── Health Ring SVG Gradient ──
  const healthRing = document.getElementById('healthRing');
  if (healthRing) {
    const svg = healthRing.closest('svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.id = 'ringGradient';
    grad.setAttribute('gradientTransform', 'rotate(45)');
    const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', '#38bdf8');
    const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', '#2563eb');
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.insertBefore(defs, svg.firstChild);

    // Set ring based on score
    const score = parseInt(document.getElementById('healthScore').textContent);
    const circumference = 2 * Math.PI * 52; // ~326.73
    const offset = circumference - (score / 100) * circumference;
    healthRing.style.strokeDasharray = circumference;
    healthRing.style.strokeDashoffset = circumference;
    setTimeout(() => {
      healthRing.style.strokeDashoffset = offset;
    }, 300);
  }


  // ── Live Metric Simulation ──
  const metrics = {
    stressVal: { base: 62, range: 8 },
    fatigueVal: { base: 45, range: 5 },
    heartVal: { base: 78, range: 6 },
  };

  function simulateMetrics() {
    Object.entries(metrics).forEach(([id, cfg]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const delta = Math.round((Math.random() - 0.5) * cfg.range);
      const val = Math.max(20, Math.min(99, cfg.base + delta));
      el.textContent = val;

      // Update corresponding bar
      const card = el.closest('.metric-card');
      if (card) {
        const fill = card.querySelector('.metric-bar-fill');
        if (fill) fill.style.width = val + '%';
      }
    });

    // Slightly move health score
    const scoreEl = document.getElementById('healthScore');
    if (scoreEl) {
      const score = 74 + Math.round((Math.random() - 0.5) * 4);
      scoreEl.textContent = score;
      if (healthRing) {
        const circumference = 2 * Math.PI * 52;
        healthRing.style.strokeDashoffset = circumference - (score / 100) * circumference;
      }
    }
  }

  setInterval(simulateMetrics, 4000);


  // ── Body Map Interactions ──
  const bodyParts = document.querySelectorAll('.body-part');
  const zoneData = {
    'head':        { title: 'Head',           status: 'ok',   statusText: 'Normal',            dur: '—', press: '12%', lean: '—',     advice: 'No issues detected. Continue driving safely.' },
    'neck':        { title: 'Neck',           status: 'ok',   statusText: 'Normal',            dur: '—', press: '18%', lean: '—',     advice: 'Slight stiffness developing. Consider neck rolls at next stop.' },
    'torso':       { title: 'Upper Back',     status: 'ok',   statusText: 'Mild Tension',      dur: '1.5h', press: '34%', lean: 'Centered', advice: 'Upper back tension building. Shoulder blade squeezes recommended.' },
    'l-shoulder':  { title: 'Left Shoulder',  status: 'ok',   statusText: 'Normal',            dur: '—', press: '22%', lean: '—',     advice: 'Left shoulder in good condition.' },
    'r-shoulder':  { title: 'Right Shoulder', status: 'warn', statusText: 'Mild Strain',       dur: '2.1h', press: '41%', lean: '—',     advice: 'Gripping wheel tightly on right side. Try relaxing grip.' },
    'l-arm':       { title: 'Left Arm',       status: 'ok',   statusText: 'Normal',            dur: '—', press: '15%', lean: '—',     advice: 'No issues detected.' },
    'r-arm':       { title: 'Right Arm',      status: 'ok',   statusText: 'Normal',            dur: '—', press: '19%', lean: '—',     advice: 'No issues detected.' },
    'lower-back':  { title: 'Lower Back',     status: 'warn', statusText: 'Elevated Tension',  dur: '3.2h', press: '68%', lean: 'Right', advice: 'Recommended: lumbar stretch + targeted massage on right side.' },
    'l-thigh':     { title: 'Left Thigh',     status: 'ok',   statusText: 'Normal',            dur: '—', press: '28%', lean: '—',     advice: 'Left thigh pressure within normal range.' },
    'r-thigh':     { title: 'Right Thigh',    status: 'danger', statusText: 'High Pressure',   dur: '3.8h', press: '82%', lean: 'Right', advice: 'Significant weight shifted to right hip. Immediate stretch recommended.' },
    'l-calf':      { title: 'Left Calf',      status: 'ok',   statusText: 'Normal',            dur: '—', press: '10%', lean: '—',     advice: 'No issues detected.' },
    'r-calf':      { title: 'Right Calf',     status: 'ok',   statusText: 'Normal',            dur: '—', press: '14%', lean: '—',     advice: 'No issues detected.' },
    'l-foot':      { title: 'Left Foot',      status: 'ok',   statusText: 'Normal',            dur: '—', press: '8%',  lean: '—',     advice: 'No issues detected.' },
    'r-foot':      { title: 'Right Foot',     status: 'ok',   statusText: 'Normal',            dur: '—', press: '10%', lean: '—',     advice: 'No issues detected.' },
  };

  bodyParts.forEach(part => {
    part.addEventListener('click', () => {
      bodyParts.forEach(p => p.classList.remove('selected'));
      part.classList.add('selected');

      const zone = part.dataset.zone;
      const data = zoneData[zone];
      if (!data) return;

      document.getElementById('zoneTitle').textContent = data.title;
      const statusEl = document.getElementById('zoneStatus');
      statusEl.textContent = data.statusText;
      statusEl.className = 'zone-status ' + data.status;

      const stats = document.querySelectorAll('.zone-stat-val');
      if (stats[0]) stats[0].textContent = data.dur;
      if (stats[1]) stats[1].textContent = data.press;
      if (stats[2]) stats[2].textContent = data.lean;

      document.querySelector('.zone-advice').textContent = data.advice;
    });
  });


  // ── Toggle Switches ──
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });


  // ── Reserve Button ──
  const reserveBtn = document.getElementById('reserveBtn');
  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      const sessionCard = document.getElementById('sessionCard');
      if (sessionCard) {
        sessionCard.classList.toggle('visible');
      }
    });
  }


  // ── Route Progress Animation ──
  function animateRoute() {
    const progress = document.getElementById('routeProgress');
    const truck = document.getElementById('routeTruck');
    if (!progress || !truck) return;

    let pct = 55;
    setInterval(() => {
      pct = Math.min(100, pct + 0.15);
      progress.style.width = pct + '%';
      truck.style.left = (pct - 2) + '%';
    }, 2000);
  }
  animateRoute();


  // ── Greeting based on time ──
  const greetingEl = document.querySelector('.greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    if (hour < 12) greetingEl.textContent = 'Good morning,';
    else if (hour < 18) greetingEl.textContent = 'Good afternoon,';
    else greetingEl.textContent = 'Good evening,';
  }

});
