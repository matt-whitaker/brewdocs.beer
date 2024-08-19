
import {APP_URL} from "@/data/env";

const nav: [string, string, boolean?][] = [
    ["About", "/about"],
    ["Release", "/release"],
    ["Roadmap", "/roadmap"],
    ["Go to app", APP_URL, true]
]

export default nav;