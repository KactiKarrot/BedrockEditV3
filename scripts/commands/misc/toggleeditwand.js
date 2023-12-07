import { commands } from "commands";
import { setWandEnabled, wandEnabled } from "main";
import { tellMessage } from "utils";
export function register() {
    commands.set('toggleeditwand', {
        alias: "togglewand",
        function: toggleWand,
        description: "Toggles whether use of the edit wand is enabled",
        extDescription: "Toggles whether use of the edit wand is enabled",
        usage: [
            ""
        ]
    });
}
function toggleWand(args, player) {
    setWandEnabled();
    if (wandEnabled) {
        tellMessage(player, '§aEdit wand enabled');
    }
    else {
        tellMessage(player, '§aEdit wand disabled');
    }
}
