import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import config from "../site.config.mjs";

type Raw = CollectionEntry<"entries">;

export interface Photo {
  image: ImageMetadata;
  file: string;
  alt: string;
  caption?: string;
}

export interface Entry {
  raw?: Raw; // missing for a folder of photos with no index.md

  slug: string; // e.g. "film/hp5"
  folder: string; // e.g. "film"
  href: string; // e.g. "/film/hp5/"
  title: string;
  type: "gallery" | "page" | "post";
  date?: Date;
  intro?: string;
  order?: number;
  unlisted: boolean;
  photos: Photo[];
  cover?: Photo;
}

// All photos in src/content, grouped by the folder they sit in.
const files = import.meta.glob<{ default: ImageMetadata }>(
  "/src/content/**/*.{jpg,jpeg,JPG,JPEG,png,webp}",
  { eager: true },
);

function photosIn(slug: string): Map<string, ImageMetadata> {
  const out = new Map<string, ImageMetadata>();
  const prefix = `/src/content/${slug}/`;
  for (const [path, mod] of Object.entries(files)) {
    if (path.startsWith(prefix) && !path.slice(prefix.length).includes("/")) {
      out.set(path.slice(prefix.length), mod.default);
    }
  }
  return new Map([...out.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

const warned = new Set<string>();

type Data = Pick<Raw["data"], "title" | "type" | "date" | "order" | "intro" | "cover" | "unlisted" | "photos">;

// "chukar-camp" → "Chukar Camp"
const titleFromFolder = (name: string) =>
  name.split(/[-_ ]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

// The web editor may save a photo as a path ("adventures/kauai/x.jpg"); only the file name matters.
const baseName = (f: string) => f.split("/").pop()!;

function build(slug: string, d: Data, raw?: Raw): Entry {
  const folder = slug.split("/")[0];
  const available = photosIn(slug);
  d = { ...d, cover: d.cover && baseName(d.cover), photos: d.photos.map((p) => ({ ...p, file: baseName(p.file) })) };
  const listed = new Map(d.photos.map((p) => [p.file, p]));

  // Galleries: listed photos first (in listed order), then any others by file name.
  const order = [...d.photos.map((p) => p.file), ...[...available.keys()].filter((f) => !listed.has(f))];
  const photos: Photo[] = [];
  for (const file of order) {
    const image = available.get(file);
    if (!image) {
      console.warn(`[photos] ${slug}: "${file}" is listed but the file isn't in the folder.`);
      continue;
    }
    const meta = listed.get(file);
    if (!meta?.alt && d.type === "gallery" && !warned.has(slug + file)) {
      warned.add(slug + file);
      console.warn(`[alt text] ${slug}/${file} has no alt text.`);
    }
    photos.push({ image, file, alt: meta?.alt ?? "", caption: meta?.caption });
  }
  // No alt text yet? Give screen readers something useful instead of silence.
  photos.forEach((p, i) => { if (!p.alt) p.alt = `${d.title}, photo ${i + 1} of ${photos.length}`; });
  const coverFile = d.cover ?? order[0];
  const cover = photos.find((p) => p.file === coverFile) ??
    (available.get(coverFile) ? { image: available.get(coverFile)!, file: coverFile, alt: "" } : undefined);

  return {
    raw, slug, folder, href: `/${slug}/`, title: d.title, type: d.type, date: d.date, intro: d.intro,
    order: d.order, unlisted: d.unlisted, photos: d.type === "gallery" ? photos : [], cover,
  };
}

export async function allEntries(): Promise<Entry[]> {
  const all = await getCollection("entries");
  const slugOf = (e: Raw) => e.id.replace(/\/index$/, "").replace(/^index$/, "");
  const entries = all.filter((e) => !e.data.draft).map((e) => build(slugOf(e), e.data, e));

  // Folder method: a folder of photos inside a Collection with no index.md is a gallery
  // titled after the folder (drafts still count as having an index.md).
  const known = new Set(all.map(slugOf));
  const folders = new Set(
    Object.keys(files)
      .map((p) => p.slice("/src/content/".length).split("/").slice(0, -1).join("/"))
      .filter((s) => s.split("/").length === 2 && config.menu.some((m) => m.folder === s.split("/")[0])),
  );
  for (const slug of folders) {
    if (known.has(slug)) continue;
    entries.push(build(slug, { title: titleFromFolder(slug.split("/")[1]), type: "gallery", unlisted: false, photos: [] }));
  }
  return entries;
}

function sortEntries(a: Entry, b: Entry) {
  const oa = a.order, ob = b.order;
  if (oa !== undefined || ob !== undefined) return (oa ?? 999) - (ob ?? 999);
  return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
}

export async function menu() {
  const entries = (await allEntries()).filter((e) => !e.unlisted);
  return config.menu.map((m) => ({
    label: m.label,
    items: [
      ...(m.extra ?? []),
      ...entries
        .filter((e) => e.folder === m.folder && !(m.hideTypes ?? []).includes(e.type))
        .sort(sortEntries)
        .map((e) => ({ label: e.title, href: e.href })),
    ],
  }));
}

export async function posts() {
  return (await allEntries()).filter((e) => e.type === "post" && !e.unlisted).sort(sortEntries);
}

export async function galleries() {
  return (await allEntries()).filter((e) => e.type === "gallery" && !e.unlisted).sort(sortEntries);
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
