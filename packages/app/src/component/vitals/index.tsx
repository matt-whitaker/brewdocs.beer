import {ScreenH4, ScreenP} from "@brewdocs.beer/design";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

// accepts either a real Batch's Measurements or a KbRecipe's raw targets
// shape (Scalar vs KbScalar) — only .value/.ibu/.srm are ever read
type VitalsLike = {og: {value: string}; fg: {value: string}; abv: {value: string}; ibu: string; srm: string};
export type VitalsProps = Partial<PropsWithClass> & { vitals: [string, VitalsLike][]; };

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div>
            <div className={classNames([className], "flex w-full justify-evenly")}>
                {vitals.map(([name, vital]) => (
                    <div className="basis-1/2 [&>*]:text-left" key={name}>
                        <ScreenH4>{name}</ScreenH4>
                        <ScreenP>ABV {vital.abv.value}</ScreenP>
                        <ScreenP>IBU {vital.ibu}</ScreenP>
                        <ScreenP>SRM {vital.srm}</ScreenP>
                        <ScreenP>O.G. {vital.og.value}</ScreenP>
                        <ScreenP>F.G. {vital.fg.value}</ScreenP>
                    </div>
                ))}
            </div>
        </div>
    )
}