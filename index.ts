process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import "dotenv/config";

import { spinTheWheel } from "./wheel/index.js";

import * as twurpleAuth from "@twurple/auth";
import * as twurplePubSub from "@twurple/pubsub";
import * as twurpleChat from "@twurple/chat";

import { setTimeout as sleep } from "timers/promises";

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.BOT_REFRESH_TOKEN || !process.env.BOT_ACCESS_TOKEN || !process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_REFRESH_TOKEN || !process.env.CHANNEL_NAME) {
    throw new Error("Missing env variables");
}

const authProvider = new twurpleAuth.RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
}, {
    accessToken: process.env.CHANNEL_ACCESS_TOKEN,
    refreshToken: process.env.CHANNEL_REFRESH_TOKEN,
    expiresIn: null,
    obtainmentTimestamp: 0,
    scope: ["channel:read:redemptions"]
});

const botAuthProvider = new twurpleAuth.RefreshingAuthProvider({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
},
{
    accessToken: process.env.BOT_ACCESS_TOKEN,
    refreshToken: process.env.BOT_REFRESH_TOKEN,
    expiresIn: null,
    obtainmentTimestamp: 0
});
const chatClient = new twurpleChat.ChatClient({
    authProvider: botAuthProvider,
    channels: [process.env.CHANNEL_NAME],
});

const pubSubClient = new twurplePubSub.PubSubClient();
const userId = await pubSubClient.registerUserListener(authProvider);

// Log when someone uses a channel point reward
pubSubClient.onRedemption(userId, async (msg) => {
    if (msg.rewardTitle === "SPIN THE WHEEL") {
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
            chatClient.say(channel, spinTheWheel(user));
        }
    }
});

chatClient.connect();
