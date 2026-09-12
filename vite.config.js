import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

import tailwindcss from '@tailwindcss/vite';

/* =========================================================
   BUDDY FLEETS — INLINE PRODUCTION CSS

   Purpose:
   - Remove external render-blocking CSS request
   - Keep CSS available before first paint
   - Avoid JS-based CSS injection
   - Preserve instant theme rendering

   Development mode is unaffected.
========================================================= */

function inlineProductionCss() {
  return {
    name: 'buddy-fleets-inline-production-css',

    apply: 'build',

    enforce: 'post',

    transformIndexHtml: {
      order: 'post',

      handler(html, context) {
        const bundle =
          context?.bundle;

        if (!bundle) {
          return html;
        }

        /* =================================================
           FIND GENERATED CSS ASSETS
        ================================================= */

        const cssAssets =
          Object.values(
            bundle
          ).filter(
            (asset) =>
              asset.type ===
                'asset' &&
              asset.fileName.endsWith(
                '.css'
              )
          );

        if (
          cssAssets.length ===
          0
        ) {
          return html;
        }

        /* =================================================
           COMBINE CSS

           cssCodeSplit is disabled below, so normally there
           will be only one production stylesheet.
        ================================================= */

        const css =
          cssAssets
            .map(
              (asset) => {
                if (
                  typeof asset.source ===
                  'string'
                ) {
                  return asset.source;
                }

                return Buffer.from(
                  asset.source
                ).toString(
                  'utf8'
                );
              }
            )
            .join(
              '\n'
            );

        /* =================================================
           REMOVE VITE GENERATED STYLESHEET LINK

           Handles:
           <link rel="stylesheet" ... href="/assets/x.css">
        ================================================= */

        const stylesheetPattern =
          /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["'][^"']+\.css(?:\?[^"']*)?["'])[^>]*>/gi;

        const htmlWithoutExternalCss =
          html.replace(
            stylesheetPattern,
            ''
          );

        /* =================================================
           INLINE CSS DIRECTLY INTO HEAD
        ================================================= */

        const inlineStyle = `
<style data-bf-inline-css>
${css}
</style>`;

        return htmlWithoutExternalCss.replace(
          '</head>',
          `${inlineStyle}\n</head>`
        );
      },
    },
  };
}

/* =========================================================
   VITE CONFIG
========================================================= */

export default defineConfig({
  plugins: [
    react(),

    tailwindcss(),

    inlineProductionCss(),
  ],

  build: {
    /*
      Keep one production CSS bundle.

      This makes critical CSS inlining predictable and avoids
      multiple render-blocking stylesheets.
    */

    cssCodeSplit:
      false,
  },
});