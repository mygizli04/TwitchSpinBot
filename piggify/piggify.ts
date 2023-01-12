import chalk from "chalk";

// If the script is not being run on macOS or Linux, exit
if (process.platform !== "darwin" && process.platform !== "linux") {
    console.log(chalk.red("This script is only meant to be run on macOS or Linux."));
    process.exit(1);
}

import { minify } from "terser";
import fs from "fs";

// Minify all scripts in out/ using minify() including all subdirectories and save them into piggify/out
await traverseDir("out");

async function traverseDir(dir: string): Promise<void> {
    if (fs.statSync(dir).isDirectory()) {
        for (const file of fs.readdirSync(dir)) {
            traverseDir(`${dir}/${file}`)
        }
        return;
    }

    if (!dir.endsWith(".js")) {
        return;
    }

    const result = await minify(fs.readFileSync(dir, "utf-8"), {
        module: true
    });

    if (!result.code) {
        console.error(chalk.red("A critical error occured while compressing files:"))
        console.error(result.code);
        debugger;
        process.exit(1);
    }

    if (!fs.existsSync(`piggify/out`)) {
        fs.mkdirSync(`piggify/out`);
    }

    // If dir contains a slash, create that directory too
    if (dir.includes("/")) {
        const dirName = dir.split("/").slice(0, -1).join("/");
        if (!fs.existsSync(`piggify/${dirName}`)) {
            fs.mkdirSync(`piggify/${dirName}`);
        }
    }

    return fs.writeFileSync(`piggify/${dir}`, result.code);
}

import { execSync } from "child_process";

execSync("./piggify/piggify.sh")