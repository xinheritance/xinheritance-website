(function () {
  const componentMap = [
    { slotId: 'background-ambient-slot', path: 'components/background-ambient.html' },
    { slotId: 'navigation-slot', path: 'components/navigation.html' },
    { slotId: 'main-page-slot', path: 'components/main-page.html' },
    { slotId: 'privacy-page-slot', path: 'components/privacy-page.html' },
    { slotId: 'footer-slot', path: 'components/footer.html' }
  ];

  const selectors = {
    mobileMenu: 'mobile-menu',
    mainPage: 'main-page',
    privacyPage: 'privacy-page',
    contactForm: 'contactForm',
    submitBtn: 'submitBtn',
    btnText: 'btnText',
    loadingSpinner: 'loadingSpinner',
    formStatus: 'formStatus'
  };
  const enquiryConfig = {
    endpoint: (function resolveEndpoint() {
      const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      if (isLocalhost && window.location.port === '5500') {
        return 'http://127.0.0.1:8091/server/send-mail.php';
      }
      return '/server/send-mail.php';
    })(),
    minLoadingMs: 2000
  };

  function getById(id) {
    return document.getElementById(id);
  }

  function loadComponentIntoSlot(slotId, html) {
    const slot = getById(slotId);
    if (!slot) return;
    slot.outerHTML = html;
  }

  async function loadHtmlComponent(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error('Unable to load component: ' + path);
    }
    return response.text();
  }

  async function loadAllComponents() {
    const loaded = await Promise.all(componentMap.map(async function (component) {
      const html = await loadHtmlComponent(component.path);
      return { slotId: component.slotId, html: html };
    }));

    loaded.forEach(function (component) {
      loadComponentIntoSlot(component.slotId, component.html);
    });
  }

  function initAOSComponent() {
    AOS.init({
      once: true,
      offset: 50,
      duration: 800
    });
  }

  function initNavigationComponent() {
    window.toggleMobileMenu = function toggleMobileMenu() {
      const menu = getById(selectors.mobileMenu);
      menu.classList.toggle('hidden');
    };
  }

  function initPageVisibilityComponent() {
    window.showPrivacyPage = function showPrivacyPage() {
      getById(selectors.mainPage).style.display = 'none';
      getById(selectors.privacyPage).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      getById(selectors.mobileMenu).classList.add('hidden');
    };

    window.showMainPage = function showMainPage() {
      getById(selectors.privacyPage).classList.remove('active');
      getById(selectors.mainPage).style.display = 'block';
    };
  }

  function initContactFormComponent() {
    const form = getById(selectors.contactForm);
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = getById(selectors.submitBtn);
      const btnText = getById(selectors.btnText);
      const spinner = getById(selectors.loadingSpinner);
      const status = getById(selectors.formStatus);

      btnText.classList.add('opacity-0');
      spinner.classList.remove('hidden');
      btn.disabled = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Honeypot guard: bots often fill hidden fields.
      if (data.company_website && String(data.company_website).trim() !== '') {
        btnText.classList.remove('opacity-0');
        spinner.classList.add('hidden');
        btn.disabled = false;
        form.reset();
        return;
      }

      data._subject = 'New Enquiry from xinheritance.com';
      data._captcha = 'false';
      data._template = 'table';

      try {
        await Promise.all([
          fetch(enquiryConfig.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(data)
          }).then(async function (response) {
            const raw = await response.text();
            let payload = null;

            try {
              payload = raw ? JSON.parse(raw) : null;
            } catch (parseError) {
              throw new Error('Invalid server response');
            }

            if (!response.ok) {
              throw new Error((payload && payload.error) ? payload.error : 'Submission failed');
            }

            if (!payload || payload.ok !== true) {
              throw new Error((payload && payload.error) ? payload.error : 'Submission failed');
            }

            return payload;
          }),
          new Promise(function (resolve) {
            setTimeout(resolve, enquiryConfig.minLoadingMs);
          })
        ]);

        btnText.classList.remove('opacity-0');
        spinner.classList.add('hidden');
        btn.disabled = false;

        status.classList.remove('hidden', 'text-red-500');
        status.classList.add('text-green-400', 'mt-4');
        status.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent! We will contact you soon.';

        form.reset();

        setTimeout(function () {
          status.classList.add('hidden');
        }, 5000);
      } catch (error) {
        btnText.classList.remove('opacity-0');
        spinner.classList.add('hidden');
        btn.disabled = false;

        status.classList.remove('hidden', 'text-green-400');
        status.classList.add('text-red-500', 'mt-4');
        status.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Message failed to send. Please try again.';
        console.error('Error!', error.message);
      }
    });
  }

  function initSiteComponents() {
    initAOSComponent();
    initNavigationComponent();
    initPageVisibilityComponent();
    initContactFormComponent();
  }

  async function bootstrap() {
    await loadAllComponents();
    initSiteComponents();
  }

  function startBootstrap() {
    bootstrap().catch(function (error) {
      console.error(error);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBootstrap);
  } else {
    startBootstrap();
  }
})();
