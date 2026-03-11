(function () {
  const slides  = document.querySelectorAll('.slide');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const dotsBox = document.getElementById('dots');
  const counter = document.getElementById('slideCounter');
  const total   = slides.length;
  let current   = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(d);
  }

  function goTo(index) {
    if (index < 0 || index >= total) return;
    slides[current].classList.remove('active');
    dotsBox.children[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dotsBox.children[current].classList.add('active');
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
  });
})();
