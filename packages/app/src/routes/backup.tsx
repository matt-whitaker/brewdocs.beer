import {createFileRoute} from "@tanstack/react-router";
import {Suspense} from "react";
import {Crumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";
import Backup from "@/screen/backup";
import Loading from "@/screen/loading";

const BREADCRUMBS: Crumb[] = [{ label: "Backup" }];

export const Route = createFileRoute("/backup")({
    component: BackupPage
});

function BackupPage() {
    useBreadcrumbs(BREADCRUMBS);

    return (
        <Suspense fallback={<Loading />}>
            <Backup />
        </Suspense>
    );
}
