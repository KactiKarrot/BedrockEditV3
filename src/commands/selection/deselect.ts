import { Player } from "@minecraft/server";
import { commands } from "commands";
import { selMap, compSelMap } from "selectionUtils";
import { tellMessage } from "utils";

commands.set('deselect', {
    alias: "desel",
    function: deselect,
    description: "Deselects selection",
    extDescription: "Deselects selection (Removes Position 1 and Position 2)",
    usage: [
        ""
    ]
})

function deselect(args: string[], player: Player) {
    selMap.delete(player.name);
    compSelMap.delete(player.name);
    tellMessage(player, `§aDeselected region`);
}