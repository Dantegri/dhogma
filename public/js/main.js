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

// ── Proceso: scroll carousel — fases + pasos ──
(function () {
  const phases = Array.from(document.querySelectorAll('.ptimeline-fase'));
  if (!phases.length) return;

  const STEP_PX = 180; // px de scroll por paso dentro de una fase

  // Init: puntos indicadores y espacio de scroll por fase
  phases.forEach(fase => {
    const steps = Array.from(fase.querySelectorAll('.ptimeline-step'));
    if (!steps.length) return;

    steps[0].classList.add('step-active');

    if (steps.length > 1) {
      // Dots como indicadores (sin botones)
      const nav = document.createElement('div');
      nav.className = 'ptimeline-nav';
      const dotsEl = document.createElement('div');
      dotsEl.className = 'pnav-dots';
      steps.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'pnav-dot' + (i === 0 ? ' active' : '');
        dotsEl.appendChild(dot);
      });
      nav.appendChild(dotsEl);
      fase.querySelector('.ptimeline-steps').appendChild(nav);

      // Expande la fase en el DOM para tener room de scroll entre pasos
      fase.style.paddingBottom = (steps.length * STEP_PX) + 'px';
    }
  });

  function updateActive() {
    const trigger = window.innerHeight * 0.42;

    // Determina cuál fase es la activa
    let activeIndex = 0;
    phases.forEach((fase, i) => {
      if (fase.getBoundingClientRect().top <= trigger) activeIndex = i;
    });

    phases.forEach((fase, i) => fase.classList.toggle('active', i === activeIndex));

    // Calcula el paso activo dentro de la fase activa
    const activeFase = phases[activeIndex];
    const steps = Array.from(activeFase.querySelectorAll('.ptimeline-step'));

    if (steps.length > 1) {
      const scrolledIn = trigger - activeFase.getBoundingClientRect().top;
      const stepIndex = Math.min(
        Math.max(0, Math.floor(scrolledIn / STEP_PX)),
        steps.length - 1
      );

      steps.forEach((step, si) => step.classList.toggle('step-active', si === stepIndex));

      const dots = activeFase.querySelectorAll('.pnav-dot');
      dots.forEach((dot, di) => dot.classList.toggle('active', di === stepIndex));
    }
  }

  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  }, { passive: true });

  updateActive();
})();
