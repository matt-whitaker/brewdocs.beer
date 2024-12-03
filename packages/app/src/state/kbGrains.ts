import {importResource, KbGrain} from "@brewdocs.beer/kb"
import State from "@/state/state";
import useObservableState from "@/state/useObservableState";
import Grain from "@/model/grain";

export type KbGrainsTuple = [KbGrain[], Map<string, KbGrain>]|[null, null];
export const useKbGrains = () => useObservableState<KbGrainsTuple, [null, null]>(kbGrainsState, [null, null]);

export class KbGrainsState extends State<KbGrainsTuple, [null, null]>{
    load() {
        importResource("grains")!
            .then((grains: KbGrain[]) => {
                const index = grains.reduce((m, r) => m.set(r.name, r), new Map());
                this._subject.next([grains, index]);
            });
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbGrain): Grain {
        return {
            name: kbHop.name,
            weight: "0.0oz",
        } as Grain;
    }
}

const kbGrainsState = new KbGrainsState([null, null]);
export default kbGrainsState;