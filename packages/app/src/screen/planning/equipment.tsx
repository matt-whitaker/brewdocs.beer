import {Phase} from "@/model/batch";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import PlanningEquipmentPhase from "@/screen/planning/equipment-phase";

export type PlanningEquipmentProps = {
    phases: Phase[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
}
export default function PlanningEquipment({ phases, add, remove, update }: PlanningEquipmentProps) {
    return (
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            {phases.map((phase, i) => (
                <PlanningEquipmentPhase
                    key={phase.name}
                    phase={i}
                    name={phase.name}
                    items={phase.equipment}
                    add={add}
                    remove={remove}
                    update={update}
                />
            ))}
        </div>
    );
}
