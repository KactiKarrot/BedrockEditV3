import { BlockPermutation } from "@minecraft/server";
import { relPosMap, pos1Map, pos2Map } from "main";
import { addHistoryEntry, addToHistoryEntry, addVector3, ceilVector3, diffVector3, getClipAt, getClipSize, minVector3, setClipAt, setClipSize, subVector3, tell, tellError } from "utils";
function copy(args, player) {
    if (!pos1Map.has(player.name) || !pos2Map.has(player.name)) {
        tellError(player, "Position 1 or 2 not set!");
        return;
    }
    relPosMap.set(player.name, subVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), ceilVector3(player.location)));
    setClipSize(player.name, addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name))));
    let clipSize = getClipSize(player.name);
    for (let x = 0; x < clipSize.x; x++) {
        for (let y = 0; y < clipSize.y; y++) {
            for (let z = 0; z < clipSize.z; z++) {
                setClipAt(player.name, { x: x, y: y, z: z }, player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.clone());
            }
        }
    }
    tell(player, `§aCopied ${clipSize.x * clipSize.y * clipSize.z} blocks to clipboard`);
    return clipSize.x * clipSize.y * clipSize.z;
}
function cut(args, player) {
    copy(null, player);
    let perm = BlockPermutation.resolve("minecraft:air");
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                addToHistoryEntry(player.name, {
                    pos: addVector3({ x: x, y: y, z: z }, minVector3(pos1Map.get(player.name), pos2Map.get(player.name))),
                    pre: player.dimension.getBlock(addVector3({ x: x, y: y, z: z }, minVector3(pos1Map.get(player.name), pos2Map.get(player.name)))).permutation.clone(),
                    post: perm.clone()
                });
                player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).setPermutation(perm.clone());
            }
        }
    }
}
function paste(args, player) {
    // if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
    //     tellError(player, "Position 1 not set!");
    // }
    if (!relPosMap.has(player.name) || (args.length > 0 && args[0] == '-p1')) {
        relPosMap.set(player.name, subVector3(pos1Map.get(player.name), ceilVector3(player.location)));
    }
    let clipSize = getClipSize(player.name);
    // Creates new entry in history map
    addHistoryEntry(player.name);
    for (let x = 0; x < clipSize.x; x++) {
        for (let y = 0; y < clipSize.y; y++) {
            for (let z = 0; z < clipSize.z; z++) {
                // Adds current world position, blockstate before paste, and blockstate after paste to history map entry, can muse pre for undo, post for redo
                if (args != "-a" || !player.dimension.getBlock(pos1Map.get(player.name)).isAir) {
                    addToHistoryEntry(player.name, {
                        pos: addVector3(addVector3(relPosMap.get(player.name), ceilVector3(player.location)), { x: x, y: y, z: z }),
                        pre: player.dimension.getBlock(addVector3(addVector3(relPosMap.get(player.name), ceilVector3(player.location)), { x: x, y: y, z: z })).permutation.clone(),
                        post: getClipAt(player.name, { x: x, y: y, z: z }).clone()
                    });
                    player.dimension.getBlock(addVector3(addVector3(relPosMap.get(player.name), ceilVector3(player.location)), { x: x, y: y, z: z })).setPermutation(getClipAt(player.name, { x: x, y: y, z: z }).clone());
                }
            }
        }
    }
    tell(player, `§aPasted ${clipSize.x * clipSize.y * clipSize.z} blocks from clipboard`);
}
function rotate(args, player) {
}
function mirror(args, player) {
}
export { copy, cut, paste, rotate, mirror };
