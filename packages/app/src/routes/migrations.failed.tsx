import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import Loading from "@/screen/loading";
import MigrationFailures from "@/screen/migration-failures";

export const Route = createFileRoute("/migrations/failed")({
    component: MigrationFailuresPage
});

function MigrationFailuresPage() {
    return (
        <Suspense fallback={<Loading />}>
            <MigrationFailures />
        </Suspense>
    );
}
