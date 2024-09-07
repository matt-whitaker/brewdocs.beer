export const CURRENCY_REGEX = /^[\$\€\£\¥\₹\₽\₩\₫\₪\₱\₭\฿\₦\₲\₵\₮\₡\₸]/;
export const UNIT_REGEX = /[^\d.,]+/;
export const COMMAS_REGEX = /,/g;

export function parseNumberString(numberString: string): [number, string] {
    const match = numberString.match(UNIT_REGEX);

    if (match) {
        const [unit]: [string] = match;

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