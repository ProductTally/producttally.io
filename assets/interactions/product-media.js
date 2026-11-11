export function initProductMedia() {
  for (const preview of document.querySelectorAll('[data-product-video]')) {
    preview.querySelector('wa-button').addEventListener('click', () => {
      const video = document.createElement('iframe');
      video.className = 'product-video';
      video.src = `https://www.youtube-nocookie.com/embed/${preview.dataset.productVideo}?autoplay=1`;
      video.title = preview.dataset.videoTitle;
      video.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      video.allowFullscreen = true;
      video.referrerPolicy = 'strict-origin-when-cross-origin';
      preview.replaceWith(video);
      video.focus();
    }, { once: true });
  }
}
