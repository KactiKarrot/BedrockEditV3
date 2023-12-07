import { Player, BlockRaycastOptions, Vector3, BlockPermutation, Direction, BlockVolumeUtils, CompoundBlockVolume } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { historyIndexMap, historyMap, pos1Map, pos2Map } from "main";
import { addCuboid, addEllipsoid, compApplyToAllBlocks, compSelMap, getCompSpan, selMap, subtractCuboid, subtractEllipsoid } from "selection";
import { addHistoryEntry, compareVector3, floorVector3, getHistory, getPermFromHand, getPermFromStr, getPrimaryDirection, getZeroVector3, multiplyVector3, rotateDirection, setBlockAt, shiftVector3, sleep, tellError, tellMessage } from "utils";

/* Need to add:
- Line (curved line, use circle algorithm)
- Disable history (for performance)
*/

export let commands = new Map<string, command>();

interface command {
    alias?: string,
    function: (args: string[], player: Player) => any,
    description: string,
    extDescription: string,
    usage: string[]
}

let commandsa = [
    // set
    {
        name: "set",
        alias: "",
        function: set,
        description: "Sets selected region to given or held block",
        extDescription: "Sets selected region to given or held block\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[tileName: Block]"
        ]
    },
    // remove
    {
        name: "remove",
        alias: "rm",
        function: remove,
        description: "Removes the selected region",
        extDescription: "Removes the selected region",
        usage: [
            ""
        ]
    },
    // move
    {
        name: "move",
        alias: "mv",
        function: move,
        description: "Moves the selected region",
        extDescription: "Moves the selected region\ndistance: Distance to move selected region (defaults to 1)\ndirection: Direction to move selected region (defaults to me/facing/forward)\n-a: Doesn't move air blocks",
        usage: [
            "[distance: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [-a]"
        ]
    },
    // stack
    {
        name: "stack",
        alias: "",
        function: stack,
        description: "Stacks the selected region",
        extDescription: "Stacks the selected region\namount: Number of times to copy selected region\noffset: Amount of blocks between each copy\n-a: Doesn't stack air blocks",
        usage: [
            "[amount: int] [me|facing|forward|right|backward|left|north|east|south|west|up|down] [offset: int] [-a]"
        ]
    },
    // cube
    {
        name: "cube",
        alias: "box",
        function: cube,
        description: "Generates a cube",
        extDescription: "Generates a cube between Position 1 and Position 2\nmode: Whether the cube is filled in or hollow\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[mode: hollow | filled] [tileName: Block]"
        ]
    },
    // walls
    {
        name: "walls",
        alias: "",
        function: walls,
        description: "Generates four walls",
        extDescription: "Generates four walls between Position 1 and Position 2\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[tileName: Block]"
        ]
    },
    // cylinder
    {
        name: "cylinder",
        alias: "cyl",
        function: cylinder,
        description: "Generates a cylinder",
        extDescription: "Generates a cylinder between Position 1 and Position 2\ndirection: Direction for the faces of the cylinder to face (default up/down)\nmode: Whether the cylinder is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[direction: ud | ns | ew] [mode: thick | thin | filled] [fillFaces: boolean] [tileName: Block]"
        ]
    },
    // ellipsoid
    {
        name: "ellipsoid",
        alias: "sphere",
        function: ellipsoid,
        description: "Generates an ellipsoid",
        extDescription: "Generates an ellipsoid between Position 1 and Position 2\nmode: Whether the ellipsoid is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[mode: thick | thin | filled] [tileName: Block]"
        ]
    },
    // dome
    {
        name: "dome",
        alias: "",
        function: dome,
        description: "Generates a dome",
        extDescription: "Generates a dome between Position 1 and Position 2\nmode: Whether the dome is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[mode: thick | thin | filled] [fillFaces: boolean] [tileName: Block]"
        ]
    },
    // pyramid
    {
        name: "pyramid",
        alias: "pyr",
        function: pyramid,
        description: "Generates a pyramid (works best with equal x and z dimensions)",
        extDescription: "Generates a pyramid between Position 1 and Position 2 (works best with equal x and z dimensions)\nmode: Whether the pyramid is filled or hollow\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[mode: hollow | filled] [fillFaces: boolean] [tileName: Block]"
        ]
    },
    // cone
    {
        name: "cone",
        alias: "",
        function: cone,
        description: "Generates a cone",
        extDescription: "Generates a cone between Position 1 and Position 2\nmode: Whether the cone is filled, has thin edges, or thick edges\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[mode: thick | thin | filled] [fillFaces: boolean] [tileName: Block]"
        ]
    },
    // addcuboid
    {
        name: "addcuboid",
        alias: "",
        function: addcuboid,
        description: "",
        extDescription: "",
        usage: [
            ""
        ]
    },
    // subtractcuboid
    {
        name: "subtractcuboid",
        alias: "",
        function: subtractcuboid,
        description: "",
        extDescription: "",
        usage: [
            ""
        ]
    },
    // addellipsoid
    {
        name: "addellipsoid",
        alias: "",
        function: addellipsoid,
        description: "",
        extDescription: "",
        usage: [
            ""
        ]
    },
    // subtractellipsoid
    {
        name: "subtractellipsoid",
        alias: "",
        function: subtractellipsoid,
        description: "",
        extDescription: "",
        usage: [
            ""
        ]
    },
]



//Beds don't work (Can't actually determine bed color)
async function set(args: string[], player: Player) {
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
            tellError(player, `Block ${args[0]} not found`)
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let manualSel = true;
    if(!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)))
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), ShapeModes.filled);
    }

    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    })
    if (!manualSel) {
        compSelMap.delete(player.name)
    }
    tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
}

function remove(args: string[], player: Player) {
    set(['minecraft:air'], player);
}

//done
// Moves the selected region, and the selection with it
async function move(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid distance: '${args[0]}'`)
            return
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': {}
            case 'forward': {}
            case 'facing': {break;}
            case 'right': {
                direction = rotateDirection(direction, 90);
                break
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break
                break
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break
            }
            case 'south': {
                direction = Direction.South;
                break
            }
            case 'west': {
                direction = Direction.West;
                break
            }
            case 'up': {
                direction = Direction.Up;
                break
            }
            case 'down': {
                direction = Direction.Down;
                break
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`)
                break
            }
        }
    }
    let air = true;
    if (args.length >= 3 && args[2] == '-a') { 
        air = false;
    }

    let perm = BlockPermutation.resolve('minecraft:air');
    let manualSel = true;
    if(!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)))
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), ShapeModes.filled);
    }
    let selSize = getCompSpan(compSelMap.get(player.name));
    let sel = Array(selSize.x).fill(null).map(
        () => Array(selSize.y).fill(null).map(
            () => Array(selSize.z).fill(null)
        )
    )
    addHistoryEntry(player.name);
    let count = 0;
    // let origin = compSelMap.get(player.name).getOrigin();
    let min = compSelMap.get(player.name).getMin();
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == perm.type.id) {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation.clone()
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 1000 == 0) {
            await sleep(1);
        }
    })
    compSelMap.get(player.name).translateOrigin(shiftVector3(getZeroVector3(), direction, amount));
    selMap.set(player.name, BlockVolumeUtils.translate(selMap.get(player.name), shiftVector3(getZeroVector3(), direction, amount)))
    // origin = compSelMap.get(player.name).getOrigin();
    min = compSelMap.get(player.name).getMin();
    count = 0; // May need to be separate variable
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == perm.type.id) {
            return;
        }
        setBlockAt(player, l, sel[l.x - min.x][l.y - min.y][l.z - min.z].clone())
        count++;
        if (count % 1000 == 0) {
            await sleep(1);
        }
    })

    if (!manualSel) {
        compSelMap.delete(player.name);
    }

    
    // let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    // let sel = Array(selSize.x).fill(null).map(
    //     () => Array(selSize.y).fill(null).map(
    //         () => Array(selSize.z).fill(null)
    //     )
    // )
    // addHistoryEntry(player.name);
    // for (let x = 0; x < selSize.x; x++) {
    //     for (let y = 0; y < selSize.y; y++) {
    //         for (let z = 0; z < selSize.z; z++) {
    //             if (!air && player.dimension.getBlock(
    //                 addVector3(
    //                     minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                     {x: x, y: y, z: z}
    //                 )
    //             ).permutation.type.id == "minecraft:air") {
    //                 continue;
    //             }
    //             sel[x][y][z] = player.dimension.getBlock(
    //                 addVector3(
    //                     minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                     {x: x, y: y, z: z}
    //                 )
    //             ).permutation.clone()
    //             addToHistoryEntry(player.name, {
    //                 pos: addVector3(
    //                     minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                     {x: x, y: y, z: z}
    //                 ),
    //                 pre: player.dimension.getBlock(addVector3(
    //                     minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                     {x: x, y: y, z: z}
    //                 )).permutation.clone(),
    //                 post: BlockPermutation.resolve("minecraft:air")
    //             })
    //             player.dimension.getBlock(addVector3(
    //                 minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                 {x: x, y: y, z: z}
    //             )).setPermutation(BlockPermutation.resolve("minecraft:air"))
    //         }
    //     }
    // }
    // for (let x = 0; x < selSize.x; x++) {
    //     for (let y = 0; y < selSize.y; y++) {
    //         for (let z = 0; z < selSize.z; z++) {
    //             if (sel[x][y][z] == undefined || sel[x][y][z] == null) {
    //                 continue;
    //             }
    //             addToHistoryEntry(player.name, {
    //                 pos: shiftVector3(
    //                     addVector3(
    //                         minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                         {x: x, y: y, z: z}
    //                     ),
    //                     direction,
    //                     amount
    //                 ),
    //                 pre: player.dimension.getBlock(shiftVector3(
    //                     addVector3(
    //                         minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                         {x: x, y: y, z: z}
    //                     ),
    //                     direction,
    //                     amount
    //                 )).permutation.clone(),
    //                 post: sel[x][y][z].clone()
    //             })
    //             player.dimension.getBlock(
    //                 shiftVector3(
    //                     addVector3(
    //                         minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
    //                         {x: x, y: y, z: z}
    //                     ),
    //                     direction,
    //                     amount
    //                 )
    //             ).setPermutation(sel[x][y][z].clone());
                
    //         }
    //     }
    // }
    // pos1Map.set(player.name, shiftVector3(pos1Map.get(player.name), direction, amount));
    // pos2Map.set(player.name, shiftVector3(pos2Map.get(player.name), direction, amount));
    tellMessage(player, `§aMoved ${count} blocks ${direction}`)
}

//done
async function stack(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }

    let amount = 2

    //#region Args
    if (args.length == 0) {
        help(['stack'], player);
        return;
    }
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0])) || args[0] == '0') {
            tellError(player, `Invalid amount: '${args[0]}'`)
            return
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': {}
            case 'forward': {}
            case 'facing': {break;}
            case 'right': {
                direction = rotateDirection(direction, 90);
                break
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break
                break
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break
            }
            case 'south': {
                direction = Direction.South;
                break
            }
            case 'west': {
                direction = Direction.West;
                break
            }
            case 'up': {
                direction = Direction.Up;
                break
            }
            case 'down': {
                direction = Direction.Down;
                break
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`)
                break
            }
        }
    }
    let offset = 0;
    if (args.length >= 3) {
        if (Number.isNaN(parseInt(args[2]))) {
            tellError(player, `Invalid amount: '${args[2]}'`)
            return
        }
        offset = parseInt(args[2]);
    }
    let air = true;
    if (args.length >= 4 && args[3] == '-a') { 
        air = false;
    }
    //#endregion Args
    let manualSel = true;
    if(!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)))
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), ShapeModes.filled);
    }
    let selSize = getCompSpan(compSelMap.get(player.name));
    let sel = Array(selSize.x).fill(null).map(
        () => Array(selSize.y).fill(null).map(
            () => Array(selSize.z).fill(null)
        )
    )
    addHistoryEntry(player.name);
    
    let origin = compSelMap.get(player.name).getOrigin();
    let min = compSelMap.get(player.name).getMin();
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == 'minecraft:air') {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation.clone()
    })
    let count = 0;
    for (let i = 0; i < amount; i++) {
        const deltaVec = shiftVector3(getZeroVector3(), direction, (direction == Direction.North || direction == Direction.South ? selSize.z : (direction == Direction.Up || direction == Direction.Down ? selSize.y : selSize.x)) + offset);
        compSelMap.get(player.name).translateOrigin(deltaVec);
        selMap.set(player.name, BlockVolumeUtils.translate(selMap.get(player.name), deltaVec))
        min = compSelMap.get(player.name).getMin();
        compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
            count++;
            if (count % 1000 == 0) {
                await sleep(1);
            }
            player.sendMessage(`debug: ${JSON.stringify(l)} - [${l.x - min.x}][${l.y - min.y}][${l.z - min.z}]`)
            b.setPermutation(sel[l.x - min.x][l.y - min.y][l.z - min.z].clone())
        })
    }
    compSelMap.get(player.name).setOrigin(origin);
    tellMessage(player, `§aStacked selection ${amount} times (${count} blocks)`);
}

function addcuboid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled
    if (args.length >= 1) {
        switch(args[0]) {
            case 'hollow': {
                mode = ShapeModes.thick;
                break;
            }
            case 'filled': {
                mode = ShapeModes.filled;
                break;
            }
            case 'walls': {
                mode = ShapeModes.thin;
                break;
            }
            default: {
                tellError(player, `Invalid mode: ${args[0]}`)
                return
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode);
    tellMessage(player, '§aAdded cuboid to compound selection');
}

function subtractcuboid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled
    if (args.length >= 1) {
        switch(args[0]) {
            case 'hollow': {
                mode = ShapeModes.thick;
                break;
            }
            case 'filled': {
                mode = ShapeModes.filled;
                break;
            }
            case 'walls': {
                mode = ShapeModes.thin;
                break;
            }
            default: {
                tellError(player, `Invalid mode: ${args[0]}`)
                return
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    subtractCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode);
    tellMessage(player, '§aAdded negative cuboid to compound selection');
}

function addellipsoid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    let mode = 'filled'
    if (args.length >= 1) {
        mode = args[0]
    }
    addEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode as ShapeModes);
    player.sendMessage('done')
}

function subtractellipsoid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    let mode = 'filled'
    if (args.length >= 1) {
        mode = args[0]
    }
    subtractEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode as ShapeModes);
    player.sendMessage('done')
}


export {
    pos1,
    pos2
}