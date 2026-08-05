import {useMemo} from "react";
import {estimateAbv, Scalar, UNITS} from "@brewdocs.beer/core";
import Batch from "@/model/batch";
import Measurements from "@/model/measurements";
import {key} from "@/model/tracker";

type DatedReading = { reading: Scalar; date: string };

const isDatedReading = (entry: unknown): entry is DatedReading => {
    const {reading, date} = (entry ?? {}) as DatedReading;
    return Boolean(date) && Number.isFinite(parseFloat(reading?.value ?? ""));
};

function gravityReadings(batch: Batch): DatedReading[] {
    return batch.brewable.schedule.phases
        .flatMap(phase => phase.milestones)
        .filter(milestone => milestone.kind === "gravity")
        .map(milestone => batch.tracker[key({on: "milestone", id: milestone.id})])
        .filter(isDatedReading)
        .sort((a, b) => a.date.localeCompare(b.date));
}

function deriveActuals(batch: Batch): Measurements {
    const readings = gravityReadings(batch);
    if (!readings.length) {
        return batch.actuals;
    }

    const og = readings[0].reading;
    const fg = readings[readings.length - 1].reading;

    return {
        ...batch.actuals,
        og,
        fg,
        abv: { value: `${estimateAbv(og, fg).toFixed(1)}%`, unit: UNITS.PERCENT }
    };
}

export default function useActuals(batch: Batch): Measurements {
    return useMemo(() => deriveActuals(batch), [batch]);
}
