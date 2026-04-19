/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing user-generated HTML content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated HTML (articles, predictions, etc.)
 *
 * @param dirty - Raw HTML content that may contain malicious scripts
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * const clean = sanitizeHtml(article.content);
 * <div set:html={clean} />
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
      'p',
      'br',
      'span',
      'strong',
      'em',
      'u',
      's',
      'blockquote',
      'code',
      'pre',
      // Headings
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      // Lists
      'ul',
      'ol',
      'li',
      // Links
      'a',
      // Images
      'img',
      // Tables
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      // Other
      'div',
      'hr',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'class',
      'id',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Strip all HTML tags and return plain text
 * Use for excerpts, meta descriptions, etc.
 *
 * @param html - HTML content
 * @returns Plain text without any HTML tags
 *
 * @example
 * const excerpt = stripHtml(article.content).slice(0, 160);
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize user input for display (not HTML content)
 * Use for titles, names, etc. that shouldn't contain any HTML
 *
 * @param input - User input string
 * @returns Escaped string safe for display
 *
 * @example
 * const safeTitle = sanitizeText(user.title);
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}
