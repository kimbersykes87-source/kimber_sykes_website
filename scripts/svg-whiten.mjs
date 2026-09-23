/**
 * Normalize vendor SVGs for on-dark mono marks: strip Illustrator class CSS safely by
 * hoisting clip-path / display, then apply white fill without clobbering clip/mask geometry.
 */

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} css
 * @returns {Map<string, { clipPath?: string, display?: string }>}
 */
function parseClassRules(css) {
  const map = new Map();
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const parts = cleaned.split("}");
  for (const chunk of parts) {
    const brace = chunk.indexOf("{");
    if (brace === -1) continue;
    const selPart = chunk.slice(0, brace).trim();
    const body = chunk.slice(brace + 1);
    const selectors = selPart
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sel of selectors) {
      const m = sel.match(/^\.([a-zA-Z0-9_-]+)$/);
      if (!m) continue;
      const cls = m[1];
      let r = map.get(cls) || {};
      const cp = body.match(/clip-path\s*:\s*url\((#[^)]+)\)/i);
      if (cp) r.clipPath = cp[1];
      const dm = body.match(/display\s*:\s*(\w+)/i);
      if (dm) {
        const v = dm[1].toLowerCase();
        if (v === "none" || v === "hidden") r.display = v;
      }
      map.set(cls, r);
    }
  }
  return map;
}

/**
 * @param {string} svg
 * @param {Map<string, { clipPath?: string, display?: string }>} rules
 */
function applyClassPresentation(svg, rules) {
  return svg.replace(/<([a-zA-Z][\w:.-]*)(\s[^>]*)>/g, (full, tag, attrs) => {
    let body = attrs;
    let selfClose = false;
    if (/\/\s*$/.test(body)) {
      selfClose = true;
      body = body.replace(/\/\s*$/, "");
    }
    const clsMatch = body.match(/\bclass="([^"]*)"/);
    if (!clsMatch) return full;
    const classes = clsMatch[1]
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    let mergedClip = null;
    let mergedDisplay = null;
    for (const c of classes) {
      const r = rules.get(c);
      if (!r) continue;
      if (r.clipPath) mergedClip = r.clipPath;
      if (r.display) mergedDisplay = r.display;
    }
    let add = "";
    if (mergedClip && !/\bclip-path=/.test(body)) {
      add += ` clip-path="url(${mergedClip})"`;
    }
    if (mergedDisplay && !/\bdisplay=/.test(body)) {
      add += ` display="${mergedDisplay}"`;
    }
    if (!add) return full;
    const gap = body.startsWith(" ") || body === "" ? "" : " ";
    return `<${tag}${gap}${body.trimEnd()}${add}${selfClose ? " />" : ">"}`;
  });
}

/**
 * @param {string} svg
 * @param {string} title
 */
export function whitenUserSvg(svg, title) {
  let s = svg.replace(/<\?xml[^?]*\?>/g, "");
  const styleBlocks = [];
  s = s.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, inner) => {
    styleBlocks.push(inner);
    return "";
  });
  const classRules = parseClassRules(styleBlocks.join("\n"));
  s = applyClassPresentation(s, classRules);

  s = s.replace(/class="[^"]*"/gi, "");
  s = s.replace(/\bfill\s*=\s*"url\([^)]+\)"/gi, 'fill="#ffffff"');
  s = s.replace(/\bstroke\s*=\s*"url\([^)]+\)"/gi, 'stroke="#ffffff"');
  s = s.replace(/<linearGradient[\s\S]*?<\/linearGradient>/gi, "");
  s = s.replace(/<radialGradient[\s\S]*?<\/radialGradient>/gi, "");
  s = s.replace(/\sfilter="[^"]*"/gi, "");
  s = s.replace(/<filter[\s\S]*?<\/filter>/gi, "");
  s = s.replace(/\bfill\s*=\s*"(?!none|transparent)[^"]*"/gi, 'fill="#ffffff"');
  s = s.replace(/\bfill\s*:\s*(?!none|transparent)[^;"']+/gi, "fill:#ffffff");
  s = s.replace(/\bstroke\s*=\s*"(?!none|transparent)[^"]*"/gi, 'stroke="#ffffff"');
  s = s.replace(/\bstroke\s*:\s*(?!none|transparent)[^;"']+/gi, "stroke:#ffffff");
  /** Fill only on visible artwork; keep clip/mask geometry opaque for stable clipping. */
  const inject = `<defs><style type="text/css"><![CDATA[
    svg path, svg polygon, svg rect, svg circle, svg ellipse, svg polyline, svg line, svg text { fill: #ffffff !important; }
    svg > circle[fill="none"], svg > rect[fill="none"], svg > ellipse[fill="none"] { fill: none !important; }
    clipPath path, clipPath polygon, clipPath rect, clipPath circle, clipPath ellipse,
    mask path, mask polygon, mask rect, mask circle { fill: #000000 !important; stroke: none !important; }
  ]]></style></defs>`;
  if (/<svg[^>]*>/.test(s)) {
    s = s.replace(/<svg([^>]*)>/, (m, attrs) => {
      let a = attrs;
      if (!/\bshape-rendering=/.test(a)) a += ` shape-rendering="geometricPrecision"`;
      if (!/\btext-rendering=/.test(a)) a += ` text-rendering="geometricPrecision"`;
      return `<svg${a}>${inject}`;
    });
  }
  if (!s.includes("xmlns=")) {
    s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/role="img"/.test(s)) s = s.replace("<svg", '<svg role="img"');
  if (!/aria-label=/.test(s)) {
    const t = escapeXml(title);
    s = s.replace("<svg", `<svg aria-label="${t}"`);
  }
  return s.trim();
}
