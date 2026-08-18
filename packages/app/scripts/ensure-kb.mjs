#!/usr/bin/env node
import {execSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const appDir = path.resolve(import.meta.dirname, "..");
const publicKb = path.join(appDir, "public", "kb");
const RESOURCES = ["additives", "equipment", "grains", "hops", "recipe-templates", "recipes", "yeasts"];
const PROD = "https://app.brewdocs.beer/kb";

const hasData = (dir) => fs.existsSync(path.join(dir, "hops.json"));

function link(target) {
    fs.mkdirSync(path.dirname(publicKb), {recursive: true});
    fs.rmSync(publicKb, {recursive: true, force: true});
    fs.symlinkSync(path.relative(path.dirname(publicKb), target), publicKb);
}

const explicit = process.env.KB_DIST;
if (explicit && hasData(explicit)) {
    link(path.resolve(explicit));
    console.log(`kb data: KB_DIST override -> ${explicit}`);
    process.exit(0);
}

const sibling = path.resolve(appDir, "..", "..", "..", "brewdocs.beer-kb");
if (fs.existsSync(path.join(sibling, "package.json"))) {
    if (!hasData(path.join(sibling, "dist"))) {
        execSync("npm run build", {cwd: sibling, stdio: "inherit"});
    }
    if (hasData(path.join(sibling, "dist"))) {
        link(path.join(sibling, "dist"));
        console.log(`kb data: sibling checkout -> ${sibling}/dist`);
        process.exit(0);
    }
}

fs.rmSync(publicKb, {recursive: true, force: true});
fs.mkdirSync(publicKb, {recursive: true});
for (const resource of RESOURCES) {
    const response = await fetch(`${PROD}/${resource}.json`);
    if (!response.ok) {
        console.error(`kb data: ${PROD}/${resource}.json -> ${response.status}. No sibling brewdocs.beer-kb checkout and prod is unreachable; the app has no catalog.`);
        process.exit(1);
    }
    fs.writeFileSync(path.join(publicKb, `${resource}.json`), Buffer.from(await response.arrayBuffer()));
}
console.log(`kb data: fetched ${RESOURCES.length} resources from ${PROD}`);
