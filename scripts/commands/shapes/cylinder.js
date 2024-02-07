import { BlockTypes, BlockPermutation, CompoundBlockVolume, BlockVolumeUtils, system } from "@minecraft/server";
import { commands } from "commands";
import { Axis, addCylinder, compApplyToAllBlocks, selMap } from "selectionUtils";
import { getPermFromHand, tellError, addHistoryEntry, setBlockAt, tellMessage, multiplyVector3 } from "utils";
commands.set('cylinder', {
    alias: "cyl",
    function: cylinder,
    description: "Generates a cylinder",
    extDescription: "Generates a cylinder between Position 1 and Position 2\ndirection: Direction for the faces of the cylinder to face (default up/down)\nmode: Whether the cylinder is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[direction: ud | ns | ew] [mode: thick | thin | filled] [fillFaces: boolean] [tileName: Block]"
    ]
});
function cylinder(args, player) {
    // tellMessage(player, 'This command is not yet implemented')
    // return;
    let direction = Axis.Y;
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'ud' && args[0].toLowerCase() != 'ns' && args[0].toLowerCase() != 'ew') {
            tellError(player, `Invalid direction: ${args[0]}`);
            return;
        }
    }
    if (args.length >= 2) {
        if (args[1].toLowerCase() != 'thick' && args[1].toLowerCase() != 'thin' && args[1].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[1]}`);
            return;
        }
        mode = args[1].toLowerCase();
    }
    if (args.length >= 3) {
        if (args[2] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 4 && args[3] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[3]} not found`);
            return;
        }
        perm = BlockPermutation.resolve(args[3]);
    }
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    // let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    // let mat: boolean[][];
    if (args.length >= 1) {
        switch (args[0].toLowerCase()) {
            case 'ud': {
                direction = Axis.Y;
                break;
            }
            case 'ns': {
                direction = Axis.Z;
                break;
            }
            case 'ew': {
                direction = Axis.X;
                break;
            }
        }
    }
    addHistoryEntry(player.name);
    let vol = new CompoundBlockVolume(player.location);
    addCylinder(vol, BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(vol.getOrigin(), { x: -1, y: -1, z: -1 })), mode, direction, fillFaces);
    let count = 0;
    system.runJob(compApplyToAllBlocks(vol, player.dimension, (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
    }, () => {
        tellMessage(player, `§aSuccessfully generated cylinder (${count} blocks)`);
    }));
    // let blockCount = 0;
    // addHistoryEntry(player.name);
    // for (let i = 0; i < selSize.x; i++) {
    //     for (let j = 0; j < selSize.y; j++) {
    //         for (let k = 0; k < selSize.z; k++) {
    //             let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
    //             switch(direction) {
    //                 case 'ud': {
    //                     if (fillFaces && (j == 0 || j == selSize.y - 1)) {
    //                         let mat2 = generateEllipse(selSize.x, selSize.z, ShapeModes.filled);
    //                         if (mat2[i][k].valueOf() == true) {
    //                             setBlockAt(player, pos, perm.clone());
    //                             blockCount++;
    //                         }
    //                     } else if (mat[i][k].valueOf() == true) {
    //                         setBlockAt(player, pos, perm.clone());
    //                         blockCount++;
    //                     }
    //                     break;
    //                 }
    //                 case 'ns': {
    //                     if (fillFaces && (k == 0 || k == selSize.z - 1)) {
    //                         let mat2 = generateEllipse(selSize.x, selSize.y, ShapeModes.filled);
    //                         if (mat2[i][j].valueOf() == true) {
    //                             setBlockAt(player, pos, perm.clone());
    //                             blockCount++;
    //                         }
    //                     } else if (mat[i][j].valueOf() == true) {
    //                         setBlockAt(player, pos, perm.clone());
    //                         blockCount++;
    //                     }
    //                     break;
    //                 }
    //                 case 'ew': {
    //                     if (fillFaces && (i == 0 || i == selSize.x - 1)) {
    //                         let mat2 = generateEllipse(selSize.z, selSize.y, ShapeModes.filled);
    //                         if (mat2[k][j].valueOf() == true) {
    //                             setBlockAt(player, pos, perm.clone());
    //                             blockCount++;
    //                         }
    //                     } else if (mat[k][j].valueOf() == true) {
    //                         setBlockAt(player, pos, perm.clone());
    //                         blockCount++;
    //                     }
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }
    // tellMessage(player, `§aSuccessfully generated cylinder (${blockCount} blocks)`);
}
