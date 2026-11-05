(() => {
  const storageKey = 'house-of-david-theme';
  const themeToggle = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('#theme-color');
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');

  const updateThemeControls = (theme) => {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun" aria-hidden="true"></i><span class="sr-only">Switch to light theme</span>'
      : '<i class="fa-solid fa-moon" aria-hidden="true"></i><span class="sr-only">Switch to dark theme</span>';
    if (themeColor) themeColor.setAttribute('content', isDark ? '#101713' : '#fffdf9');
  };

  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    updateThemeControls(theme);
    try { localStorage.setItem(storageKey, theme); } catch (error) {}
  };

  updateThemeControls(document.documentElement.dataset.theme || 'light');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  const closeMobileNav = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
      const button = dropdown.querySelector('.nav-dropdown-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const isOpen = nav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileNav));
  }

  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('.nav-dropdown-toggle');
    if (!button) return;
    button.addEventListener('click', event => {
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(other => {
        if (other !== dropdown) {
          other.classList.remove('open');
          const otherButton = other.querySelector('.nav-dropdown-toggle');
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        }
      });
      dropdown.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
        const button = dropdown.querySelector('.nav-dropdown-toggle');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    }
  });

  const lightbox = document.querySelector('.gallery-lightbox');
  if (lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
    const closeLightbox = lightbox.querySelector('.gallery-lightbox-close');
    let lastTrigger = null;
    const closeViewer = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger) lastTrigger.focus();
    };
    document.querySelectorAll('.full-gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lastTrigger = item;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = item.dataset.caption || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeLightbox.focus();
      });
    });
    closeLightbox.addEventListener('click', closeViewer);
    lightbox.addEventListener('click', event => { if (event.target === lightbox) closeViewer(); });
    lightbox._closeViewer = closeViewer;
  }

  const encodeMail = (subject, body) => {
    window.location.href = `mailto:houseofdavidolympia@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const data = new FormData(contactForm);
      const body = [
        'Hello House of David AFH,', '',
        'I am contacting you through the House of David website.', '',
        `Name: ${data.get('name') || ''}`,
        `Phone: ${data.get('phone') || 'Not provided'}`,
        `Email: ${data.get('email') || ''}`,
        `Topic: ${data.get('topic') || ''}`, '',
        'Message:', data.get('message') || '', '',
        'Thank you.'
      ].join('\n');
      encodeMail(`Website inquiry from ${data.get('name') || 'a prospective family'}`, body);
    });
  }

  const tourForm = document.querySelector('#tour-form');
  const tourDate = document.querySelector('#tour-date');
  if (tourDate) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    tourDate.min = localDate;
  }
  if (tourForm) {
    tourForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!tourForm.reportValidity()) return;
      const data = new FormData(tourForm);
      const rawDate = data.get('date');
      let friendlyDate = rawDate || '';
      if (rawDate) {
        const [year, month, day] = rawDate.split('-').map(Number);
        friendlyDate = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
          .format(new Date(year, month - 1, day));
      }
      const body = [
        'Hello House of David AFH,', '',
        'I would like to request a tour of the Olympia home.', '',
        `Name: ${data.get('name') || ''}`,
        `Phone: ${data.get('phone') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Preferred date: ${friendlyDate}`,
        `Preferred time: ${data.get('time') || ''}`,
        `Seeking care for: ${data.get('relationship') || ''}`, '',
        'Additional information:', data.get('message') || 'None provided', '',
        'Please let me know whether this date and time can be confirmed.', '',
        'Thank you.'
      ].join('\n');
      encodeMail(`Tour request - ${friendlyDate || 'House of David AFH'}`, body);
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (lightbox && lightbox.classList.contains('open') && lightbox._closeViewer) {
      lightbox._closeViewer();
      return;
    }
    document.querySelectorAll('.nav-dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
      const button = dropdown.querySelector('.nav-dropdown-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
    if (nav && nav.classList.contains('open')) {
      closeMobileNav();
      menuToggle.focus();
    }
  });
})();

/* ---------------------------------------------------------
   Motion enhancements
   --------------------------------------------------------- */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const themeToggle = document.querySelector('.theme-toggle');

  // Give the sticky header a little depth only after the page starts moving.
  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // Brief icon motion when the visitor changes theme.
  if (themeToggle && !reduceMotion) {
    themeToggle.addEventListener('click', () => {
      themeToggle.classList.remove('theme-changing');
      void themeToggle.offsetWidth;
      themeToggle.classList.add('theme-changing');
      window.setTimeout(() => themeToggle.classList.remove('theme-changing'), 460);
    });
  }

  const groups = [
    { selector: '.hero-copy > *', variant: '', step: 85 },
    { selector: '.hero-visual', variant: 'reveal-scale', step: 0 },
    { selector: '.intro-grid > *', variant: '', step: 120 },
    { selector: '.section-heading > *', variant: '', step: 90 },
    { selector: '.service-card', variant: '', step: 65 },
    { selector: '.about-grid > *', variant: '', step: 120 },
    { selector: '.care-heading', variant: '', step: 0 },
    { selector: '.condition-layout > *', variant: '', step: 100 },
    { selector: '.providers-grid > *', variant: '', step: 120 },
    { selector: '.gallery-heading-copy', variant: '', step: 0 },
    { selector: '.gallery-preview-item', variant: 'reveal-scale', step: 70 },
    { selector: '.gallery-preview-action', variant: '', step: 0 },
    { selector: '.location-grid .location-card', variant: '', step: 100 },
    { selector: '.location-map-wrap', variant: 'reveal-scale', step: 0 },
    { selector: '.faq-layout > *', variant: '', step: 110 },
    { selector: '.cta-inner > *', variant: '', step: 100 },
    { selector: '.footer-grid > *', variant: '', step: 80 },
    { selector: '.gallery-page-hero .container > *', variant: '', step: 90 },
    { selector: '.full-gallery-item', variant: 'reveal-scale', step: 60 },
    { selector: '.inner-page-hero-grid > *', variant: '', step: 120 },
    { selector: '.contact-page-grid > *', variant: '', step: 100 },
    { selector: '.tour-page-grid > *', variant: '', step: 100 },
    { selector: '.tour-steps > div', variant: '', step: 75 },
    { selector: '.tour-location-inner > *', variant: '', step: 90 },
    { selector: '.contact-map-section .location-map-wrap', variant: 'reveal-scale', step: 0 }
  ];

  const revealElements = new Set();

  groups.forEach(group => {
    document.querySelectorAll(group.selector).forEach((element, index) => {
      element.classList.add('reveal');
      if (group.variant) element.classList.add(group.variant);
      if (group.step) element.style.setProperty('--reveal-delay', `${Math.min(index * group.step, 360)}ms`);
      revealElements.add(element);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -55px 0px'
  });

  revealElements.forEach(element => observer.observe(element));
})();

/* ---------------------------------------------------------
   Website inquiry popup for CSparks Developers
   --------------------------------------------------------- */
(() => {
  const intervalMs = 10 * 60 * 1000;
  const lastShownKey = 'csparks-website-popup-last-shown';
  const whatsappNumber = '254743362677';
  const whatsappMessage = 'Hello, I saw the House of David website and I would like a website like this.';
  const emailAddress = 'reinherd2001@gmail.com';

  const overlay = document.createElement('div');
  overlay.className = 'website-inquiry-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="website-inquiry-popup" role="dialog" aria-modal="true" aria-labelledby="website-inquiry-title" aria-describedby="website-inquiry-description">
      <button class="website-inquiry-close" type="button" aria-label="Close website inquiry popup">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <div class="website-inquiry-icon" aria-hidden="true"><i class="fa-solid fa-code"></i></div>
      <span class="eyebrow">Like what you see?</span>
      <h2 id="website-inquiry-title">Want a website like this?</h2>
      <p id="website-inquiry-description">Let’s build a professional website for your business. Message us on WhatsApp or note the email below.</p>
      <div class="website-inquiry-actions">
        <a class="website-inquiry-action whatsapp" href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          <span>WhatsApp</span>
        </a>
        <div class="website-inquiry-action email email-readonly" aria-label="Email address ${emailAddress}">
          <i class="fa-solid fa-envelope" aria-hidden="true"></i>
          <span class="email-readonly-content">
            <strong>Email</strong>
            <small>${emailAddress}</small>
          </span>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector('.website-inquiry-close');
  const popup = overlay.querySelector('.website-inquiry-popup');
  let lastFocusedElement = null;
  let timerId = null;

  const readLastShown = () => {
    try {
      const value = Number(localStorage.getItem(lastShownKey));
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch (error) {
      return null;
    }
  };

  const writeLastShown = (timestamp) => {
    try { localStorage.setItem(lastShownKey, String(timestamp)); } catch (error) {}
  };

  const scheduleNext = () => {
    if (timerId) window.clearTimeout(timerId);
    const lastShown = readLastShown();
    const now = Date.now();

    // On a visitor's first page view, start the ten-minute clock now.
    if (!lastShown) {
      writeLastShown(now);
      timerId = window.setTimeout(showPopup, intervalMs);
      return;
    }

    const elapsed = now - lastShown;
    const delay = Math.max(500, intervalMs - elapsed);
    timerId = window.setTimeout(showPopup, delay);
  };

  const showPopup = () => {
    if (overlay.classList.contains('is-open')) {
      timerId = window.setTimeout(showPopup, intervalMs);
      return;
    }

    lastFocusedElement = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    writeLastShown(Date.now());
    window.setTimeout(() => closeButton.focus(), 40);
  };

  const closePopup = () => {
    if (!overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    writeLastShown(Date.now());
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    scheduleNext();
  };

  closeButton.addEventListener('click', closePopup);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closePopup();
  });

  document.addEventListener('keydown', event => {
    if (!overlay.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closePopup();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = popup.querySelectorAll('button, a[href]');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  scheduleNext();
})();

/* ---------------------------------------------------------
   Floating WhatsApp shortcut for House of David / David
   --------------------------------------------------------- */
(() => {
  const davidWhatsAppNumber = '13023390579';
  const davidWhatsAppMessage = 'Hello David, I visited the House of David AFH website and would like to learn more about your care services.';

  const floatingLink = document.createElement('a');
  floatingLink.className = 'david-whatsapp-float';
  floatingLink.href = `https://wa.me/${davidWhatsAppNumber}?text=${encodeURIComponent(davidWhatsAppMessage)}`;
  floatingLink.target = '_blank';
  floatingLink.rel = 'noopener noreferrer';
  floatingLink.setAttribute('aria-label', 'Chat with David on WhatsApp about House of David AFH');
  floatingLink.title = 'Chat with David on WhatsApp';
  floatingLink.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>';

  document.body.appendChild(floatingLink);
})();
