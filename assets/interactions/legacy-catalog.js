(() => {
  const target = document.currentScript?.dataset.catalogDestination;
  if (!target) return;
  const current = new URL(window.location.href);
  if (!['category', 'q', 'page'].some(key => current.searchParams.has(key)) && current.hash !== '#shortlist') return;
  const destination = new URL(target, current.origin);
  destination.search = current.search;
  destination.hash = current.hash;
  window.location.replace(destination.href);
})();
