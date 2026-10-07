import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Every folder in src/content with an index.md is one entry.
// Its Collection is the first folder in the path (yearbooks, film, ...).
const entries = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(["gallery", "page", "post"]).default("gallery"),
    date: z.coerce.date().optional(),
    order: z.number().optional(),
    intro: z.string().optional(),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    unlisted: z.boolean().default(false),
    photos: z
      .array(z.object({ file: z.string(), alt: z.string().optional(), caption: z.string().optional() }))
      .default([]),
  }),
});

export const collections = { entries };
