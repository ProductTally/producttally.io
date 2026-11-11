function isClipped(text) {
  const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
  // Glyphs can extend slightly outside the last visible line box.
  return text.scrollWidth > text.clientWidth || text.scrollHeight - text.clientHeight > lineHeight / 2;
}

export function initCardTooltips(links) {
  for (const link of links) {
    const tooltips = [...link.parentElement.querySelectorAll('.card-tooltip')].map(tooltip => ({
      tooltip,
      text: document.getElementById(tooltip.getAttribute('for')),
    }));
    for (const { tooltip, text } of tooltips) {
      tooltip.addEventListener('wa-show', event => {
        if (!isClipped(text)) event.preventDefault();
      });
    }
    link.addEventListener('focus', () => {
      if (!link.matches(':focus-visible')) return;
      const firstClipped = tooltips.find(({ text }) => isClipped(text));
      firstClipped?.tooltip.show?.();
    });
    link.addEventListener('blur', () => {
      for (const { tooltip } of tooltips) {
        if (tooltip.open) tooltip.hide();
      }
    });
  }
}
