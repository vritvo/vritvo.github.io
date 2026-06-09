import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site: string | undefined }) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  // Use date-only + noon UTC so feed shows the intended calendar day in all timezones
  const toRssDate = (d: Date) =>
    new Date(d.toISOString().split("T")[0] + "T12:00:00Z");

  return rss({
    title: "Victoria Ritvo",
    description: "Blog posts",
    site: context.site ?? "https://victoriaritvo.com",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: toRssDate(post.data.pubDate),
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
