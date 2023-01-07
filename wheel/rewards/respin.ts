import { spinTheWheel, WheelReward } from "../index.js";

import { chatClient, getCongratulationsText } from "../../index.js";

const reward: WheelReward = {
    name: "respin",

    run() {
        chatClient.say(process.env.CHANNEL_NAME!, getCongratulationsText("respin") + " Respinning the wheel now...");
        
        const reward = spinTheWheel({stringOnly: true});
        
        chatClient.say(process.env.CHANNEL_NAME!, reward.message);

        return null;
    },
}

export default reward;