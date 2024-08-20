"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {useService} from "@/service/useService";
import {ScreenH2, ScreenH3, ScreenP} from "@/component/typography";
import getBatches from "@/service/getBatches";
import Batch from "@/model/batch";

export default function BatchList() {
    const batches = useService<typeof getBatches, Batch[]>(getBatches, []);

    if (!batches) {
        return <></>;
    }

    return (
        <Screen>
            <ScreenH2 className="mt-0">Your brews</ScreenH2>
            <ul className="menu mt-4 px-0">
                {batches.map((batch, i) => (
                    <li key={i} className="odd:bg-base-200">
                        <Link href={`/batch?batchId=${batch.id}`} className="text-left block">
                            <ScreenH2 className="text-xl">{batch.recipe?.name || ""}<br />{batch.name || ""}</ScreenH2>
                            <ScreenH3 className="text-lg mb-1">by {batch.brewer || batch.recipe?.brewer || ""}</ScreenH3>
                            <ScreenP>Status: {batch.status}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}