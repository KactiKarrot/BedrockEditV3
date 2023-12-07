import { BlockPermutation } from "@minecraft/server";
import { relPosMap, pos1Map, clipMap } from "main";
import { compApplyToAllBlocks, compSelMap, selMap } from "selection";
import { addHistoryEntry, addVector3, floorVector3, getClipAt, getClipSize, rotatePerm, setBlockAt, setClipSize, sleep, subVector3, tellError, tellMessage } from "utils";
//done
//done
async function cut(args, player) {
    if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).from == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).to == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    copy(null, player);
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
//done
export async function paste(args, player) {
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    if ((args.length > 0 && (args[0] == '-ap' || args[0] == '-p'))) {
        if (!selMap.has(player.name) || selMap.get(player.name) == undefined || selMap.get(player.name).from == undefined) {
            tellError(player, "Position 1 not set!");
            return;
        }
        relPosMap.set(player.name, subVector3(pos1Map.get(player.name), floorVector3(player.location)));
    }
    tellMessage(player, `§aPasting...`);
    let clipSize = getClipSize(player.name);
    // Creates new entry in history map
    addHistoryEntry(player.name);
    let playerPos = floorVector3(player.location);
    let count = 0;
    for (let x = 0; x < clipSize.x; x++) {
        for (let y = 0; y < clipSize.y; y++) {
            for (let z = 0; z < clipSize.z; z++) {
                count++;
                if (count % 1000 == 0) {
                    await sleep(1);
                }
                let pos = addVector3(addVector3(relPosMap.get(player.name), playerPos), { x: x, y: y, z: z });
                // Adds current world position, blockstate before paste, and blockstate after paste to history map entry, can muse pre for undo, post for redo
                if ((args != "-a" || !(getClipAt(player.name, { x: x, y: y, z: z }).type.id == 'minecraft:air')) && getClipAt(player.name, { x: x, y: y, z: z }) != undefined) {
                    setBlockAt(player, pos, getClipAt(player.name, { x: x, y: y, z: z }).clone());
                }
            }
        }
    }
    tellMessage(player, `§aPasted ${count} blocks from clipboard`);
}
export function rotate(args, player) {
    if (args.length < 1) {
        tellError(player, 'No angle given');
        return;
    }
    let angle = 0;
    switch (args[0]) {
        case '90': {
            angle = 90;
            break;
        }
        case '180': {
            angle = 180;
            break;
        }
        case '270': {
            angle = 270;
            break;
        }
        default: {
            tellError(player, `Invalid angle: '${args[0]}'`);
            return;
            break;
        }
    }
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    for (let a = 0; a < angle / 90; a++) {
        let oldClip = clipMap.get(player.name);
        let clipSize = getClipSize(player.name);
        clipSize = {
            x: clipSize.z,
            y: clipSize.y,
            z: clipSize.x
        };
        let newClip = Array(clipSize.x).fill(null).map(() => Array(clipSize.y).fill(null).map(() => Array(clipSize.z).fill(null)));
        for (let i = 0; i < clipSize.z; i++) {
            for (let j = 0; j < clipSize.y; j++) {
                for (let k = 0; k < clipSize.x; k++) {
                    if (oldClip[i][j][clipSize.x - 1 - k] != undefined) {
                        newClip[k][j][i] = oldClip[0 + i][j][clipSize.x - 1 - k].clone();
                        newClip[k][j][i] = rotatePerm(newClip[k][j][i]);
                    }
                }
            }
        }
        // relPosMap.set(player.name, subVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), floorVector3(player.location)));
        relPosMap.set(player.name, {
            x: -(relPosMap.get(player.name).z + clipSize.x - 1),
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).x
        });
        clipMap.set(player.name, newClip);
    }
    tellMessage(player, `§aRotated clipboard ${angle} degrees`);
}
export function mirror(args, player) {
    if (args.length < 1) {
        tellError(player, 'No axis given');
        return;
    }
    let axis = args[0].toLowerCase();
    if (axis != 'x' && axis != 'z') {
        tellError(player, `Invalid axis: '${args[0]}'`);
        return;
    }
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    let oldClip = clipMap.get(player.name);
    let clipSize = getClipSize(player.name);
    let newClip = Array(clipSize.x).fill(null).map(() => Array(clipSize.y).fill(null).map(() => Array(clipSize.z).fill(null)));
    for (let i = 0; i < clipSize.x; i++) {
        for (let j = 0; j < clipSize.y; j++) {
            for (let k = 0; k < clipSize.z; k++) {
                if ((axis == 'x' && oldClip[clipSize.x - 1 - i][j][k] != undefined) || oldClip[i][j][clipSize.z - 1 - k] != undefined) {
                    if (axis == 'x') {
                        newClip[i][j][k] = oldClip[clipSize.x - 1 - i][j][k].clone();
                    }
                    else {
                        newClip[i][j][k] = oldClip[i][j][clipSize.z - 1 - k].clone();
                    }
                    //Doesnt work to everything (stairs)
                    newClip[i][j][k] = rotatePerm(newClip[i][j][k]);
                    newClip[i][j][k] = rotatePerm(newClip[i][j][k]);
                }
            }
        }
    }
    if (axis == 'x') {
        relPosMap.set(player.name, {
            x: relPosMap.get(player.name).x * -1 - clipSize.x + 1,
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).z
        });
    }
    else {
        relPosMap.set(player.name, {
            x: relPosMap.get(player.name).x,
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).z * -1 - clipSize.z + 1
        });
    }
    clipMap.set(player.name, newClip);
    tellMessage(player, `§aMirrored clipboard over the ${axis} axis`);
}
