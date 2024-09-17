import State from "@/state/state";
import useObservableState from "@/state/useObservableState";
import sessionStorage from "@/storage/settings";

export type Session = Record<string, boolean>
export const useSettings = () => useObservableState<Session, null>(sessionState, null);

export class SessionState extends State<Session, null> {
    load() {
        sessionStorage.index()
            .then((settings: Session) => {
                this._subject.next(settings);
            });
    }

    set(id: string, value: any) {
        sessionStorage.save(id, value);
        this.load();
    }
}

const sessionState = new SessionState(null);
export default sessionState;