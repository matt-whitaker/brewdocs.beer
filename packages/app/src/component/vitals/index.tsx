import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";

// accepts either a real Batch's Measurements or a KbRecipe's raw targets
// shape (Scalar vs KbScalar) — only .value/.ibu/.srm are ever read
type VitalsLike = {og: {value: string}; fg: {value: string}; abv: {value: string}; ibu: string; srm: string};
export type VitalsProps = Partial<PropsWithClass> & { vitals: [string, VitalsLike][]; };

const MEASUREMENTS: [string, (vital: VitalsLike) => string][] = [
    ["ABV", vital => vital.abv.value],
    ["IBU", vital => vital.ibu],
    ["SRM", vital => vital.srm],
    ["O.G.", vital => vital.og.value],
    ["F.G.", vital => vital.fg.value]
];

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div className={classNames("flex w-full gap-x-4", [className])}>
            {vitals.map(([name, vital]) => (
                <DataGrid key={name} className="basis-1/2 min-w-0">
                    <DataGridHeaderRow>{name}</DataGridHeaderRow>
                    {MEASUREMENTS.map(([measurement, read]) => (
                        <DataGridRow zebra key={measurement}>
                            {/* read-only summary, so the value is plain text rather than an input */}
                            <DataGridLabel cols={2}>{measurement}</DataGridLabel>
                            <div className="col-span-4 self-center pr-1 text-sm text-right">{read(vital)}</div>
                        </DataGridRow>
                    ))}
                </DataGrid>
            ))}
        </div>
    )
}
