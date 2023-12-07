import { BlockPermutation, } from "@minecraft/server";
import { commands } from "commands";
import { compApplyToAllBlocks, compSelMap } from "selection";
import { addHistoryEntry, addVector3, playerHasSel, setBlockAt, setClipSize, sleep, subVector3, tellMessage } from "utils";
export function register() {
    commands.set('cut', {
        function: cut,
        description: "Cuts a region to the player's clipboard",
        extDescription: "Cuts a region to the player's clipboard",
        usage: [
            ""
        ]
    });
}
async function cut(args, player) {
    if (!playerHasSel(player)) {
        return;
    }
    commands.get('copy').function(null, player);
    let perm = BlockPermutation.resolve("minecraft:air");
    addHistoryEntry(player.name);
    setClipSize(player.name, addVector3({ x: 1, y: 1, z: 1 }, subVector3(compSelMap.get(player.name).getBoundingBox().max, compSelMap.get(player.name).getBoundingBox().min)));
    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 1000 == 0) {
            await sleep(1);
        }
    });
    tellMessage(player, `§aCut ${count} blocks to clipboard`);
}
