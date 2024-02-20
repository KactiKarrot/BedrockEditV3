import { BlockVolumeUtils, CompoundBlockVolume, Player } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands"
import { addCuboid, compSelMap, selMap, subtractCuboid } from "selectionUtils";
import { floorVector3, multiplyVector3, tellError, tellMessage } from "utils";

commands.set('subtractcube', {
    alias: "subcube",
    function: removeCubeCommand,
    description: "Subtracts a cube from selection",
    extDescription: "Subtracts a cube from selection between Position 1 and Position 2\nmode: Whether the cube is filled in or hollow",
    usage: [
        "[mode: hollow | filled]"
    ]
})

function removeCubeCommand(args: string[], player: Player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = 'filled'
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
        }
        mode = args[0].toLowerCase();
    }

    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    subtractCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode as ShapeModes);

    tellMessage(player, `§aSubtracted cube from selection`);
}