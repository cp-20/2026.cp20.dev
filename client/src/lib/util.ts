export const isMobile = window.matchMedia("(max-width: 560px)").matches;

const ua = navigator.userAgent;
export const isMobileDevice = /Android|webOS|iPhone|iPad|iPod/i.test(ua);
