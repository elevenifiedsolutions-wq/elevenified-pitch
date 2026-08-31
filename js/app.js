/* ==========================================================================
   Elevenified Vision — Core Application Logic
   Navigation, FAQ Accordion, Pilot Intake Modal, and Analytics Telemetry
   ========================================================================== */

(function () {
  'use strict';

  // 1. Sticky Navigation & Scroll Spy
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }

      // Scroll Spy
      let currentSection = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        const height = section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    });

    // Mobile Toggle
    const toggleBtn = document.querySelector('.mobile-toggle');
    const navLinksWrapper = document.querySelector('.nav-links-wrapper');
    const navMenu = document.querySelector('.nav-menu');
    if (toggleBtn && navLinksWrapper) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = navLinksWrapper.classList.contains('mobile-open');
        if (isOpen) {
          navLinksWrapper.classList.remove('mobile-open');
          navLinksWrapper.style.display = '';
        } else {
          navLinksWrapper.classList.add('mobile-open');
          navLinksWrapper.style.display = 'flex';
          navLinksWrapper.style.flexDirection = 'column';
          navLinksWrapper.style.position = 'absolute';
          navLinksWrapper.style.top = '68px';
          navLinksWrapper.style.left = '0';
          navLinksWrapper.style.right = '0';
          navLinksWrapper.style.background = '#0c0e12';
          navLinksWrapper.style.padding = '20px 28px';
          navLinksWrapper.style.borderBottom = '1px solid #29303d';
          if (navMenu) {
            navMenu.style.flexDirection = 'column';
            navMenu.style.alignItems = 'flex-start';
            navMenu.style.gap = '14px';
          }
        }
      });

      // Close mobile menu when a nav link is clicked
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (navLinksWrapper.classList.contains('mobile-open')) {
            navLinksWrapper.classList.remove('mobile-open');
            navLinksWrapper.style.display = '';
          }
        });
      });
    }
  }

  // 2. Interactive FAQ Accordion
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close others
        faqItems.forEach(other => {
          other.classList.remove('open');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          trackEvent('faq_opened', { question: question.textContent.trim() });
        }
      });
    });
  }

  // 3. Founding Pilot Intake Modal
  function initPilotModal() {
    const modal = document.getElementById('pilotModal');
    const openBtns = document.querySelectorAll('[data-open-pilot-modal]');
    const closeBtn = document.getElementById('closePilotModal');
    const form = document.getElementById('pilotIntakeForm');
    const successBanner = document.getElementById('intakeSuccessBanner');

    if (!modal) return;

    function openModal() {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      trackEvent('pilot_modal_opened');
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Formatting Application Email...';
        }

        const fullName = document.getElementById('intakeName')?.value || '';
        const company = document.getElementById('intakeCompany')?.value || '';
        const roleSelect = document.getElementById('intakeRole');
        const role = roleSelect?.options[roleSelect.selectedIndex]?.text || '';
        const industrySelect = document.getElementById('intakeIndustry');
        const industry = industrySelect?.options[industrySelect.selectedIndex]?.text || '';
        const process = document.getElementById('intakeProcess')?.value || '';
        const workEmail = document.getElementById('intakeEmail')?.value || '';
        const timestamp = new Date().toISOString();

        const formData = {
          fullName,
          company,
          role,
          industry,
          process,
          workEmail,
          timestamp
        };

        const emailRecipient = 'siddharth@elevenified.com';
        const emailSubject = `Elevenified-Vision Pilot Application — ${company}`;
        const emailBody = [
          `Hello Siddharth,`,
          ``,
          `I would like to apply for the Elevenified-Vision Founding Pilot Program. Here are our details:`,
          ``,
          `• Full Name: ${fullName}`,
          `• Company: ${company}`,
          `• Role: ${role}`,
          `• Industry: ${industry}`,
          `• Process to evaluate: ${process}`,
          `• Work Email: ${workEmail}`,
          `• Submitted At: ${timestamp}`,
          ``,
          `Looking forward to discussing fit.`,
          ``,
          `Best regards,`,
          `${fullName}`
        ].join('\n');

        const mailtoUrl = `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Trigger email client directly
        setTimeout(() => {
          try {
            window.location.href = mailtoUrl;
          } catch (err) {
            console.warn('Mailto link navigation caught:', err);
          }

          form.style.display = 'none';
          if (successBanner) {
            successBanner.style.display = 'block';
            const fallbackContainer = document.getElementById('fallbackMailtoContainer');
            if (fallbackContainer) {
              fallbackContainer.innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                  <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="text-decoration:none;">✉ Open in Email Client</a>
                  <button type="button" id="copyEmailDetailsBtn" class="btn btn-secondary btn-sm">📋 Copy Application Details</button>
                </div>
                <div id="copyNotice" style="display:none; font-size:0.8rem; color:var(--cyan); margin-top:8px;">✓ Copied details to clipboard! Send to siddharth@elevenified.com</div>
              `;
              const copyBtn = document.getElementById('copyEmailDetailsBtn');
              if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                  navigator.clipboard.writeText(emailBody).then(() => {
                    const notice = document.getElementById('copyNotice');
                    if (notice) notice.style.display = 'block';
                  });
                });
              }
            }
          }
          trackEvent('pilot_application_submitted', formData);
        }, 500);
      });
    }
  }

  // 4. Lightweight Privacy-First Event Tracking
  function trackEvent(eventName, payload = {}) {
    try {
      const eventData = { event: eventName, ...payload, url: window.location.href, ts: Date.now() };
      window.dispatchEvent(new CustomEvent('elevenified_vision_analytics', { detail: eventData }));
      // Optional debug logging in console
      console.log(`[Elevenified Analytics] ${eventName}`, payload);
    } catch (err) {
      // Fail silently
    }
  }

  // 5. Before/After Toggle
  function initBeforeAfter() {
    const tabs = document.querySelectorAll('.ba-tab');
    const panels = document.querySelectorAll('.ba-panel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-panel');
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.getElementById('ba-panel-' + target);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  // 6. Feature Status Filter Tabs
  function initFeatureFilter() {
    const filterBtns = document.querySelectorAll('.feature-filter-btn');
    const cards = document.querySelectorAll('.wall-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        cards.forEach(card => {
          const status = card.getAttribute('data-status');
          if (filter === 'all' || status === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
        trackEvent('feature_filter_changed', { filter });
      });
    });
  }

  // 7. Progressive Technical Disclosure
  function initTechDisclosure() {
    const btn = document.getElementById('techDisclosureBtn');
    const content = document.getElementById('techDisclosureContent');
    if (!btn || !content) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      content.classList.toggle('open', !isOpen);
    });
  }

  // 8. Floating Sticky CTA
  function initFloatingCta() {
    const cta = document.getElementById('floatingCta');
    const closeBtn = document.getElementById('floatingCtaClose');
    const pilotSection = document.getElementById('pilot');
    if (!cta) return;

    let dismissed = false;

    window.addEventListener('scroll', () => {
      if (dismissed) return;
      const scrollY = window.scrollY;

      // Show after 600px scroll
      if (scrollY > 600) {
        // Hide when pilot section is in viewport
        if (pilotSection) {
          const rect = pilotSection.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            cta.classList.remove('visible');
            cta.setAttribute('aria-hidden', 'true');
            return;
          }
        }
        cta.classList.add('visible');
        cta.setAttribute('aria-hidden', 'false');
      } else {
        cta.classList.remove('visible');
        cta.setAttribute('aria-hidden', 'true');
      }
    }, { passive: true });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissed = true;
        cta.classList.add('dismissed');
        trackEvent('floating_cta_dismissed');
      });
    }

    // Clicking the link also opens the modal
    const ctaLink = cta.querySelector('.floating-cta-link');
    if (ctaLink) {
      ctaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('pilotModal');
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
          trackEvent('pilot_modal_opened', { source: 'floating_cta' });
        }
      });
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initFAQ();
    initPilotModal();
    initBeforeAfter();
    initFeatureFilter();
    initTechDisclosure();
    initFloatingCta();
  });
})();
