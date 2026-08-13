import tokens from "@/tokens.json";

const FALLBACK_SRM = 40;

export const SRM_TO_HEX = new Map<number, [string, string, string]>(
    tokens.srmScale.map(({srm, classes}): [number, [string, string, string]] => [
        srm,
        [classes.bg, classes.border, classes.outline]
    ])
);

export function findSrmClasses(srm: number): [string, string, string] {
    const match = Array.from(SRM_TO_HEX.entries()).find(([key]) => srm <= key);

    if (match) {
        return match[1];
    }

    return SRM_TO_HEX.get(FALLBACK_SRM) as [string, string, string];
}
