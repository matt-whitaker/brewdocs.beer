import Vitals from "@brewdocs/model/vitals";
import {ScreenH3, ScreenH4, ScreenP} from "@brewdocs/component/typography";
import classNames from "classnames";
import {PropsWithChildren} from "react";

export type VitalsProps = { vitals: [[string, Vitals], [string, Vitals]]; className?: string; };

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div>
            <div className={classNames([className], "flex w-full justify-evenly [&>div]:grow [&>div>*]:text-left")}>
                {vitals.map(([name, vitals]) => (
                    <div key={name}>
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