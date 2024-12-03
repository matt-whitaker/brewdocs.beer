import { KbHop, importResource } from "@brewdocs.beer/kb"
import State from "@/state/state";
import useObservableState from "@/state/useObservableState";
import Hop from "@/model/hop";

export type KbHopsTuple = [KbHop[], Map<string, KbHop>]|[null, null];
export const useKbHops = () => useObservableState<KbHopsTuple, [null, null]>(kbHopsState, [null, null]);

export class KbHopsState extends State<KbHopsTuple, [null, null]>{
    load() {
        importResource("hops")!
            .then((hops: KbHop[]) => {
                const index = hops.reduce((m, r) => m.set(r.name, r), new Map());
                this._subject.next([hops, index]);
            });
    }

    /**
     * Map a Knowledge-base hop to local app model, setting defaults
     */
    kbToState(kbHop: KbHop): Hop {
        return {
            name: kbHop.name,
            weight: "0.0oz",
            alpha: `${kbHop.alpha}%`,
            boil: "60.0",
            phase: "boil"
        } as Hop;
    }
}

const kbHopsState = new KbHopsState([null, null]);
export default kbHopsState;