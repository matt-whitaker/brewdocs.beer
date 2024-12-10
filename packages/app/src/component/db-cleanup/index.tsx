"use client";

import {useEffect} from "react";
import batchesStorage from "@/storage/batches";
import sessionStorage from "@/storage/settings";
import {useRouter} from "next/navigation";

export default function DbCleanup() {
    const router = useRouter();
    useEffect(() => {
        if (new URLSearchParams(location.search).get("purge") !== null) {
            batchesStorage.purge();
            sessionStorage.purge();
            router.push("/");
        }

        return () => {};
    }, []);

    return null;
}