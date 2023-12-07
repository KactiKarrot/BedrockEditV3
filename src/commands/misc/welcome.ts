import { Player } from "@minecraft/server";
import { commands } from "commands";
import { setWelcome, welcomeMessage } from "main";
import { tellMessage } from "utils";

export function register() {
    commands.set('welcome', {
        alias: "",
        function: welcome,
        description: "Toggles the welcome message shown to all players on join",
        extDescription: "Toggles the welcome message shown to all players on join",
        usage: [
            ""
        ]
    })
}

function welcome(args: string[], player: Player) {
    setWelcome();
    if (welcomeMessage) {
        tellMessage(player, '§aWelcome message enabled')
    } else {
        tellMessage(player, '§aWelcome message disabled')
    }
}