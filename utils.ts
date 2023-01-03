import fs from "fs/promises";

export async function fileExists(file: string) {
    return await fs.access(file).then(() => true).catch(() => false);
}