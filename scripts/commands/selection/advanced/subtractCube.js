import { CompoundBlockVolume } from "@minecraft/server";
import { commands } from "commands";
import { cloneVol, compSelMap, selMap, subtractCuboid } from "selectionUtils";
import { floorVector3, multiplyVector3, tellError, tellMessage } from "utils";
commands.set('subtractcube', {
    alias: "subcube",
    function: removeCubeCommand,
    description: "Subtracts a cube from selection",
    extDescription: "Subtracts a cube from selection between Position 1 and Position 2\nmode: Whether the cube is filled in or hollow",
    usage: [
        "[mode: hollow | filled]"
    ]
});
function removeCubeCommand(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = 'filled';
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    let newVol = cloneVol(selMap.get(player.name));
    newVol.translate(multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 }));
    subtractCuboid(compSelMap.get(player.name), newVol, mode);
    tellMessage(player, `§aSubtracted cube from selection`);
}
