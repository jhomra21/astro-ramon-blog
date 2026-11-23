export const REVEAL_STEP_MS = 50;
export const REVEAL_MAX_STEPS = 9;

export function getRevealStyle(delayMs: number) {
	return `--reveal-delay:${delayMs}ms`;
}

/** Step of a list item within a stagger; long lists stop adding delay after REVEAL_MAX_STEPS. */
export function getStaggerStep(index: number) {
	return Math.min(index, REVEAL_MAX_STEPS);
}

/** Steps a staggered list of `count` items takes, so the next element can follow its last item. */
export function getStaggerLength(count: number) {
	return count === 0 ? 0 : getStaggerStep(count - 1) + 1;
}
