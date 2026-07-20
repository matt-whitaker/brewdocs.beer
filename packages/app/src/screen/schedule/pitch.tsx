import {useCallback} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import Yeast from "@/model/yeast";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import {saveSession, useSession} from "@/state/session";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

const SESSION_KEY = "schedule.pitch";

export type SchedulePitchProps = {
    yeast: Yeast[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function SchedulePitch({ yeast, update, updateScalar }: SchedulePitchProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    return (
        <div>
            <DataGridHeaderRow
                collapsible
                label="Pitch"
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                4. Pitch
            </DataGridHeaderRow>
            <DataGrid>
                {yeast.map((yeast: Yeast, i) => (
                    <DataGridRow zebra key={`yeast-${yeast.name}-${i}`}>
                        <DataGridLabel className="cozy">{yeast.name}</DataGridLabel>
                        <DataGridInput
                            col={3}
                            value={yeast.temp.value}
                            onChange={(value: string) => update(`yeasts[${i}].temp.value`, value)}
                            onBlur={(value: string) => updateScalar(`yeasts[${i}].temp`, value)}
                        />
                    </DataGridRow>
                ))}
            </DataGrid>
        </div>
    )
}
