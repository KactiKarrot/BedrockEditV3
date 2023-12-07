import { BlockTypes, BlockPermutation } from "@minecraft/server";
import { generatePyramid } from "Circle-Generator/Controller";
import { commands } from "commands";
import { pos1Map, pos2Map } from "main";
import { getPermFromHand, tellError, addVector3, diffVector3, addHistoryEntry, minVector3, setBlockAt, tellMessage } from "utils";
commands.set('pyramid', {
    alias: "pyr",
    function: pyramid,
    description: "Generates a pyramid (works best with equal x and z dimensions)",
    extDescription: "Generates a pyramid between Position 1 and Position 2 (works best with equal x and z dimensions)\nmode: Whether the pyramid is filled or hollow\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[mode: hollow | filled] [fillFaces: boolean] [tileName: Block]"
    ]
});
function pyramid(args, player) {
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 3 && args[2] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[2]} not found`);
            return;
        }
        perm = BlockPermutation.resolve(args[2]);
    }
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat = generatePyramid(selSize.x, selSize.y, selSize.z, mode);
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated pyramid (${blockCount} blocks)`);
}
