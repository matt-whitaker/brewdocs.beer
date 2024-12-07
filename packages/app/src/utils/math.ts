import {Units} from "@brewdocs.beer/core";

export const CURRENCY_REGEX = /^[\$\€\£\¥\₹\₽\₩\₫\₪\₱\₭\฿\₦\₲\₵\₮\₡\₸]/; // todo web safe to do this?
export const UNIT_REGEX = /[^\d.,]+/;
export const COMMAS_REGEX = /,/g;
export const UNIT_SPLIT_REGEX = /^(-?\d+(?:\.\d+)?)(\D*)$/;

export function parseNumberString(numberString: string): [number, string] {
    const match = numberString.match(UNIT_REGEX);

    if (match) {
        const unit = match[0];

        let number = numberString.replace(unit, '');
        if (CURRENCY_REGEX.test(unit)) {
            number = number.replace(COMMAS_REGEX, '');
        }

        return [parseFloat(number), unit];
    }

    let number = numberString;
    if (COMMAS_REGEX.test(numberString)) {
        number = numberString.replace(COMMAS_REGEX, '');
    }

    return [parseFloat(number), ''];
}

export function calculateNewHopWeight(originalAlpha: string, originalWeight: string, newAlpha: string) {
    const originalAlphaNum = parseFloat(originalAlpha.replace('%', ''));
    const originalWeightNum = parseFloat(originalWeight.replace('lb', ''));
    const newAlphaNum = parseFloat(newAlpha.replace('%', ''));

    return (originalAlphaNum * originalWeightNum) / newAlphaNum;
}

export function formatNumberWithUnit(input: string, unit: string) {
    const match = input.match(UNIT_SPLIT_REGEX);

    if (!match) {
        throw new Error("Invalid input format. Input must start with a number.");
    }

    const [_, numericPart, actualUnit] = match;

    if (actualUnit && Object.values(Units).includes(actualUnit as Units)) {
        return input;
    }

    return numericPart + unit;
}