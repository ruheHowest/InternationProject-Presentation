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

  const bodyTooltip = document.getElementById('bodyTooltip');
  const bodyVisual = document.querySelector('.body-visual');

  bodyParts.forEach(part => {
    // Click to update detail panel
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

    // Hover tooltip
    part.addEventListener('mouseenter', (e) => {
      const zone = part.dataset.zone;
      const data = zoneData[zone];
      if (!data || !bodyTooltip) return;

      bodyTooltip.querySelector('.bt-title').textContent = data.title;
      const statusSpan = bodyTooltip.querySelector('.bt-status');
      statusSpan.textContent = data.statusText;
      statusSpan.className = 'bt-status ' + data.status;
      bodyTooltip.querySelector('.bt-pressure').textContent = 'Pressure: ' + data.press;
      bodyTooltip.classList.add('visible');
    });

    part.addEventListener('mousemove', (e) => {
      if (!bodyTooltip || !bodyVisual) return;
      const rect = bodyVisual.getBoundingClientRect();
      const x = e.clientX - rect.left + 14;
      const y = e.clientY - rect.top - 10;
      bodyTooltip.style.left = x + 'px';
      bodyTooltip.style.top = y + 'px';
    });

    part.addEventListener('mouseleave', () => {
      if (bodyTooltip) bodyTooltip.classList.remove('visible');
    });

    // Touch support for tooltip
    part.addEventListener('touchstart', (e) => {
      const zone = part.dataset.zone;
      const data = zoneData[zone];
      if (!data || !bodyTooltip || !bodyVisual) return;

      bodyTooltip.querySelector('.bt-title').textContent = data.title;
      const statusSpan = bodyTooltip.querySelector('.bt-status');
      statusSpan.textContent = data.statusText;
      statusSpan.className = 'bt-status ' + data.status;
      bodyTooltip.querySelector('.bt-pressure').textContent = 'Pressure: ' + data.press;

      const touch = e.touches[0];
      const rect = bodyVisual.getBoundingClientRect();
      bodyTooltip.style.left = (touch.clientX - rect.left + 14) + 'px';
      bodyTooltip.style.top = (touch.clientY - rect.top - 10) + 'px';
      bodyTooltip.classList.add('visible');

      setTimeout(() => bodyTooltip.classList.remove('visible'), 2000);
    }, { passive: true });
  });


  // ── Toggle Switches ──
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');

      // Dark mode toggle
      if (toggle.dataset.setting === 'darkmode') {
        if (toggle.classList.contains('active')) {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    });
  });


  // ── Reserve Button ──
  const reserveBtn = document.getElementById('reserveBtn');
  let isReserved = false;
  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      isReserved = !isReserved;
      const label = reserveBtn.querySelector('span');
      const checkIcon = reserveBtn.querySelector('.reserve-icon-check');
      const arrowIcon = reserveBtn.querySelector('.reserve-icon-arrow');

      if (isReserved) {
        label.textContent = 'Reserved';
        reserveBtn.classList.add('reserved');
        if (checkIcon) checkIcon.style.display = '';
        if (arrowIcon) arrowIcon.style.display = 'none';
      } else {
        label.textContent = 'Reserve Pod';
        reserveBtn.classList.remove('reserved');
        if (checkIcon) checkIcon.style.display = 'none';
        if (arrowIcon) arrowIcon.style.display = '';
      }

      const sessionCard = document.getElementById('sessionCard');
      if (sessionCard) {
        if (isReserved) {
          sessionCard.classList.add('visible');
        } else {
          sessionCard.classList.remove('visible');
        }
      }
    });
  }


  // ── Pod Map Flow ──
  const podData = [
    { name: 'VitalRoute Lounge',    loc: '📍 Rest Stop E40 — Wetteren',     dist: '12 mi', eta: '~14 min', beds: '3 free', rating: 4.8, stars: '★★★★★', facilities: ['💆 Massage','🧘 Breathing','🎨 Chromo','☕ Café'] },
    { name: 'ZenDrive Hub',         loc: '📍 Service Area E17 — Deinze',    dist: '18 mi', eta: '~22 min', beds: '1 free', rating: 4.5, stars: '★★★★½', facilities: ['💆 Massage','❄️ Climate','🪞 Stretches','🍽️ Diner'] },
    { name: 'RestWell Station',     loc: '📍 Truck Park A14 — Aalter',      dist: '24 mi', eta: '~28 min', beds: '5 free', rating: 4.9, stars: '★★★★★', facilities: ['💆 Massage','🧘 Breathing','🎨 Chromo','❄️ Climate','🛁 Shower'] },
    { name: 'RouteRevive Point',    loc: '📍 Rest Area E40 — Erpe-Mere',    dist: '8 mi',  eta: '~10 min', beds: '2 free', rating: 4.2, stars: '★★★★☆', facilities: ['💆 Massage','🧘 Breathing','☕ Café'] },
    { name: 'TruckSpa Oasis',      loc: '📍 Service Plaza A10 — Oostkamp', dist: '32 mi', eta: '~38 min', beds: '4 free', rating: 4.7, stars: '★★★★★', facilities: ['💆 Massage','🎨 Chromo','❄️ Climate','🪞 Stretches','☕ Café','🛁 Shower'] },
  ];

  const mapOverlay   = document.getElementById('podMapOverlay');
  const mapSheet     = document.getElementById('mapSheet');
  const mapMarkers   = document.querySelectorAll('.map-marker');
  const openMapBtn   = document.getElementById('openMapBtn');
  const mapBackBtn   = document.getElementById('mapBackBtn');
  const mapReserveBtn = document.getElementById('mapReserveBtn');

  let selectedPodIdx = null;

  function openMap() {
    if (mapOverlay) mapOverlay.classList.add('open');
  }

  function closeMap() {
    if (mapOverlay) mapOverlay.classList.remove('open');
    if (mapSheet) mapSheet.classList.remove('visible');
    mapMarkers.forEach(m => m.classList.remove('active'));
    selectedPodIdx = null;
  }

  function showPodSheet(idx) {
    const pod = podData[idx];
    if (!pod || !mapSheet) return;

    selectedPodIdx = idx;
    mapMarkers.forEach(m => m.classList.remove('active'));
    document.querySelector(`.map-marker[data-pod="${idx}"]`)?.classList.add('active');

    document.getElementById('mapPodName').textContent = pod.name;
    document.getElementById('mapPodLoc').textContent = pod.loc;
    document.getElementById('mapDist').textContent = pod.dist;
    document.getElementById('mapEta').textContent = pod.eta;
    document.getElementById('mapBeds').textContent = pod.beds;

    const ratingEl = document.getElementById('mapPodRating');
    ratingEl.querySelector('.rating-stars').textContent = pod.stars;
    ratingEl.querySelector('.rating-val').textContent = pod.rating;

    const facEl = document.getElementById('mapFacilities');
    facEl.innerHTML = pod.facilities.map(f => `<span class="facility-chip">${f}</span>`).join('');

    mapSheet.classList.add('visible');
  }

  if (openMapBtn) openMapBtn.addEventListener('click', openMap);
  if (mapBackBtn) mapBackBtn.addEventListener('click', closeMap);

  mapMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
      const idx = parseInt(marker.dataset.pod);
      showPodSheet(idx);
    });
  });

  if (mapReserveBtn) {
    mapReserveBtn.addEventListener('click', () => {
      if (selectedPodIdx === null) return;
      const pod = podData[selectedPodIdx];

      // Update hero card with chosen pod info
      const heroInfo = document.querySelector('.pod-info');
      if (heroInfo) {
        heroInfo.querySelector('h3').textContent = pod.name;
        heroInfo.querySelector('.pod-location').textContent = pod.loc;
        heroInfo.querySelector('.pod-distance').textContent = pod.dist + ' ahead · ' + pod.eta;
      }

      // Mark quick-reserve button as reserved
      if (reserveBtn) {
        const label = reserveBtn.querySelector('span');
        const checkIcon = reserveBtn.querySelector('.reserve-icon-check');
        const arrowIcon = reserveBtn.querySelector('.reserve-icon-arrow');
        label.textContent = 'Reserved';
        reserveBtn.classList.add('reserved');
        if (checkIcon) checkIcon.style.display = '';
        if (arrowIcon) arrowIcon.style.display = 'none';
        isReserved = true;
      }

      // Show session card
      const sessionCard = document.getElementById('sessionCard');
      if (sessionCard) sessionCard.classList.add('visible');

      // Close map
      closeMap();
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
