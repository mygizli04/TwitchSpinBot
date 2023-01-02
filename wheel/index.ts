export abstract class WheelReward {
    /**
     * The name of the reward.
     */
    abstract name: string;

    /**
     * If this reward is selected and this property is present, a second dice will be rolled to determine if the reward will actually be executed.
     * If not, another reward will be selected. This means the probability of the reward being selected is (1/[number of rewards]) * [probability].
     */
    probability?: number;

    /**
     * The function that is called when the reward is selected.
     * 
     * @returns The message that is sent to the chat such as "Congratulations [username]! You won [returned string]!"
     * if nothing is returned then the message will be "Congratulations [username]! You won [reward name]!"
     */
    run(): string | void {};
}

import fs from "fs/promises";

const rewards: WheelReward[] = [];
const stringOnlyRewards = (await import("./rewards.json", { assert: { type: "json" } })).default;

try {
    await fs.access("./out/wheel/rewards");

    for (const reward of await fs.readdir("./out/wheel/rewards")) {
        if (reward.endsWith(".js")) {
            import(`./rewards/${reward}`).then(reward => {
                rewards.push(reward.default);
            })
        }
    }
}
finally {}

/**
 * Spin the wheel!
 * 
 * @param name The name of the user that spun the wheel.
 * @returns The message that is sent to the chat.
 */
export function spinTheWheel(name: string): string {
    const allRewards = [...rewards, ...stringOnlyRewards];

    const reward = allRewards[Math.floor(Math.random() * allRewards.length)];
    const message = typeof reward === "string" ? reward : reward.run();

    if (message) {
        return `Congratulations ${name}! You won ${message}!`;
    } else {
        return `Congratulations ${name}! You won ${typeof reward === "string" ? reward : reward.name}!`;
    }
}