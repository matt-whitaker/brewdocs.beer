import {useSuspenseQuery} from "@tanstack/react-query";
import {runMigrationPass} from "@/storage/migration/pass";

export const migrationPassQueryKey = () => ["migration-pass"];

export const completeMigrationPass = async (): Promise<true> => {
    await runMigrationPass();
    return true;
};

export const useMigrationPass = (): void => {
    useSuspenseQuery({queryKey: migrationPassQueryKey(), queryFn: completeMigrationPass});
};
