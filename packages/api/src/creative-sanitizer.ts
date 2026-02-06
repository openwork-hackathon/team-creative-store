import sanitizeHtml from "sanitize-html";

const stripUnsafeStyle = (style: string) => {
  const withoutImports = style.replace(/@import[^;]+;/gi, "");
  const withoutUrl = withoutImports.replace(/url\\((?:[^)]*)\\)/gi, (match) => {
    if (/https?:/i.test(match)) return "";
    return match;
  });
  return withoutUrl;
};

export function sanitizeCreativeHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "div",
      "span",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "a",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "br",
      "hr",
      "section",
      "header",
      "footer",
      "main",
      "article",
      "nav",
      "button",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td"
    ],
    allowedAttributes: {
      "*": ["class", "style", "id", "role", "aria-label", "aria-hidden"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding", "data-asset-id"],
      button: ["type", "aria-label"]
    },
    allowedSchemes: ["data", "http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["data"],
      a: ["http", "https", "mailto", "tel"]
    },
    transformTags: {
      "*": (tagName, attribs) => {
        if (attribs.style) {
          attribs.style = stripUnsafeStyle(attribs.style);
        }
        return { tagName, attribs };
      },
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          attribs.rel = attribs.rel ?? "noopener noreferrer";
        }
        return { tagName, attribs };
      }
    }
  });
}
