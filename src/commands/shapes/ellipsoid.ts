import { Player, BlockTypes, BlockPermutation } from "@minecraft/server";
import { generateEllipsoid, ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { getPermFromHand, tellError, addVector3, diffVector3, addHistoryEntry, minVector3, setBlockAt, tellMessage } from "utils";

commands.set('ellipsoid', {
    alias: "sphere",
    function: ellipsoid,
    description: "Generates an ellipsoid",
    extDescription: "Generates an ellipsoid between Position 1 and Position 2\nmode: Whether the ellipsoid is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[mode: thick | thin | filled] [tileName: Block]"
    ]
})

function ellipsoid(args: string[], player: Player) {
    tellMessage(player, 'This command is not yet implemented')
    return;
    // let mode = 'filled'
    // let perm = getPermFromHand(player);
    // if (args.length >= 1) {
    //     if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
    //         tellError(player, `Invalid mode: ${args[0]}`)
    //         return
    //     }
    //     mode = args[0].toLowerCase();
    // }
    // if (args.length >= 2 && args[1] != '') {
    //     if (BlockTypes.get(args[1]) == undefined) {
    //         tellError(player, `Block ${args[1]} not found`)
    //         return;
    //     }
    //     perm = BlockPermutation.resolve(args[1]);
    // }

    // if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
    //     tellError(player, "Position 1 not set!");
    //     return;
    // }
    // if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
    //     tellError(player, "Position 2 not set!");
    //     return;
    // }
    // let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    // let mat = generateEllipsoid(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    
    // let blockCount = 0;

    // addHistoryEntry(player.name);

    // for (let i = 0; i < selSize.x; i++) {
    //     for (let j = 0; j < selSize.y; j++) {
    //         for (let k = 0; k < selSize.z; k++) {
    //             let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
    //             if (mat[i][j][k].valueOf() == true) {
    //                 setBlockAt(player, pos, perm.clone());
    //                 blockCount++;
    //             }
    //         }
    //     }
    // }
    // tellMessage(player, `§aSuccessfully generated ellipsoid (${blockCount} blocks)`);
}