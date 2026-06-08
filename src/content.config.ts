import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    featured: z.boolean().default(false),
    coverImage: z.string(),
    githubUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    order: z.number().optional(),
  }),
});

// add a collection for blog posts with title, description, pub date.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(), // YAML parses dates as Date; coerce so string or date both work
  }),
});

export const collections = {
  projects,
  blog,
};
