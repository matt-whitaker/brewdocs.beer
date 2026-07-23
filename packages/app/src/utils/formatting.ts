import {Currency, isCurrency, isUnit, Scalar, Unit} from "@brewdocs.beer/core";

/**
 * Coerces a raw kb scalar into the app's Scalar shape. Now that kb and app share
 * one Scalar type this is effectively a copy; kept as a boundary point pending
 * the transform-collapse follow-up.
 */
export function kbScalarToScalar(kbScalar: Scalar): Scalar {
    return {
        value: kbScalar.value,
        unit: kbScalar.unit
    };
}

export const UNIT_REGEX = /^(-?\d+(?:\.\d+)?)(\D*)$/;
export const CURRENCY_REGEX = /^(\D*)(-?\d+(?:\.\d+)?)$/;

export function scalarFromNumberWithUnit(input: string, defaultUnit: Unit, lockUnit: boolean = false): Scalar {
    const match = input.match(UNIT_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with a number.");
    }

    const [_, numericPart, actualUnit] = match as unknown as [void, string, string];

    if (!lockUnit && actualUnit && isUnit(actualUnit)) {
        return {
            value: input,
            unit: actualUnit
        };
    }

    return {
        value: numericPart + defaultUnit,
        unit: defaultUnit,
    };
}

export function scalarFromNumberWithCurrency(input: string, defaultCurrency: Currency, lock: boolean = false): Scalar {
    const match = input.match(CURRENCY_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with an optional prefix followed by a number.");
    }

    const [_, actualCurrency, numericPart] = match as unknown as [void, string, string];

    if (!lock && actualCurrency && isCurrency(actualCurrency)) {
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