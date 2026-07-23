export const CURRENCIES = {
    DOLLAR: "$",
    EURO: "€",
    POUND: "£",
    YEN: "¥",
    RUPEE: "₹",
    WON: "₩",
    FRANC: "₣",
    PESO: "₱",
    LIRA: "₺",
    BITCOIN: "₿",
} as const;
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

export const UNITS = {
    PERCENT: "%",
    LITERS: "L",
    MILLILITERS: "mL",
    GALLONS: "gal",
    QUARTS: "qt",
    PINTS: "pt",
    OUNCES: "oz",
    GRAMS: "g",
    KILOGRAMS: "kg",
    POUNDS: "lb",
    TEASPOONS: "tsp",
    TABLESPOONS: "tbsp",
    CUPS: "cup",
    FAHRENHEIT: "°F",
    CELSIUS: "°C",
    SPECIFIC_GRAVITY: "SG",
    PLATO: "°P",
    IBU: "IBU",
    SRM: "SRM",
    PH: "pH",
    MINUTES: "min",
} as const;
export type Unit = typeof UNITS[keyof typeof UNITS];

/**
 * The one scalar shape, shared by the kb catalog and the app. `unit`/`currency`
 * are string-literal unions (subtypes of string), so raw kb JSON can carry them
 * across the type boundary with a validated cast — see isUnit/isCurrency.
 */
export interface Scalar {
    value: string;
    unit?: Unit;
    currency?: Currency;
}

const UNIT_VALUES: readonly string[] = Object.values(UNITS);
export const isUnit = (value: string): value is Unit => UNIT_VALUES.includes(value);

const CURRENCY_VALUES: readonly string[] = Object.values(CURRENCIES);
export const isCurrency = (value: string): value is Currency => CURRENCY_VALUES.includes(value);

export interface Entity {
    id: string;
}
