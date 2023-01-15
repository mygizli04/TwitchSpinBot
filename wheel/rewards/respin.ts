import { spinTheWheel, WheelReward } from "../index.js";

import { chatClient, getCongratulationsText } from "../../index.js";

const reward: WheelReward = {
    name: "respin",

    weight: 0.05,

    run() {
        chatClient.say(process.env.CHANNEL_NAME!, getCongratulationsText("respin") + " Respinning the wheel now...");
        
        const reward = spinTheWheel({exclude: ["respin"]});

        if (reward.message) {
            chatClient.say(process.env.CHANNEL_NAME!, reward.message);
        }

        return null;
    },
}

export default reward;