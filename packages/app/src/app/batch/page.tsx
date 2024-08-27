
import {Suspense} from "react";
import RecipeContent from "@/app/batch/content";

export default function Recipe() {
    return (
        <Suspense>
            <RecipeContent />
        </Suspense>
    );
}
