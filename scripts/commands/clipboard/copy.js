import { CompoundBlockVolume, BlockVolumeUtils, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { relPosMap } from "main";
import { selMap, compSelMap, addCuboid, getCompSpan, compApplyToAllBlocks } from "selectionUtils";
import { tellError, floorVector3, multiplyVector3, subVector3, minVector3, setClipSize, setClipAt, tellMessage } from "utils";
commands.set('copy', {
    alias: "cp",
    function: copy,
    description: "Copies a region to the player's clipboard",
    extDescription: "Copies a region to the player's clipboard",
    usage: [
        ""
    ]
});
function copy(args, player) {
    if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).from == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).to == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let manualSel = true;
    if (!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.filled);
    }
    relPosMap.set(player.name, subVector3(minVector3(selMap.get(player.name).from, selMap.get(player.name).to), floorVector3(player.location)));
    setClipSize(player.name, getCompSpan(compSelMap.get(player.name)));
    let count = 0;
    system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
        setClipAt(player.name, subVector3(l, compSelMap.get(player.name).getBoundingBox().min), b.permutation.clone());
        count++;
    }, () => {
        if (!manualSel) {
            compSelMap.delete(player.name);
        }
        if (args != null) {
            tellMessage(player, `§aCopied ${count} blocks to clipboard`);
        }
    }));
}
