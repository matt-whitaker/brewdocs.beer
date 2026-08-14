import {useNavigate} from "@tanstack/react-router";
import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import createUserEquipment from "@/actions/createUserEquipment";
import ModalScreen from "@/component/modal/screen";

const DEFAULT_NAME = "New Equipment";

export default function EquipmentCreateModal() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const onConfirm = useCallback(() =>
        createUserEquipment(name.trim() || DEFAULT_NAME)
            .then((id) => navigate({to: "/equipment/$equipmentId", params: {equipmentId: id}})),
    [navigate, name]);

    return (
        <ModalScreen title="Create Equipment" onConfirm={onConfirm}>
            <span>
                <label>
                    Equipment name:
                    <InputText value={name} onChange={setName} primary placeholder={DEFAULT_NAME} className="xs:ml-2 mt-2" />
                </label>
            </span>
        </ModalScreen>
    );
}
