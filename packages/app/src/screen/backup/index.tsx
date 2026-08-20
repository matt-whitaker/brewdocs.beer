import {ChangeEvent, useCallback, useState} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import restoreBackup from "@/actions/restoreBackup";
import Action from "@/component/action";
import Screen from "@/component/screen";
import {BackupContents, UNREADABLE_BACKUP, backupFile, readBackup} from "@/model/backup";
import {useClock} from "@/providers/clock";
import {useBatches} from "@/state/batches";
import {useRecipes} from "@/state/recipes";
import {APP_VERSION} from "@/utils/env";
import {shareFile} from "@/utils/share";

const FAILED_MESSAGE = "That backup could not be handed off. Try again.";
const RESTORE_LABEL = "Restore from a backup file";
const RESTORE_FAILED_MESSAGE = "That backup could not be restored. Try again.";
const RESTORED_MESSAGE = "Restored. Your batches and recipes now match that file.";

type RestoreNotice = {message: string, failed: boolean};

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
    const [restoreNotice, setRestoreNotice] = useState<RestoreNotice|null>(null);

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

    const restore = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setRestoreNotice(null);

        let contents: BackupContents;

        try {
            contents = readBackup(await file.text());
        } catch {
            setRestoreNotice({message: UNREADABLE_BACKUP, failed: true});
            return;
        }

        try {
            await restoreBackup(contents);
            setRestoreNotice({message: RESTORED_MESSAGE, failed: false});
        } catch {
            setRestoreNotice({message: RESTORE_FAILED_MESSAGE, failed: true});
        }
    }, []);

    return (
        <Screen>
            <ScreenP>
                A backup is a single file holding every batch and recipe stored on this device.
                Keep it wherever you like — it is the only way back if this browser&apos;s data is
                cleared or the device is lost.
            </ScreenP>
            <Action label="Back up now" className="btn-md text-primary mt-3" onClick={backUpNow} />
            {failed && <ScreenP className="text-error">{FAILED_MESSAGE}</ScreenP>}
            <ScreenP className="mt-6">
                Restoring replaces what is on this device with what the file holds. A file with only
                recipes in it leaves your batches untouched, and the other way round.
            </ScreenP>
            <label className="mt-3 flex w-full flex-col gap-1">
                <span className="text-sm">{RESTORE_LABEL}</span>
                <input
                    type="file"
                    accept=".json,application/json"
                    className="file-input w-full"
                    onChange={(event) => void restore(event)}
                />
            </label>
            {restoreNotice &&
                <ScreenP className={restoreNotice.failed ? "text-error" : void 0}>{restoreNotice.message}</ScreenP>}
        </Screen>
    );
}
