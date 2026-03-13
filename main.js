/* ══════════════════════════════════════════════
   main.js — Repowering Partners (Updated)
══════════════════════════════════════════════ */

/* ── PAGE ROUTING ──────────────────────────── */

// Handle Browser Back/Forward Buttons
window.addEventListener('popstate', function() {
  var pageId = location.hash.replace('#', '') || 'home';
  renderPage(pageId);
});

// Handle clicks on internal links
function route(event, id) {
  if (event) event.preventDefault();
  history.pushState(null, null, '#' + id);
  renderPage(id);
}

// Logic to switch the view
function renderPage(id) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  // Show requested page
  var target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
  } else {
    // If ID not found, default to home
    document.getElementById('page-home').classList.add('active');
  }

  // Update pill nav active state
  document.querySelectorAll('.nav-center a').forEach(function(a) {
    a.classList.remove('active');
  });
  var activeNav = document.getElementById('nav-' + id);
  if (activeNav) activeNav.classList.add('active');

  // Always close mobile menu on navigation
  closeMobileMenu();

  // Reset contact form state when visiting contact page
  if (id === 'contact') {
    resetContactFormState();
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Trigger animations for new page
  setTimeout(observeAnimations, 80);
}


/* ── MOBILE MENU ───────────────────────────── */

function openMobileMenu() {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  if (!nav || !btn) return;

  nav.style.display = 'flex';
  nav.getBoundingClientRect(); // Force reflow
  nav.classList.add('open');
  btn.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  if (!nav || !btn) return;

  nav.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');

  setTimeout(function() {
    if (!nav.classList.contains('open')) {
      nav.style.display = 'none';
    }
  }, 320);
}

function toggleMobileMenu() {
  var nav = document.getElementById('mobileNav');
  if (!nav) return;

  if (nav.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

// Close on outside tap
document.addEventListener('click', function(e) {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  if (nav && btn && nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close on desktop resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 960) {
    closeMobileMenu();
    var nav = document.getElementById('mobileNav');
    if (nav) nav.style.display = 'none';
  }
});


/* ── SCROLL EFFECTS ────────────────────────── */

window.addEventListener('scroll', function() {
  var navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  observeAnimations();
}, { passive: true });

function currentPageId() {
  var active = document.querySelector('.page.active');
  return active ? active.id.replace('page-', '') : 'home';
}

function observeAnimations() {
  var pageEl = document.getElementById('page-' + currentPageId());
  if (!pageEl) return;

  var els = pageEl.querySelectorAll(
    '[data-animate]:not(.visible), [data-animate-left]:not(.visible), [data-animate-right]:not(.visible)'
  );

  els.forEach(function(el, i) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
      var delay = Math.min(i * 0.07, 0.4);
      el.style.transitionDelay = delay + 's';
      el.classList.add('visible');
    }
  });
}


/* ── CONTACT FORM ──────────────────────────── */

function getContactForm() {
  return document.getElementById('contactForm') || document.getElementById('contact-form');
}

function getFormStatusEl() {
  return document.getElementById('form-status');
}

function getSuccessEl() {
  return document.getElementById('successMsg');
}

function setFormStatus(message, type) {
  var status = getFormStatusEl();
  var success = getSuccessEl();

  if (status) {
    status.textContent = message || '';
    if (type === 'success') {
      status.style.color = '#2e7d32';
    } else if (type === 'error') {
      status.style.color = '#b00020';
    } else {
      status.style.color = '';
    }
  }

  // If there is only a success message container, use it for success only
  if (success && type === 'success') {
    success.classList.add('show');
  }
}

function resetContactFormState() {
  var form = getContactForm();
  var success = getSuccessEl();
  var status = getFormStatusEl();
  var btn = form ? form.querySelector('button[type="submit"], .form-submit') : null;

  if (form) {
    form.style.display = '';
  }

  if (success) {
    success.classList.remove('show');
  }

  if (status) {
    status.textContent = '';
    status.style.color = '';
  }

  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.background = '';
  }
}

async function handleSubmit(e) {
  if (e) e.preventDefault();

  var form = getContactForm();
  var success = getSuccessEl();
  var status = getFormStatusEl();

  if (!form) return;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  var action = form.getAttribute('action') || '';
  var btn = form.querySelector('button[type="submit"], .form-submit');
  var originalText = btn ? btn.textContent : '';

  if (!action || action.indexOf('YOUR_FORM_ID') !== -1) {
    setFormStatus('Add your real Formspree form URL to the form action first.', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending...';
    btn.style.opacity = '0.8';
  }

  if (status) {
    status.textContent = '';
    status.style.color = '';
  }

  try {
    var response = await fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      form.reset();

      if (btn) {
        btn.textContent = '✓ Received';
        btn.style.background = '#4CAF50';
      }

      if (success) {
        form.style.display = 'none';
        success.classList.add('show');
      }

      if (status) {
        setFormStatus('Thanks — your submission was sent successfully.', 'success');
      }
    } else {
      var result = null;
      try {
        result = await response.json();
      } catch (jsonError) {}

      var message = 'Something went wrong. Please try again.';
      if (result && result.errors && result.errors.length && result.errors[0].message) {
        message = result.errors[0].message;
      }

      setFormStatus(message, 'error');

      if (btn) {
        btn.textContent = originalText;
      }
    }
  } catch (error) {
    setFormStatus('Network error. Please try again.', 'error');

    if (btn) {
      btn.textContent = originalText;
    }
  }

  setTimeout(function() {
    if (btn && (!success || !success.classList.contains('show'))) {
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.opacity = '1';
      btn.style.background = '';
    }
  }, 3000);
}


/* ── INIT ──────────────────────────────────── */

window.addEventListener('load', function() {
  // 1. Mobile nav setup
  var nav = document.getElementById('mobileNav');
  if (nav) nav.style.display = 'none';

  // 2. Attach form handler only if the form does not already use inline onsubmit
  var form = getContactForm();
  if (form && !form.getAttribute('onsubmit')) {
    form.addEventListener('submit', handleSubmit);
  }

  // 3. Initial Page Load based on URL Hash
  var initialPage = location.hash.replace('#', '') || 'home';
  renderPage(initialPage);

  // 4. Initial animations
  setTimeout(observeAnimations, 100);
});