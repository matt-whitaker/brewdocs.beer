"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {useService} from "@/service/useService";
import {ScreenH2} from "@/component/typography";
import getBatches from "@/service/getBatches";

export default function BatchList() {
    const batches = useService<typeof getBatches>(getBatches, []);

    if (!batches) {
        return <></>;
    }

    return (
        <Screen>
            <ScreenH2 className="mt-0">Your brews</ScreenH2>
            <ul className="mt-4">
                {batches.map((batch, i) => (
                    <li key={batch.id} className="list-disc ml-5 underline hover:font-semibold">
                        <Link href={`/batch?batchId=${i}`}>{batch.name || batch.recipe?.name} by {batch.brewer || batch.recipe?.brewer}</Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}