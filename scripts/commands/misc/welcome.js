import { commands } from "commands";
import { setWelcome, welcomeMessage } from "main";
import { tellMessage } from "utils";
commands.set('welcome', {
    alias: "",
    function: welcome,
    description: "Toggles the welcome message shown to all players on join",
    extDescription: "Toggles the welcome message shown to all players on join",
    usage: [
        ""
    ]
});
function welcome(args, player) {
    setWelcome();
    if (welcomeMessage) {
        tellMessage(player, '§aWelcome message enabled');
    }
    else {
        tellMessage(player, '§aWelcome message disabled');
    }
}
