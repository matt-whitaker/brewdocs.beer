import {useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import ModalScreen from "@/component/modal/screen";
import {deleteUserEquipment} from "@/state/userEquipment";

export type EquipmentDeleteModalProps = {
    equipmentId: string;
    name: string;
    returnToList?: boolean;
};

export default function EquipmentDeleteModal({ equipmentId, name, returnToList }: EquipmentDeleteModalProps) {
    const navigate = useNavigate();

    const onConfirm = useCallback(async () => {
        if (returnToList) await navigate({to: "/equipment"});
        await deleteUserEquipment(equipmentId);
    }, [equipmentId, navigate, returnToList]);

    return (
        <ModalScreen title={`Delete ${name}?`} onConfirm={onConfirm}>
            <ScreenP>This can&apos;t be undone.</ScreenP>
        </ModalScreen>
    );
}
