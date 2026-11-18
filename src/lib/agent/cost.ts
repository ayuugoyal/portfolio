/**
 * USD cost of one response from its usage. Pure TS.
 * Prices are USD per million tokens. Cache writes (5-minute TTL) bill at 1.25x input.
 * An unknown model is priced like the most expensive one listed, so the budget errs on the safe side.
 */

type Price = { input: number; output: number; cacheRead: number };

export const PRICES: Record<string, Price> = {
    "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
    "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1 },
    "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
    // possible server-side fallback targets of claude-opus-5-5
    "claude-opus-5": { input: 5, output: 25, cacheRead: 0.5 },
    "claude-opus-4-8": { input: 5, output: 25, cacheRead: 0.5 },
};
const WORST: Price = { input: 5, output: 25, cacheRead: 0.5 };
const CACHE_WRITE = 1.25;

export type UsageLike = {
    input_tokens?: number | null;
    output_tokens?: number | null;
    cache_creation_input_tokens?: number | null;
    cache_read_input_tokens?: number | null;
    iterations?: ReadonlyArray<{
        type?: string;
        model?: string | null;
        input_tokens?: number | null;
        output_tokens?: number | null;
        cache_creation_input_tokens?: number | null;
        cache_read_input_tokens?: number | null;
    }> | null;
};

export function priceOf(model: string | null | undefined): Price {
    if (!model) return WORST;
    // exact id, or a dated / suffixed variant of a listed id
    const key = Object.keys(PRICES).find((k) => model === k || model.startsWith(`${k}-`) || model.startsWith(`${k}@`));
    return key ? PRICES[key] : WORST;
}

const n = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);

function partCost(u: Omit<UsageLike, "iterations">, p: Price): number {
    return (
        (n(u.input_tokens) * p.input +
            n(u.cache_creation_input_tokens) * p.input * CACHE_WRITE +
            n(u.cache_read_input_tokens) * p.cacheRead +
            n(u.output_tokens) * p.output) /
        1_000_000
    );
}

/**
 * Cost of a response. When the API reports per-model iterations (a server-side fallback ran), each is
 * priced at its own model; otherwise the top-level usage at `model`.
 */
export function costUsd(usage: UsageLike | null | undefined, model: string | null | undefined): number {
    if (!usage) return 0;
    // every iteration is billed (message, fallback_message, compaction, advisor…); one without a model ran on `model`
    const its = usage.iterations?.filter(Boolean);
    if (its && its.length > 0) return its.reduce((sum, it) => sum + partCost(it, priceOf(it.model ?? model)), 0);
    return partCost(usage, priceOf(model));
}
