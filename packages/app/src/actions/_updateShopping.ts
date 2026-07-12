import Batch, {ShoppingListItem} from "@/model/batch";
import {Currencies, Units} from "@brewdocs.beer/core";
import {groupBy} from "@/utils/func";
import Hop from "@/model/hop";
import {parseNumberString} from "@/utils/math";
import Grain from "@/model/grain";

export default function _updateShopping(batch: Batch): Batch {
    (batch as Batch).shopping = [
        {
            name: "Hops",
            items: ((): ShoppingListItem[] => {
                const groups: Record<string, Hop[]> = groupBy(batch.hops, "name");
                return Object.keys(groups).map(hopName => {
                    const unit = parseNumberString(groups[hopName][0].weight.value)[1];
                    const weight = groups[hopName].reduce((m, v) => m + parseNumberString(v.weight.value)[0], 0.0);
                    return {
                        name: hopName,
                        purchased: false,
                        cost: {
                            value: "$0.00",
                            currency: Currencies.DOLLAR
                        },
                        scalar: {
                            value: `${weight}${unit}`,
                            unit: Units.PERCENT
                        }
                    }
                })
            })()
        },
        {
            name: "Grain",
            items: (() => {
                const groups: Record<string, Grain[]> = groupBy(batch.grains, "name");
                return Object.keys(groups).map(grainName => {
                    const unit = parseNumberString(groups[grainName][0].weight.value)[1];
                    const weight = groups[grainName].reduce((m, v) => m + parseNumberString(v.weight.value)[0], 0.0);

                    return {
                        name: grainName,
                        purchased: false,
                        cost: {
                            value: "$0.00",
                            currency: Currencies.DOLLAR
                        },
                        scalar: {
                            value: `${weight}${unit}`,
                            unit: Units.PERCENT
                        }
                    }
                })
            })(),
        },
        {
            name: "Yeast",
            items: batch.yeasts.map(({ name }) => ({
                name,
                purchased: false,
                cost: {
                    value: "$0.00",
                    currency: Currencies.DOLLAR
                }
            }))
        },
        {
            name: "Additives",
            items: batch.additives.map(({ name }) => ({
                name,
                purchased: false,
                cost: {
                    value: "$0.00",
                    currency: Currencies.DOLLAR
                }
            }))
        }
    ];

    return batch as Batch;
}