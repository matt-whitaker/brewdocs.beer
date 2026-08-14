import {useCallback, useState} from "react";
import {InputText, Textarea} from "@brewdocs.beer/design";
import ModalScreen from "@/component/modal/screen";
import {saveUserEquipment, useUserEquipmentItem} from "@/state/userEquipment";

export type EquipmentEditModalProps = { equipmentId: string };

const toCount = (value: string): number | undefined => {
    const count = parseInt(value.trim(), 10);
    return Number.isFinite(count) ? count : undefined;
};

export default function EquipmentEditModal({ equipmentId }: EquipmentEditModalProps) {
    const equipment = useUserEquipmentItem(equipmentId);

    const [name, setName] = useState(equipment.name);
    const [notes, setNotes] = useState(equipment.notes);
    const [count, setCount] = useState(equipment.count == null ? "" : String(equipment.count));

    const onConfirm = useCallback(() => {
        saveUserEquipment(equipmentId, {
            ...equipment,
            name: name.trim() || equipment.name,
            notes,
            count: toCount(count)
        });
    }, [equipmentId, equipment, name, notes, count]);

    return (
        <ModalScreen title="Edit Equipment" onConfirm={onConfirm}>
            <span>
                <label>
                    Equipment name:
                    <InputText value={name} onChange={setName} primary className="xs:ml-2 mt-2" />
                </label>
            </span>
            <span>
                <label>
                    Quantity:
                    <InputText value={count} onChange={setCount} primary placeholder="1" className="xs:ml-2 mt-2" />
                </label>
            </span>
            <span>
                <label>
                    Notes:
                    <Textarea value={notes} onChange={setNotes} primary className="mt-2" />
                </label>
            </span>
        </ModalScreen>
    );
}
