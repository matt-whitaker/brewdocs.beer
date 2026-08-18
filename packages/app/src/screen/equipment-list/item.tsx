import {Link} from "@tanstack/react-router";
import {ScreenH2, ScreenP, Trash} from "@brewdocs.beer/design";
import {KbEquipment} from "@brewdocs.beer/kb";
import Action from "@/component/action";
import UserEquipment from "@/model/userEquipment";
import EquipmentDeleteModal from "@/screen/equipment-delete-modal";

export type EquipmentSource = "kb" | "user";

export type EquipmentListItemProps = {
    equipment: KbEquipment | UserEquipment;
    source: EquipmentSource;
};

export default function EquipmentListItem({ equipment, source }: EquipmentListItemProps) {
    const to = source === "kb" ? "/kb/equipment/$equipmentId" : "/equipment/$equipmentId";
    return (
        <li className="odd:bg-base-200 relative">
            <Link to={to} params={{equipmentId: equipment.id}} className="text-left block">
                <ScreenH2 className="text-lg">{equipment.name}</ScreenH2>
                {equipment.count != null && <ScreenP className="mb-1">Quantity {equipment.count}</ScreenP>}
                <ScreenP className="pt-2">{equipment.notes}</ScreenP>
            </Link>
            {source === "user" && <Action
                label={`Delete ${equipment.name}`}
                icon={Trash}
                iconOnly
                className="btn-xs text-error absolute top-1.5 right-1.5"
                modalContent={<EquipmentDeleteModal equipmentId={equipment.id} name={equipment.name} />}
            />}
        </li>
    );
}

export function EquipmentListItemFallback() {
    return (
        <li className="odd:bg-base-200 relative">
            <ScreenP>This equipment can&rsquo;t be displayed.</ScreenP>
        </li>
    );
}
