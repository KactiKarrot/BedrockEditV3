import { commands } from "commands";
// import { pos1Map, pos2Map } from "main";
import { tellMessage } from "utils";
commands.set('cone', {
    function: cone,
    description: "Generates a cone",
    extDescription: "Generates a cone between Position 1 and Position 2\nmode: Whether the cone is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[mode: thick | thin | filled] [fillFaces: boolean] [tileName: Block]"
    ]
});
// Doesn't work (offset is off and top of odd diameter has 2x2)
function cone(args, player) {
    tellMessage(player, 'This command is not yet implemented');
    // let mode = 'filled'
    // let perm = getPermFromHand(player);
    // let fillFaces = true;
    // if (args.length >= 1) {
    //     if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
    //         tellError(player, `Invalid mode: ${args[0]}`)
    //         return
    //     }
    //     mode = args[0].toLowerCase();
    // }
    // if (args.length >= 2) {
    //     if (args[1] == 'false') {
    //         fillFaces = false;
    //     }
    // }
    // if (args.length >= 3 && args[2] != '') {
    //     if (BlockTypes.get(args[2]) == undefined) {
    //         tellError(player, `Block ${args[2]} not found`)
    //         return;
    //     }
    //     perm = BlockPermutation.resolve(args[2]);
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
    // let mat = generateCone(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    // let blockCount = 0;
    // addHistoryEntry(player.name);
    // for (let i = 0; i < selSize.x; i++) {
    //     for (let j = 0; j < selSize.y; j++) {
    //         for (let k = 0; k < selSize.z; k++) {
    //             let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
    //             if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0 && generateEllipse(selSize.x, selSize.z, ShapeModes.filled)[i][k].valueOf() == true)) {
    //                 setBlockAt(player, pos, perm.clone());
    //                 blockCount++;
    //             }
    //         }
    //     }
    // }
    // tellMessage(player, `§aSuccessfully generated a cone (${blockCount} blocks)`);
}
