(() => {
  const { measurementId, siteOrigin } = document.currentScript.dataset;
  if (window.location.origin !== siteOrigin) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
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
    page_location: window.location.origin + window.location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : ''
  });

  function reportAffiliateClick(event) {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-affiliate-click][href]');
    if (!link || link.protocol !== 'https:' || link.origin === window.location.origin) return;

    gtag('event', 'affiliate_click', {
      send_to: measurementId,
      product_id: link.dataset.affiliateClick,
      link_type: link.dataset.affiliateLinkType,
      link_domain: link.hostname,
      page_location: window.location.origin + window.location.pathname
    });
  }

  document.addEventListener('click', reportAffiliateClick);
  document.addEventListener('auxclick', event => {
    if (event.button === 1) reportAffiliateClick(event);
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(tag);
})();
