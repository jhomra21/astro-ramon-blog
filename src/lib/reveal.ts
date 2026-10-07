export const REVEAL_STEP_MS = 50;
export const REVEAL_MAX_CARD_STEPS = 9;

export const HERO_REVEAL = {
	portrait: { delayMs: 53, durationMs: 220, scale: 0.94 },
	name: { delayMs: 144 },
	subtitle: { delayMs: 210 },
	bio: { delayMs: 262 },
	socials: { delayMs: 315 },
	buttons: { delayMs: 367 },
} as const;

export const PROJECTS_REVEAL_START_MS = 390;

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
