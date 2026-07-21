#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const pkg = require("./../package.json");

const srcDir = path.join(process.cwd(), "data");
const outDir = path.join(process.cwd(), "dist");

// current shape of a kb item — bump when a data file would no longer parse/derive correctly.
// independent of pkg.version (the envelope version below), which tracks npm releases, not item shape.
const KB_MODEL_VERSION = 1;

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

    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith(".json"));

    const combinedData = [];
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        data.id = path.basename(file, path.extname(file));
        data.version = KB_MODEL_VERSION;
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
