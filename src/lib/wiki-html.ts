/**
 * Rewrite stored article HTML so internal `[[Slug|Label]]` style links
 * become real <a> tags pointing at /article/<slug>.
 *
 * The scraper normalizes Wikipedia internal links to <a data-internal="slug">,
 * so this just needs to swap href.
 */
export function renderWikiHtml(html: string): string {
  return html.replace(
    /<a\b([^>]*?)\sdata-internal="([^"]+)"([^>]*)>/g,
    (_m, pre, slug, post) =>
      `<a${pre} href="/article/${slug}"${post}>`,
  );
}
