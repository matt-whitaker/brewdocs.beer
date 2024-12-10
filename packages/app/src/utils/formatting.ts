import {Units, Currencies} from "@brewdocs.beer/core";
import Scalar from "@/model/scalar";

export const UNIT_REGEX = /^(-?\d+(?:\.\d+)?)(\D*)$/;
export const CURRENCY_REGEX = /^(\D*)(-?\d+(?:\.\d+)?)$/;

// export function parseUnit(input: string): Units|null {
//     const match = input.match(UNIT_REGEX);
//
//     if (!match) return null;
//
//     const [_, __, actualUnit]: [void, void, Units] = match;
//
//     return Object.values(Units).includes(actualUnit) ? actualUnit : null;
// }

export function scalarFromNumberWithUnit(input: string, defaultUnit: Units, lock: boolean = false): Scalar {
    const match = input.match(UNIT_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with a number.");
    }

    const [_, numericPart, actualUnit] = match as unknown as [void, string, Units];

    if (!lock && actualUnit && Object.values(Units).includes(actualUnit as Units)) {
        return {
            value: input,
            unit: actualUnit
        };
    }

    return {
        value: numericPart + defaultUnit,
        unit: defaultUnit,
    }
}

export function scalarFromNumberWithCurrency(input: string, defaultCurrency: Currencies, lock: boolean = false): Scalar {
    const match = input.match(CURRENCY_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with an optional prefix followed by a number.");
    }

    const [_, actualCurrency, numericPart] = match as unknown as [void, Currencies, string];

    if (!lock && actualCurrency && Object.values(Currencies).includes(actualCurrency as Currencies)) {
        return {
            value: input,
            currency: actualCurrency
        };
    }

    return {
        value: defaultCurrency + numericPart,
        currency: defaultCurrency
    };
}