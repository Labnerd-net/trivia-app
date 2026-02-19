/**
 * Decodes HTML entities in a string to prevent XSS while displaying special characters
 */
export function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
