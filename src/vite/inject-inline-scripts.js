import { join, dirname } from 'path';
import { parse as parseHTML } from 'node-html-parser';
import { build } from 'vite';

export function injectInlineScripts() {
  return {
    name: 'inject-inline-scripts',
    /** @type import("vite").IndexHtmlTransformHook */
    async transformIndexHtml(html, context) {
      const doc = parseHTML(html, { comment: true });
      const syncScripts = doc.querySelectorAll('script[src][type="inline"]');
      for (const script of syncScripts) {
        const scriptSrc = join(dirname(context.filename), script.getAttribute('src'));
        const res = await build({
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
      return doc.toString();
    },
  };
}
