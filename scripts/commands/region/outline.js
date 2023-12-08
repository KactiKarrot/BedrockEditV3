import { BlockVolumeUtils } from "@minecraft/server";
import { commands } from "commands";
import { compSelMap, selMap, applyToAllBlocks } from "selectionUtils";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, setBlockAt, sleep, tellMessage, subVector3 } from "utils";
commands.set('outline', {
    function: outline,
    description: "Sets outline of selected region to given or held block",
    extDescription: "Sets outline of selected region to given or held block\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[tileName: Block]"
    ]
});
async function outline(args, player) {
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
            tellError(player, `Block ${args[0]} not found`);
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let count = 0;
    applyToAllBlocks(selMap.get(player.name), player.dimension, async (b, l) => {
        let diff = BlockVolumeUtils.getSpan(selMap.get(player.name));
        let pos = subVector3(l, BlockVolumeUtils.getMin(selMap.get(player.name)));
        if (((pos.x == 0 || pos.x == diff.x - 1) && (pos.y == 0 || pos.y == diff.y - 1)) ||
            ((pos.x == 0 || pos.x == diff.x - 1) && (pos.z == 0 || pos.z == diff.z - 1)) ||
            ((pos.z == 0 || pos.z == diff.z - 1) && (pos.y == 0 || pos.y == diff.y - 1))) {
            setBlockAt(player, l, perm.clone());
            count++;
            if (count % 5000 == 0) {
                await sleep(1);
            }
        }
    });
    tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
}
