import { BlockTypes, BlockPermutation, CompoundBlockVolume, BlockVolumeUtils } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { selMap, compSelMap, addCuboid, Axis, compApplyToAllBlocks } from "selection";
import { tellError, getPermFromHand, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, sleep, tellMessage } from "utils";
commands.set('walls', {
    function: walls,
    description: "Generates four walls",
    extDescription: "Generates four walls between Position 1 and Position 2\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[tileName: Block]"
    ]
});
function walls(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let perm = getPermFromHand(player);
    if (args.length >= 1 && args[0] != '') {
        if (BlockTypes.get(args[0]) == undefined) {
            tellError(player, `Block ${args[1]} not found`);
            return;
        }
        perm = BlockPermutation.resolve(args[0]);
    }
    addHistoryEntry(player.name);
    compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.thin, Axis.Y);
    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    });
    compSelMap.delete(player.name);
    tellMessage(player, `§aSuccessfully generated walls (${count} blocks)`);
}
