import {Units, Currencies} from "@brewdocs.beer/core";
import {KbScalar} from "@brewdocs.beer/kb";
import Scalar from "@/model/scalar";

/**
 * Coerces a raw kb scalar into the app's Scalar shape. Kb unit strings are
 * authored to match Units enum values, so this is a safe cast, not a real
 * conversion (verified against the actual kb data).
 */
export function kbScalarToScalar(kbScalar: KbScalar): Scalar {
    return {
        value: kbScalar.value,
        unit: kbScalar.unit as Units
    };
}

export const UNIT_REGEX = /^(-?\d+(?:\.\d+)?)(\D*)$/;
export const CURRENCY_REGEX = /^(\D*)(-?\d+(?:\.\d+)?)$/;

export function scalarFromNumberWithUnit(input: string, defaultUnit: Units, lockUnit: boolean = false): Scalar {
    const match = input.match(UNIT_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with a number.");
    }

    const [_, numericPart, actualUnit] = match as unknown as [void, string, Units];

    if (!lockUnit && actualUnit && Object.values(Units).includes(actualUnit as Units)) {
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