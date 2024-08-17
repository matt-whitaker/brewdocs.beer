import {WWW_URL} from "@/data/env";

const nav: [string, string?][] = [
    ["About", `${WWW_URL}/about`],
    ["------------------------------"],
    ["Home", "/"],
    ["-> Resume Brew", "/recipe/0"],
    ["Brew a Beer", "/recipe"],
    ["Knowledge Base", "/knowledge"]
]

export default nav;