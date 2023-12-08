import { Player, CompoundBlockVolume, BlockVolumeUtils } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { compSelMap, selMap, addCuboid, compApplyToAllBlocks } from "selectionUtils";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, sleep, tellMessage } from "utils";

commands.set('set', {
    function: set,
    description: "Sets selected region to given or held block",
    extDescription: "Sets selected region to given or held block\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[tileName: Block]"
    ]
})

//Beds don't work (Can't actually determine bed color)
async function set(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let perm = getPermFromHand(player);
    if (args.length > 0) {
        perm = getPermFromStr(args[0], player);
        if (perm == null) {
            tellError(player, `Block ${args[0]} not found`)
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let manualSel = true;
    if(!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)))
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), ShapeModes.filled);
    }

    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    })
    if (!manualSel) {
        compSelMap.delete(player.name)
    }
    tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
}