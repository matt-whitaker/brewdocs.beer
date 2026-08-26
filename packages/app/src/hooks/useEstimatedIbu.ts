import {useMemo} from "react";
import {isUnit, Scalar, Unit} from "@brewdocs.beer/core";
import {resourcesOf} from "@/model/brewable";
import {Assignment} from "@/model/brewable";
import {parseNumberString} from "@/utils/math";

const GRAMS_PER_UNIT: Partial<Record<Unit, number>> = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592
};

const LITERS_PER_UNIT: Partial<Record<Unit, number>> = {
    L: 1,
    mL: 0.001,
    pt: 0.473176,
    qt: 0.946353,
    gal: 3.78541
};

const TINSETH_MAX_UTILIZATION = 1.65;
const TINSETH_GRAVITY_BASE = 0.000125;
const TINSETH_BOIL_RATE = 0.04;
const TINSETH_BOIL_SCALE = 4.15;

function amountOf(scalar?: Scalar): number {
    return parseNumberString(scalar?.value ?? "")[0];
}

function convert(scalar: Scalar, factors: Partial<Record<Unit, number>>): number {
    const [amount, embeddedUnit] = parseNumberString(scalar?.value ?? "");
    const unit = isUnit(embeddedUnit) ? embeddedUnit : scalar?.unit;
    const factor = unit && factors[unit];

    return factor ? amount * factor : NaN;
}

function tinsethIbu(assignments: Assignment[], batchSize: Scalar, og?: Scalar): number | null {
    const hops = resourcesOf(assignments ?? [], "hop");

    if (!hops.length) {
        return 0;
    }

    const batchVolumeLiters = convert(batchSize, LITERS_PER_UNIT);
    const gravity = amountOf(og);

    if (!(batchVolumeLiters > 0) || !(gravity > 0)) {
        return null;
    }

    const bignessFactor = TINSETH_MAX_UTILIZATION * Math.pow(TINSETH_GRAVITY_BASE, gravity - 1);

    const total = hops.reduce((sum, hop) => {
        const weightGrams = convert(hop.weight, GRAMS_PER_UNIT);
        const alphaDecimal = amountOf(hop.alpha) / 100;
        const boilMinutes = amountOf(hop.boil);

        if (!Number.isFinite(weightGrams) || !Number.isFinite(alphaDecimal) || !Number.isFinite(boilMinutes)) {
            return sum;
        }

        const mgPerLiter = (weightGrams * alphaDecimal * 1000) / batchVolumeLiters;
        const boilTimeFactor = (1 - Math.exp(-TINSETH_BOIL_RATE * boilMinutes)) / TINSETH_BOIL_SCALE;

        return sum + bignessFactor * boilTimeFactor * mgPerLiter;
    }, 0);

    return Number.isFinite(total) ? Math.round(total) : null;
}

export default function useEstimatedIbu(assignments: Assignment[], batchSize: Scalar, og?: Scalar): number | null {
    return useMemo(() => tinsethIbu(assignments, batchSize, og), [assignments, batchSize, og]);
}
