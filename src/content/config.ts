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

export const collections = {
  projects: projectsCollection,
};

