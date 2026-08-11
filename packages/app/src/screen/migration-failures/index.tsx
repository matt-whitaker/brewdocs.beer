import {useMemo} from "react";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import ErrorBoundary from "@/component/error-boundary";
import Screen from "@/component/screen";
import MigrationFailureItem, {MigrationFailureItemFallback} from "@/screen/migration-failures/item";
import {
    discardMigrationFailure,
    isRetryable,
    retryMigrationFailure,
    useMigrationFailures
} from "@/state/migrationFailures";

export default function MigrationFailures() {
    const failures = useMigrationFailures();

    const items = useMemo(() => Object.entries(failures).map(([id, failure]) => (
        <ErrorBoundary key={id} fallback={<MigrationFailureItemFallback id={id} onDiscard={discardMigrationFailure} />}>
            <MigrationFailureItem
                id={id}
                failure={failure}
                canRetry={isRetryable(failure)}
                onDiscard={discardMigrationFailure}
                onRetry={retryMigrationFailure}
            />
        </ErrorBoundary>
    )), [failures]);

    return (
        <Screen>
            <ScreenH2>Failed migrations</ScreenH2>
            {items.length
                ? <ul className="w-full menu px-0">{items}</ul>
                : <ScreenP>No records have been set aside.</ScreenP>}
        </Screen>
    );
}
