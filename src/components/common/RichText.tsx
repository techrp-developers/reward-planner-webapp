import React from 'react';

/**
 * Strips all HTML tags and returns clean plain text (useful for card snippets with line-clamp)
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a string contains HTML tags
 */
export function hasHtmlTags(str) {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Sanitizes and cleans Quill editor output & generic HTML
 */
export function cleanAndFormatHtml(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let cleaned = rawHtml;

  // 1. Remove dangerous scripts, iframes, and event handlers
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '');

  // 2. Remove Quill internal empty markers (<span class="ql-ui" ...></span>)
  cleaned = cleaned.replace(/<span class="ql-ui"[^>]*>.*?<\/span>/gi, '');
  cleaned = cleaned.replace(/<span class="ql-ui"[^>]*\/>/gi, '');

  // 3. Remove inline white/light background-color that breaks dark/gray containers
  cleaned = cleaned.replace(/background-color:\s*(rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#ffffff|#fff|white);?/gi, '');
  cleaned = cleaned.replace(/background:\s*(rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#ffffff|#fff|white);?/gi, '');

  // 4. Convert Quill <ol> containing data-list="bullet" into <ul>
  cleaned = cleaned.replace(/<ol(\s+[^>]*)?>([\s\S]*?)<\/ol>/gi, (match, attrs, inner) => {
    if (/data-list=["']bullet["']/i.test(inner)) {
      return `<ul${attrs || ''}>${inner}</ul>`;
    }
    return match;
  });

  return cleaned;
}

/**
 * Reusable component for rendering product/service descriptions
 * Handles both plain text and rich Quill/WYSIWYG HTML output safely
 */
export default function RichText({
  content,
  fallback = 'No description available.',
  className = '',
}) {
  const text = content && String(content).trim() ? content : fallback;

  if (!hasHtmlTags(text)) {
    return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
  }

  const safeHtml = cleanAndFormatHtml(text);

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
