import {ScreenH4, ScreenH5} from "@brewdocs.beer/design";
import {Fragment, useCallback} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import Grain from "@/model/grain";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import {saveSession, useSession} from "@/state/session";
import {Mash} from "@/model/mash";
import Hydrometer from "@/model/hydrometer";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

const SESSION_KEY = "schedule.mash";

export type ScheduleMashProps = {
    mash: Mash[];
    grains: Grain[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    hydro: Hydrometer;
    hydroIndex: number;
};

export default function ScheduleMash({ mash, grains, update, updateScalar, hydro, hydroIndex }: ScheduleMashProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    return (
        <div>
            <DataGridHeaderRow
                label="Mash"
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                1. Mash
            </DataGridHeaderRow>
            {mash.map((m, i) => (
                <Fragment key={`mash-${m.name}-${i}`}>
                    <ScreenH4 className="cozy">{m.name} - {m.time.value}</ScreenH4>
                    <DataGrid>
                        {grains.map((grain: Grain, i) => (
                            <DataGridRow zebra key={`grain-${grain.name}-${i}`}>
                                <DataGridLabel>{grain.name} <DataGridLabelNote>({grain.weight.value})</DataGridLabelNote></DataGridLabel>
                                <DataGridInput readonly value={m.temp.value} col={3} />
                            </DataGridRow>
                        ))}
                    </DataGrid>
                </Fragment>
            ))}
            <div className="divider my-0"></div>
            <ScreenH5 className="cozy">Gravity Reading</ScreenH5>
            <DataGrid>
                <DataGridRow zebra key={`hydro-${hydro.name}-${hydroIndex}`}>
                    <DataGridLabel>
                        <DataGridInput
                            col={1}
                            type="date"
                            value={hydro.date}
                            onChange={(value: string) => update(`hydrometer[${hydroIndex}].date`, value)}
                        />
                    </DataGridLabel>
                    <DataGridInput
                        col={3}
                        value={hydro.gravity.value}
                        onChange={(value: string) => update(`hydrometer[${hydroIndex}].gravity.value`, value)}
                        onBlur={(value: string) => updateScalar(`hydrometer[${hydroIndex}].gravity`, value)}
                    />
                </DataGridRow>
            </DataGrid>
        </div>
    )
}
