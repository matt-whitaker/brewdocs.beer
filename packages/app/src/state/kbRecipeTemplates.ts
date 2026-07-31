import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipeTemplate} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";

export const kbRecipeTemplatesQueryKey = () => ["kb", "recipe-templates"];
export const fetchKbRecipeTemplates = async (): Promise<KbRecipeTemplate[]> => {
    const cached = await kbStorage.getResource("recipe-templates");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Recipe templates data isn't downloaded yet, and you're offline.");
    }

    const recipeTemplates = await importResource("recipe-templates");
    return kbStorage.saveResource("recipe-templates", recipeTemplates);
};

export const prefetchKbRecipeTemplates = () => queryClient.prefetchQuery({ queryKey: kbRecipeTemplatesQueryKey(), queryFn: fetchKbRecipeTemplates });

export const useKbRecipeTemplates = (): KbRecipeTemplate[] => {
    const { data } = useSuspenseQuery({ queryKey: kbRecipeTemplatesQueryKey(), queryFn: fetchKbRecipeTemplates });

    if (!data) {
        throw new Error("Unable to load recipe templates from Knowledge Base");
    }

    return data;
};
