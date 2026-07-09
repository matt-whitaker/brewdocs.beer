import {useEffect} from "react";
import batchesStorage from "@/storage/batches";
import sessionStorage from "@/storage/settings";
import {useNavigate} from "@tanstack/react-router";

export default function DbCleanup() {
    const navigate = useNavigate();
    useEffect(() => {
        if (new URLSearchParams(location.search).get("purge") !== null) {
            batchesStorage.purge();
            sessionStorage.purge();
            navigate({to: "/", replace: true});
        }

        return () => {};
    }, []);

    return null;
}
