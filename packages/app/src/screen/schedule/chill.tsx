import DataGrid from "@/component/data-grid";
import DataGridSubheaderRow from "@/component/data-grid/subheader-row";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import Hydrometer from "@/model/hydrometer";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type ScheduleChillProps = {
    hydro: Hydrometer;
    hydroIndex: number;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function ScheduleChill({ hydro, hydroIndex, update, updateScalar }: ScheduleChillProps) {
    return (
        <div className="pt-2">
            <p>
                It is critical you chill your wort as quickly as possible. Cool you wort to 60°F to 72°F, depending on what your beer style calls for.
            </p>
            <div className="divider my-0"></div>
            <DataGridSubheaderRow>Gravity Reading</DataGridSubheaderRow>
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
