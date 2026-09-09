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
          const specs = [p.niveles, p.construccion].filter(v => v && v !== '—').join(' · ');
          fig.innerHTML = `
            <img src="${p.img}" alt="${p.titulo}" loading="lazy" />
            <figcaption>
              <div>
                <strong>${p.titulo}</strong>
                ${specs ? `<span class="pf-loc">${specs}</span>` : ''}
              </div>
            </figcaption>`;
          grid.appendChild(fig);
        });
      })
      .catch(() => {
        grid.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:2rem">Error cargando el portafolio.</p>';
      });
  }
})();

// ── Proceso: figura de fase activa — se actualiza sola al hacer scroll ──
(function () {
  const phaseWrap = document.querySelector('.proceso-sticky');
  const fases = Array.from(document.querySelectorAll('.pacc-fase'));
  if (!phaseWrap || !fases.length) return;

  const numEl  = document.getElementById('pphase-num');
  const nameEl = document.getElementById('pphase-name');
  const listEl = document.getElementById('pphase-list');
  const dots   = Array.from(document.querySelectorAll('.pphase-dot'));

  function renderList(fase) {
    const titles = Array.from(fase.querySelectorAll('.sr-only li')).map(li => li.textContent);
    listEl.innerHTML = titles.map((t, i) => `<li style="--i:${i}">${t}</li>`).join('');
  }
  renderList(fases[0]);

  // Saltar a una fase al tocar su punto — sustituye el scroll horizontal
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.querySelector(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Borde de separación solo cuando la figura ya está "pegada" arriba
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  phaseWrap.before(sentinel);
  new IntersectionObserver(
    ([entry]) => phaseWrap.classList.toggle('is-stuck', !entry.isIntersecting),
    { rootMargin: '-73px 0px 0px 0px', threshold: 0 }
  ).observe(sentinel);

  // Fase activa: la última cuyo inicio ya cruzó el borde inferior del
  // encabezado pegajoso. Se mide en vivo (no un número fijo) porque ese
  // encabezado cambia de alto cuando el título se recoge al pegarse.
  // Se calcula en cada scroll (no por bandas de intersección) para no
  // saltarse fases cortas como "Gestión", que solo tiene una etapa.
  let activeFase = fases[0];
  let switchTimer = null;

  function applyFase(current, index) {
    numEl.textContent  = current.dataset.num;
    nameEl.textContent = current.dataset.name;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', String(i === index));
    });
    renderList(current);
  }

  function updateActiveFase() {
    const triggerLine = phaseWrap.getBoundingClientRect().bottom;
    let current = fases[0];
    let index = 0;
    fases.forEach((fase, i) => {
      if (fase.getBoundingClientRect().top <= triggerLine) { current = fase; index = i; }
    });
    if (current === activeFase) return;
    activeFase = current;

    // La lista sale con la animación y, cuando termina, entra la de la siguiente fase
    clearTimeout(switchTimer);
    listEl.classList.add('is-switching');
    switchTimer = setTimeout(() => {
      applyFase(current, index);
      listEl.classList.remove('is-switching');
    }, 200);
  }

  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActiveFase);
  }, { passive: true });

  updateActiveFase();
})();
