
import { Player, CompoundBlockVolume, BlockTypes, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { compSelMap, selMap, addCuboid, compApplyToAllBlocks, cloneVol } from "selectionUtils";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, sleep, tellMessage } from "utils";

commands.set('replace', {
    function: replace,
    description: "Replaces given block in selected region with given or held block",
    extDescription: "Replaces given block in selected region with given or held block\nreplacetileName: Block to replace (defaults to air)\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[replaceTileName: Block] [tileName: Block]"
    ]
})

//replaces given block (vanilla /fill block replace block)

//Beds don't work (Can't actually determine bed color)
async function replace(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let perm = getPermFromHand(player);

    let type = BlockTypes.get('minecraft:air');
    if (args[0]) {
        type = BlockTypes.get(args[0]);
    }
    if (type == undefined) {
        tellError(player, `Block ${args[0]} not found`)
        return;
    }

    if (args.length >= 2) {
        perm = getPermFromStr(args[1], player);
        if (perm == null) {
            tellError(player, `Block ${args[1]} not found`)
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let manualSel = true;
    if(!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)))
        let newVol = cloneVol(selMap.get(player.name));
        newVol.translate(multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1}));
        addCuboid(compSelMap.get(player.name), newVol, ShapeModes.filled);
    }

    let count = 0;
    system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
        if (b.type.id == type.id) {
            setBlockAt(player, l, perm/*.clone()*/);
            count++;
        }
    }, () => {
        if (!manualSel) {
            compSelMap.delete(player.name)
        }
        tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
    }))
}