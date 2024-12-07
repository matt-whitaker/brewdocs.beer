import {Units, Currencies} from "@brewdocs.beer/core";

function formatNumberWithUnit(input, unit) {
    // Use regex to separate the numeric part and any suffix from the input
    const match = input.match(/^(-?\d+(?:\.\d+)?)(\D*)$/);

    if (!match) {
        throw new Error("Invalid input format. Input must start with a number.");
    }

    const [_, numericPart, actualUnit] = match;

    // Check if the actual suffix is non-empty and valid
    if (actualUnit && Object.values(Units).includes(actualUnit)) {
        return input; // Input already has a valid suffix
    }

    // Return the fixed string with the expected suffix
    return numericPart + unit;
}

function formatNumberWithCurrency(input, currency) {
    // Use regex to separate any prefix and the numeric part from the input
    const match = input.match(/^(\D*)(-?\d+(?:\.\d+)?)$/);

    if (!match) {
        throw new Error("Invalid input format. Input must start with an optional prefix followed by a number.");
    }

    const [_, actualCurrency, numericPart] = match;

    // Check if the actual prefix is non-empty and matches the expected prefix
    if (actualCurrency && Object.values(Currencies).includes(actualCurrency)) {
        return input; // Input already has the correct prefix
    }

    // Return the fixed string with the expected prefix
    return currency + numericPart;
}