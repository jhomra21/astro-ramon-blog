export const REVEAL_STEP_MS = 50;
export const REVEAL_MAX_CARD_STEPS = 9;

export const HERO_REVEAL = {
	portrait: { delayMs: 80, durationMs: 220, scale: 0.94 },
	name: { delayMs: 220 },
	subtitle: { delayMs: 320 },
	bio: { delayMs: 400 },
	socials: { delayMs: 480 },
	buttons: { delayMs: 560 },
} as const;

export const PROJECTS_REVEAL_START_MS = 620;

interface RevealStyleOptions {
	durationMs?: number;
	scale?: number;
}

export function getRevealStyle(delayMs: number, { durationMs, scale }: RevealStyleOptions = {}) {
	const declarations = [`--reveal-delay:${delayMs}ms`];
	if (durationMs !== undefined) declarations.push(`--reveal-duration:${durationMs}ms`);
	if (scale !== undefined) declarations.push(`--reveal-scale:${scale}`);
	return declarations.join(";");
}
