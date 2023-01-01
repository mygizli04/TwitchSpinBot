if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.log("Please enter your client ID and secret in the .env file.");
    process.exit(1);
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
    res.send("You can close this tab now.");
    
    const twitchRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://localhost`, {
        method: "POST"
    });

    const { access_token, refresh_token } = await twitchRes.json() as any;

    console.log("Success! Please paste the following 2 into the .env file.")
    console.log("CHANNEL_ACCESS_TOKEN=" + access_token);
    console.log("CHANNEL_REFRESH_TOKEN=" + refresh_token);

    process.exit(0);
});

app.listen(80);

import open from "open";

console.log("Please give the bot access to see when a channel point reward is claimed on your channel.");
open(`https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost&response_type=code&scope=channel:read:redemptions`);