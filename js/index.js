// Based on Codrops' On-Scroll 3D Carousel (MIT, https://github.com/codrops/3DCarousel).
// The boutique's content comes from js/config.js; the page is built from it first,
// then the template's carousel code runs unchanged apart from a few marked lines.

// Import utility function for preloading images
import { preloadImages } from './utils.js';
// Import the WebGL transition for the preview grids
import { createGridTransition } from './gridTransition.js';

/* ================= Boutique content (from js/config.js) ================= */

const { CONFIG, TEXT } = window;
const B = CONFIG.business;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Language: English or Gujarati, remembered on this device
let lang = 'en';
try {
  if (localStorage.getItem('lang') === 'gu') lang = 'gu';
} catch (e) {} // Storage can be blocked; English is fine then
const t = (key) => TEXT[lang][key] ?? TEXT.en[key] ?? key;
document.documentElement.lang = lang;

// Colours
const rootStyle = document.documentElement.style;
rootStyle.setProperty('--color-bg', CONFIG.colors.bg);
rootStyle.setProperty('--color-text', CONFIG.colors.text);
rootStyle.setProperty('--color-muted', CONFIG.colors.muted);
rootStyle.setProperty('--color-accent', CONFIG.colors.accent);

// Text bound to the business details, and the translated labels
const bindings = {
  name: B.name,
  shortName: B.shortName,
  nameRest: B.name.replace(B.shortName, '').trim(),
  city: B.city,
  tagline: lang === 'gu' ? B.taglineGu : B.tagline,
  taglineGu: B.taglineGu,
  address: B.address,
  timings: B.timings,
  sunday: B.sunday,
  phoneDisplay: B.phoneDisplay,
};
$$('[data-bind]').forEach((el) => (el.textContent = bindings[el.dataset.bind] ?? ''));
$$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
document.title = `${B.name} · ${B.city}`;
$('#ratingText').textContent = `${B.googleRating} ${t('onGoogle')} · ${B.googleReviewCount} ${t('reviewsWord')}`;
$('#googleLink').href = B.googleReviewsUrl;
$('#demoNote').textContent = `Demo website prepared by ${B.demoBy}. Prices, story and reviews are sample content.`;

const priceText = (o) => {
  const f = (p) => '₹' + (p == null ? '[price]' : Number(p).toLocaleString('en-IN'));
  const rent = `${t('rentFrom')} ${f(o.rentPrice)}`;
  const buy = `${t('buyFrom')} ${f(o.buyPrice)}`;
  return o.offer === 'rent' ? rent : o.offer === 'buy' ? buy : `${rent} ${t('or')} ${buy}`;
};
const byCode = (code) => CONFIG.outfits.find((o) => o.code === code);

// Only outfits with photos are shown, each in the carousel of its first category;
// a style appears once it has at least one
const shownOutfits = CONFIG.outfits.filter((o) => o.photos && o.photos.length);
const styles = CONFIG.styles
  .map((s) => ({ ...s, items: shownOutfits.filter((o) => o.categories[0] === s.cat) }))
  .filter((s) => s.items.length);

/**
 * Builds one carousel scene and its preview grid per style
 *
 * @returns {void}
 */
const buildCollection = () => {
  const scenes = [];
  const previews = [];
  styles.forEach((style, i) => {
    const n = i + 1;
    const photos = style.items.flatMap((o) => o.photos.map((src) => ({ o, src })));
    // 4 to 8 cards on the ring: few photos are repeated, more are trimmed
    const count = Math.min(8, Math.max(4, photos.length));
    const cells = Array.from({ length: count }, (_, k) => photos[k % photos.length]);
    const radius = count <= 4 ? 500 : count <= 6 ? 650 : 760;
    const title = lang === 'gu' ? style.titleGu : style.title;
    const pieces = lang === 'gu' ? `${style.items.length} પોશાક` : `${style.items.length} piece${style.items.length === 1 ? '' : 's'}`;

    scenes.push(`
      <div class="scene" data-radius="${radius}">
        <h2 class="scene__title" data-speed="0.7">
          <a href="#preview-${n}"><span>${esc(title)}</span></a>
          <span class="scene__count">${esc(pieces)}</span>
        </h2>
        <div class="carousel">
          ${cells.map(({ src }) => `
          <div class="carousel__cell">
            <div class="card">
              <div class="card__face card__face--front" style="background-image: url('${esc(src)}')"></div>
              <div class="card__face card__face--back" style="background-image: url('${esc(src)}')"></div>
            </div>
          </div>`).join('')}
        </div>
      </div>`);

    previews.push(`
      <div class="preview" id="preview-${n}">
        <header class="preview__header">
          <h2 class="preview__title"><span>${esc(title)}</span></h2>
          <button aria-label="${esc(t('close'))}" class="preview__close">${esc(t('close'))}</button>
        </header>
        <div class="grid" style="--cols: ${Math.min(4, photos.length)}">
          ${photos.map(({ o, src }) => `
          <figure class="grid__item">
            <div class="grid__item-image" role="img" aria-label="${esc(o.name)}" style="background-image: url('${esc(src)}')"></div>
            <figcaption class="grid__item-caption">
              <h3>${esc(o.name)}</h3>
              <p>${esc(o.code)} · ${esc(priceText(o))}</p>
              <button class="grid__item-enquire" type="button" data-enquire="${esc(o.code)}">${esc(t('enquire'))}</button>
            </figcaption>
          </figure>`).join('')}
        </div>
      </div>`);
  });
  $('#collection').innerHTML = scenes.join('');
  $('#previews').innerHTML = previews.join('');
};

/**
 * Story text, the photo collage and the reviews
 *
 * @returns {void}
 */
const buildSections = () => {
  $('#storyText').textContent = CONFIG.story;
  const collage = shownOutfits.flatMap((o) => o.photos.slice(1).concat(o.photos[0])).slice(0, 3);
  const speeds = [0.85, 1.12, 0.92]; // Each photo moves at its own speed (ScrollSmoother effects)
  $('#storyPhotos').innerHTML = collage
    .map((src, i) => `<div class="story__photo" data-speed="${speeds[i]}" style="background-image: url('${esc(src)}')"></div>`)
    .join('');

  $('#reviewList').innerHTML = CONFIG.reviews
    .map((r) => `<figure class="review"><blockquote>“${esc(r.text)}”</blockquote><figcaption>${esc(r.name)} — ${esc(r.detail)}</figcaption></figure>`)
    .join('');

  const fill = (sel, list) => {
    $(sel).innerHTML = `<option value="">${esc(t('choose'))}</option>` + list.map((x) => `<option>${esc(x)}</option>`).join('');
  };
  fill('#fType', CONFIG.outfitTypes);
  fill('#fBudget', CONFIG.budgetRanges);
};

buildCollection();
buildSections();

const sheet = $('#sheet');

/* ================= Template: On-Scroll 3D Carousel ================= */

// Register the GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

// Whether the user asked for less motion (gentler carousels, crossfaded previews)
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Initialize GSAP's ScrollSmoother for smooth scrolling and scroll-based effects
const smoother = ScrollSmoother.create({
  smooth: prefersReducedMotion ? 0 : 1, // How long (in seconds) it takes to "catch up"
  effects: !prefersReducedMotion, // Enable data-speed and data-lag-based scroll effects
  normalizeScroll: { allowNestedScroll: true }, // Normalizes scroll behavior across browsers, letting the preview scroll on its own
});

// Reference to the container that wraps all the 3D scene elements
const sceneWrapper = document.querySelector('.scene-wrapper');

// The page's frame (title, links, tags), faded out while a preview is open
const frame = document.querySelector('.frame');

// Global flag to prevent multiple animations from overlapping or triggering at once
let isAnimating = false;

// The preview that is currently open, if any
let activePreview = null;

// WebGL transition for the preview grids (null with reduced motion or without WebGL2)
const gridTransition = prefersReducedMotion ? null : createGridTransition();

// A Map to store SplitText instances keyed by DOM elements (used for animating text characters)
const splitMap = new Map();

// How the carousels react to the scroll speed: they spread out from their center and their
// cards lean against the direction they move in, settling with a spring when the scroll stops
const scrollMotion = {
  spread: 0.05, // px further out from the center per px/s of scroll speed
  maxSpread: 180, // px
  lean: 0.006, // Degrees of lean per px/s of scroll speed
  maxLean: 20, // Degrees
  stiffness: 120, // How quickly they follow the speed (higher = snappier)
  damping: 14, // How quickly they settle (lower = more overshoot)
  spin: 0.12, // Degrees a slider turns per px it's dragged sideways
  spinSmoothing: 0.6, // Seconds a slider takes to catch up with the drag
  spinInertia: 0.35, // How far a slider keeps turning after it's let go (seconds of its speed)
};

/**
 * Returns an array of transform strings to evenly space carousel cells in 3D
 *
 * @param {number} count - Number of carousel cells
 * @param {number} radius - Radius of the circular layout
 * @returns {string[]} Array of transform strings for each cell
 */
const getCarouselCellTransforms = (count, radius) => {
  const angleStep = 360 / count; // Divide 360° by number of cells to get angle step
  return Array.from({ length: count }, (_, i) => {
    const angle = i * angleStep;
    return `rotateY(calc(${angle}deg + var(--spin, 0deg))) translateZ(calc(${radius}px + var(--spread, 0px) + var(--spin-spread, 0px)))`; // 3D rotation + translation (plus the drag's turn, and the spread from the scroll and drag speed)
  });
};

/**
 * Applies 3D transforms to each cell in a given carousel
 *
 * @param {Element} carousel - DOM element representing the carousel
 * @returns {void}
 */
const setupCarouselCells = (carousel) => {
  const wrapper = carousel.closest('.scene');
  const radius = parseFloat(wrapper.dataset.radius) || 500; // Read radius from data attribute or default to 500
  const cells = carousel.querySelectorAll('.carousel__cell');

  const transforms = getCarouselCellTransforms(cells.length, radius); // Get transform strings
  cells.forEach((cell, i) => {
    cell.style.transform = transforms[i]; // Apply transform to each cell
  });
};

/**
 * Creates a scroll-linked GSAP timeline for a given carousel scene
 *
 * @param {Element} carousel - DOM element of the carousel
 * @returns {GSAPTimeline} Scroll-driven animation timeline
 */
const createScrollAnimation = (carousel) => {
  const wrapper = carousel.closest('.scene');
  const cards = carousel.querySelectorAll('.card');
  const titleSpan = wrapper.querySelector('.scene__title a > span'); // (changed) the title has a piece count next to it
  const split = splitMap.get(titleSpan);
  const chars = split?.chars || [];

  // Less rotation when the user prefers reduced motion
  const motion = prefersReducedMotion ? 1 / 3 : 1;

  // Create scroll-driven timeline
  carousel._timeline = gsap.timeline({
    defaults: { ease: 'sine.inOut' },
    scrollTrigger: {
      trigger: wrapper,
      start: 'top bottom', // Start when top of wrapper hits bottom of viewport
      end: 'bottom top', // End when bottom of wrapper hits top of viewport
      scrub: true, // Smooth animation based on scroll position
    },
  });

  carousel._timeline
    .fromTo(
      carousel,
      { rotationY: -90 + 90 * motion },
      { rotationY: -90 - 90 * motion },
      0
    ) // Rotate carousel horizontally (0° to -180°)
    .fromTo(
      carousel,
      { rotationZ: 3 * motion, rotationX: 3 * motion },
      { rotationZ: -3 * motion, rotationX: -3 * motion },
      0
    ) // Subtle 3D tilt
    .fromTo(
      cards,
      { filter: 'brightness(250%)' },
      { filter: 'brightness(80%)', ease: 'power3' },
      0
    ) // Brightness dimming
    .fromTo(
      cards,
      { rotationZ: 10 * motion },
      { rotationZ: -10 * motion, ease: 'none' },
      0
    ); // Rotate cards around Z

  // Animate title characters in on scroll
  if (chars.length > 0) {
    animateChars(chars, 'in', {
      scrollTrigger: {
        trigger: wrapper,
        start: 'top center',
        toggleActions: 'play none none reverse',
      },
    });
  }

  return carousel._timeline;
};

/**
 * Initializes SplitText instances on key animated elements
 *
 * @returns {void}
 */
const initTextsSplit = () => {
  document
    .querySelectorAll(
      '.scene__title a > span, .preview__title span, .preview__close' // (changed) only the title, not the count
    )
    .forEach((span) => {
      const split = SplitText.create(span, {
        type: 'words, chars', // Split by words (so lines only break between them) and characters
        charsClass: 'char', // Assign class to each character
        aria: span.hasAttribute('aria-label') ? 'hidden' : 'auto', // Keep an existing label (the close button)
      });
      splitMap.set(span, split); // Store split instance for reuse
    });
};

/**
 * Animates all grid items in the preview into view
 *
 * @param {HTMLElement} preview - Preview DOM element containing grid items
 * @returns {void}
 */
const animatePreviewGridIn = (preview) => {
  if (gridTransition) {
    gridTransition.animate(preview, 'in');
    return;
  }
  // Without WebGL, a simple fade
  gsap.fromTo(
    preview.querySelectorAll('.grid__item'),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.6, ease: 'sine', stagger: 0.03 }
  );
};

/**
 * Animates all grid items in the preview out of view
 * @param {HTMLElement} preview - The preview container
 */
const animatePreviewGridOut = (preview) => {
  const onComplete = () =>
    gsap.set(preview, { pointerEvents: 'none', autoAlpha: 0 });
  if (gridTransition) {
    return gridTransition.animate(preview, 'out', onComplete);
  }
  return gsap.to(preview.querySelectorAll('.grid__item'), {
    autoAlpha: 0,
    duration: 0.4,
    ease: 'sine.in',
    onComplete,
  });
};

/**
 * Returns how many seconds an animation still has to play, forwards or backwards
 *
 * @param {gsap.core.Animation} animation
 * @returns {number}
 */
const secondsLeft = (animation) =>
  (animation.reversed() ? animation.time() : animation.duration() - animation.time()) /
  Math.abs(animation.timeScale()); // GSAP reports a reversed animation's timeScale as negative

/**
 * Retrieves relevant DOM elements and text splits from a scene title
 * @param {HTMLElement} titleEl - The `.scene__title` element
 * @returns {Object} wrapper, carousel, cards, span, chars
 */
const getSceneElementsFromTitle = (titleEl) => {
  const wrapper = titleEl.closest('.scene'); // Scene container
  const carousel = wrapper?.querySelector('.carousel'); // Carousel in the scene
  const cards = carousel?.querySelectorAll('.card'); // All card elements
  const span = titleEl.querySelector('a > span'); // Title span (changed: skips the count)
  const chars = splitMap.get(span)?.chars || []; // SplitText chars
  return { wrapper, carousel, cards, span, chars };
};

/**
 * Retrieves scene-related elements from a preview element
 * @param {HTMLElement} previewEl - The `.preview` element
 * @returns {Object} All scene elements and corresponding titleEl
 */
const getSceneElementsFromPreview = (previewEl) => {
  const previewId = `#${previewEl.id}`;
  const titleLink = document.querySelector(
    `.scene__title a[href="${previewId}"]`
  );
  const titleEl = titleLink?.closest('.scene__title'); // Corresponding title element
  return { ...getSceneElementsFromTitle(titleEl), titleEl };
};

/**
 * Animates SplitText character elements in or out
 *
 * @param {HTMLElement[]} chars - Array of character elements to animate
 * @param {'in' | 'out'} direction - Direction of the animation ('in' for fade in, 'out' for fade out)
 * @param {Object} [opts={}] - Optional GSAP config overrides (e.g. scrollTrigger)
 */
const animateChars = (chars, direction = 'in', opts = {}) => {
  const base = {
    autoAlpha: direction === 'in' ? 1 : 0,
    duration: 0.02,
    ease: 'none',
    stagger: { each: 0.04, from: direction === 'in' ? 'start' : 'end' },
    ...opts,
  };

  gsap.fromTo(chars, { autoAlpha: direction === 'in' ? 0 : 1 }, base);
};

/**
 * Animates title and close button characters in a preview
 *
 * @param {HTMLElement} preview - The preview container
 * @param {'in' | 'out'} direction - Animation direction
 * @param {string} [selector='.preview__title span, .preview__close'] - Selector for elements to animate
 */
const animatePreviewTexts = (
  preview,
  direction = 'in',
  selector = '.preview__title span, .preview__close'
) => {
  preview.querySelectorAll(selector).forEach((el) => {
    const chars = splitMap.get(el)?.chars || [];
    animateChars(chars, direction);
  });
};

/**
 * Shows a preview with a simple crossfade (used when the user prefers reduced motion)
 *
 * @param {HTMLElement} preview - The preview container
 * @param {boolean} show - Whether to show or hide the preview
 * @param {Function} [onComplete] - Callback when the crossfade finishes
 */
const crossfadePreview = (preview, show, onComplete) => {
  gsap
    .timeline({ defaults: { duration: 0.5, ease: 'power1.inOut' }, onComplete })
    .to(sceneWrapper, { autoAlpha: show ? 0 : 1 }, 0)
    .to(frame, { autoAlpha: show ? 0 : 1 }, 0)
    .to(preview, { autoAlpha: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none' }, 0);
};

/**
 * Handles transition from carousel view to preview grid
 *
 * @param {Event} e - Click event triggered from `.scene__title`
 */
const activatePreviewFromCarousel = (e) => {
  e.preventDefault();
  if (isAnimating) return;
  isAnimating = true;

  const titleEl = e.currentTarget;
  const { wrapper, carousel, cards, chars } =
    getSceneElementsFromTitle(titleEl);
  const previewSelector = titleEl.querySelector('a')?.getAttribute('href');
  const preview = document.querySelector(previewSelector);
  activePreview = preview;

  // Stop scrolling while the preview is open
  smoother.paused(true);
  document.body.classList.add('is-preview-open'); // (added) hides the chat button

  const onOpen = () => {
    isAnimating = false;
    preview.querySelector('.preview__close').focus({ preventScroll: true });
  };

  // Make sure the preview's images are ready (as WebGL textures when there's WebGL) before it shows up
  const ready = gridTransition
    ? gridTransition.prepare(preview)
    : preloadImages(`${previewSelector} .grid__item-image`);
  ready.then(() => {
    if (prefersReducedMotion) {
      crossfadePreview(preview, true, onOpen);
      return;
    }

    // Scroll position that centers the scene
    const targetY = smoother.offset(wrapper, 'center center');

    // Temporarily disable scroll-based animations
    ScrollTrigger.getAll().forEach((t) => t.disable(false));
    // Stop the title's own reveal if it's still running, so it doesn't bring characters back
    gsap.killTweensOf(chars);

    gsap
      .timeline({
        defaults: { duration: 1.5, ease: 'power2.inOut' },
        onComplete: () => {
          ScrollTrigger.getAll().forEach((t) => t.enable());
          carousel._timeline.scrollTrigger.scroll(targetY);
          onOpen();
        },
      })
      .to(smoother, { scrollTop: targetY })
      .to(frame, { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' }, 0) // The frame steps aside
      .to(
        chars,
        {
          autoAlpha: 0,
          duration: 0.02,
          ease: 'none',
          stagger: { each: 0.04, from: 'end' },
        },
        0
      )
      .to(carousel, { rotationX: 90, rotationY: -360, z: -2000 }, 0)
      .to(
        carousel,
        {
          duration: 2.5,
          ease: 'power3.inOut',
          z: 1500,
          rotationZ: 270,
          onComplete: () => gsap.set(sceneWrapper, { autoAlpha: 0 }),
        },
        0.7
      )
      .to(cards, { rotationZ: 0 }, 0)
      .add(() => {
        gsap.set(preview, { pointerEvents: 'auto', autoAlpha: 1 });
        animatePreviewGridIn(preview);
        animatePreviewTexts(preview, 'in');
      }, '<+=1.9');
  });
};

/**
 * Handles transition from preview grid back to carousel view
 *
 * @param {HTMLElement} preview - The open preview container
 */
const deactivatePreviewToCarousel = (preview) => {
  if (isAnimating || !preview) return;
  isAnimating = true;
  activePreview = null;

  // Let go of the close button so its focus ring doesn't stay behind while it fades out
  document.activeElement.blur();

  const { carousel, cards, chars, titleEl } =
    getSceneElementsFromPreview(preview);

  const onClose = () => {
    smoother.paused(false);
    document.body.classList.remove('is-preview-open'); // (added)
    isAnimating = false;
    titleEl.querySelector('a').focus({ preventScroll: true });
  };

  if (prefersReducedMotion) {
    crossfadePreview(preview, false, onClose);
    return;
  }

  animatePreviewTexts(preview, 'out');
  const gridOut = animatePreviewGridOut(preview);

  gsap.set(sceneWrapper, { autoAlpha: 1 });

  // The scene was centered when the preview opened, which is halfway (progress 0.5)
  // through its scroll timeline: rotationY -90° and no tilt.
  // The carousel comes back once the grid's close has played (as its wave collapses into the
  // center), so the two don't cover each other
  gsap
    .timeline({
      delay: Math.max(secondsLeft(gridOut) - 0.2, 0),
      defaults: { duration: 1.3, ease: 'expo' },
      onComplete: onClose,
    })
    .to(frame, { autoAlpha: 1, duration: 0.8, ease: 'power1.inOut' }, 0) // The frame comes back
    .fromTo(
      chars,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.02,
        ease: 'none',
        stagger: { each: 0.04, from: 'start' },
      }
    )
    .fromTo(
      carousel,
      {
        z: -550,
        rotationX: 0,
        rotationY: -720,
        rotationZ: 0,
        yPercent: 300,
      },
      {
        rotationY: -90,
        yPercent: 0,
      },
      0
    )
    .fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.3);
};

/**
 * Adds click event listeners to scene titles and preview close buttons
 *
 * @returns {void}
 */
const initEventListeners = () => {
  // When a scene title is clicked, activate the preview
  document.querySelectorAll('.scene__title').forEach((title) => {
    title.addEventListener('click', activatePreviewFromCarousel);
  });

  // When a preview close button is clicked, deactivate the preview
  document.querySelectorAll('.preview__close').forEach((btn) => {
    btn.addEventListener('click', (e) =>
      deactivatePreviewToCarousel(e.currentTarget.closest('.preview'))
    );
  });

  // Escape closes the open preview
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!sheet.hidden) return closeSheet(); // (added) an open enquiry closes first
    setChat(false);
    deactivatePreviewToCarousel(activePreview);
  });
};

/**
 * Initializes all carousels on the page
 *
 * @returns {void}
 */
const initCarousels = () => {
  document.querySelectorAll('.carousel').forEach((carousel) => {
    setupCarouselCells(carousel); // Position carousel cells in 3D
    createScrollAnimation(carousel); // Attach scroll animation timeline
  });
};

/**
 * Springs that turn a speed into a spread and a lean, set as CSS variables on an element (the
 * carousels inside it inherit them), so they settle naturally when the speed drops
 *
 * @param {HTMLElement} el - Element the variables are set on
 * @param {string} prefix - '' for --spread and --lean, 'spin-' for --spin-spread and --spin-lean
 * @returns {Function} Updates the springs: (speed in px/s, time step in s)
 */
const createSpeedSprings = (el, prefix) => {
  const springs = { spread: { value: 0, velocity: 0 }, lean: { value: 0, velocity: 0 } };
  let atRest = true;

  return (speed, dt) => {
    const targets = {
      spread: Math.min(Math.abs(speed) * scrollMotion.spread, scrollMotion.maxSpread),
      lean: gsap.utils.clamp(-scrollMotion.maxLean, scrollMotion.maxLean, -speed * scrollMotion.lean),
    };

    let moving = false;
    Object.entries(springs).forEach(([key, spring]) => {
      spring.velocity +=
        (scrollMotion.stiffness * (targets[key] - spring.value) - scrollMotion.damping * spring.velocity) * dt;
      spring.value += spring.velocity * dt;
      if (Math.abs(targets[key] - spring.value) > 0.01 || Math.abs(spring.velocity) > 0.01) moving = true;
    });

    // Leave the styles alone once everything has settled
    if (!moving && atRest) return;
    atRest = !moving;
    if (atRest) springs.spread.value = springs.lean.value = 0;
    el.style.setProperty(`--${prefix}spread`, `${springs.spread.value}px`);
    el.style.setProperty(`--${prefix}lean`, `${springs.lean.value}deg`);
  };
};

/**
 * Makes the carousels react to how fast they move: scrolling spreads and leans all of them
 * (--spread and --lean on the scenes), dragging a slider only that one (--spin-spread and
 * --spin-lean on its carousel)
 *
 * @returns {void}
 */
const initScrollMotion = () => {
  const scroll = createSpeedSprings(sceneWrapper, '');
  const spins = [...document.querySelectorAll('.carousel')].map((carousel) => ({
    carousel,
    update: createSpeedSprings(carousel, 'spin-'),
    last: 0,
  }));

  gsap.ticker.add((time, deltaTime) => {
    const dt = Math.min(deltaTime / 1000, 1 / 30); // Seconds, capped so a stalled tab doesn't fling the springs
    const paused = isAnimating || activePreview; // No reaction while a preview opens, is open or closes

    scroll(paused ? 0 : smoother.getVelocity(), dt); // px/s

    // Turning a slider by +1° moves it like scrolling up by 1 / spin px
    spins.forEach((spin) => {
      const value = spin.carousel._spin.value;
      const degreesPerSecond = deltaTime > 0 ? ((value - spin.last) / deltaTime) * 1000 : 0;
      spin.last = value;
      spin.update(paused ? 0 : -degreesPerSecond / scrollMotion.spin, dt);
    });
  });
};

/**
 * Turns a slider by dragging it sideways, with the mouse or a finger, through --spin on its
 * carousel (which its cells add to their angle). It keeps turning a little when it's let go,
 * and a drag never opens the preview
 *
 * @returns {void}
 */
const initDragSpin = () => {
  const carousels = [...document.querySelectorAll('.carousel')];
  let dragged = null; // The carousel being dragged
  let wasDrag = false; // Whether the last press turned a slider (then its click is ignored)

  // Each slider eases towards where the drag has taken it
  carousels.forEach((carousel) => {
    carousel._spin = { value: 0, target: 0 };
    carousel._spinTo = gsap.quickTo(carousel._spin, 'value', {
      duration: scrollMotion.spinSmoothing,
      ease: 'power3',
      onUpdate: () => carousel.style.setProperty('--spin', `${carousel._spin.value}deg`),
    });
  });

  // Turns the dragged slider so its front moves by px (positive = to the right)
  const spinBy = (px) => {
    if (!dragged || isAnimating || activePreview) return;
    wasDrag = true;
    dragged._spin.target += px * scrollMotion.spin;
    dragged._spinTo(dragged._spin.target);
  };

  ScrollTrigger.observe({
    target: sceneWrapper,
    type: 'pointer,touch',
    lockAxis: true, // A drag that starts sideways turns the slider; one that starts up or down scrolls (touch)
    dragMinimum: 4, // Smaller moves are still clicks
    onPress: (self) => {
      dragged = self.event.target.closest('.scene')?.querySelector('.carousel') ?? null;
    },
    onDragStart: () => document.body.classList.add('is-dragging'),
    onChangeX: (self) => spinBy(self.deltaX),
    onDragEnd: (self) => {
      document.body.classList.remove('is-dragging');
      if (Math.abs(self.velocityX) > Math.abs(self.velocityY)) spinBy(self.velocityX * scrollMotion.spinInertia);
    },
  });

  // Every press starts fresh, wherever it is (a scroll, for one, is a drag that turns nothing)
  window.addEventListener('pointerdown', () => (wasDrag = false), true);

  // A drag that ends on a title isn't a click on it
  window.addEventListener(
    'click',
    (e) => {
      if (!wasDrag) return;
      e.preventDefault();
      e.stopPropagation();
      wasDrag = false;
    },
    true,
  );
};

/**
 * Initializes text splitting, carousels, and event listeners
 *
 * @returns {void}
 */

/* ================= Boutique sections ================= */

const toastEl = $('#toast');
let toastTimer = 0;
const toast = (msg) => {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
};

/**
 * Copies text, falling back to a hidden textarea where the clipboard API is refused
 *
 * @param {string} text
 * @returns {void}
 */
const copyText = (text) => {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast(t('copied'));
    } catch (e) {}
    ta.remove();
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => toast(t('copied')), fallback);
  else fallback();
};

const canGoLive = () => CONFIG.liveMode && /^\d{8,15}$/.test(B.whatsappNumber);
const waLink = (msg) => `https://wa.me/${B.whatsappNumber}?text=${encodeURIComponent(msg)}`;
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const fmtDate = (v) => {
  if (!v) return '[date]';
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ---- Sheet (enquiries and notices) ---- */
let sheetOpener = null;
const openSheet = (html, opener) => {
  sheetOpener = opener || document.activeElement;
  $('#sheetPanel').innerHTML = `<button class="sheet__close" type="button" data-close-sheet>${esc(t('close'))}</button>${html}`;
  sheet.hidden = false;
  smoother.paused(true);
  gsap.fromTo('#sheetPanel', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: prefersReducedMotion ? 0 : 0.45, ease: 'power3.out' });
  $('[data-close-sheet]', sheet).focus({ preventScroll: true });
};
const closeSheet = () => {
  if (sheet.hidden) return;
  sheet.hidden = true;
  if (!activePreview && !isAnimating) smoother.paused(false);
  sheetOpener?.focus?.({ preventScroll: true });
};
sheet.addEventListener('click', (e) => {
  if (e.target === sheet || e.target.closest('[data-close-sheet]')) closeSheet();
});

const notice = (text, opener) =>
  openSheet(`<p class="sheet__title" id="sheetTitle">${esc(t('notLive'))}</p><p class="muted">${esc(text)}</p>`, opener);

/**
 * Shows the WhatsApp message an enquiry would send (or opens WhatsApp in live mode)
 *
 * @param {object} o - Outfit
 * @param {Element} opener
 * @returns {void}
 */
const openEnquiry = (o, opener) => {
  const message = (date) => `Hi ${B.name}, I'm interested in outfit ${o.code} (${o.name}). Is it available on ${fmtDate(date)}?`;
  if (canGoLive()) {
    window.open(waLink(message('')), '_blank', 'noopener');
    return;
  }
  openSheet(
    `<div class="sheet__head"><div class="sheet__thumb" style="background-image:url('${esc(o.photos[0])}')"></div>
       <div><p class="muted">${esc(t('enqTitle'))} ${esc(o.code)}</p><h2 class="sheet__title" id="sheetTitle">${esc(o.name)}</h2><p class="muted">${esc(priceText(o))}</p></div></div>
     <p class="muted" style="text-transform:none">${esc(o.description)}</p>
     <div class="field"><label for="enqDate">${esc(t('enqDate'))}</label><input id="enqDate" type="date" min="${today()}" /></div>
     <p class="label">${esc(t('enqSub'))}</p>
     <pre class="message" id="enqMsg"></pre>
     <p class="muted" style="text-transform:none">${esc(t('liveNote'))}</p>
     <div class="row"><button class="btn btn--accent" type="button" id="enqCopy">${esc(t('copy'))}</button></div>`,
    opener,
  );
  const msgEl = $('#enqMsg');
  const update = () => (msgEl.textContent = message($('#enqDate').value));
  update();
  $('#enqDate').addEventListener('input', update);
  $('#enqCopy').addEventListener('click', () => copyText(msgEl.textContent));
};

document.addEventListener('click', (e) => {
  const enq = e.target.closest('[data-enquire]');
  if (enq) openEnquiry(byCode(enq.dataset.enquire), enq);
});

/* ---- Chat button ---- */
const chatPop = $('#chatPop');
const setChat = (open) => {
  chatPop.hidden = !open;
  $$('[data-chat]').forEach((b) => b.setAttribute('aria-expanded', open));
  if (open) $('#chatClose').focus({ preventScroll: true });
};
$$('[data-chat]').forEach((b) =>
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (canGoLive()) return window.open(waLink(`Hi ${B.name}, I have a question.`), '_blank', 'noopener');
    setChat(chatPop.hidden);
  }),
);
$('#chatClose').addEventListener('click', () => setChat(false));
document.addEventListener('click', (e) => {
  if (!chatPop.hidden && !e.target.closest('#chatPop')) setChat(false);
});

/* ---- Navigation (smooth-scrolled) ---- */
const goTo = (hash, focusBooking) => {
  const target = $(hash);
  if (!target) return;
  smoother.scrollTo(target, !prefersReducedMotion, 'top top');
  if (focusBooking) setTimeout(() => $('#fName').focus({ preventScroll: true }), prefersReducedMotion ? 0 : 1100);
};
$$('[data-nav]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(a.getAttribute('href'), a.hasAttribute('data-book'));
  }),
);
$('#chatToBook').addEventListener('click', () => {
  setChat(false);
  goTo('#visit', true);
});

$('#langToggle').addEventListener('click', () => {
  try {
    localStorage.setItem('lang', lang === 'en' ? 'gu' : 'en');
  } catch (e) {}
  location.reload(); // The titles are split into characters, so a fresh build is simplest
});

/* ---- Booking form ---- */
const form = $('#bookForm');
const ready = $('#ready');
$('#fDate').min = today();
$$('#bookForm input, #bookForm select').forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('invalid')));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let first = null;
  const check = (id, ok) => {
    $(id).closest('.field').classList.toggle('invalid', !ok);
    if (!ok && !first) first = $(id);
  };
  check('#fName', $('#fName').value.trim().length > 1);
  check('#fPhone', $('#fPhone').value.replace(/\D/g, '').length >= 8);
  check('#fDate', !!$('#fDate').value);
  check('#fType', !!$('#fType').value);
  if (first) return first.focus();

  const v = (id) => $(id).value.trim();
  const msg = [
    `Hello ${B.name},`,
    'I would like to book a trial.',
    '',
    `Name: ${v('#fName')}`,
    `Phone: ${v('#fPhone')}`,
    `Function date: ${fmtDate(v('#fDate'))}`,
    `Outfit type: ${v('#fType')}`,
    v('#fBudget') && `Budget: ${v('#fBudget')}`,
    v('#fMsg') && `Message: ${v('#fMsg')}`,
  ].filter((x) => x !== '' && x !== false).join('\n');
  if (canGoLive()) return window.open(waLink(msg), '_blank', 'noopener');

  $('#readyMsg').textContent = msg;
  gsap.to(form, {
    autoAlpha: 0,
    y: -20,
    duration: prefersReducedMotion ? 0 : 0.35,
    onComplete: () => {
      form.hidden = true;
      ready.hidden = false;
      gsap.fromTo(ready, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: prefersReducedMotion ? 0 : 0.5 });
      ready.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    },
  });
});
$('#editBooking').addEventListener('click', () => {
  ready.hidden = true;
  form.hidden = false;
  gsap.fromTo(form, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: prefersReducedMotion ? 0 : 0.4 });
  $('#fName').focus({ preventScroll: true });
  ScrollTrigger.refresh();
});
$('#copyBooking').addEventListener('click', () => copyText($('#readyMsg').textContent));

$('#videoCall').addEventListener('click', (e) => {
  const msg = `Hi ${B.name}, I would like to book a video call to see your collection. I'm based in [city / country].`;
  if (canGoLive()) return window.open(waLink(msg), '_blank', 'noopener');
  openSheet(`<p class="sheet__title" id="sheetTitle">${esc(t('ctaVideo'))}</p><p class="label">${esc(t('enqSub'))}</p><pre class="message">${esc(msg)}</pre><p class="muted" style="text-transform:none">${esc(t('liveNote'))}</p>`, e.currentTarget);
});
$('#googleLink').addEventListener('click', (e) => {
  if (B.googleReviewsUrl !== '#') return;
  e.preventDefault();
  notice("This button will open the boutique's Google reviews page.", e.currentTarget);
});

/* ---- Map placeholder: a line drawing of the area ---- */
$('#map').innerHTML = `
  <svg viewBox="0 0 400 250" fill="none" stroke="currentColor" role="img" aria-label="Map placeholder: the studio on Kalawad Road, Rajkot">
    <g stroke-opacity="0.22" stroke-width="1"><path d="M0 60h400M0 190h400M70 0v250M300 0v250M180 0l-20 250"/></g>
    <path d="M-10 132 C 90 122 210 140 410 118" stroke-opacity="0.85" stroke-width="2.5"/>
    <path d="M30 230 C 120 210 200 236 380 200" stroke-opacity="0.3" stroke-width="10" stroke-linecap="round"/>
    <text x="24" y="118" fill="currentColor" stroke="none" font-family="DM Mono, monospace" font-size="10" fill-opacity="0.75" letter-spacing="1">KALAWAD ROAD</text>
    <circle cx="246" cy="130" r="16" stroke="${esc(CONFIG.colors.accent)}" stroke-opacity="0.5"/>
    <circle cx="246" cy="130" r="5" fill="${esc(CONFIG.colors.accent)}" stroke="none"/>
  </svg>
  <div class="map__cap"><span>${esc(t('mapNote'))}</span><button class="btn" type="button" id="dirBtn">${esc(t('directions'))}</button></div>`;
$('#dirBtn').addEventListener('click', (e) => {
  if (B.mapsUrl && B.mapsUrl !== '#') return window.open(B.mapsUrl, '_blank', 'noopener');
  notice('The "Get directions" button will open Google Maps at the studio.', e.currentTarget);
});

/* ---- Scroll effects for the sections ---- */
const initSections = () => {
  // The header gets a backdrop once the intro has scrolled past; the corner hint hides after the carousels
  const intro = $('.intro');
  const collection = $('#collection');
  const updateFrame = () => {
    frame.classList.toggle('frame--solid', intro.getBoundingClientRect().bottom < window.innerHeight * 0.15);
    frame.classList.toggle('frame--past-collection', collection.getBoundingClientRect().bottom < window.innerHeight * 0.6);
  };
  gsap.ticker.add(updateFrame); // Cheap: two rect reads per frame
  updateFrame();

  if (prefersReducedMotion) return;

  // Intro: the name and lines rise in
  gsap.from('.intro > *', { autoAlpha: 0, y: 30, duration: 1.1, ease: 'power3.out', stagger: 0.08 });

  // Story: the words light up as they scroll by
  const words = SplitText.create('#storyText', { type: 'words', wordsClass: 'word' }).words;
  gsap.fromTo(words, { opacity: 0.16 }, {
    opacity: 1,
    ease: 'none',
    stagger: 0.05,
    scrollTrigger: { trigger: '#storyText', start: 'top 80%', end: 'bottom 45%', scrub: true },
  });

  // Big headings fade in letter by letter, like the carousel titles
  $$('.display, .story__made-title, .nri__title').forEach((el) => {
    const chars = SplitText.create(el, { type: 'words, chars', charsClass: 'char' }).chars;
    animateChars(chars, 'in', { scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } });
  });

  // Reviews rise in one after another
  gsap.from('.review', { autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '#reviewList', start: 'top 80%' } });
};

/**
 * Initializes text splitting, carousels, and event listeners
 *
 * @returns {void}
 */
const init = () => {
  initTextsSplit(); // Prepare character-level splits for animations
  initCarousels(); // Set up carousels with transforms and scroll triggers
  initEventListeners(); // Bind all interactive handlers
  initDragSpin(); // Dragging a slider sideways turns it
  if (!prefersReducedMotion) initScrollMotion(); // Carousels react to how fast they move
  initSections(); // The boutique's sections
};

// Start app once the carousel images and the fonts are loaded
Promise.all([preloadImages('.card__face'), document.fonts.ready]).then(() => {
  document.body.classList.remove('loading'); // Remove loading state from body
  init(); // Begin initialization
  preloadImages('.grid__item-image'); // Load the preview images in the background
});
