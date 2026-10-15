const filterGroup = document.querySelector('.filters');
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('[data-category]');
const emptyState = document.querySelector('.empty-state');
const categoryNames = { profissional: 'profissionais', pessoal: 'pessoais' };
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('reveal-pending');
    entry.target.classList.add('reveal-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 }) : null;

function revealOnArrival(element) {
  if (!revealObserver || motionPreference.matches) return;
  element.classList.remove('reveal-visible');
  element.classList.add('reveal-pending');
  revealObserver.observe(element);
}

document.querySelectorAll('.about > div, .section-heading, .project-card, .contact > :not(.contact-star)').forEach(revealOnArrival);

filterGroup.hidden = false;

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((filterButton) => {
      filterButton.setAttribute('aria-pressed', String(filterButton === button));
    });

    projectCards.forEach((card) => {
      card.hidden = card.dataset.category !== category;
      if (!card.hidden) {
        visibleCount += 1;
        revealOnArrival(card);
      }
    });

    emptyState.hidden = visibleCount > 0;
    emptyState.textContent = visibleCount > 0 ? '' : `Ainda não adicionei projetos ${categoryNames[category]}. Por enquanto, meus trabalhos estão na categoria Acadêmicos.`;
  });
});

const portrait = document.querySelector('.portrait-composition');
const pointerPreference = window.matchMedia('(hover: hover) and (pointer: fine)');

portrait.addEventListener('pointermove', (event) => {
  if (motionPreference.matches || !pointerPreference.matches) return;
  const bounds = portrait.getBoundingClientRect();
  const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
  const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
  portrait.style.setProperty('--portrait-x', `${-vertical * 8}deg`);
  portrait.style.setProperty('--portrait-y', `${horizontal * 8}deg`);
});

function resetPortrait() {
  portrait.style.removeProperty('--portrait-x');
  portrait.style.removeProperty('--portrait-y');
}

portrait.addEventListener('pointerleave', resetPortrait);
motionPreference.addEventListener('change', () => {
  resetPortrait();
  if (!motionPreference.matches) return;
  document.querySelectorAll('.reveal-pending').forEach((element) => {
    revealObserver?.unobserve(element);
    element.classList.remove('reveal-pending');
  });
});

const navigationLinks = document.querySelectorAll('nav a');
const navigationSections = [...navigationLinks].map((link) => document.querySelector(link.getAttribute('href')));
let scrollScheduled = false;

function updateScrollState() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollableHeight)) : 0;
  document.body.style.setProperty('--reading-progress', progress);
  const currentSection = navigationSections.filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.4).pop();

  navigationLinks.forEach((link) => {
    if (currentSection && link.getAttribute('href') === `#${currentSection.id}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  scrollScheduled = false;
}

function scheduleScrollUpdate() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  window.requestAnimationFrame(updateScrollState);
}

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
filterGroup.addEventListener('click', scheduleScrollUpdate);
updateScrollState();
