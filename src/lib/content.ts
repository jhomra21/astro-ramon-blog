import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

const FIRST_SENTENCE = /^.+?[.!?](?=\s|$)/;

export const getShortTitle = (title: string) => title.split(': ')[0];

export const getSummary = (description: string) => description.match(FIRST_SENTENCE)?.[0] ?? description;

export const isFeatured = (entry: BlogEntry) => entry.data.projectType === 'featured';

const byNewest = (a: BlogEntry, b: BlogEntry) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

export async function getProjects() {
	const projects = await getCollection('blog', ({ data }) => data.isProject === true);

	return projects.sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)) || byNewest(a, b));
}

export async function getPosts() {
	const posts = await getCollection('blog', ({ id }) => id !== 'about');

	return posts.sort(byNewest);
}
