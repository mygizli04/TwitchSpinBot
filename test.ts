import { spinTheWheel } from "./wheel/index.js";
import { setTimeout as sleep } from "timers/promises";

while (true) {
    await sleep(500);
    console.log(spinTheWheel("sbeveuwu"));
}