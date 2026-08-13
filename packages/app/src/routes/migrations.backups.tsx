import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import Loading from "@/screen/loading";
import MigrationBackups from "@/screen/migration-backups";

export const Route = createFileRoute("/migrations/backups")({
    component: MigrationBackupsPage
});

function MigrationBackupsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <MigrationBackups />
        </Suspense>
    );
}
