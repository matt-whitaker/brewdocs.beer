import {importResource, KbHop} from "@brewdocs.beer/kb"
import Hop from "@/model/hop";
import CollectionState from "@/state/collectionState";
import useCollectionState from "@/hooks/useCollectionState";
import {Units} from "@brewdocs.beer/core";

export const useKbHops = () => useCollectionState<KbHop>(kbHopsState);

export class KbHopsState extends CollectionState<KbHop>{
    async load() {
        const hops = await importResource<KbHop>("hops");
        this._subject.next(hops);
        return hops;
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbHop): Hop {
        return {
            name: kbHop.name,
            weight: {
                value: "0.0oz",
                unit: Units.OUNCES
            },
            alpha: {
                value: `${kbHop.alpha}%`,
                unit: Units.PERCENT
            },
            boil: {
                value: "60min",
                unit: Units.MINUTES
            },
            phase: "boil"
        } as Hop;
    }
}

const kbHopsState = new KbHopsState(null);
export default kbHopsState;