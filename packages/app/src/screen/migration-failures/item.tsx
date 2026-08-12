import {useCallback, useState} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import {MigrationFailure, MigrationFailureReason} from "@/storage/migration/types";

const RETRY_UNAVAILABLE = "Retry isn't available for this record. Discarding it is the only action.";
const RETRY_NEEDS_UPDATE_PATH = "Retry isn't available until an update path exists. Discarding it is the only action.";

const REASON_SUMMARY: Record<MigrationFailureReason, string> = {
    "no-migration-path": "No update path exists for this record yet.",
    "migration-error": "An update was attempted and failed."
};

export type MigrationFailureItemProps = {
    id: string;
    failure: MigrationFailure;
    canRetry: boolean;
    onDiscard: (id: string) => Promise<void>;
    onRetry: (id: string, failure: MigrationFailure) => Promise<boolean>;
};

export default function MigrationFailureItem({id, failure, canRetry, onDiscard, onRetry}: MigrationFailureItemProps) {
    const {entityType, id: recordId, fromVersion, targetVersion, data, error, reason} = failure;
    const [retryRejected, setRetryRejected] = useState(false);
    const retryUnavailable = reason === "no-migration-path" ? RETRY_NEEDS_UPDATE_PATH : RETRY_UNAVAILABLE;

    const discard = useCallback(() => { onDiscard(id); }, [id, onDiscard]);
    const retry = useCallback(async () => {
        setRetryRejected(!(await onRetry(id, failure)));
    }, [id, failure, onRetry]);

    return (
        <li className="odd:bg-base-200 block p-3">
            <ScreenH3 className="text-lg normal-case break-all">{recordId ? `${entityType} · ${recordId}` : entityType}</ScreenH3>
            <ScreenP>Stuck at version {fromVersion} &mdash; the app expects version {targetVersion}.</ScreenP>
            <ScreenP>{REASON_SUMMARY[reason]}</ScreenP>
            {reason === "migration-error" && <ScreenP className="text-error">{error}</ScreenP>}
            <pre className="mt-2 max-h-64 overflow-auto rounded-box bg-base-300 p-2 text-2xs">{JSON.stringify(data, null, 2)}</pre>
            {retryRejected && <ScreenP className="text-error mt-2">Retry failed &mdash; this record still can&rsquo;t be updated.</ScreenP>}
            {!canRetry && <ScreenP className="mt-2 text-2xs">{retryUnavailable}</ScreenP>}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    className="btn btn-xs"
                    disabled={!canRetry}
                    title={canRetry ? undefined : retryUnavailable}
                    onClick={retry}>
                    Retry
                </button>
                <button type="button" className="btn btn-xs text-error" onClick={discard}>Discard</button>
            </div>
        </li>
    );
}

export type MigrationFailureItemFallbackProps = {
    id: string;
    onDiscard: (id: string) => Promise<void>;
};

export function MigrationFailureItemFallback({id, onDiscard}: MigrationFailureItemFallbackProps) {
    const discard = useCallback(() => { onDiscard(id); }, [id, onDiscard]);

    return (
        <li className="odd:bg-base-200 block p-3">
            <ScreenP>This failed record can&rsquo;t be displayed.</ScreenP>
            <ScreenP className="font-mono text-2xs break-all">{id}</ScreenP>
            <button type="button" className="btn btn-xs text-error mt-2" onClick={discard}>Discard</button>
        </li>
    );
}
