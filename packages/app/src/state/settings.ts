import State from "@/state/state";
import useObservableState from "@/state/useObservableState";
import settingsStorage from "@/storage/settings";

export type Settings = Record<string, boolean>
export const useSettings = () => useObservableState<Settings, null>(settingsState, null);

export class SettingsState extends State<Settings, null> {
    load() {
        settingsStorage.index()
            .then((settings: Settings) => {
                this._subject.next(settings);
            });
    }

    set(id: string, value: any) {
        settingsStorage.save(id, value);
        this.load();
    }
}

const settingsState = new SettingsState(null);
export default settingsState;