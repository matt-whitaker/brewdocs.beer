import {Scalar, UNITS} from "./models";

const platoToSpecificGravity = (plato: number): number =>
    1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));

export function toSpecificGravity(scalar: Scalar): number {
    const value = parseFloat(scalar.value);
    return scalar.unit === UNITS.PLATO ? platoToSpecificGravity(value) : value;
}

export function estimateAbv(og: Scalar, fg: Scalar): number {
    return (toSpecificGravity(og) - toSpecificGravity(fg)) * 131.25;
}
