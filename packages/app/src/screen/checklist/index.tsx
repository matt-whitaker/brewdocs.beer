"use client";

import Screen from "../../component/screen";
import useService from "@/service/useService";
import {ScreenH2} from "@/component/typography";
import Batch from "@/model/batch";
import Error from "@/component/error";
import {useSearchParams} from "next/navigation";
import batchService from "@/service/batch";

export default function Checklist() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<Batch>(batchService).get(batchId);
    if (!batch) { return <Error>'batch' missing</Error>; }

    const equipment = batch?.recipe?.equipment;
    if (!equipment) { return <Error>'equipment' missing</Error>; }

    return (
        <Screen>
            <ScreenH2>Brew Day Checklist</ScreenH2>
            <div className="mt-3 flex">
                <ul className="grid-flow-col lg:columns-3 columns-1 w-full ">
                    {equipment.map(({ name }) => (
                        <label key={name} className="mb-0.5 text-lg flex items-center">
                            <input type="checkbox" className="checkbox sm:checkbox-sm checkbox-xs mr-3" />
                            {name}
                        </label>
                    ))}
                </ul>
            </div>
        </Screen>
    )
}