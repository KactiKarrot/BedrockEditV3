import { CompoundBlockVolume, BlockVolumeUtils, BlockTypes, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { compSelMap, selMap, addCuboid, compApplyToAllBlocks } from "selectionUtils";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, tellMessage } from "utils";
commands.set('replace', {
    function: replace,
    description: "Replaces given block in selected region with given or held block",
    extDescription: "Replaces given block in selected region with given or held block\nreplacetileName: Block to replace\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "<replaceTileName: Block> [tileName: Block]"
    ]
});
//replaces given block (vanilla /fill block replace block)
//Beds don't work (Can't actually determine bed color)
async function replace(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let perm = getPermFromHand(player);
    if (args.length == 0) {
        tellError(player, 'Not enough arguments');
    }
    let type = BlockTypes.get(args[0]);
    if (type == undefined) {
        tellError(player, `Block ${args[0]} not found`);
        return;
    }
    if (args.length >= 2) {
        perm = getPermFromStr(args[1], player);
        if (perm == null) {
            tellError(player, `Block ${args[1]} not found`);
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let manualSel = true;
    if (!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.filled);
    }
    let count = 0;
    system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
        player.sendMessage(JSON.stringify(b.getTags()));
        if (b.type.id == type.id) {
            setBlockAt(player, l, perm.clone());
            count++;
        }
    }, () => {
        if (!manualSel) {
            compSelMap.delete(player.name);
        }
        tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
    }));
}
