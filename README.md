# GORRRBB

Personal photo site. Static site built with [Astro](https://astro.build), hosted on Cloudflare Pages.

## Add a gallery (folder method)

1. Make a folder inside the right Collection, e.g. `src/content/adventures/chukar-camp/`.
2. Drop your JPEGs in. They show in file-name order (prefix `01_`, `02_`… to reorder).
3. Commit and push (GitHub Desktop works). Cloudflare publishes it in about 2 minutes.

The folder name becomes the title ("chukar-camp" shows as "Chukar Camp"). To set the title,
date or intro yourself, add an `index.md` in the folder:

   ```md
   ---
   title: Chukar Camp
   type: gallery
   date: 2024-10-12
   ---
   ```

Galleries without a date sort after dated ones in the menu.

Optional: list photos in `index.md` to add alt text (read aloud by screen readers) and captions.
The build prints a warning for every photo with no alt text.

```md
photos:
  - file: GORB3364.jpg
    alt: Surfers paddling out at dusk, Hanalei Bay
    caption: Hanalei, March 2024
```

## Add a page or blog post

Same as a gallery, with `type: page` or `type: post` and your text below the `---`.
Blog posts go in `src/content/thoughts/blog/<post-name>/`. Put photos in the same folder
and place them in the text with `![Alt text](./photo.jpg)`.

## Other settings

- `draft: true` hides an entry from the site. `unlisted: true` publishes it but leaves it out of menus.
- Menu order and the site name live in `src/site.config.mjs`.
- Old Format links are redirected in `public/_redirects`.

## Photos

Upload normal JPEGs (around 2000–3000px on the long edge is plenty). The build makes 600, 1200
and 2000px versions in AVIF and WebP, strips camera and GPS data, and only publishes the resized copies.

## Web editor

`.pages.yml` sets up [Pages CMS](https://pagescms.org): sign in with GitHub to add galleries and
write posts from a browser or phone.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Deploy (Cloudflare Pages)

Create a Pages project connected to this repo. Build command `npm run build`, output folder `dist`.
