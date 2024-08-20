import { BlockTypes, CompoundBlockVolume, system } from "@minecraft/server";
import { commands } from "commands";
import { selMap, addCuboid, compApplyToAllBlocks, cloneVol } from "selectionUtils";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, tellMessage } from "utils";
commands.set('cube', {
    alias: "box",
    function: cube,
    description: "Generates a cube",
    extDescription: "Generates a cube between Position 1 and Position 2\nmode: Whether the cube is filled in or hollow\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[mode: hollow | filled] [tileName: Block]"
    ]
});
function cube(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = 'filled';
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2 && args[1] != '') {
        if (BlockTypes.get(args[1]) == undefined) {
            tellError(player, `Block ${args[1]} not found`);
            return;
        }
        perm = getPermFromStr(args[1], player);
    }
    addHistoryEntry(player.name);
    let vol = new CompoundBlockVolume(floorVector3(player.location));
    let newVol = cloneVol(selMap.get(player.name));
    newVol.translate(multiplyVector3(vol.getOrigin(), { x: -1, y: -1, z: -1 }));
    addCuboid(vol, newVol, mode);
    let count = 0;
    system.runJob(compApplyToAllBlocks(vol, player.dimension, (b, l) => {
        setBlockAt(player, l, perm /*.clone()*/);
        count++;
    }, () => {
        tellMessage(player, `§aSuccessfully generated cube (${count} blocks)`);
    }));
}
