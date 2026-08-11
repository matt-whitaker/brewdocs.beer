import {useNavigate} from "@tanstack/react-router";
import {useEffect} from "react";
import batchesStorage from "@/storage/batches";
import kbStorage from "@/storage/kb";
import migrationBackupsStorage from "@/storage/migration/backups";
import migrationFailuresStorage from "@/storage/migration/failures";
import recipesStorage from "@/storage/recipes";
import sessionStorage from "@/storage/session";

export default function DbCleanup() {
    const navigate = useNavigate();
    useEffect(() => {
        if (new URLSearchParams(location.search).get("purge") !== null) {
            batchesStorage.purge();
            sessionStorage.purge();
            kbStorage.purge();
            recipesStorage.purge();
            migrationFailuresStorage.purge();
            migrationBackupsStorage.purge();
            navigate({to: "/", replace: true});
        }
        // navigate is stable, and the ?purge= guard makes any re-run a no-op
        // (navigating away drops the param), so listing it can't loop
    }, [navigate]);

    return null;
}
