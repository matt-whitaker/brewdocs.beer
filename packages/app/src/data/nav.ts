import {WWW_URL} from "@/utils/env";

const nav: [string, string?][] = [
    ["About", `${WWW_URL}/about`],
    ["Disclaimer", "/disclaimer"],
    ["", "divider"],

    ["Batches", "/batches"],
    ["Recipes", "/recipes"],
    ["Equipment", "/equipment"],
    ["Backup", "/backup"]
];

export default nav;