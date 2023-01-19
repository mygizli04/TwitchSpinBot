process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import chalk from "chalk";

console.log(chalk.greenBright("Starting the bot..."));

import "dotenv/config";

import { spinTheWheel } from "./wheel/index.js";

import * as twurpleAuth from "@twurple/auth";
import * as twurplePubSub from "@twurple/pubsub";
import * as twurpleChat from "@twurple/chat";

import { setTimeout as sleep } from "timers/promises";

import fs from "fs/promises";
import { fileExists, randomChance } from "./utils.js";

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.BOT_REFRESH_TOKEN || !process.env.BOT_ACCESS_TOKEN || !process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_REFRESH_TOKEN || !process.env.CHANNEL_NAME) {
    throw new Error("Missing env variables");
}

const authProvider = new twurpleAuth.RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    onRefresh(token) {
        fs.writeFile("./channelToken.json", JSON.stringify(token, null, 4));
    },
}, await fileExists("./channelToken.json") ? await fs.readFile("./channelToken.json", "utf-8").then(JSON.parse) : {
    accessToken: process.env.CHANNEL_ACCESS_TOKEN,
    refreshToken: process.env.CHANNEL_REFRESH_TOKEN
});

const botAuthProvider = new twurpleAuth.RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    onRefresh(token) {
        fs.writeFile("./botToken.json", JSON.stringify(token, null, 4));
    }
}, await fileExists("./botToken.json") ? await fs.readFile("./botToken.json", "utf-8").then(JSON.parse) : {
    accessToken: process.env.BOT_ACCESS_TOKEN,
    refreshToken: process.env.BOT_REFRESH_TOKEN
});
export const chatClient = new twurpleChat.ChatClient({
    authProvider: botAuthProvider,
    channels: [process.env.CHANNEL_NAME],
});

chatClient.onRegister(async () => {
    console.log(chalk.greenBright(`Logged into chat as ${chatClient.currentNick}`));

    setInterval(async () => {
        if (randomChance(1 / 200)) {
            chatClient.say(process.env.CHANNEL_NAME!, "Random wheel spin time! Please wait...");

            await sleep(3000);

            const reward = spinTheWheel({ user: null });

            if (reward.message) {
                chatClient.say(process.env.CHANNEL_NAME!, reward.message);
            }
        }
    }, 5 * 60 * 1000)
});

const pubSubClient = new twurplePubSub.PubSubClient();
const userId = await pubSubClient.registerUserListener(authProvider);

console.log(chalk.greenBright(`(Probably) Started listening to wheel spins on the channel ${process.env.CHANNEL_NAME}!`));

let lastSpunUser: string | null = null;

/**
 * Get the congratulations text.
 * @param reward The reward that the user won.
 * @param user The user that won the reward. If not provided, it will use the last spun user.
 * @returns "Congratulations [user]! You won [reward]!"
 */
export function getCongratulationsText(reward: string, user?: string | null): string {
    if (user) {
        return `Congratulations ${user}! You won ${reward}!`;
    }
    else if (user !== null && lastSpunUser) {
        return `Congratulations ${lastSpunUser}! You won ${reward}!`;
    }
    else {
        return `Congratulations! You won ${reward}!`;
    }
}

// Log when someone uses a channel point reward
pubSubClient.onRedemption(userId, async (msg) => {
    if (msg.rewardTitle === "SPIN THE WHEEL") {
        lastSpunUser = msg.userDisplayName;
        chatClient.say(process.env.CHANNEL_NAME!, `Alright ${lastSpunUser}, Spinning the wheel...`);
        await sleep(3000)
        
        const reward = spinTheWheel();

        if (reward.message) {
            chatClient.say(process.env.CHANNEL_NAME!, reward.message);
        }
    }
});

chatClient.onMessage(async (channel, user, message, msg) => {
    if (message === "!respin") {
        if (msg.userInfo.isMod || msg.userInfo.isBroadcaster || user === "sbeveuwu") {
            let reply: string;

            if (lastSpunUser) {
                reply = `Ok ${user}, Spinning the wheel again for ${lastSpunUser}...`;
            }
            else {
                reply = `Ok ${user}, Spinning the wheel again...`;
            }

            chatClient.say(channel, reply);
            await sleep(3000)

            const reward = spinTheWheel({user: lastSpunUser ?? user});

            if (reward.message) {
                chatClient.say(channel, reward.message);
            }
        }
    }
});

chatClient.connect();
