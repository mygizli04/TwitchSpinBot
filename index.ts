process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import "dotenv/config";

import { spinTheWheel } from "./wheel/index.js";

import * as twurpleAuth from "@twurple/auth";
import * as twurplePubSub from "@twurple/pubsub";
import * as twurpleChat from "@twurple/chat";

import { setTimeout as sleep } from "timers/promises";

import fs from "fs/promises";
import { fileExists } from "./utils.js";

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
const chatClient = new twurpleChat.ChatClient({
    authProvider: botAuthProvider,
    channels: [process.env.CHANNEL_NAME],
});

const pubSubClient = new twurplePubSub.PubSubClient();
const userId = await pubSubClient.registerUserListener(authProvider);

let lastSpunUser: string | null = null;

// Log when someone uses a channel point reward
pubSubClient.onRedemption(userId, async (msg) => {
    if (msg.rewardTitle === "SPIN THE WHEEL") {
        lastSpunUser = msg.userDisplayName;
        chatClient.say(process.env.CHANNEL_NAME!, "Spinning the wheel...");
        await sleep(3000)
        chatClient.say(process.env.CHANNEL_NAME!, spinTheWheel(msg.userDisplayName));
    }
});

chatClient.onMessage(async (channel, user, message, msg) => {
    if (message === "!respin") {
        if (msg.userInfo.isMod || msg.userInfo.isBroadcaster || user === "sbeveuwu") {
            chatClient.say(channel, "Oops! My mistake, one sec pls. Spinning rn");
            await sleep(10 * 1000)
            chatClient.say(channel, spinTheWheel(lastSpunUser ?? user));
        }
    }
});

chatClient.connect();
