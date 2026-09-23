const shareButton = document.querySelector('#shareButton');
const toast = document.querySelector('#toast');

shareButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    window.prompt('คัดลอกลิงก์นี้เพื่อส่งให้เธอ:', window.location.href);
  }
  if (!toast) return;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
});