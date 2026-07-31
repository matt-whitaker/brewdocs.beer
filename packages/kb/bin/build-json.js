#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const pkg = require("./../package.json");

const srcDir = path.join(process.cwd(), "data");
const outDir = path.join(process.cwd(), "dist");

const ENTITY_TYPES = {
  additives: "kbAdditive",
  equipment: "kbEquipment",
  grains: "kbGrain",
  hops: "kbHop",
  "recipe-templates": "kbRecipeTemplate",
  recipes: "kbRecipe",
  yeasts: "kbYeast"
};

// Execute the build process
(() => {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory not found at ${srcDir}`);
    return;
  }

  // Create the dist directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
    console.log(`Created dist directory at ${outDir}`);
  }

  const directories = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  directories.forEach((dir) => {
    const dirPath = path.join(srcDir, dir);
    const outputFilePath = path.join(outDir, `${dir}.json`);
    const entityType = ENTITY_TYPES[dir];

    if (!entityType) {
      console.error(`No ENTITY_TYPES entry for data/${dir} — its items will build without a __type`);
    }

    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith(".json"));

    const combinedData = [];
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        data.id = path.basename(file, path.extname(file));
        data.__type = entityType;
        combinedData.push(data);
      } catch (error) {
        console.error(`Error reading JSON from ${filePath}:`, error);
      }
    });

    const json = {
      version: pkg.version,
      data: combinedData
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(json, null, 0));
  });
})();
