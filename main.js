/* ══════════════════════════════════════════════
   main.js — Repowering Partners (Updated)
══════════════════════════════════════════════ */

/* ── PAGE ROUTING ──────────────────────────── */

window.addEventListener('popstate', function() {
  var pageId = location.hash.replace('#', '') || 'home';
  renderPage(pageId);
});

function route(event, id) {
  if (event) event.preventDefault();
  history.pushState(null, null, '#' + id);
  renderPage(id);
}

function renderPage(id) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  var target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
  } else {
    document.getElementById('page-home').classList.add('active');
  }

  document.querySelectorAll('.nav-center a').forEach(function(a) {
    a.classList.remove('active');
  });
  var activeNav = document.getElementById('nav-' + id);
  if (activeNav) activeNav.classList.add('active');

  closeMobileMenu();
  window.scrollTo(0, 0);
  setTimeout(observeAnimations, 80);
}


/* ── MOBILE MENU ───────────────────────────── */

function openMobileMenu() {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  nav.style.display = 'flex';
  nav.getBoundingClientRect();
  nav.classList.add('open');
  btn.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
}

function closeMobileMenu() {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
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
  if (nav.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

document.addEventListener('click', function(e) {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

window.addEventListener('resize', function() {
  if (window.innerWidth > 960) {
    closeMobileMenu();
    document.getElementById('mobileNav').style.display = 'none';
  }
});


/* ── SCROLL EFFECTS ────────────────────────── */

window.addEventListener('scroll', function() {
  var navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
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
    '[data-animate]:not(.visible), [data-animate-left]:not(.visible)'
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
/*
   BUG FIX: The previous code defined a handleSubmit() function but never
   attached it to the form — the form used a native HTML action (Formspree),
   which bypasses JS entirely and navigates away on submit. This prevented
   the in-page success message from ever showing.

   Fix: intercept submit via addEventListener, POST via fetch (AJAX), and
   show the success state in-page on a 200 response.
*/

function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var statusEl  = document.getElementById('form-status');

    // Disable button to prevent double-submit
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }
    if (statusEl) statusEl.textContent = '';

    try {
      var response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Show success state
        form.style.display = 'none';
        var successMsg = document.getElementById('successMsg');
        if (successMsg) successMsg.classList.add('show');
      } else {
        // Parse Formspree error if available
        var data = await response.json().catch(function() { return {}; });
        var errMsg = (data && data.errors)
          ? data.errors.map(function(err) { return err.message; }).join(', ')
          : 'Something went wrong. Please try again.';
        if (statusEl) statusEl.textContent = errMsg;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit for Review';
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      if (statusEl) statusEl.textContent = 'Network error. Please check your connection and try again.';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit for Review';
      }
    }
  });
}


/* ── INIT ──────────────────────────────────── */

window.addEventListener('load', function() {
  var nav = document.getElementById('mobileNav');
  if (nav) nav.style.display = 'none';

  var initialPage = location.hash.replace('#', '') || 'home';
  renderPage(initialPage);

  setTimeout(observeAnimations, 100);

  // Wire up contact form
  initContactForm();
});