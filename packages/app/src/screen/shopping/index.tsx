"use client";

import Error from "@/component/error";
import useService from "@/service/useService";
import Batch from "@/model/batch";
import {useSearchParams} from "next/navigation";
import batchService from "@/service/batch";

export default function Shopping() {
    const batchId = useSearchParams().get("batchId");
    const batch = useService<Batch|null>(batchService.get, null, [batchId]);
    if (!batch) return <Error>'batch' missing</Error>
    const recipe = batch.recipe;

    // Todo: if batch, but not recipe = something went wrong.
    if (!batch || !recipe) return <></>;

    const categories = [
        { title: "Hops", data: batch?.hops ?? recipe.hops }
    ]
    return null;
    // return (
    //     <Screen>
    //         <ScreenH2>Shopping List</ScreenH2>
    //         <div className="mt-3 flex">
    //             <ul className="grid-flow-col lg:columns-3 columns-1 w-full ">
    //                 {equipment.map(({ name }) => (
    //                     <label key={name} className="mb-0.5 text-lg flex items-center">
    //                         <input type="checkbox" className="checkbox sm:checkbox-sm checkbox-xs mr-3" />
    //                         {name}
    //                     </label>
    //                 ))}
    //             </ul>
    //         </div>
    //     </Screen>
    // );
}