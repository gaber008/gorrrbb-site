import { defineConfig } from "astro/config";
import { readdir, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import config from "./src/site.config.mjs";

// Astro copies every original photo into the build even when only the resized
// versions are used. Originals can carry camera and GPS data, so this removes
// any image in /_astro that no page links to.
const removeUnusedOriginals = {
  name: "remove-unused-originals",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const out = fileURLToPath(dir);
      const pages = [];
      const walk = async (d) => {
        for (const e of await readdir(d, { withFileTypes: true })) {
          const p = join(d, e.name);
          if (e.isDirectory()) await walk(p);
          else if (/\.(html|xml)$/.test(e.name)) pages.push(await readFile(p, "utf8"));
        }
      };
      await walk(out);
      const html = pages.join("\n");
      let removed = 0;
      for (const f of await readdir(join(out, "_astro"))) {
        if (/\.(jpe?g|png|webp|avif)$/i.test(f) && !html.includes(f)) {
          await unlink(join(out, "_astro", f));
          removed++;
        }
      }
      logger.info(`Removed ${removed} unused original photo(s).`);
    },
  },
};

export default defineConfig({
  site: config.url,
  trailingSlash: "always",
  integrations: [removeUnusedOriginals],
});
