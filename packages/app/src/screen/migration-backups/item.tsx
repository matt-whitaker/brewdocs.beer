import {useCallback, useState} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import {RevertKind} from "@/state/migrationBackups";
import {MigrationBackup} from "@/storage/migration/types";

const REVERT_UNSUPPORTED = "Revert isn't available for this kind of record.";
const REVERT_RECORD_GONE = "Revert isn't available — this record is no longer stored.";

const REVERT_KIND_SUMMARY: Record<RevertKind, string> = {
    exact: "Exact revert — restores this record byte-for-byte as it was before the update.",
    computed: "Computed revert — reverses the update's logic, which can lose data the update added."
};

export type MigrationBackupItemProps = {
    id: string;
    backup: MigrationBackup;
    revertKind?: RevertKind;
    supportsRevert: boolean;
    onRevert: (id: string, backup: MigrationBackup) => Promise<boolean>;
};

export default function MigrationBackupItem({id, backup, revertKind, supportsRevert, onRevert}: MigrationBackupItemProps) {
    const {entityType, id: recordId, fromVersion, toVersion, migratedAt, data} = backup;
    const [revertRejected, setRevertRejected] = useState(false);
    const revertUnavailable = supportsRevert ? REVERT_RECORD_GONE : REVERT_UNSUPPORTED;

    const revert = useCallback(async () => {
        setRevertRejected(!(await onRevert(id, backup)));
    }, [id, backup, onRevert]);

    return (
        <li className="odd:bg-base-200 block p-3">
            <ScreenH3 className="text-lg normal-case break-all">{recordId ? `${entityType} · ${recordId}` : entityType}</ScreenH3>
            <ScreenP>Updated from version {fromVersion} to version {toVersion} on {migratedAt.slice(0, 10)}.</ScreenP>
            {revertKind
                ? <ScreenP>{REVERT_KIND_SUMMARY[revertKind]}</ScreenP>
                : <ScreenP className="text-2xs">{revertUnavailable}</ScreenP>}
            <pre className="mt-2 max-h-64 overflow-auto rounded-box bg-base-300 p-2 text-2xs">{JSON.stringify(data, null, 2)}</pre>
            {revertRejected && <ScreenP className="text-error mt-2">Revert failed &mdash; this record still can&rsquo;t be reverted.</ScreenP>}
            <button
                type="button"
                className="btn btn-xs mt-2"
                disabled={!revertKind}
                title={revertKind ? undefined : revertUnavailable}
                onClick={revert}>
                Revert
            </button>
        </li>
    );
}

export type MigrationBackupItemFallbackProps = {
    id: string;
};

export function MigrationBackupItemFallback({id}: MigrationBackupItemFallbackProps) {
    return (
        <li className="odd:bg-base-200 block p-3">
            <ScreenP>This updated record can&rsquo;t be displayed, so it can&rsquo;t be reverted from here.</ScreenP>
            <ScreenP className="font-mono text-2xs break-all">{id}</ScreenP>
        </li>
    );
}
