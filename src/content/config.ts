import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
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
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(), // YAML parses dates as Date; coerce so string or date both work
  }),
});

export const collections = {
  projects: projectsCollection,
  blog: blogCollection,
};