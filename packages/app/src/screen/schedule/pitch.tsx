import DataGrid from "@/component/data-grid";
import Yeast from "@/model/yeast";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type SchedulePitchProps = {
    yeast: Yeast[];
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function SchedulePitch({ yeast, update, updateScalar }: SchedulePitchProps) {
    return (
        <div className="pt-2">
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
