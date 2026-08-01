import {Unit, UNITS} from "@brewdocs.beer/core";
import {MilestoneKind, PhaseType} from "@/model/brewable";

export type ReadingPrimary = "reading" | "date" | "waterParameter";

export type ReadingKindConfig = {
    kind: MilestoneKind;
    primary: ReadingPrimary;
    headerLabel: string;
    addLabel: string;
    defaultLabel: string;
    unitOptions?: {name: string; value: Unit}[];
    phaseTypes?: PhaseType[];
};

const GRAVITY_UNIT_OPTIONS = [
    { name: "°P", value: UNITS.PLATO },
    { name: "SG", value: UNITS.SPECIFIC_GRAVITY },
];

const VOLUME_UNIT_OPTIONS = [
    { name: "gal", value: UNITS.GALLONS },
    { name: "qt", value: UNITS.QUARTS },
    { name: "pt", value: UNITS.PINTS },
    { name: "L", value: UNITS.LITERS },
    { name: "mL", value: UNITS.MILLILITERS },
];

const TEMPERATURE_UNIT_OPTIONS = [
    { name: "°F", value: UNITS.FAHRENHEIT },
    { name: "°C", value: UNITS.CELSIUS },
];

const PRESSURE_UNIT_OPTIONS = [
    { name: "psi", value: UNITS.PSI },
];

export const READING_KINDS: ReadingKindConfig[] = [
    {
        kind: "gravity",
        primary: "reading",
        headerLabel: "Gravity",
        addLabel: "Add reading",
        defaultLabel: "Reading",
        unitOptions: GRAVITY_UNIT_OPTIONS
    },
    {
        kind: "volume",
        primary: "reading",
        headerLabel: "Volume",
        addLabel: "Add volume reading",
        defaultLabel: "Volume",
        unitOptions: VOLUME_UNIT_OPTIONS
    },
    {
        kind: "temperature",
        primary: "reading",
        headerLabel: "Temperature",
        addLabel: "Add temperature reading",
        defaultLabel: "Temperature",
        unitOptions: TEMPERATURE_UNIT_OPTIONS
    },
    {
        kind: "water",
        primary: "waterParameter",
        headerLabel: "Water Chemistry",
        addLabel: "Add water sample",
        defaultLabel: "Water Sample",
        phaseTypes: ["mash"]
    },
    {
        kind: "pressure",
        primary: "reading",
        headerLabel: "Pressure",
        addLabel: "Add pressure reading",
        defaultLabel: "Pressure",
        unitOptions: PRESSURE_UNIT_OPTIONS,
        phaseTypes: ["carbonation"]
    },
    {
        kind: "kegDate",
        primary: "date",
        headerLabel: "Keg date",
        addLabel: "Add keg date",
        defaultLabel: "Keg date",
        phaseTypes: ["carbonation"]
    },
    {
        kind: "bottleDate",
        primary: "date",
        headerLabel: "Bottle date",
        addLabel: "Add bottle date",
        defaultLabel: "Bottle date",
        phaseTypes: ["conditioning"]
    }
];

export const readingKindsForPhase = (type: PhaseType): ReadingKindConfig[] =>
    READING_KINDS.filter(({ phaseTypes }) => !phaseTypes || phaseTypes.includes(type));
