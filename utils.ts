import fs from "fs/promises";

export async function fileExists(file: string) {
    return await fs.access(file).then(() => true).catch(() => false);
}

/**
 * Random chance of return being true.
 * 
 * @param chance A number between 0 and 1.
 */
export function randomChance(chance: number): boolean {
    return Math.random() < chance;
}