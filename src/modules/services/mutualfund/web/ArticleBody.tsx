import { createElement, type ReactNode } from 'react';
import { normalizeMutualFundImageUrl } from '../../../../api/mutualFundImages';
const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'br', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span', 'div', 'img']);
const blocked = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button']);
const safeUrl = (url: string) => /^(https?:\/\/|\/[^/]|\.\.?\/|#)/i.test(url) ? url : undefined;
export default function ArticleBody({ content }: { content: string | null }) {
  if (!content) return <p>Full content is not available for this article yet.</p>;
  const doc = new DOMParser().parseFromString(content, 'text/html');
  function render(node: Node, key: number): ReactNode {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;
    const tag = node.tagName.toLowerCase();
    if (tag === 'iframe') {
      const src = node.getAttribute('src') || '';
      try {
        const url = new URL(src);
        const hosts = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];
        if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || !/^\/(embed\/|video\/)/.test(url.pathname)) return null;
        return <iframe key={key} src={url.href} title={node.getAttribute('title') || 'Educational video'} loading="lazy" className="aspect-video w-full rounded-2xl" allow="fullscreen; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />;
      } catch { return null; }
    }
    if (blocked.has(tag)) return null;
    const children = Array.from(node.childNodes).map(render);
    if (!allowed.has(tag)) return children;
    const props: Record<string, unknown> = { key };
    if (tag === 'a') { props.href = safeUrl(node.getAttribute('href') || ''); props.target = '_blank'; props.rel = 'noopener noreferrer'; }
    if (tag === 'img') { props.src = safeUrl(normalizeMutualFundImageUrl(node.getAttribute('src')) || ''); props.alt = node.getAttribute('alt') || ''; props.loading = 'lazy'; if (!props.src) return null; return createElement(tag, props); }
    if (tag === 'br') return createElement(tag, props);
    return createElement(tag, props, children);
  }
  return <div className="mf-article-body">{Array.from(doc.body.childNodes).map(render)}</div>;
}
