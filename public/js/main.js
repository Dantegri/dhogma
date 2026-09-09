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
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
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

// ── Portfolio modal ──
(function () {
  const modal   = document.getElementById('pf-modal');
  const grid    = document.getElementById('pf-grid');
  const closeBtn = modal && modal.querySelector('.pf-close');
  const backdrop = modal && modal.querySelector('.pf-backdrop');
  if (!modal || !grid) return;

  let loaded = false;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!loaded) { loadProjects(); loaded = true; }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // Abre con cualquier tarjeta de proyecto
  document.querySelectorAll('.proyecto-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', openModal);
  });

  closeBtn && closeBtn.addEventListener('click', closeModal);
  backdrop && backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function loadProjects() {
    fetch('assets/portfolio-data.json')
      .then(r => r.json())
      .then(projects => {
        grid.innerHTML = '';
        projects.forEach(p => {
          const fig = document.createElement('figure');
          fig.className = 'pf-item';
          const nivTag = p.niveles && p.niveles !== '—'
            ? `<span class="pf-tag">${p.niveles}</span>` : '';
          const conTag = p.construccion && p.construccion !== '—'
            ? `<span class="pf-tag red">${p.construccion}</span>` : '';
          fig.innerHTML = `
            <img src="${p.img}" alt="${p.titulo}" loading="lazy" />
            <figcaption>
              <strong>${p.titulo}</strong>
              ${p.ubicacion ? `<span class="pf-loc">${p.ubicacion}</span>` : ''}
              <div class="pf-tags">${conTag}${nivTag}</div>
            </figcaption>`;
          grid.appendChild(fig);
        });
      })
      .catch(() => {
        grid.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:2rem">Error cargando el portafolio.</p>';
      });
  }
})();

// ── Proceso: acordeón de 12 etapas ──
(function () {
  const acc = document.getElementById('proceso-acc');
  if (!acc) return;

  const items = Array.from(acc.querySelectorAll('.pacc-item'));

  items.forEach(item => {
    const trigger = item.querySelector('.pacc-trigger');
    const panel   = item.querySelector('.pacc-panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });

  // Abre la primera etapa de cada fase por defecto
  document.querySelectorAll('.pacc-fase').forEach(fase => {
    const first = fase.querySelector('.pacc-trigger');
    if (first) first.click();
  });

  // Si se llega por ancla desde el riel, abre esa fase y ajusta scroll
  if (location.hash.startsWith('#fase-')) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView({ block: 'start' });
  }
})();

// ── Proceso: riel pegajoso — selecciona la fase visible al hacer scroll ──
(function () {
  const railWrap = document.querySelector('.proceso-rail-wrap');
  const fases = Array.from(document.querySelectorAll('.pacc-fase'));
  if (!railWrap || !fases.length) return;

  const cards = {};
  document.querySelectorAll('.prail-card').forEach(card => {
    cards[card.getAttribute('href')] = card;
  });

  // Sombra/fondo del riel solo cuando ya está "pegado" arriba
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  railWrap.before(sentinel);
  new IntersectionObserver(
    ([entry]) => railWrap.classList.toggle('is-stuck', !entry.isIntersecting),
    { rootMargin: '-73px 0px 0px 0px', threshold: 0 }
  ).observe(sentinel);

  // Fase activa: la última cuyo inicio ya cruzó la línea justo debajo del riel.
  // Se calcula en cada scroll (no por bandas de intersección) para no saltarse
  // fases cortas como "Gestión", que solo tiene una etapa.
  const TRIGGER_LINE = 140; // px desde arriba, debajo del riel pegajoso
  const progressBar = document.getElementById('proceso-progress-bar');
  let activeCard = null;

  function updateActiveFase() {
    let current = fases[0];
    let index = 0;
    fases.forEach((fase, i) => {
      if (fase.getBoundingClientRect().top <= TRIGGER_LINE) { current = fase; index = i; }
    });
    const card = cards['#' + current.id];
    if (card && card !== activeCard) {
      if (activeCard) activeCard.classList.remove('active');
      card.classList.add('active');
      activeCard = card;
    }
    if (progressBar) progressBar.style.width = ((index + 1) / fases.length * 100) + '%';
  }

  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActiveFase);
  }, { passive: true });

  updateActiveFase();
})();
