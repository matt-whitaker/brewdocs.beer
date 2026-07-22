import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {Phase, phaseLabel, SchedulePhase} from "@/model/batch";
import BatchPlanningEquipmentPhase from "@/screen/batch-planning/equipment-phase";

export type BatchPlanningEquipmentProps = {
    phases: Phase[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
};
export default function BatchPlanningEquipment({ phases, add, remove, update }: BatchPlanningEquipmentProps) {
    return (
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            {phases.map((phase, i) => (
                <BatchPlanningEquipmentPhase
                    key={phase.name}
                    phase={i}
                    name={phase.name}
                    label={phaseLabel(phase, i)}
                    schedulePhase={phase.tags[0] as SchedulePhase}
                    items={phase.equipment}
                    add={add}
                    remove={remove}
                    update={update}
                />
            ))}
        </div>
    );
}
