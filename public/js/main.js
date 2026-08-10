// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Hero background parallax load ──
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('load', () => heroBg.classList.add('loaded'));
}

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── Smooth anchor offset (fixed navbar compensation) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight : 0;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ── Contact form via Web3Forms ──
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      } else {
        throw new Error();
      }
    } catch {
      alert('Hubo un error. Por favor contáctanos por WhatsApp.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ── Intersection Observer — fade-in ──
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Proceso steps: carrusel de conceptos dentro de cada fase ──
(function () {
  document.querySelectorAll('.ptimeline-steps').forEach(container => {
    const steps = Array.from(container.querySelectorAll('.ptimeline-step'));
    if (!steps.length) return;

    // Activa siempre el primer paso
    steps[0].classList.add('step-active');

    // Fases con un solo paso no necesitan nav
    if (steps.length < 2) return;

    let current = 0;

    // Genera nav: ← dots →
    const nav = document.createElement('div');
    nav.className = 'ptimeline-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pnav-btn pnav-prev';
    prevBtn.setAttribute('aria-label', 'Anterior');
    prevBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    prevBtn.disabled = true;

    const dotsEl = document.createElement('div');
    dotsEl.className = 'pnav-dots';
    steps.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'pnav-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pnav-btn pnav-next';
    nextBtn.setAttribute('aria-label', 'Siguiente');
    nextBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;

    nav.appendChild(prevBtn);
    nav.appendChild(dotsEl);
    nav.appendChild(nextBtn);
    container.appendChild(nav);

    function goTo(index) {
      steps[current].classList.remove('step-active');
      dotsEl.children[current].classList.remove('active');
      current = index;
      steps[current].classList.add('step-active');
      dotsEl.children[current].classList.add('active');
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === steps.length - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
  });
})();

// ── Proceso timeline: carousel por scroll ──
(function () {
  const phases = document.querySelectorAll('.ptimeline-fase');
  if (!phases.length) return;

  function updateActive() {
    const trigger = window.innerHeight * 0.42;
    let current = phases[0];
    phases.forEach(phase => {
      if (phase.getBoundingClientRect().top <= trigger) current = phase;
    });
    phases.forEach(phase => phase.classList.toggle('active', phase === current));
  }

  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  }, { passive: true });

  updateActive();
})();
