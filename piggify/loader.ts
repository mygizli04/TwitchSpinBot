
if (process.env.SPINBOT_DO_NOT_CHECK_UPDATE !== "1" && await updateAvailable()) {
    await downloadUpdate();
    process.exit(69);
}

async function downloadUpdate(): Promise<void> {
    // Copy new version into ../update
}

async function updateAvailable(): Promise<boolean> {
    return false;
}

await import("../index.js");
export {};