(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const header = document.querySelector('[data-header]');
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (menuToggle && menu) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
      }
    });
    window.matchMedia('(min-width: 851px)').addEventListener('change', (event) => {
      if (event.matches) closeMenu();
    });
  }

  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const slides = [...slider.querySelectorAll('[data-slide]')];
    const dots = [...slider.querySelectorAll('[data-slider-dot]')];
    const currentLabel = slider.querySelector('[data-slider-current]');
    const sliderToggle = slider.querySelector('[data-slider-toggle]');
    let current = 0;
    let timer = null;
    let paused = prefersReducedMotion;

    const updateSliderToggle = () => {
      if (!sliderToggle) return;
      sliderToggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      sliderToggle.setAttribute('title', paused ? 'Play slideshow' : 'Pause slideshow');
      sliderToggle.querySelector('span').textContent = paused ? '>' : '||';
    };

    const setSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
      if (currentLabel) currentLabel.textContent = String(current + 1).padStart(2, '0');
    };
    const start = () => {
      if (paused || slides.length < 2) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => setSlide(current + 1), 7000);
    };
    const restart = () => { window.clearInterval(timer); start(); };

    slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => { setSlide(current - 1); restart(); });
    slider.querySelector('[data-slider-next]')?.addEventListener('click', () => { setSlide(current + 1); restart(); });
    dots.forEach((dot) => dot.addEventListener('click', () => { setSlide(Number(dot.dataset.sliderDot)); restart(); }));
    sliderToggle?.addEventListener('click', () => {
      paused = !paused;
      updateSliderToggle();
      if (paused) window.clearInterval(timer); else start();
    });
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', () => window.clearInterval(timer));
    slider.addEventListener('focusout', start);
    setSlide(0);
    updateSliderToggle();
    start();
  }

  const quoteSlider = document.querySelector('[data-quote-slider]');
  if (quoteSlider) {
    const quotes = [...quoteSlider.querySelectorAll('[data-quote]')];
    const dots = [...quoteSlider.querySelectorAll('[data-quote-dot]')];
    let current = 0;
    let timer = null;
    const setQuote = (index) => {
      current = (index + quotes.length) % quotes.length;
      quotes.forEach((quote, i) => {
        const active = i === current;
        quote.classList.toggle('is-active', active);
        quote.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
    };
    const start = () => {
      if (prefersReducedMotion || quotes.length < 2) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => setQuote(current + 1), 6000);
    };
    quoteSlider.querySelector('[data-quote-prev]')?.addEventListener('click', () => { setQuote(current - 1); start(); });
    quoteSlider.querySelector('[data-quote-next]')?.addEventListener('click', () => { setQuote(current + 1); start(); });
    dots.forEach((dot) => dot.addEventListener('click', () => { setQuote(Number(dot.dataset.quoteDot)); start(); }));
    quoteSlider.addEventListener('mouseenter', () => window.clearInterval(timer));
    quoteSlider.addEventListener('mouseleave', start);
    setQuote(0);
    start();
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = contactForm.querySelector('[data-form-status]');
    const submitButton = contactForm.querySelector('[type="submit"]');
    const originalButtonContent = submitButton.innerHTML;
    contactForm.addEventListener('input', () => {
      status.hidden = true;
      status.classList.remove('is-error');
    });
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      status.hidden = true;
      status.classList.remove('is-error');
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        const result = await response.json();
        if (!response.ok) {
          const details = Array.isArray(result.errors)
            ? result.errors.map((error) => error.message).filter(Boolean).join(' ')
            : '';
          throw new Error(details || `The form could not be sent (HTTP ${response.status}).`);
        }
        status.hidden = false;
        status.textContent = 'Your message has been sent. Thank you for getting in touch!';
        contactForm.reset();
      } catch (error) {
        status.hidden = false;
        status.classList.add('is-error');
        status.textContent = error instanceof Error
          ? `${error.message} Please try again or contact us by email.`
          : 'An unexpected error occurred while sending your message. Please try again.';
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    });
  }
})();
