import {useCallback, useState} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import Action from "@/component/action";
import Screen from "@/component/screen";
import {backupFile} from "@/model/backup";
import {useClock} from "@/providers/clock";
import {useBatches} from "@/state/batches";
import {useRecipes} from "@/state/recipes";
import {APP_VERSION} from "@/utils/env";
import {shareFile} from "@/utils/share";

const FAILED_MESSAGE = "That backup could not be handed off. Try again.";

/**
 * Batches and recipes are read on render rather than inside the click handler: Web
 * Share needs the user activation the tap gave it, and an awaited store read in
 * between can spend it before `navigator.share` is ever reached.
 */
export default function Backup() {
    const batches = useBatches();
    const recipes = useRecipes();
    const clock = useClock();
    const [failed, setFailed] = useState(false);

    const backUpNow = useCallback(() => {
        const file = backupFile({
            appVersion: APP_VERSION,
            exportedAt: clock.now().toISOString(),
            batches,
            recipes
        });

        setFailed(false);
        shareFile(file).catch((cause: unknown) => {
            setFailed(!(cause instanceof Error && cause.name === "AbortError"));
        });
    }, [batches, clock, recipes]);

    return (
        <Screen>
            <ScreenP>
                A backup is a single file holding every batch and recipe stored on this device.
                Keep it wherever you like — it is the only way back if this browser&apos;s data is
                cleared or the device is lost.
            </ScreenP>
            <Action label="Back up now" className="btn-md text-primary mt-3" onClick={backUpNow} />
            {failed && <ScreenP className="text-error">{FAILED_MESSAGE}</ScreenP>}
        </Screen>
    );
}
