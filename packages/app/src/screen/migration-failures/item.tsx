import {useCallback, useState} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import {MigrationFailure} from "@/storage/migration/types";

const RETRY_UNAVAILABLE = "This record can't be retried automatically.";

export type MigrationFailureItemProps = {
    id: string;
    failure: MigrationFailure;
    canRetry: boolean;
    onDiscard: (id: string) => Promise<void>;
    onRetry: (id: string, failure: MigrationFailure) => Promise<boolean>;
};

export default function MigrationFailureItem({id, failure, canRetry, onDiscard, onRetry}: MigrationFailureItemProps) {
    const {entityType, id: recordId, fromVersion, targetVersion, data, error} = failure;
    const [retryRejected, setRetryRejected] = useState(false);

    const discard = useCallback(() => { onDiscard(id); }, [id, onDiscard]);
    const retry = useCallback(async () => {
        setRetryRejected(!(await onRetry(id, failure)));
    }, [id, failure, onRetry]);

    return (
        <li className="odd:bg-base-200 block p-3">
            <ScreenH3 className="text-lg normal-case break-all">{recordId ? `${entityType} · ${recordId}` : entityType}</ScreenH3>
            <ScreenP>Version {fromVersion} &rarr; {targetVersion}</ScreenP>
            <ScreenP className="text-error">{error}</ScreenP>
            <pre className="mt-2 max-h-64 overflow-auto rounded-box bg-base-300 p-2 text-2xs">{JSON.stringify(data, null, 2)}</pre>
            {retryRejected && <ScreenP className="text-error mt-2">Retry failed &mdash; this record still can&rsquo;t be updated.</ScreenP>}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    className="btn btn-xs"
                    disabled={!canRetry}
                    title={canRetry ? undefined : RETRY_UNAVAILABLE}
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
