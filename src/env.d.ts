/// <reference types="astro/client" />

// Astro only declares lowercase image extensions.
declare module "*.JPG" {
	const metadata: ImageMetadata;
	export default metadata;
}
