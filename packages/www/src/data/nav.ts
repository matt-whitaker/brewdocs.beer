import {APP_URL, DESIGN_URL} from "@/data/env";

// third slot marks the inverted call-to-action link
const nav: [string, string, boolean?][] = [
    ["Try the demo", APP_URL, true],
    ["Design system", DESIGN_URL],
    ["About", "/about"]
];

export default nav;
