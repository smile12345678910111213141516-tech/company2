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

  // Scroll to top
  window.scrollTo(0, 0);

  // Trigger animations for new page
  setTimeout(observeAnimations, 80);
}


/* ── MOBILE MENU ───────────────────────────── */

function openMobileMenu() {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  nav.style.display = 'flex';
  nav.getBoundingClientRect(); // Force reflow
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

// Close on outside tap
document.addEventListener('click', function(e) {
  var nav = document.getElementById('mobileNav');
  var btn = document.getElementById('mobileMenuBtn');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close on desktop resize
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

async function handleSubmit(e) {
  e.preventDefault();

  var form = document.getElementById('contactForm');
  var success = document.getElementById('successMsg');
  
  // Simple HTML5 validation check
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  var data = new FormData(form);
  var action = form.action;

  // Check if Formspree action is set (not placeholder)
  if (action && !action.includes('YOUR_FORMSPREE_ID')) {
    try {
      const response = await fetch(action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        showSuccess(form, success);
      } else {
        alert("There was a problem submitting your form. Please try again.");
      }
    } catch (error) {
       // Fallback for demo or network error
       console.error('Submission error:', error);
       alert("Error connecting to form service.");
    }
  } else {
    // Demo Mode: If no backend is configured, just show success
    console.log("Demo submission success");
    showSuccess(form, success);
  }
}

function showSuccess(form, successEl) {
  form.style.display = 'none';
  successEl.classList.add('show');
}


/* ── INIT ──────────────────────────────────── */

window.addEventListener('load', function() {
  // 1. Mobile nav setup
  var nav = document.getElementById('mobileNav');
  if (nav) nav.style.display = 'none';

  // 2. Initial Page Load based on URL Hash
  var initialPage = location.hash.replace('#', '') || 'home';
  renderPage(initialPage);

  // 3. Initial animations
  setTimeout(observeAnimations, 100);
});