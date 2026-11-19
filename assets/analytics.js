(() => {
  const { measurementId, siteOrigin, pageType, pageLanguage, articleId, productId } = document.currentScript.dataset;
  if (window.location.origin !== siteOrigin) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  const context = { page_type: pageType, page_language: pageLanguage };
  if (articleId) context.article_id = articleId;
  if (productId) context.product_id = productId;
  if (!articleId && document.referrer) {
    const referrer = new URL(document.referrer);
    const article = referrer.pathname.match(/\/(?:blog|guides)\/[^/]+\/([a-z0-9-]+)\/$/);
    if (referrer.origin === siteOrigin && article) context.article_id = article[1];
  }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false,
    page_location: window.location.origin + window.location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : ''
  });
  gtag('event', 'page_view', { send_to: measurementId, ...context });

  if (pageType === 'product' && productId) {
    gtag('event', 'product_detail_view', { send_to: measurementId, ...context });
  }

  function reportProductClick(event) {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const location = link.dataset.productLinkLocation ?? link.dataset.affiliateLinkType ?? 'navigation';
    if (link.origin === window.location.origin) {
      const product = link.pathname.match(/\/products\/([a-z0-9-]+)\/$/);
      if (product) {
        const parameters = { send_to: measurementId, ...context, product_id: product[1], link_location: location };
        if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
          && (!link.target || link.target === '_self') && !link.hasAttribute('download')) {
          let followed = false;
          const follow = () => {
            if (followed) return;
            followed = true;
            window.location.assign(link.href);
          };
          event.preventDefault();
          parameters.event_callback = follow;
          parameters.event_timeout = 200;
          setTimeout(follow, 200);
        }
        gtag('event', 'product_detail_click', parameters);
      }
      return;
    }
    if (!link.dataset.affiliateClick || link.protocol !== 'https:') return;

    gtag('event', 'affiliate_click', {
      send_to: measurementId,
      ...context,
      product_id: link.dataset.affiliateClick,
      link_type: link.dataset.affiliateLinkType,
      link_domain: link.hostname,
      link_location: location,
      page_location: window.location.origin + window.location.pathname
    });
  }

  document.addEventListener('click', reportProductClick);
  document.addEventListener('auxclick', event => {
    if (event.button === 1) reportProductClick(event);
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(tag);
})();
