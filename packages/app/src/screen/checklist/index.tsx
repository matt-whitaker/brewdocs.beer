"use client";

import Screen from "../../component/screen";
import {ScreenH2} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import ButtonChecklist from "@/component/button-checklist";
import ButtonChecklistItem from "@/component/button-checklist/item";
import useButtonChecklist from "@/component/button-checklist/useButtonChecklist";
import Collapse from "@/component/collapse";
import EquipmentChecklist from "@/model/equipemnt-checklist";
import equipment from "@/data/equipment";
import {flatten} from "lodash";
import {useCallback, useMemo} from "react";
import {EquipmentUses} from "@/model/equipment";
import ButtonChecklistAdd from "@/component/button-checklist/add";

export default function Checklist({ batch }: { batch: Batch|null }) {
    const checklist = batch?.recipe?.checklist;

    const [checked, setChecked] = useButtonChecklist(useMemo(() => ({ '3-PBW': true, "3-CO2": true, "3-Star San": true }), []));

    const getItems = useCallback((uses: EquipmentUses[]): string[] => [...new Set<string>(flatten(
        uses.map((use) => equipment
            .filter((eq) => eq.use.includes(use))
            .map(({ name }) => name)
        ))).values()], []);

    if (!batch) { return <Error>'batch' missing</Error>; }
    if (!checklist) { return <Error>'checklist' missing</Error>; }

    return (
        <Screen className="join join-vertical w-full">
            <ScreenH2>Brew Day Checklist</ScreenH2>
            {checklist.map(({ uses, name: title }: EquipmentChecklist, i) => (
                <Collapse key={title} title={title}>
                    <ButtonChecklist className="sm:columns-2">
                        {getItems(uses).map((name) => (
                            <ButtonChecklistItem key={name} id={`${i+1}-${name}`} name={name} checked={checked} toggle={setChecked} />
                        ))}
                        <ButtonChecklistAdd />
                    </ButtonChecklist>
                </Collapse>
            ))}
        </Screen>
    )
}