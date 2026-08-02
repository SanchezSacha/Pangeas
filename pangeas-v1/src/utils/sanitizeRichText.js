const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI']);
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED']);

const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const sanitizeRichText = value => {
    const html = String(value ?? '');
    if (!html || typeof DOMParser === 'undefined') return escapeHtml(html);

    const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    [...document.body.querySelectorAll('*')].reverse().forEach(element => {
        if (DROP_WITH_CONTENT.has(element.tagName)) {
            element.remove();
            return;
        }

        if (!ALLOWED_TAGS.has(element.tagName)) {
            element.replaceWith(...element.childNodes);
            return;
        }

        [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
    });

    return document.body.innerHTML;
};
