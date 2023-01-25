import fs from "fs/promises";
import { StringOnlyWheelReward, WheelReward } from "./index.js";

const stringOnlyRewards = await fs.readFile("./wheel/rewards.json", "utf-8").then(JSON.parse) as StringOnlyWheelReward[];

const rewards: (WheelReward | StringOnlyWheelReward)[] = [...stringOnlyRewards];

try {
    await fs.access("./out/wheel/rewards");

    for (const reward of await fs.readdir("./out/wheel/rewards")) {
        if (reward.endsWith(".js")) {
            const rewardFile = (await import(`./rewards/${reward}`)).default
            rewards.push(rewardFile);
        }
    }
}
finally {}


export function getRewards(): StringOnlyWheelReward[] {
    let ret = [...rewards];

    return ret;
}

/**
 * Reduced the probability of a reward being selected for one hour.
 * @param reward The name of the reward.
 */
export function reduceWeight(reward: string): void {
    const rewardIndex = rewards.findIndex(r => r.name === reward);

    if (rewardIndex === -1) {
        throw new Error("Reward not found");
    }

    rewards[rewardIndex].weight /= 2;

    setTimeout(() => {
        rewards[rewardIndex].weight *= 2;
    }, 1 * 60 * 60 * 1000)
}