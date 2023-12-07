import { BlockPermutation, Direction, BlockVolumeUtils, CompoundBlockVolume } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { historyIndexMap, historyMap, pos1Map, pos2Map } from "main";
import { addCuboid, addEllipsoid, compApplyToAllBlocks, compSelMap, getCompSpan, selMap, subtractCuboid, subtractEllipsoid } from "selection";
import { addHistoryEntry, compareVector3, floorVector3, getHistory, getPermFromHand, getPermFromStr, getPrimaryDirection, getZeroVector3, multiplyVector3, rotateDirection, setBlockAt, shiftVector3, sleep, tellError, tellMessage } from "utils";
/* Need to add:
- Line (curved line, use circle algorithm)
- Disable history (for performance)
*/
export let commands = new Map();
let commandsa = [
    // undo
    {
        name: "undo",
        alias: "",
        function: undo,
        description: "Undoes an action",
        extDescription: "Undoes an action\ntimes: Number of actions to undo\nplayer: Player to undo actions for (useful for admins)",
        usage: [
            "[times: int] [player: Player]"
        ]
    },
    // redo
    {
        name: "redo",
        alias: "",
        function: redo,
        description: "Redoes an action",
        extDescription: "Redoes an action\ntimes: Number of actions to redo\nplayer: Player to redo actions for (useful for admins)",
        usage: [
            "[times: int] [player: Player]"
        ]
    },
    // clearhistory
    {
        name: "clearhistory",
        alias: "clear",
        function: clearHistory,
        description: "Clears the players edit history",
        extDescription: "Clears the players edit history",
        usage: [
            ""
        ]
    },
    // pos1
    {
        name: "pos1",
        alias: "p1",
        function: pos1,
        description: "Saves a position to pos1",
        extDescription: "Saves a position to pos1\nfacing: Gets block from player's view vector\n-l: Includes liquid blocks (such as water) in the position selection (normally passes through)\n-p: Includes passable blocks (such as vines) in the position selection (normally passes through)\nposition: Gets block from given coordinates",
        usage: [
            "",
            "facing [-lp]",
            "position <pos: x y z>"
        ]
    },
    // pos2
    {
        name: "pos2",
        alias: "p2",
        function: pos2,
        description: "Saves a position to pos2",
        extDescription: "Saves a position to pos2\nfacing: Gets block from player's view vector\n-l: Includes liquid blocks (such as water) in the position selection (normally passes through)\n-p: Includes passable blocks (such as vines) in the position selection (normally passes through)\nposition: Gets block from given coordinates",
        usage: [
            "",
            "facing [-lp]",
            "position <pos: x y z>"
        ]
    },
    // shift
    {
        name: "shift",
        alias: "",
        function: shift,
        description: "Moves the selection",
        extDescription: "Moves the selection\ndistance: Distance to move selection (defaults to 1)\ndirection: Direciton to move selection (defaults to me/facing/forward)",
        usage: [
            "[distance: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down]"
        ]
    },
    // shrink
    {
        name: "shrink",
        alias: "",
        function: shrink,
        description: "Shrinks the selection",
        extDescription: "Shrinks the selection\namount: Amount to shrink selection (defaults to 1)\ndirection: Direciton to move selection (defaults to me/facing/forward)\noppositeAmount: Amount to shrink selection in the opposite direciton (defaults to 0)",
        usage: [
            "[amount: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [oppositeAmount: int]"
        ]
    },
    // expand
    {
        name: "expand",
        alias: "",
        function: expand,
        description: "Expands the selection",
        extDescription: "Expands the selection\namount: Amount to shrink selection (defaults to 1)\ndirection: Direciton to move selection (defaults to me/facing/forward)\noppositeAmount: Amount to shrink selection in the opposite direciton (defaults to 0)",
        usage: [
            "[amount: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [oppositeAmount: int]"
        ]
    },
    // inset
    {
        name: "inset",
        alias: "",
        function: inset,
        description: "Shrinks the selection in all directions",
        extDescription: "Shrinks the selection in all directions\namount: Amount to inset selection (defaults to 1)\n-h: Only inset horizontally\n-v: Only inset vertically",
        usage: [
            "[amount: int] [-hv]"
        ]
    },
    // outset
    {
        name: "outset",
        alias: "",
        function: outset,
        description: "Expands the selection in all directions",
        extDescription: "Expands the selection in all directions\namount: Amount to outset selection (defaults to 1)\n-h: Only outset horizontally\n-v: Only outset vertically",
        usage: [
            "[amount: int] [-hv]"
        ]
    },
    // deselect
    {
        name: "deselect",
        alias: "desel",
        function: deselect,
        description: "Deselects selection",
        extDescription: "Deselects selection (Removes Position 1 and Position 2)",
        usage: [
            ""
        ]
    },
    // copy
    {
        name: "copy",
        alias: "cp",
        function: copy,
        description: "Copies a region to the player's clipboard",
        extDescription: "Copies a region to the player's clipboard",
        usage: [
            ""
        ]
    },
    // cut
    {
        name: "cut",
        alias: "",
        function: cut,
        description: "Cuts a region to the player's clipboard",
        extDescription: "Cuts a region to the player's clipboard",
        usage: [
            ""
        ]
    },
    // paste
    {
        name: "paste",
        alias: "",
        function: paste,
        description: "Pastes a region from the player's clipboard",
        extDescription: "Pastes a region from the player's clipboard\n-a: Doesn't paste air blocks\n-p: Pastes starting with the lowest coordinate at Position 1",
        usage: [
            "[-ap]"
        ]
    },
    // rotate
    {
        name: "rotate",
        alias: "",
        function: rotate,
        description: "Rotates the clipboard",
        extDescription: "Rotates the clipboard\nangle: Angle to rotate clipboard (must be 90, 180, or 270)",
        usage: [
            "<rotationAngle: angle>"
        ]
    },
    // mirror
    {
        name: "mirror",
        alias: "flip",
        function: mirror,
        description: "Mirrors the clipboard",
        extDescription: "Mirrors the clipboard\naxis: Axis to mirror clipboard over",
        usage: [
            "<mirrorAxis: x | z>"
        ]
    },
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
];
function undo(args, player) {
    let name = player.name;
    let times = 1;
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        times = parseInt(args[0]);
    }
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        tellError(player, `Invalid number: ${args[0]}`);
    }
    if (args.length >= 2 && args[1] != '') {
        name = args[1];
    }
    if (historyMap.get(name) == undefined || historyMap.get(name).length <= 0) {
        tellError(player, "Nothing to undo");
        return;
    }
    if (historyIndexMap.get(name) == historyMap.get(name).length) {
        tellError(player, "Nothing more to undo");
        return;
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        if (historyIndexMap.get(name) == historyMap.get(name).length) {
            break;
        }
        let entry = getHistory(name, historyIndexMap.get(name));
        for (let i = entry.length - 1; i >= 0; i--) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].pre.clone());
            changes++;
        }
        historyIndexMap.set(name, historyIndexMap.get(name) + 1);
        actions++;
    }
    tellMessage(player, `§aUndid ${actions} actions (${changes} blocks)`);
}
function redo(args, player) {
    let name = player.name;
    let times = 1;
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        times = parseInt(args[0]);
    }
    if (args.length >= 1 && isNaN(parseInt(args[0])) && args[0] != '') {
        tellError(player, `Invalid number: ${args[0]}`);
    }
    if (args.length >= 2 && args[1] != '') {
        name = args[1];
    }
    if (historyMap.get(name) == undefined || historyMap.get(name).length <= 0) {
        tellError(player, "Nothing to redo");
        return;
    }
    if (historyIndexMap.get(name) == 0) {
        tellError(player, "Nothing more to redo");
        return;
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        historyIndexMap.set(name, historyIndexMap.get(name) - 1);
        let entry = getHistory(name, historyIndexMap.get(name));
        for (let i = 0; i < entry.length; i++) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].post.clone());
            changes++;
        }
        actions++;
    }
    tellMessage(player, `§aRedid ${actions} actions (${changes} blocks)`);
}
function clearHistory(args, player) {
    let name = player.name;
    if (args.length >= 1 && args[0] != '') {
        name = args[0];
    }
    historyMap.delete(name);
    historyIndexMap.delete(name);
    tellMessage(player, `§aEdit history cleared`);
}
// from
//done
function pos1(args, player, pos = null) {
    switch (args[0]) {
        case "position": {
            if (args.length < 4) {
                tellError(player, "Not enough arguments");
                return;
            }
            pos = floorVector3(player.location);
            if (args[1][0] != "~") {
                pos.x = 0;
                args[1] = ' ' + args[1];
            }
            if (args[2][0] != "~") {
                pos.y = 0;
                args[2] = ' ' + args[2];
            }
            if (args[3][0] != "~") {
                pos.z = 0;
                args[3] = ' ' + args[3];
            }
            if (args[1].length > 1) {
                if (isNaN(parseInt(args[1].substring(1)))) {
                    tellError(player, `Invalid number: ${args[1]}`);
                    return;
                }
                pos.x += parseInt(args[1].substring(1));
            }
            if (args[2].length > 1) {
                if (isNaN(parseInt(args[2].substring(1)))) {
                    tellError(player, `Invalid number: ${args[2]}`);
                    return;
                }
                pos.y += parseInt(args[2].substring(1));
            }
            if (args[3].length > 1) {
                if (isNaN(parseInt(args[3].substring(1)))) {
                    tellError(player, `Invalid number: ${args[3]}`);
                    return;
                }
                pos.z += parseInt(args[3].substring(1));
            }
            break;
        }
        case "facing": {
            let options = {
                includeLiquidBlocks: false,
                includePassableBlocks: false,
                maxDistance: 15
            };
            if (args.length > 1 && args[1].charAt(0) == '-') {
                args[1] = args[1].substring(1);
                for (let i = 0; i < args[1].length; i++) {
                    switch (args[1].charAt(i)) {
                        case 'l': {
                            options.includeLiquidBlocks = true;
                            break;
                        }
                        case 'p': {
                            options.includePassableBlocks = true;
                            break;
                        }
                    }
                }
            }
            let rayHit = player.getBlockFromViewDirection(options);
            if (rayHit != undefined) {
                pos = rayHit.block.location;
            }
            else {
                tellError(player, 'No block in range');
                return;
            }
            break;
        }
        default: {
            pos = floorVector3(player.location);
            break;
        }
    }
    if (!selMap.has(player.name) || !compareVector3(pos, selMap.get(player.name).from)) {
        if (selMap.has(player.name)) {
            selMap.get(player.name).from = pos;
        }
        else {
            selMap.set(player.name, { from: pos, to: undefined });
        }
        if (selMap.get(player.name).to == undefined) {
            tellMessage(player, `§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z}`);
        }
        else {
            tellMessage(player, `§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z} (${BlockVolumeUtils.getCapacity(selMap.get(player.name))} blocks)`);
        }
    }
}
// to
//done
function pos2(args, player, pos = null) {
    switch (args[0]) {
        case "position": {
            if (args.length < 4) {
                tellError(player, "Not enough arguments");
                return;
            }
            pos = floorVector3(player.location);
            if (args[1][0] != "~") {
                pos.x = 0;
                args[1] = ' ' + args[1];
            }
            if (args[2][0] != "~") {
                pos.y = 0;
                args[2] = ' ' + args[2];
            }
            if (args[3][0] != "~") {
                pos.z = 0;
                args[3] = ' ' + args[3];
            }
            if (args[1].length > 1) {
                if (isNaN(parseInt(args[1].substring(1)))) {
                    tellError(player, `Invalid number: ${args[1]}`);
                    return;
                }
                pos.x += parseInt(args[1].substring(1));
            }
            if (args[2].length > 1) {
                if (isNaN(parseInt(args[2].substring(1)))) {
                    tellError(player, `Invalid number: ${args[2]}`);
                    return;
                }
                pos.y += parseInt(args[2].substring(1));
            }
            if (args[3].length > 1) {
                if (isNaN(parseInt(args[3].substring(1)))) {
                    tellError(player, `Invalid number: ${args[3]}`);
                    return;
                }
                pos.z += parseInt(args[3].substring(1));
            }
            break;
        }
        case "facing": {
            let options = {
                includeLiquidBlocks: false,
                includePassableBlocks: false,
                maxDistance: 15
            };
            if (args.length > 1 && args[1].charAt(0) == '-') {
                args[1] = args[1].substring(1);
                for (let i = 0; i < args[1].length; i++) {
                    switch (args[1].charAt(i)) {
                        case 'l': {
                            options.includeLiquidBlocks = true;
                            break;
                        }
                        case 'p': {
                            options.includePassableBlocks = true;
                            break;
                        }
                    }
                }
            }
            let rayHit = player.getBlockFromViewDirection(options);
            if (rayHit != undefined) {
                pos = rayHit.block.location;
            }
            else {
                tellError(player, 'No block in range');
                return;
            }
            break;
        }
        default: {
            pos = floorVector3(player.location);
            break;
        }
    }
    if (!selMap.has(player.name) || !compareVector3(pos, selMap.get(player.name).to)) {
        if (selMap.has(player.name)) {
            selMap.get(player.name).to = pos;
        }
        else {
            selMap.set(player.name, { to: pos, from: undefined });
        }
        if (selMap.get(player.name).from == undefined) {
            tellMessage(player, `§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z}`);
        }
        else {
            tellMessage(player, `§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z} (${BlockVolumeUtils.getCapacity(selMap.get(player.name))} blocks)`);
        }
    }
}
function shift(args, player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid distance: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': { }
            case 'forward': { }
            case 'facing': {
                break;
            }
            case 'right': {
                direction = rotateDirection(direction, 90);
                break;
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break;
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break;
                break;
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break;
            }
            case 'south': {
                direction = Direction.South;
                break;
            }
            case 'west': {
                direction = Direction.West;
                break;
            }
            case 'up': {
                direction = Direction.Up;
                break;
            }
            case 'down': {
                direction = Direction.Down;
                break;
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`);
                break;
            }
        }
    }
    pos1Map.set(player.name, shiftVector3(pos1Map.get(player.name), direction, amount));
    pos2Map.set(player.name, shiftVector3(pos2Map.get(player.name), direction, amount));
    tellMessage(player, `§aShifted selection ${amount} blocks ${direction}`);
}
function shrink(args, player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': { }
            case 'forward': { }
            case 'facing': {
                break;
            }
            case 'right': {
                direction = rotateDirection(direction, 90);
                break;
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break;
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break;
                break;
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break;
            }
            case 'south': {
                direction = Direction.South;
                break;
            }
            case 'west': {
                direction = Direction.West;
                break;
            }
            case 'up': {
                direction = Direction.Up;
                break;
            }
            case 'down': {
                direction = Direction.Down;
                break;
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`);
                break;
            }
        }
    }
    let oppositeAmount = 0;
    if (args.length >= 3) {
        if (isNaN(parseInt(args[2]))) {
            tellError(player, `Invalid opposite amount: ${args[2]}`);
            return;
        }
        oppositeAmount = parseInt(args[2]);
    }
    switch (direction) {
        case Direction.North: {
            if (pos1Map.get(player.name).z == pos2Map.get(player.name).z) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).z > pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z - amount
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                });
            }
            break;
        }
        case Direction.East: {
            if (pos1Map.get(player.name).x == pos2Map.get(player.name).x) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x + amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.South: {
            if (pos1Map.get(player.name).z == pos2Map.get(player.name).z) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + amount
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                });
                pos1Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + amount
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                });
            }
            break;
        }
        case Direction.West: {
            if (pos1Map.get(player.name).x == pos2Map.get(player.name).x) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).x > pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.Up: {
            if (pos1Map.get(player.name).y == pos2Map.get(player.name).y) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + amount,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + oppositeAmount,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + amount,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + oppositeAmount,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.Down: {
            if (pos1Map.get(player.name).y == pos2Map.get(player.name).y) {
                tellError(player, `Can't shrink selection any more`);
                return;
            }
            if (pos1Map.get(player.name).y > pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - amount,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - oppositeAmount,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - amount,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - oppositeAmount,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
    }
    tellMessage(player, `§aShrunk selection ${amount} blocks`);
}
function expand(args, player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': { }
            case 'forward': { }
            case 'facing': {
                break;
            }
            case 'right': {
                direction = rotateDirection(direction, 90);
                break;
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break;
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break;
                break;
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break;
            }
            case 'south': {
                direction = Direction.South;
                break;
            }
            case 'west': {
                direction = Direction.West;
                break;
            }
            case 'up': {
                direction = Direction.Up;
                break;
            }
            case 'down': {
                direction = Direction.Down;
                break;
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`);
                break;
            }
        }
    }
    let oppositeAmount = 0;
    if (args.length >= 3) {
        if (isNaN(parseInt(args[2]))) {
            tellError(player, `Invalid opposite amount: ${args[2]}`);
            return;
        }
        oppositeAmount = parseInt(args[2]);
    }
    amount = -amount;
    oppositeAmount = -oppositeAmount;
    switch (direction) {
        case Direction.North: {
            if (pos1Map.get(player.name).z > pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z - amount
                });
                pos2Map.set(player.name, {
                    y: pos2Map.get(player.name).y,
                    x: pos2Map.get(player.name).x,
                    z: pos2Map.get(player.name).z + oppositeAmount
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                });
            }
            break;
        }
        case Direction.East: {
            if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x + amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.South: {
            if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z - amount
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                });
            }
            break;
        }
        case Direction.West: {
            if (pos1Map.get(player.name).x > pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x + amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.Up: {
            if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - amount,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + oppositeAmount,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - amount,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + oppositeAmount,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
        case Direction.Down: {
            if (pos1Map.get(player.name).y > pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + amount,
                    z: pos1Map.get(player.name).z
                });
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - oppositeAmount,
                    z: pos2Map.get(player.name).z
                });
            }
            else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + amount,
                    z: pos2Map.get(player.name).z
                });
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - oppositeAmount,
                    z: pos1Map.get(player.name).z
                });
            }
            break;
        }
    }
    tellMessage(player, `§aExpanded selection ${amount} blocks`);
}
function inset(args, player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let h = true;
    let v = true;
    if (args.length >= 2 && args[1] != '') {
        h = false;
        v = false;
        if (args[1].indexOf('h') >= 0) {
            h = true;
        }
        if (args[1].indexOf('v') >= 0) {
            v = true;
        }
    }
    let p1 = pos1Map.get(player.name);
    let p2 = pos2Map.get(player.name);
    for (let i = 0; i < amount; i++) {
        if (h) {
            if (pos1Map.get(player.name).x > pos2Map.get(player.name).x) {
                p1.x--;
                p2.x++;
            }
            else if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                p1.x++;
                p2.x--;
            }
            if (pos1Map.get(player.name).z > pos2Map.get(player.name).z) {
                p1.z--;
                p2.z++;
            }
            else if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                p1.z++;
                p2.z--;
            }
        }
        if (v) {
            if (pos1Map.get(player.name).y > pos2Map.get(player.name).y) {
                p1.y--;
                p2.y++;
            }
            else if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                p1.y++;
                p2.y--;
            }
        }
    }
    pos1Map.set(player.name, p1);
    pos2Map.set(player.name, p2);
    tellMessage(player, `§aSelection inset ${amount} blocks`);
}
function outset(args, player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let h = true;
    let v = true;
    if (args.length >= 2 && args[1] != '') {
        h = false;
        v = false;
        if (args[1].indexOf('h') >= 0) {
            h = true;
        }
        if (args[1].indexOf('v') >= 0) {
            v = true;
        }
    }
    let p1 = pos1Map.get(player.name);
    let p2 = pos2Map.get(player.name);
    for (let i = 0; i < amount; i++) {
        if (h) {
            if (pos1Map.get(player.name).x >= pos2Map.get(player.name).x) {
                p1.x++;
                p2.x--;
            }
            else if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                p1.x--;
                p2.x++;
            }
            if (pos1Map.get(player.name).z >= pos2Map.get(player.name).z) {
                p1.z++;
                p2.z--;
            }
            else if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                p1.z--;
                p2.z++;
            }
        }
        if (v) {
            if (pos1Map.get(player.name).y >= pos2Map.get(player.name).y) {
                p1.y++;
                p2.y--;
            }
            else if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                p1.y--;
                p2.y++;
            }
        }
    }
    pos1Map.set(player.name, p1);
    pos2Map.set(player.name, p2);
    tellMessage(player, `§aSelection outset ${amount} blocks`);
}
//done
function deselect(args, player) {
    selMap.delete(player.name);
    compSelMap.delete(player.name);
    tellMessage(player, `§aDeselected region`);
}
//Beds don't work (Can't actually determine bed color)
async function set(args, player) {
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
            tellError(player, `Block ${args[0]} not found`);
            return;
        }
    }
    // let count = 0;
    addHistoryEntry(player.name);
    let manualSel = true;
    if (!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.filled);
    }
    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    });
    if (!manualSel) {
        compSelMap.delete(player.name);
    }
    tellMessage(player, `§aChanged ${count} blocks to ${perm.type.id}`);
}
function remove(args, player) {
    set(['minecraft:air'], player);
}
//done
// Moves the selected region, and the selection with it
async function move(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1;
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid distance: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': { }
            case 'forward': { }
            case 'facing': {
                break;
            }
            case 'right': {
                direction = rotateDirection(direction, 90);
                break;
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break;
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break;
                break;
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break;
            }
            case 'south': {
                direction = Direction.South;
                break;
            }
            case 'west': {
                direction = Direction.West;
                break;
            }
            case 'up': {
                direction = Direction.Up;
                break;
            }
            case 'down': {
                direction = Direction.Down;
                break;
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`);
                break;
            }
        }
    }
    let air = true;
    if (args.length >= 3 && args[2] == '-a') {
        air = false;
    }
    let perm = BlockPermutation.resolve('minecraft:air');
    let manualSel = true;
    if (!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.filled);
    }
    let selSize = getCompSpan(compSelMap.get(player.name));
    let sel = Array(selSize.x).fill(null).map(() => Array(selSize.y).fill(null).map(() => Array(selSize.z).fill(null)));
    addHistoryEntry(player.name);
    let count = 0;
    // let origin = compSelMap.get(player.name).getOrigin();
    let min = compSelMap.get(player.name).getMin();
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == perm.type.id) {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation.clone();
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 1000 == 0) {
            await sleep(1);
        }
    });
    compSelMap.get(player.name).translateOrigin(shiftVector3(getZeroVector3(), direction, amount));
    selMap.set(player.name, BlockVolumeUtils.translate(selMap.get(player.name), shiftVector3(getZeroVector3(), direction, amount)));
    // origin = compSelMap.get(player.name).getOrigin();
    min = compSelMap.get(player.name).getMin();
    count = 0; // May need to be separate variable
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == perm.type.id) {
            return;
        }
        setBlockAt(player, l, sel[l.x - min.x][l.y - min.y][l.z - min.z].clone());
        count++;
        if (count % 1000 == 0) {
            await sleep(1);
        }
    });
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
    tellMessage(player, `§aMoved ${count} blocks ${direction}`);
}
//done
async function stack(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 2;
    //#region Args
    if (args.length == 0) {
        help(['stack'], player);
        return;
    }
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0])) || args[0] == '0') {
            tellError(player, `Invalid amount: '${args[0]}'`);
            return;
        }
        amount = parseInt(args[0]);
    }
    let direction = getPrimaryDirection(player.getViewDirection());
    if (args.length >= 2) {
        switch (args[1].toLowerCase()) {
            case 'me': { }
            case 'forward': { }
            case 'facing': {
                break;
            }
            case 'right': {
                direction = rotateDirection(direction, 90);
                break;
            }
            case 'backward': {
                direction = rotateDirection(direction, 180);
                break;
            }
            case 'left': {
                direction = rotateDirection(direction, 270);
                break;
                break;
            }
            case 'north': {
                direction = Direction.North;
                break;
            }
            case 'east': {
                direction = Direction.East;
                break;
            }
            case 'south': {
                direction = Direction.South;
                break;
            }
            case 'west': {
                direction = Direction.West;
                break;
            }
            case 'up': {
                direction = Direction.Up;
                break;
            }
            case 'down': {
                direction = Direction.Down;
                break;
            }
            default: {
                tellError(player, `Invalid direction '${args[1]}'`);
                break;
            }
        }
    }
    let offset = 0;
    if (args.length >= 3) {
        if (Number.isNaN(parseInt(args[2]))) {
            tellError(player, `Invalid amount: '${args[2]}'`);
            return;
        }
        offset = parseInt(args[2]);
    }
    let air = true;
    if (args.length >= 4 && args[3] == '-a') {
        air = false;
    }
    //#endregion Args
    let manualSel = true;
    if (!compSelMap.has(player.name)) {
        manualSel = false;
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
        addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.filled);
    }
    let selSize = getCompSpan(compSelMap.get(player.name));
    let sel = Array(selSize.x).fill(null).map(() => Array(selSize.y).fill(null).map(() => Array(selSize.z).fill(null)));
    addHistoryEntry(player.name);
    let origin = compSelMap.get(player.name).getOrigin();
    let min = compSelMap.get(player.name).getMin();
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        if (!air && b.permutation.type.id == 'minecraft:air') {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation.clone();
    });
    let count = 0;
    for (let i = 0; i < amount; i++) {
        const deltaVec = shiftVector3(getZeroVector3(), direction, (direction == Direction.North || direction == Direction.South ? selSize.z : (direction == Direction.Up || direction == Direction.Down ? selSize.y : selSize.x)) + offset);
        compSelMap.get(player.name).translateOrigin(deltaVec);
        selMap.set(player.name, BlockVolumeUtils.translate(selMap.get(player.name), deltaVec));
        min = compSelMap.get(player.name).getMin();
        compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
            count++;
            if (count % 1000 == 0) {
                await sleep(1);
            }
            player.sendMessage(`debug: ${JSON.stringify(l)} - [${l.x - min.x}][${l.y - min.y}][${l.z - min.z}]`);
            b.setPermutation(sel[l.x - min.x][l.y - min.y][l.z - min.z].clone());
        });
    }
    compSelMap.get(player.name).setOrigin(origin);
    tellMessage(player, `§aStacked selection ${amount} times (${count} blocks)`);
}
function addcuboid(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled;
    if (args.length >= 1) {
        switch (args[0]) {
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
                tellError(player, `Invalid mode: ${args[0]}`);
                return;
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), mode);
    tellMessage(player, '§aAdded cuboid to compound selection');
}
function subtractcuboid(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled;
    if (args.length >= 1) {
        switch (args[0]) {
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
                tellError(player, `Invalid mode: ${args[0]}`);
                return;
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    subtractCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), mode);
    tellMessage(player, '§aAdded negative cuboid to compound selection');
}
function addellipsoid(args, player) {
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
    let mode = 'filled';
    if (args.length >= 1) {
        mode = args[0];
    }
    addEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), mode);
    player.sendMessage('done');
}
function subtractellipsoid(args, player) {
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
    let mode = 'filled';
    if (args.length >= 1) {
        mode = args[0];
    }
    subtractEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), mode);
    player.sendMessage('done');
}
export { pos1, pos2 };
