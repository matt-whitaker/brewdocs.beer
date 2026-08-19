import classNames from "classnames";
import {ReactNode} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import {SrmTag} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";

// accepts either a real Batch's Measurements or a KbRecipe's raw targets
// shape (Scalar vs KbScalar) — only .value/.ibu/.srm are ever read
type VitalsLike = {og: {value: string}; fg: {value: string}; abv: {value: string}; ibu: string; srm: string};
export type VitalsProps = Partial<PropsWithClass> & { vitals: [string, VitalsLike][]; };

type Measurement = [string, (vital: VitalsLike) => string, ((vital: VitalsLike) => ReactNode)?];

function parseSrm(srm: string): number {
    return String(srm).trim() ? Number(srm) : NaN;
}

function srmTag(vital: VitalsLike): ReactNode {
    const srm = parseSrm(vital.srm);

    return Number.isFinite(srm) ? <SrmTag srm={srm} /> : null;
}

const MEASUREMENTS: Measurement[] = [
    ["ABV", vital => vital.abv.value],
    ["IBU", vital => vital.ibu],
    ["SRM", vital => vital.srm, srmTag],
    ["O.G.", vital => vital.og.value],
    ["F.G.", vital => vital.fg.value]
];

export default function Vitals({ vitals, className }: VitalsProps) {
    return (
        <div className={classNames("flex w-full gap-x-4", [className])}>
            {vitals.map(([name, vital]) => (
                <DataGrid key={name} className="basis-1/2 min-w-0">
                    <DataGridHeaderRow>{name}</DataGridHeaderRow>
                    {MEASUREMENTS.map(([measurement, read, decorate]) => (
                        <DataGridRow zebra key={measurement}>
                            {}
                            <DataGridLabel cols={2}>{measurement}</DataGridLabel>
                            <div className="col-span-4 flex items-center justify-end gap-x-1 self-center pr-1 text-sm leading-6 lg:leading-8">
                                {decorate?.(vital)}
                                {read(vital)}
                            </div>
                        </DataGridRow>
                    ))}
                </DataGrid>
            ))}
        </div>
    );
}
