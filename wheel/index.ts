export abstract class WheelReward {
    /**
     * The name of the reward.
     */
    abstract name: string;

    /**
     * The function that is called when the reward is selected.
     * 
     * @returns The message that is sent to the chat such as "Congratulations [username]! You won [returned string]!"
     * if nothing is returned then there will be no message sent to the chat.
     */
    run(): string | null {return this.name};
}

import fs from "fs/promises";
import { getCongratulationsText } from "../index.js";

const rewards: WheelReward[] = [];
import stringOnlyRewards from "./rewards.json" assert { type: "json" };

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

interface SpinArguments {
    /**
     * The name of the user that spun the wheel.
     * @default lastSpunUser
     */
    user?: string,

    /**
     * Whether or not to only use string rewards.
     * @default false
     */
    stringOnly?: boolean,

    /**
     * Whether or not to automatically execute the reward if it is not string only.
     * @default true
     */
    autoExecute?: boolean
}

interface NonAutoExecuteSpinArguments extends SpinArguments {
    autoExecute: false
}

interface StringOnlySpinArguments extends SpinArguments {
    stringOnly: true
}

interface WheelResult {
    /**
     * The reward that is won.
     */
    reward: WheelReward | string,

    /**
     * Result of the reward if it is not string only.
     */
    result: string | null,

    /**
     * The message that is sent to the chat such as "Congratulations [username]! You won [returned string]!"
     */
    message: string | null
}

interface StringOnlyWheelResult extends WheelResult {
    reward: string,

    result: null,

    message: string
}

interface NonAutoExecutedWheelResult extends WheelResult {
    message: null,

    result: null
}

/**
 * Spin the wheel!
 * 
 * @param name The name of the user that spun the wheel.
 * @returns The reward that is won
*/
export function spinTheWheel(): WheelResult;
export function spinTheWheel(options?: StringOnlySpinArguments): StringOnlyWheelResult;
export function spinTheWheel(options?: NonAutoExecuteSpinArguments): NonAutoExecutedWheelResult;
export function spinTheWheel(options?: SpinArguments): WheelResult;
export function spinTheWheel(options?: SpinArguments): WheelResult {
    const { user, stringOnly } = options ?? {};

    const allRewards: (WheelReward | string)[] = [...rewards];

    if (!stringOnly) {
        allRewards.push(...stringOnlyRewards);
    }

    const reward = allRewards[Math.floor(Math.random() * allRewards.length)];

    if (typeof reward === "string") {
        return {
            reward: reward,
            result: null,
            message: getCongratulationsText(reward, user)
        }
    }
    else {
        const message = reward.run();

        if (message === null) {
            return {
                reward: reward,
                result: null,
                message: null
            }
        }
        else {
            return {
                reward: reward,
                result: message,
                message: getCongratulationsText(message, user)
            }
        }
    }
}