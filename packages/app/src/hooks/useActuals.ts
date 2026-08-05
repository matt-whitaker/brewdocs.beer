import {useMemo} from "react";
import {estimateAbv, UNITS} from "@brewdocs.beer/core";
import useGravity from "@/hooks/useGravity";
import Batch from "@/model/batch";
import Measurements from "@/model/measurements";

export default function useActuals(batch: Batch): Measurements {
    const gravity = useGravity(batch.brewable, batch.tracker);

    return useMemo(() => {
        if (!gravity) {
            return batch.actuals;
        }

        const {og, fg} = gravity;

        return {
            ...batch.actuals,
            og,
            fg,
            abv: { value: `${estimateAbv(og, fg).toFixed(1)}%`, unit: UNITS.PERCENT }
        };
    }, [batch.actuals, gravity]);
}
