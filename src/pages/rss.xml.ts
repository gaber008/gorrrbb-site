import { posts } from "../lib/entries";
import config from "../site.config.mjs";

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function GET() {
  const items = (await posts()).map((p) => `<item><title>${esc(p.title)}</title><link>${config.url}${p.href}</link><guid>${config.url}${p.href}</guid>${p.date ? `<pubDate>${p.date.toUTCString()}</pubDate>` : ""}${p.intro ? `<description>${esc(p.intro)}</description>` : ""}</item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(config.name)}</title><link>${config.url}</link><description>live slow, die whenever</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
