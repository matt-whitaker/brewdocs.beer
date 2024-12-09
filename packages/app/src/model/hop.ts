import Scalar from "@/model/scalar";

export default interface Hop {
    name: string;
    weight: Scalar;
    alpha: Scalar;
    boil: Scalar;
    phase: "boil"|"secondary"|"dry";
}