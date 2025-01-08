import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
	type: 'content',
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).optional(),
		// Project-specific fields
		isProject: z.boolean().default(false),
		projectUrl: z.string().url().optional(),
		projectStatus: z.enum(['live', 'development', 'archived']).optional(),
		projectType: z.enum(['latest', 'featured', 'regular']).optional(),
		techStack: z.array(
			z.object({
				name: z.string(),
				description: z.string()
			})
		).optional(),
	}),
});

export const collections = {
	'blog': blogCollection,
};
