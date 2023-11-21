import { Player, BlockPermutation, BlockStates } from "@minecraft/server";
import { relPosMap, pos1Map, pos2Map, clipMap } from "main";
import { addHistoryEntry, addToHistoryEntry, addVector3, ceilVector3, diffVector3, floorVector3, getClipAt, getClipSize, minVector3, rotatePerm, setBlockAt, setClipAt, setClipSize, subVector3, tellError, tellMessage } from "utils";

export function copy(args, player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    relPosMap.set(player.name, subVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), floorVector3(player.location)));
    setClipSize(player.name, addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name))));
    let clipSize = getClipSize(player.name);
    for (let x = 0; x < clipSize.x; x++) {
        for (let y = 0; y < clipSize.y; y++) {
            for (let z = 0; z < clipSize.z; z++) {
                setClipAt(player.name, {x: x, y: y, z: z},
                    player.dimension.getBlock(
                        addVector3(
                            minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                            {x: x, y: y, z: z}
                        )
                    ).permutation.clone()
                );
            }
        }
    }
    tellMessage(player, `§aCopied ${clipSize.x * clipSize.y * clipSize.z} blocks to clipboard`);
    return clipSize.x * clipSize.y * clipSize.z
}

export function cut(args, player: Player) {
    copy(null, player);
    let perm = BlockPermutation.resolve("minecraft:air");
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                addToHistoryEntry(player.name, {
                    pos: addVector3({x: x, y: y, z: z}, minVector3(pos1Map.get(player.name), pos2Map.get(player.name))),
                    pre: player.dimension.getBlock(addVector3({x: x, y: y, z: z}, minVector3(pos1Map.get(player.name), pos2Map.get(player.name)))).permutation.clone(),
                    post: perm.clone()
                });
                player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: x, y: y, z: z})).setPermutation(perm.clone());
            }
        }
    }
}

export function paste(args, player: Player) {
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    if ((args.length > 0 && (args[0] == '-ap' || args[0] == '-p'))) {
        if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
            tellError(player, "Position 1 not set!");
            return;
        }
        relPosMap.set(player.name, subVector3(pos1Map.get(player.name), floorVector3(player.location)));
    }
    let clipSize = getClipSize(player.name);
    // Creates new entry in history map
    addHistoryEntry(player.name);
    for (let x = 0; x < clipSize.x; x++) {
        for (let y = 0; y < clipSize.y; y++) {
            for (let z = 0; z < clipSize.z; z++) {
                let pos = addVector3(addVector3(relPosMap.get(player.name), floorVector3(player.location)), {x: x, y: y, z: z});
                // Adds current world position, blockstate before paste, and blockstate after paste to history map entry, can muse pre for undo, post for redo
                if ((args != "-a" || !player.dimension.getBlock(pos).isAir) &&  getClipAt(player.name, {x: x, y: y, z: z}) != undefined) {
                    setBlockAt(player, pos, getClipAt(player.name, {x: x, y: y, z: z}).clone());
                }
            }
        }
    }
    tellMessage(player, `§aPasted ${clipSize.x * clipSize.y * clipSize.z} blocks from clipboard`);
}

export function rotate(args, player: Player) {
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
            tellError(player, `Invalid angle: '${args[0]}'`)
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
        }
        let newClip: Array<Array<Array<BlockPermutation>>> = Array(clipSize.x).fill(null).map(
            () => Array(clipSize.y).fill(null).map(
                () => Array(clipSize.z).fill(null)
            )
        )
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

export function mirror(args, player: Player) {
    if (args.length < 1) {
        tellError(player, 'No axis given');
        return;
    }
    let axis = args[0].toLowerCase();
    if (axis != 'x' && axis != 'z') {
        tellError(player, `Invalid axis: '${args[0]}'`)
        return;
    }
    if (!clipMap.has(player.name)) {
        tellError(player, `Nothing in clipboard`);
        return;
    }
    let oldClip = clipMap.get(player.name);
    let clipSize = getClipSize(player.name);
    let newClip: Array<Array<Array<BlockPermutation>>> = Array(clipSize.x).fill(null).map(
        () => Array(clipSize.y).fill(null).map(
            () => Array(clipSize.z).fill(null)
        )
    )
    for (let i = 0; i < clipSize.x; i++) {
        for (let j = 0; j < clipSize.y; j++) {
            for (let k = 0; k < clipSize.z; k++) {
                if ((axis == 'x' && oldClip[clipSize.x - 1 - i][j][k] != undefined) || oldClip[i][j][clipSize.z - 1 - k] != undefined) {
                    if (axis == 'x') {
                        newClip[i][j][k] = oldClip[clipSize.x - 1 - i][j][k].clone();
                    } else {
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
    } else {
        relPosMap.set(player.name, {
            x: relPosMap.get(player.name).x,
            y: relPosMap.get(player.name).y,
            z: relPosMap.get(player.name).z * -1 - clipSize.z + 1
        });
    }
    clipMap.set(player.name, newClip);
    tellMessage(player, `§aMirrored clipboard over the ${axis} axis`);
}