import {useMemo} from "react";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import ErrorBoundary from "@/component/error-boundary";
import Screen from "@/component/screen";
import MigrationBackupItem, {MigrationBackupItemFallback} from "@/screen/migration-backups/item";
import {
    isRevertable,
    revertMigrationBackup,
    useMigrationBackups,
    useRevertKinds
} from "@/state/migrationBackups";

export default function MigrationBackups() {
    const backups = useMigrationBackups();
    const revertKinds = useRevertKinds();

    const items = useMemo(() => Object.entries(backups).map(([id, backup]) => (
        <ErrorBoundary key={id} fallback={<MigrationBackupItemFallback id={id} />}>
            <MigrationBackupItem
                id={id}
                backup={backup}
                revertKind={revertKinds[id]}
                supportsRevert={isRevertable(backup)}
                onRevert={revertMigrationBackup}
            />
        </ErrorBoundary>
    )), [backups, revertKinds]);

    return (
        <Screen>
            <ScreenH2>Reverts</ScreenH2>
            {items.length
                ? <ul className="w-full menu px-0">{items}</ul>
                : <ScreenP>No updated records are available to revert.</ScreenP>}
        </Screen>
    );
}
