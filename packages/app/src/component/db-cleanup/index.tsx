import {useEffect} from "react";
import batchesStorage from "@/storage/batches";
import sessionStorage from "@/storage/session";
import kbStorage from "@/storage/kb";
import {useNavigate} from "@tanstack/react-router";

export default function DbCleanup() {
    const navigate = useNavigate();
    useEffect(() => {
        if (new URLSearchParams(location.search).get("purge") !== null) {
            batchesStorage.purge();
            sessionStorage.purge();
            kbStorage.purge();
            navigate({to: "/", replace: true});
        }
        // navigate is stable, and the ?purge= guard makes any re-run a no-op
        // (navigating away drops the param), so listing it can't loop
    }, [navigate]);

    return null;
}
