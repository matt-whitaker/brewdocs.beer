import {useNavigate} from "@tanstack/react-router";
import {useCallback, useMemo, useState} from "react";
import {InputSelect, InputText} from "@brewdocs.beer/design";
import createRecipe from "@/actions/createRecipe";
import ModalScreen from "@/component/modal/screen";
import {useKbRecipeTemplates} from "@/state/kbRecipeTemplates";

const DEFAULT_NAME = "New Recipe";

export default function RecipeCreateModal() {
    const navigate = useNavigate();
    const templates = useKbRecipeTemplates();

    const [name, setName] = useState("");
    const [templateId, setTemplateId] = useState<string|null>(null);

    const templateOptions = useMemo(() => [
        {name: "Empty"},
        ...templates.map(template => ({name: template.name, value: template.id})),
    ], [templates]);

    const onConfirm = useCallback(() =>
        createRecipe(templates.find(t => t.id === templateId), name.trim() || DEFAULT_NAME)
            .then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate, name, templates, templateId]);

    return (
        <ModalScreen title="Create Recipe" onConfirm={onConfirm}>
            <span>
                <label>
                    Recipe name:
                    <InputText value={name} onChange={setName} primary placeholder={DEFAULT_NAME} className="xs:ml-2 mt-2" />
                </label>
            </span>
            <span>
                <label>
                    Template:
                    <InputSelect data={templateOptions} value={templateId} onChange={setTemplateId} className="xs:ml-2 mt-2" />
                </label>
            </span>
        </ModalScreen>
    );
}
