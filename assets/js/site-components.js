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
      title: 'Inherit the Digital Future | Xinheritance',
      description: 'We are a next gen SaaS development company building tools that don\'t just work—they evolve. From smart expense management to Shopify powerhouses to developer toolkits.',
      keywords: 'Xinheritance, SaaS development, xSplito, XLabTool, Shopify plugins, developer tools',
      ogTitle: 'Inherit the Digital Future | Xinheritance',
      ogDescription: "We build SaaS tools that don't just work—they evolve. From smart expense management to developer toolkits and Shopify powerhouses.",
      ogUrl: 'https://xinheritance.com/',
      twitterTitle: 'Inherit the Digital Future | Xinheritance',
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
        return '<li class="flex items-start gap-3"><i class="fas fa-check mt-1"></i><span>' + escapeHtml(item) + '</span></li>';
      }).join('');

      var accentClass = 'product-card-accent-purple';
      if (product.slug === 'xsplito') {
        accentClass = 'product-card-accent-green';
      } else if (product.slug === 'xlabtool') {
        accentClass = 'product-card-accent-pink';
      }

      return (
        '<article class="product-card ' + accentClass + '">' +
          '<div class="product-icon">' +
            '<i class="' + product.card.iconClass + '"></i>' +
          '</div>' +
          '<h3 class="product-title">' + escapeHtml(product.card.name) + '</h3>' +
          '<p class="product-tag mt-2">' + escapeHtml(product.card.tagline) + '</p>' +
          '<p class="product-body">' + escapeHtml(product.card.shortDescription) + '</p>' +
          '<ul class="product-list">' + highlights + '</ul>' +
          '<div class="product-actions">' +
            '<a href="' + escapeHtml(product.detailPagePath || '#') + '" class="button-subtle button-subtle-light">View Details <i class="fas fa-arrow-right ml-2 text-xs"></i></a>' +
            '<a href="' + escapeHtml(product.websiteUrl) + '" target="_blank" rel="noopener noreferrer" class="button-subtle button-subtle-accent">' + escapeHtml(product.card.websiteLabel) + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function initProductsComponent() {
    const products = getProductsData();
    if (!products.length) return;

    const productsGrid = getById(selectors.productsGrid);
    if (!productsGrid) return;

    renderProductCards(products);
    if (window.AOS && typeof window.AOS.refreshHard === 'function') {
      window.AOS.refreshHard();
    }
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
    // Scroll animations disabled to fix visibility while keeping UX simple
    AOS.init({
      disable: true
    });
  }

  function initNavigationComponent() {
    const nav = getById('siteNav');

    function syncNavState() {
      if (!nav) return;
      if (window.scrollY > 16) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }

    syncNavState();
    window.addEventListener('scroll', syncNavState, { passive: true });

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
