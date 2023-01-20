export abstract class WheelReward {
    /**
     * The name of the reward.
     */
    abstract name: string;

    /**
     * The weight of the reward. (Higher weight = higher chance of being selected)
     */
    weight = 1;

    abstract requiresUser: boolean;

    /**
     * The function that is called when the reward is selected.
     * 
     * @returns The message that is sent to the chat such as "Congratulations [username]! You won [returned string]!"
     * if nothing is returned then there will be no message sent to the chat.
     */
    run(): string | null {return this.name};
}

export function isWheelReward(reward: any): reward is WheelReward {
    return reward["run"] !== undefined;
}

export interface StringOnlyWheelReward {
    /**
     * The name of the reward.
     */
    name: string,

    /**
     * Whether or not the reward requires a user.
     */
    requiresUser: boolean,

    /**
     * The weight of the reward. (Higher weight = higher chance of being selected)
     */
    weight: number
}

import { getCongratulationsText } from "../index.js";

import { getRewards, reduceWeight } from "./rewards.js";

interface SpinArguments {
    /**
     * The name of the user that spun the wheel.
     * 
     * If not provided, it will use the last spun user.
     * 
     * If null, it will not use a user.
     * 
     * @default lastSpunUser
     */
    user?: string | null,

    /**
     * The names of the rewards that should not be selected.
     */
    exclude?: string[]
}

interface WheelResult {
    /**
     * The reward that is won.
     */
    reward: WheelReward | StringOnlyWheelReward,

    /**
     * The message that is sent to the chat such as "Congratulations [username]! You won [returned string]!"
     */
    message: string | null
}

import weightedRandom from "weighted-random";

/**
 * Spin the wheel!
 * 
 * @param name The name of the user that spun the wheel.
 * @returns The reward that is won
*/
export function spinTheWheel(options?: SpinArguments): WheelResult {
    const { user, exclude } = options ?? {};

    const rewards: (WheelReward | StringOnlyWheelReward)[] = getRewards();

    if (exclude) {
        rewards.filter(reward => !exclude.includes(reward.name));
    }

    if (user === null) {
        rewards.filter(reward => reward.requiresUser);
    }

    const reward = rewards[weightedRandom(rewards.map(reward => reward.weight))];

    reduceWeight(reward.name);

    if (!isWheelReward(reward)) {
        return {
            reward: reward,
            message: getCongratulationsText(reward.name, user)
        }
    }
    else {
        const message = reward.run();

        if (message === null) {
            return {
                reward: reward,
                message: null
            }
        }
        else {
            return {
                reward: reward,
                message: getCongratulationsText(message, user)
            }
        }
    }
}