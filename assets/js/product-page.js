(function () {
  function getById(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function applyProductSeo(product) {
    const meta = product.seo || {};
    if (meta.title) {
      document.title = meta.title;
      setMetaByAttribute('name', 'title', meta.title);
    }
    if (meta.description) setMetaByAttribute('name', 'description', meta.description);
    if (meta.keywords) setMetaByAttribute('name', 'keywords', meta.keywords);
    if (meta.ogTitle) setMetaByAttribute('property', 'og:title', meta.ogTitle);
    if (meta.ogDescription) setMetaByAttribute('property', 'og:description', meta.ogDescription);
    if (meta.ogUrl) setMetaByAttribute('property', 'og:url', meta.ogUrl);
    if (meta.twitterTitle) setMetaByAttribute('name', 'twitter:title', meta.twitterTitle);
    if (meta.twitterDescription) setMetaByAttribute('name', 'twitter:description', meta.twitterDescription);
    if (meta.canonical) setCanonical(meta.canonical);
  }

  function renderDetail(product) {
    const mount = getById('productDetailMount');
    if (!mount) return;

    const sections = product.details.sections.map(function (section) {
      const paragraphs = section.paragraphs.map(function (paragraph) {
        return '<p class="text-gray-300 leading-relaxed">' + escapeHtml(paragraph) + '</p>';
      }).join('');

      return (
        '<div class="space-y-4">' +
          '<h3 class="text-2xl font-display font-bold text-white">' + escapeHtml(section.heading) + '</h3>' +
          '<div class="space-y-4">' + paragraphs + '</div>' +
        '</div>'
      );
    }).join('');

    mount.innerHTML =
      '<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28">' +
        '<div class="glass-card rounded-3xl p-6 md:p-10 border border-white/10">' +
          '<a href="/#products" class="mb-8 inline-flex items-center gap-2 text-brand-cyan hover:text-white transition-colors text-sm font-semibold">' +
            '<i class="fas fa-arrow-left"></i> Back to Products' +
          '</a>' +
          '<div class="space-y-8">' +
            '<div>' +
              '<h1 class="text-3xl md:text-5xl font-display font-bold mb-3">' + escapeHtml(product.details.heroTitle) + '</h1>' +
              '<p class="text-gray-400 text-base md:text-lg leading-relaxed">' + escapeHtml(product.details.heroSummary) + '</p>' +
            '</div>' +
            '<div class="space-y-8">' + sections + '</div>' +
            '<div class="pt-2">' +
              '<a href="' + escapeHtml(product.websiteUrl) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-purple hover:bg-brand-purple/80 transition-all font-semibold">' +
                escapeHtml(product.card.websiteLabel) + ' <i class="fas fa-external-link-alt text-xs"></i>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function findProductBySlug(slug) {
    if (!Array.isArray(window.XINHERITANCE_PRODUCTS)) return null;
    return window.XINHERITANCE_PRODUCTS.find(function (item) {
      return item.slug === slug;
    }) || null;
  }

  function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || document.body.getAttribute('data-product-slug');
    if (!slug) return;

    const product = findProductBySlug(slug);
    if (!product) {
      const mount = getById('productDetailMount');
      if (mount) {
        mount.innerHTML = '<div class="max-w-4xl mx-auto px-4 py-28"><div class="glass-card rounded-3xl p-8 text-center"><h1 class="text-3xl font-display font-bold mb-4">Product Not Found</h1><p class="text-gray-400">This product page is unavailable right now.</p></div></div>';
      }
      return;
    }

    applyProductSeo(product);
    renderDetail(product);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductPage);
  } else {
    initProductPage();
  }
})();
