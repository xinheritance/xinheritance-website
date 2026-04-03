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
    formStatus: 'formStatus',
    productsGrid: 'productsGrid'
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
  const seoMetaByPage = {
    main: {
      title: 'Xinheritance | Future of SaaS — xSplito, XLabTool & Shopify Plugins',
      description: 'Xinheritance is a top-tier software company building next-gen SaaS products. Discover xSplito, XLabTool, and powerful Shopify plugins.',
      keywords: 'Xinheritance, SaaS company, xSplito, XLabTool, Shopify plugins, developer tools',
      ogTitle: 'Xinheritance | Future of SaaS — xSplito, XLabTool & Shopify Plugins',
      ogDescription: "We build SaaS tools that don't just work—they evolve. From smart expense management to developer toolkits and Shopify powerhouses.",
      ogUrl: 'https://xinheritance.com/',
      twitterTitle: 'Xinheritance | Future of SaaS',
      twitterDescription: "We build SaaS tools that don't just work—they evolve. xSplito, XLabTool & Shopify Plugins.",
      canonical: 'https://xinheritance.com/'
    },
    privacy: {
      title: 'Privacy Policy | Xinheritance',
      description: 'Read the official Xinheritance privacy policy covering data collection, usage, retention, and user rights.',
      keywords: 'Xinheritance privacy policy, data protection, cookies, user rights, GDPR',
      ogTitle: 'Privacy Policy | Xinheritance',
      ogDescription: 'Learn how Xinheritance collects, uses, stores, and protects your information across our services.',
      ogUrl: 'https://xinheritance.com/#privacy',
      twitterTitle: 'Privacy Policy | Xinheritance',
      twitterDescription: 'Understand how your data is handled at Xinheritance.',
      canonical: 'https://xinheritance.com/'
    }
  };

  function getById(id) {
    return document.getElementById(id);
  }

  function setMetaByAttribute(attr, key, value) {
    const el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (el) {
      el.setAttribute('content', value);
    }
  }

  function setCanonical(url) {
    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url);
    }
  }

  function applySeoMeta(pageKey) {
    const meta = seoMetaByPage[pageKey] || seoMetaByPage.main;
    document.title = meta.title;
    setMetaByAttribute('name', 'title', meta.title);
    setMetaByAttribute('name', 'description', meta.description);
    setMetaByAttribute('name', 'keywords', meta.keywords);
    setMetaByAttribute('property', 'og:title', meta.ogTitle);
    setMetaByAttribute('property', 'og:description', meta.ogDescription);
    setMetaByAttribute('property', 'og:url', meta.ogUrl);
    setMetaByAttribute('name', 'twitter:title', meta.twitterTitle);
    setMetaByAttribute('name', 'twitter:description', meta.twitterDescription);
    setCanonical(meta.canonical);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProductsData() {
    if (Array.isArray(window.XINHERITANCE_PRODUCTS)) {
      return window.XINHERITANCE_PRODUCTS;
    }
    return [];
  }

  function renderProductCards(products) {
    const grid = getById(selectors.productsGrid);
    if (!grid) return;

    grid.innerHTML = products.map(function (product, index) {
      const highlights = product.card.highlights.map(function (item) {
        return '<li class="flex items-center"><i class="fas fa-check ' + product.card.checksColorClass + ' mr-2"></i> ' + escapeHtml(item) + '</li>';
      }).join('');

      return (
        '<div class="glass-card rounded-2xl p-8 relative overflow-hidden group" data-aos="fade-up" data-aos-delay="' + (index * 100) + '">' +
          '<div class="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl transition-all ' + product.card.glowClass + '"></div>' +
          '<div class="w-12 h-12 rounded-lg bg-gradient-to-br ' + product.card.iconGradient + ' flex items-center justify-center mb-6">' +
            '<i class="' + product.card.iconClass + ' text-white text-xl"></i>' +
          '</div>' +
          '<h3 class="text-2xl font-display font-bold mb-1">' + escapeHtml(product.card.name) + '</h3>' +
          '<p class="text-brand-cyan text-xs uppercase tracking-wider mb-3">' + escapeHtml(product.card.tagline) + '</p>' +
          '<p class="text-gray-400 text-sm mb-6 leading-relaxed">' + escapeHtml(product.card.shortDescription) + '</p>' +
          '<ul class="text-sm text-gray-300 space-y-2 mb-6">' + highlights + '</ul>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
            '<a href="' + escapeHtml(product.detailPagePath || '#') + '" class="block w-full text-center py-2 rounded-lg border border-brand-cyan/40 hover:bg-brand-cyan/10 transition-colors text-sm font-semibold">View Details</a>' +
            '<a href="' + escapeHtml(product.websiteUrl) + '" target="_blank" rel="noopener noreferrer" class="block w-full text-center py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold">' + escapeHtml(product.card.websiteLabel) + ' <i class="fas fa-external-link-alt ml-1 text-xs"></i></a>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function initProductsComponent() {
    const products = getProductsData();
    if (!products.length) return;

    const productsGrid = getById(selectors.productsGrid);
    if (!productsGrid) return;

    renderProductCards(products);
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
    function activatePrivacyPage(pushHash) {
      getById(selectors.mainPage).style.display = 'none';
      getById(selectors.privacyPage).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      getById(selectors.mobileMenu).classList.add('hidden');
      applySeoMeta('privacy');

      if (pushHash) {
        window.history.pushState(null, '', '#privacy');
      }
    }

    function activateMainPage(pushHash) {
      getById(selectors.privacyPage).classList.remove('active');
      getById(selectors.mainPage).style.display = 'block';
      applySeoMeta('main');

      if (pushHash && window.location.hash === '#privacy') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }

    window.showPrivacyPage = function showPrivacyPage() {
      activatePrivacyPage(true);
    };

    window.showMainPage = function showMainPage() {
      activateMainPage(true);
    };

    if (window.location.hash === '#privacy') {
      activatePrivacyPage(false);
    } else {
      activateMainPage(false);
    }
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
    initProductsComponent();
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
