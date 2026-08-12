import {PropsWithChildren, Suspense} from "react";
import Loading from "@/screen/loading";
import {useMigrationPass} from "@/state/migrations";

function MigratedRecords({children}: PropsWithChildren) {
    useMigrationPass();

    return <>{children}</>;
}

export default function MigrationGate({children}: PropsWithChildren) {
    return (
        <Suspense fallback={<Loading />}>
            <MigratedRecords>{children}</MigratedRecords>
        </Suspense>
    );
}
