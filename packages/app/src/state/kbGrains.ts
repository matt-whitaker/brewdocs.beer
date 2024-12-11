import {importResource, KbGrain} from "@brewdocs.beer/kb"
import Grain from "@/model/grain";
import useCollectionState from "@/hooks/useCollectionState";
import CollectionState from "@/state/collectionState";
import {Units} from "@brewdocs.beer/core";

export const useKbGrains = () => useCollectionState<KbGrain>(kbGrainsState);

export class KbGrainsState extends CollectionState<KbGrain>{
    async load() {
        const grains = await importResource<KbGrain>("grains");
        this._subject.next(grains);
        return grains;
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbGrain): Grain {
        return {
            name: kbHop.name,
            weight: {
                value: "0.0oz",
                unit: Units.OUNCES
            },
        } as Grain;
    }
}

const kbGrainsState = new KbGrainsState(null);
export default kbGrainsState;