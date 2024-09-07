import Measurements from "@/model/measurements";
import {ScreenH4, ScreenP} from "@/component/typography";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type VitalsProps = Partial<PropsWithClass> & { vitals: [string, Measurements][]; };

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div>
            <div className={classNames([className], "flex w-full justify-evenly")}>
                {vitals.map(([name, vital]) => (
                    <div className="basis-1/2 [&>*]:text-left" key={name}>
                        <ScreenH4>{name}</ScreenH4>
                        <ScreenP>ABV {vital.abv}</ScreenP>
                        <ScreenP>IBU {vital.ibu}</ScreenP>
                        <ScreenP>SRM {vital.srm}</ScreenP>
                        <ScreenP>O.G. {vital.og}</ScreenP>
                        <ScreenP>F.G. {vital.fg}</ScreenP>
                    </div>
                ))}
            </div>
        </div>
    )
}