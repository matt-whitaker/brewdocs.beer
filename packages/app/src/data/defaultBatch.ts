import Batch, {BATCH_MODEL_VERSION, Phase, SchedulePhase} from "@/model/batch";
import {Units} from "@brewdocs.beer/core";
import Statuses from "@/model/statuses";
import equipment from "@/data/equipment";
import {EquipmentUses} from "@/model/equipment";
import {intersection} from "@/utils/func";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";

/** pulls the kit for a phase out of the catalog by matching EquipmentUses tags */
const forUse = (phase: SchedulePhase, ...uses: EquipmentUses[]) => equipment
    .filter(({ use }) => intersection(uses, use).length > 0)
    .map(item => equipmentToScheduleItem(item, phase));

/** the out-of-the-box Schedule tabs: one per brew-day stage */
const phases: Phase[] = [
    { name: "Mash", tags: ["mash"], equipment: forUse("mash", "mash", "clean", "measure") },
    // chilling is just the closing gravity reading, so it rides along with the boil
    { name: "Boil", tags: ["boil"], equipment: forUse("boil", "boil", "measure", "transfer") },
    { name: "Ferment", tags: ["ferment"], equipment: forUse("ferment", "starter", "primary", "secondary") }
];

const defaultBatch  = {
    version: BATCH_MODEL_VERSION,
    phases,
    // same placeholder the hydrometer dates use
    pitchedDate: "0000-00-00",
    batchSize: {
        value: "5gal",
        unit: Units.GALLONS
    },
    efficiency: {
        value: "75%",
        unit: Units.PERCENT
    },
    boilTime: {
        value: "60min",
        unit: Units.MINUTES
    },
    status: Statuses.PREP,
    actuals: {
        og: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        fg: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        abv: {
            value: "0.0%",
            unit: Units.PERCENT
        },
        ibu: "0",
        srm: "0"
    },
    hydrometer: [
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "Before boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After Ferment",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After secondary",
        }
    ],
}

export default defaultBatch as Pick<Batch, keyof typeof defaultBatch>