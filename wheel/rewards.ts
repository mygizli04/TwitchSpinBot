import fs from "fs/promises";
import { StringOnlyWheelReward, WheelReward } from "./index.js";

const stringOnlyRewards = await fs.readFile("./out/wheel/rewards.json", "utf-8").then(JSON.parse) as StringOnlyWheelReward[];
const wheelRewards: WheelReward[] = [];

let reduced: { [key: string]: number } = {};

let doneImporting = false;

try {
    await fs.access("./out/wheel/rewards");

    for (const reward of await fs.readdir("./out/wheel/rewards")) {
        if (reward.endsWith(".js")) {
            import(`./rewards/${reward}`).then(reward => {
                wheelRewards.push(reward.default);
                rewards.push(reward.default);
            })
        }
    }

    doneImporting = true;
}
finally {}

const rewards: (WheelReward | StringOnlyWheelReward)[] = [...stringOnlyRewards];

export function getRewards(): StringOnlyWheelReward[] {
    let ret = [...rewards];

    increaseWeights();

    return ret;
}

export function reduceWeight(reward: string): void {
    if (!doneImporting) return;

    const rewardIndex = rewards.findIndex(r => r.name === reward);

    if (rewardIndex === -1) {
        throw new Error("Reward not found");
    }

    rewards[rewardIndex].weight /= 2;

    reduced[reward] = reduced[reward] ? reduced[reward] + 1 : 1;
}

export function increaseWeights(except?: string): void {
    for (const reward in reduced) {
        if (reward === except) continue;

        const rewardIndex = rewards.findIndex(r => r.name === reward);

        if (rewardIndex === -1) {
            throw new Error("Reward not found");
        }

        rewards[rewardIndex].weight *= 2;

        reduced[reward] -= 1;

        if (reduced[reward] === 0) {
            delete reduced[reward];
        }
    }
}