import { Player } from "@minecraft/server";
import { commands } from "commands";

commands.set('remove', {
    alias: "rm",
    function: remove,
    description: "Removes the selected region",
    extDescription: "Removes the selected region",
    usage: [
        ""
    ]
})

function remove(args: string[], player: Player) {
    commands.get('set').function(['minecraft:air'], player);
}