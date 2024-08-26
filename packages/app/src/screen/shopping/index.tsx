"use client";

import Error from "@/component/error";
import Batch from "@/model/batch";

export default function Shopping({ batch }: { batch: Batch }) {
    const recipe = batch?.recipe;
    if (!batch) return <Error>'batch' missing</Error>
    if (!recipe) return <Error>'recipe' missing</Error>

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