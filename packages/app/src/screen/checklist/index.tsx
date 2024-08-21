"use client";

import Screen from "../../component/screen";
import useService from "@/service/useService";
import {ScreenH2} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import batchService from "@/service/batch";
import ButtonChecklist from "@/component/button-checklist";
import ButtonChecklistItem from "@/component/button-checklist/item";
import useButtonChecklist from "@/component/button-checklist/useButtonChecklist";
import Collapse from "@/component/collapse";
import EquipmentChecklist from "@/model/equipemnt-checklist";
import equipment from "@/data/equipment";
import {flatten} from "lodash";
import {useCallback} from "react";

export default function Checklist() {
    const batchId = useSearchParams().get("batchId");
    const [checked, setChecked] = useButtonChecklist({  });
    const batch = useService<Batch>(batchService).get(batchId);

    const getItems = useCallback((uses): string[] => [...new Set<string>(flatten(
        uses.map((use) => equipment
            .filter((eq) => eq.use.includes(use))
            .map(({ name }) => name)
        ))).values()], [equipment]);

    if (!batch) { return <Error>'batch' missing</Error>; }

    const checklist = batch?.recipe?.checklist;
    if (!checklist) { return <Error>'checklist' missing</Error>; }

    return (
        <Screen className="join join-vertical">
            <ScreenH2>Brew Day Checklist</ScreenH2>
            {checklist.map(({ uses, name: title }: EquipmentChecklist) => (
                <Collapse title={title}>
                    <ButtonChecklist className="sm:columns-2">
                        {getItems(uses).map((name) => (
                            <ButtonChecklistItem id={`${title}-${name}`} name={name} checked={checked} toggle={setChecked} />
                        ))}
                    </ButtonChecklist>
                </Collapse>
            ))}
        </Screen>
    )
}