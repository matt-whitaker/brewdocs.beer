import {useEffect} from "react";
import {useNavigate} from "@tanstack/react-router";
import {runMigrations} from "@/utils/migrationPlan";

export default function DbMigrate() {
    const navigate = useNavigate();
    useEffect(() => {
        if (new URLSearchParams(location.search).get("migrate") !== null) {
            runMigrations().then(() => navigate({to: "/", replace: true}));
        }

        return () => {};
    }, []);

    return null;
}
