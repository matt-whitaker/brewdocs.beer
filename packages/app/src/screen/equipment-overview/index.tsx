import {Pencil, ScreenP, Trash} from "@brewdocs.beer/design";
import Action from "@/component/action";
import Screen from "@/component/screen";
import EquipmentDeleteModal from "@/screen/equipment-delete-modal";
import EquipmentEditModal from "@/screen/equipment-edit-modal";
import {useUserEquipmentItem} from "@/state/userEquipment";

export type EquipmentOverviewProps = { equipmentId: string };
export default function EquipmentOverview({ equipmentId }: EquipmentOverviewProps) {
    const equipment = useUserEquipmentItem(equipmentId);

    return (
        <Screen>
            <div className="flex justify-end gap-1 pt-2">
                <Action label="Edit" icon={Pencil} modalContent={<EquipmentEditModal equipmentId={equipmentId} />} />
                <Action
                    label="Delete"
                    icon={Trash}
                    className="btn-sm text-error"
                    modalContent={<EquipmentDeleteModal equipmentId={equipmentId} name={equipment.name} returnToList />}
                />
            </div>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2">
                {equipment.count != null && <ScreenP className="pt-2">Quantity {equipment.count}</ScreenP>}
                <ScreenP className="pt-4">{equipment.notes}</ScreenP>
            </div>
        </Screen>
    );
}
