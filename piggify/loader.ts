process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import chalk from "chalk";

const skipUpdate = process.env.SPINBOT_DO_NOT_CHECK_UPDATE === "1";

if (skipUpdate) {
    console.log(chalk.yellowBright("Not checking for updates..."));
}
else if (await update()) {
    console.log(chalk.greenBright("Starting the install..."));
    process.exit(69);
}

import type { Endpoints } from "@octokit/types";

async function update(): Promise<boolean> {
    const fetch = (await import("node-fetch")).default;
    const fs = (await import("fs")).default;
    const { version }: {version: string} = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

    console.log(chalk.yellowBright("Checking for updates..."));

    const latestRelease = await fetch("https://api.github.com/repos/mygizli04/TwitchSpinBot/releases/latest", {
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    }).then(res => res.json() as Promise<Endpoints["GET /repos/{owner}/{repo}/releases/latest"]["response"]["data"]>);

    if (latestRelease.tag_name !== `v${version}`) {
        console.log(chalk.yellowBright(`\nNew version available: ${latestRelease.tag_name} (current: v${version})\n`));
        // Print changelog
        console.log(chalk.yellowBright("Update notes:"));
        for (const line of latestRelease.body!.split("\n")) {
            console.log(chalk.greenBright(line));
        }
        console.log(chalk.yellowBright("Downloading..."))
        const download = await fetch(latestRelease.assets.find(asset => asset.name === "piggified.zip")!.browser_download_url);
        console.log(chalk.greenBright("Downloaded successfully, installing..."))
        const file = await download.arrayBuffer();
        fs.writeFileSync("../update.zip", Buffer.from(file));
        return true;
    }

    console.log(chalk.greenBright("No updates available."));
    return false;
}

await import("../index.js");
export {};