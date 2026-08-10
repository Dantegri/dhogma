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

// ── Proceso: sticky scroll — fases + pasos sin padding visual ──
(function () {
  const section = document.getElementById('proceso');
  if (!section) return;

  const inner = section.querySelector('.container');
  const phases = Array.from(section.querySelectorAll('.ptimeline-fase'));
  if (!phases.length) return;

  const UNIT_PX  = 220;  // px de scroll por unidad (fase o paso)
  const INTRO_PX = 320;  // scroll inicial antes de activar la primera fase

  // Datos de cada fase con sus pasos
  const data = phases.map(fase => ({
    el: fase,
    steps: Array.from(fase.querySelectorAll('.ptimeline-step'))
  }));

  // Init dots + primer paso activo
  data.forEach(p => {
    if (!p.steps.length) return;
    p.steps[0].classList.add('step-active');
    if (p.steps.length < 2) return;

    const nav = document.createElement('div');
    nav.className = 'ptimeline-nav';
    const dotsEl = document.createElement('div');
    dotsEl.className = 'pnav-dots';
    p.steps.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'pnav-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(dot);
    });
    nav.appendChild(dotsEl);
    p.el.querySelector('.ptimeline-steps').appendChild(nav);
  });

  // Altura total = intro + (1 unidad por fase + 1 por cada paso)
  const totalUnits = data.reduce((s, p) => s + 1 + p.steps.length, 0);
  section.style.minHeight = (INTRO_PX + totalUnits * UNIT_PX) + 'px';

  // Hace el contenido sticky — sin gaps visuales
  inner.style.position = 'sticky';
  inner.style.top = '5rem';

  function updateActive() {
    const scrolled = -section.getBoundingClientRect().top - INTRO_PX;

    // Mapea el scroll a fase activa y paso activo
    let remaining = Math.max(0, scrolled);
    let activePhase = 0;
    let activeStep  = 0;

    for (let pi = 0; pi < data.length; pi++) {
      const budget = (1 + data[pi].steps.length) * UNIT_PX;
      if (remaining < budget || pi === data.length - 1) {
        activePhase = pi;
        activeStep  = Math.min(
          Math.max(0, Math.floor((remaining - UNIT_PX) / UNIT_PX)),
          data[pi].steps.length - 1
        );
        break;
      }
      remaining -= budget;
    }

    data.forEach((p, pi) => {
      const on = pi === activePhase;
      p.el.classList.toggle('active', on);
      if (!on || p.steps.length < 2) return;
      p.steps.forEach((s, si) => s.classList.toggle('step-active', si === activeStep));
      p.el.querySelectorAll('.pnav-dot').forEach((d, di) => d.classList.toggle('active', di === activeStep));
    });
  }

  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  }, { passive: true });

  updateActive();
})();
