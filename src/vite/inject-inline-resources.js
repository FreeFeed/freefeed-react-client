import { join, dirname } from 'path';
import { HTMLElement, parse as parseHTML } from 'node-html-parser';
import { build } from 'vite';

/**
 * Injects into HTML page all scripts with type="inject" (as IIFE) and all
 * styles.
 *
 * This plugin is FreeFeed-specific and not intended for general use.
 */
export function injectInlineResources() {
  return {
    name: 'inject-inline-resources',
    /** @type import("vite").IndexHtmlTransformHook */
    async transformIndexHtml(html, context) {
      const doc = parseHTML(html, { comment: true });
      const syncScripts = doc.querySelectorAll('script[src][type="inject"]');
      for (const script of syncScripts) {
        const scriptSrc = join(dirname(context.filename), script.getAttribute('src'));
        const res = await build({
          plugins: [],
          build: {
            sourcemap: false,
            lib: {
              entry: scriptSrc,
              formats: ['iife'],
              name: 'startup',
              fileName: 'assets/[name]-[hash]',
            },
            rollupOptions: {
              output: { inlineDynamicImports: false },
            },
          },
        });

        const result = res[0].output.find((e) => e.isEntry);

        script.removeAttribute('src');
        script.removeAttribute('type');
        script.textContent = result.code;
      }

      const styles = doc.querySelectorAll('link[rel="stylesheet"]');
      for (const style of styles) {
        const src = style.getAttribute('href').replace(/^\//, '');
        const inlineStyle = new HTMLElement('style', {});
        inlineStyle.textContent = context.bundle[src].source;
        style.replaceWith(inlineStyle);
      }

      return doc.toString();
    },
  };
}
