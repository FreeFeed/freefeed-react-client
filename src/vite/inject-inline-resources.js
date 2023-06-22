import { dirname, join } from 'path';
import { build } from 'esbuild';
import { HTMLElement, parse as parseHTML } from 'node-html-parser';

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

      // Inject scripts
      const inlineScripts = doc.querySelectorAll('script[type="inline"]');
      for (const script of inlineScripts) {
        const scriptSrc = join(dirname(context.filename), script.getAttribute('src'));
        const result = await build({
          entryPoints: [scriptSrc],
          bundle: true,
          minify: true,
          format: 'iife',
          target: ['es2015'],
          write: false,
        });
        const inlineScript = new HTMLElement('script', {});
        inlineScript.textContent = result.outputFiles[0].text.trim();
        script.replaceWith(inlineScript);
      }

      // Inject styles (only in production build mode, so we have context.bundle)
      if (context.bundle) {
        const styles = doc.querySelectorAll('link[rel="stylesheet"]');
        for (const style of styles) {
          const src = style.getAttribute('href').replace(/^\//, '');
          const inlineStyle = new HTMLElement('style', {});
          inlineStyle.textContent = context.bundle[src].source;
          style.replaceWith(inlineStyle);
        }
      }

      return doc.toString();
    },
  };
}
