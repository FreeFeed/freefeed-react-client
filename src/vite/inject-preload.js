export function injectPreload({ files = [] } = {}) {
  let basePath;
  return {
    name: 'inject-preload',
    apply: 'build',
    configResolved(config) {
      basePath = config.base;
    },
    /** @type import("vite").IndexHtmlTransformHook */
    async transformIndexHtml(html, context) {
      if (!context.bundle) {
        return html;
      }

      const tags = [];

      for (const key of Object.keys(context.bundle)) {
        const conf = files.find((f) => f.match.test(key));
        if (!conf) {
          continue;
        }

        tags.push({
          tag: 'link',
          attrs: { rel: 'preload', ...conf.attributes, href: basePath + key },
          injectTo: 'head-prepend',
        });
      }

      return tags;
    },
  };
}
