const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const railLinks = [...document.querySelectorAll('.section-rail a')];
const railGroups = [...document.querySelectorAll('.section-rail details')];
const backToTop = document.querySelector('.back-to-top');
const sections = [...document.querySelectorAll('main section[id]')];

const setActiveLinks = (links, targetId) => {
  links.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${targetId}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const setActivePrimary = (sectionId) => setActiveLinks(navLinks, sectionId);
const setActiveDetail = (targetId) => {
  setActiveLinks(railLinks, targetId);
  const activeLink = railLinks.find((link) => link.getAttribute('href') === `#${targetId}`);
  activeLink?.closest('details')?.setAttribute('open', '');
};

const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 48);
  backToTop.classList.toggle('is-visible', window.scrollY > 640);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

railGroups.forEach((group) => {
  group.addEventListener('toggle', () => {
    if (!group.open) return;
    railGroups.forEach((otherGroup) => {
      if (otherGroup !== group) otherGroup.removeAttribute('open');
    });
  });
});

const scrollToTarget = (target, behavior = 'smooth') => {
  const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 24;
  window.scrollTo({ top: Math.max(0, top), behavior });
};

backToTop.addEventListener('click', (event) => {
  event.preventDefault();
  history.pushState(null, '', '#top');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

railLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;
    history.pushState(null, '', hash);
    setActiveDetail(target.id);
    scrollToTarget(target);
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActivePrimary(entry.target.id);
    });
  },
  { rootMargin: '-30% 0px -58% 0px', threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

const detailTargets = railLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const detailObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveDetail(entry.target.id);
    });
  },
  { rootMargin: '-22% 0px -68% 0px', threshold: 0 },
);

detailTargets.forEach((target) => detailObserver.observe(target));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px' },
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const lightbox = document.querySelector('.lightbox');
const lightboxStage = lightbox.querySelector('.lightbox-stage');
const lightboxImage = lightbox.querySelector('.lightbox-stage img');
const lightboxTitle = lightbox.querySelector('.lightbox-caption strong');
const lightboxDescription = lightbox.querySelector('.lightbox-caption p');
const lightboxCount = lightbox.querySelector('.lightbox-count');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
const zoomOut = lightbox.querySelector('.zoom-out');
const zoomIn = lightbox.querySelector('.zoom-in');
const zoomReset = lightbox.querySelector('.zoom-reset');
const zoomLevel = lightbox.querySelector('.zoom-level');
const triggers = [...document.querySelectorAll('.lightbox-trigger')];
let activeImageIndex = 0;
let imageZoom = 1;
let imageOffset = { x: 0, y: 0 };
let dragState = null;

const clampPan = () => {
  const stageRect = lightboxStage.getBoundingClientRect();
  const baseWidth = lightboxImage.offsetWidth;
  const baseHeight = lightboxImage.offsetHeight;
  const maxX = Math.max(0, (baseWidth * imageZoom - stageRect.width) / 2);
  const maxY = Math.max(0, (baseHeight * imageZoom - stageRect.height) / 2);
  imageOffset = {
    x: Math.max(-maxX, Math.min(maxX, imageOffset.x)),
    y: Math.max(-maxY, Math.min(maxY, imageOffset.y)),
  };
};

const renderZoom = () => {
  clampPan();
  lightboxImage.style.transform = `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageZoom})`;
  zoomLevel.textContent = `${Math.round(imageZoom * 100)}%`;
};

const renderLightbox = (index) => {
  const trigger = triggers[index];
  if (!trigger) return;
  activeImageIndex = index;
  lightboxImage.src = trigger.dataset.image;
  lightboxImage.alt = trigger.dataset.title || '项目功能截图';
  lightboxTitle.textContent = trigger.dataset.title || '项目功能截图';
  lightboxDescription.textContent = trigger.dataset.description || '';
  lightboxCount.textContent = `${index + 1} / ${triggers.length}`;
  imageZoom = 1;
  imageOffset = { x: 0, y: 0 };
  renderZoom();
};

const openLightbox = (index) => {
  renderLightbox(index);
  document.body.classList.add('modal-open');
  lightbox.showModal();
};

const closeLightbox = () => {
  lightbox.close();
  document.body.classList.remove('modal-open');
};

const moveLightbox = (direction) => {
  const nextIndex = (activeImageIndex + direction + triggers.length) % triggers.length;
  renderLightbox(nextIndex);
};

triggers.forEach((trigger, index) => {
  trigger.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
zoomOut.addEventListener('click', () => {
  imageZoom = Math.max(1, Number((imageZoom - 0.25).toFixed(2)));
  if (imageZoom === 1) imageOffset = { x: 0, y: 0 };
  renderZoom();
});
zoomIn.addEventListener('click', () => {
  imageZoom = Math.min(3, Number((imageZoom + 0.25).toFixed(2)));
  renderZoom();
});
zoomReset.addEventListener('click', () => {
  imageZoom = 1;
  imageOffset = { x: 0, y: 0 };
  renderZoom();
});

lightboxImage.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 0.1 : -0.1;
  imageZoom = Math.min(3, Math.max(1, Number((imageZoom + delta).toFixed(2))));
  renderZoom();
}, { passive: false });

lightboxImage.addEventListener('dblclick', () => {
  imageZoom = imageZoom === 1 ? 1.75 : 1;
  if (imageZoom === 1) imageOffset = { x: 0, y: 0 };
  renderZoom();
});

lightboxImage.addEventListener('load', renderZoom);

const startDragging = (event) => {
  if (!lightbox.open || (event.pointerType === 'mouse' && event.button !== 0)) return;
  event.preventDefault();
  // A direct drag starts a comfortable inspection zoom so the user can explore a region immediately.
  if (imageZoom <= 1) imageZoom = 1.25;
  renderZoom();
  dragState = {
    startX: event.clientX,
    startY: event.clientY,
    offsetX: imageOffset.x,
    offsetY: imageOffset.y,
    pointerId: event.pointerId,
  };
  lightboxStage.classList.add('is-dragging');
  try {
    lightboxImage.setPointerCapture(event.pointerId);
  } catch (_) {
    // Pointer capture is not available in every browser; global listeners below provide a fallback.
  }
};

const dragImage = (event) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  event.preventDefault();
  imageOffset = {
    x: dragState.offsetX + event.clientX - dragState.startX,
    y: dragState.offsetY + event.clientY - dragState.startY,
  };
  renderZoom();
};

const stopDragging = (event) => {
  if (!dragState || (event && event.pointerId !== dragState.pointerId)) return;
  dragState = null;
  lightboxStage.classList.remove('is-dragging');
  if (event) {
    try {
      if (lightboxImage.hasPointerCapture(event.pointerId)) lightboxImage.releasePointerCapture(event.pointerId);
    } catch (_) {
      // The browser may already have released the pointer.
    }
  }
};

lightboxImage.addEventListener('dragstart', (event) => event.preventDefault());
lightboxImage.addEventListener('pointerdown', startDragging);
window.addEventListener('pointermove', dragImage, { passive: false });
window.addEventListener('pointerup', stopDragging);
window.addEventListener('pointercancel', stopDragging);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));

document.addEventListener('keydown', (event) => {
  if (!lightbox.open) return;
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});

// Keep the visible caption aligned with the same title and description used in the lightbox.
document.querySelectorAll('.gallery-item, .conversation-card').forEach((figure) => {
  const trigger = figure.querySelector('.lightbox-trigger');
  const caption = figure.querySelector('figcaption');
  if (!trigger || !caption || !trigger.dataset.description || caption.querySelector('.gallery-description')) return;
  const description = document.createElement('p');
  description.className = 'gallery-description';
  description.textContent = trigger.dataset.description;
  caption.append(description);
});
