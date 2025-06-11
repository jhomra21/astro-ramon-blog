import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			heroImage: image().optional(),
			tags: z.array(z.string()).optional(),
			// Project-specific fields
			isProject: z.boolean().optional(),
			projectUrl: z.string().optional(),
			projectStatus: z.string().optional(),
			projectType: z.string().optional(),
			githubUrl: z.string().url().optional(),
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
