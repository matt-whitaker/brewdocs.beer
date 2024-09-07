import Measurements from "@/model/measurements";
import {ScreenH4, ScreenP} from "@/component/typography";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type VitalsProps = Partial<PropsWithClass> & { vitals: [[string, Measurements], [string, Measurements]?]; };

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div>
            <div className={classNames([className], "flex w-full justify-evenly")}>
                {vitals.map(([name, vitals]) => (
                    <div className="basis-1/2 [&>*]:text-left" key={name}>
                        <ScreenH4>{name}</ScreenH4>
                        <ScreenP>ABV {vitals.abv}</ScreenP>
                        <ScreenP>IBU {vitals.ibu}</ScreenP>
                        <ScreenP>SRM {vitals.srm}</ScreenP>
                        <ScreenP>O.G. {vitals.og}</ScreenP>
                        <ScreenP>F.G. {vitals.fg}</ScreenP>
                    </div>
                ))}
            </div>
        </div>
    )
}