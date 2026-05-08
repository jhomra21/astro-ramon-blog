import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			heroImage: image().optional(),
			tags: z.array(z.string()).optional(),
			isProject: z.boolean().optional(),
			projectUrl: z.string().optional(),
			projectStatus: z.enum(['live']).optional(),
			projectType: z.enum(['featured']).optional(),
			githubUrl: z.url().optional(),
			techStack: z
				.array(
					z.object({
						name: z.string(),
						description: z.string(),
					})
				)
				.optional(),
		}),
});

export const collections = { blog };
