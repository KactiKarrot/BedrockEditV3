import { Player, BlockRaycastOptions, Vector3, EntityInventoryComponent, BlockPermutation, BlockTypes, Direction, ItemTypes, world, EntityScaleComponent, EntityQueryOptions, system } from "@minecraft/server";
import { ShapeModes, generateCone, generateDome, generateEllipse, generateEllipsoid, generatePyramid } from "Circle-Generator/Controller";
import { copy, cut, mirror, paste, rotate } from "clipboard";
import { PREFIX, VERSION, WAND_NAME, currentWand, historyIndexMap, historyMap, pos1Map, pos2Map, setShowParticles, setWand, setWandEnabled, setWelcome, showParticles, wandEnabled, welcomeMessage } from "main";
import { addHistoryEntry, addToHistoryEntry, addVector3, compareVector3, diffVector3, floorVector3, forceSetBlockAt, getHistory, getPermFromHand, getPermFromStr, getPrimaryDirection, minVector3, rotateDirection, setBlockAt, shiftVector3, sleep, tellError, tellMessage } from "utils";

let commands = [
    // help
    {
        name: "help",
        alias: "?",
        function: help,
        description: "Lists all commands and what they do",
        extDescription: "Lists all commands and what they do",
        usage: [
            "",
            "[page: int]",
            "[command: CommandName]"
        ]
    },
    // version
    {
        name: "version",
        alias: "ver",
        function: version,
        description: "Prints the current version",
        extDescription: "Prints the current version",
        usage: [
            ""
        ]
    },
    // welcome
    {
        name: "welcome",
        alias: "",
        function: welcome,
        description: "Toggles the welcome message shown to all players on join",
        extDescription: "Toggles the welcome message shown to all players on join",
        usage: [
            ""
        ]
    },
    // wand
    {
        name: "wand",
        alias: "",
        function: wand,
        description: "Sets or gives the wand item",
        extDescription: "Sets or gives the wand item\nitemName: Name of the item to set as the wand. Use 'default' to reset. If not given the player is given the current wand item.",
        usage: [
            "[itemName: Item]"
        ]
    },
    // toggleeditwand
    {
        name: "toggleeditwand",
        alias: "togglewand",
        function: toggleWand,
        description: "Toggles whether use of the edit wand is enabled",
        extDescription: "Toggles whether use of the edit wand is enabled",
        usage: [
            ""
        ]
    },
    // toggleoutline
    {
        name: "toggleoutline",
        alias: "toggleparticles",
        function: toggleOutline,
        description: "Toggles whether selection outline particles are rendered",
        extDescription: "Toggles whether selection outline particles are rendered (WARNING: Large selections can can cause cause performance issues with this on, use your own risk)",
        usage: [
            ""
        ]
    },
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
]

function help(args: string[], player: Player) {
    if (args.length > 0 && isNaN(parseInt(args[0]))) {
        let found = false;
        let index;
        commands.forEach((c, i) => {
            if (args[0] == c.name || (args[0] == c.alias && c.alias != '')) {
                found = true;
                index = i;
            }
        })
        if (!found) {
            tellError(player, `Command '${args[0]}' not found`);
            return
        } else {
            let msg = `§e${commands[index].name}`
            if (commands[index].alias != '') {
                msg += ` (also ${commands[index].alias})`
            }
            msg += ':';
            msg += `\n§e${commands[index].extDescription}\n§rUsage`;
            commands[index].usage.forEach((e) => {
                msg += `\n- ${PREFIX}${commands[index].name} ${e}`
            })
            // tellMessage(player, msg);
            tellMessage(player, msg)
            return
        }
    }
    let startPage = 0;
    if (args.length > 0 && !isNaN(parseInt(args[0]))) {
        startPage = parseInt(args[0]) - 1;
        if (startPage >= Math.ceil(commands.length / 7)) {
            startPage = Math.ceil(commands.length / 7) - 1;
        }
    }
    let msg = `§2--- Showing help page ${startPage + 1} of ${Math.ceil(commands.length / 7)} (${PREFIX}help <page>) ---`;
    for (let i = startPage * 7; i < commands.length; i++) {
        msg += `\n§r- ${PREFIX}${commands[i].name}: §b${commands[i].description}`
        if (i >= startPage * 7 + 6) {
            break;
        }
    }
    // tellMessage(player, `§7- ${PREFIX}help: §bLists all commands and what they do\n§7- ${PREFIX}copy: §bCopies a region to the player's clipboard\n§7- ${PREFIX}cut: §bCuts a region to the player's clipboard\n§7- ${PREFIX}paste: §bPastes a region from the player's clipboard\n§7- ${PREFIX}pos1: §bSaves your current position to pos1\n§7- ${PREFIX}pos2: §bSaves your current position to pos2`)
    tellMessage(player, msg)
}

function version(args: string[], player: Player) {
    tellMessage(player, `<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`);
}

function welcome(args: string[], player: Player) {
    setWelcome();
    if (welcomeMessage) {
        tellMessage(player, '§aWelcome message enabled')
    } else {
        tellMessage(player, '§aWelcome message disabled')
    }
}

function wand(args: string[], player: Player) {
    if (args.length < 1) {
        (player.getComponent('minecraft:inventory') as EntityInventoryComponent).container.addItem(currentWand.clone());
        tellMessage(player, `You have been given ${WAND_NAME}`)
        return;
    }
    if (args[0] == 'default') {
        args[0] = 'minecraft:wooden_axe'
    }
    let itemType = ItemTypes.get(args[0]);
    if (itemType == undefined) {
        tellError(player, `Item ${args[0]} not found`);
        return;
    }
    // scoreboard.removeParticipant('wand.' + currentWand.typeId);
    // scoreboard.setScore("wand." + itemType.id, 0);
    world.setDynamicProperty('wand', itemType.id);
    setWand();
    tellMessage(player, `§aSet wand item to ${currentWand.typeId}`)
}

function toggleWand(args: string[], player: Player) {
    setWandEnabled()
    if (wandEnabled) {
        tellMessage(player, '§aEdit wand enabled')
    } else {
        tellMessage(player, '§aEdit wand disabled')
    }
}

function toggleOutline(args: string[], player: Player) {
    setShowParticles()
    if (showParticles) {
        tellMessage(player, '§aOutline particles enabled')
    } else {
        tellMessage(player, '§aOutline particles disabled')
    }
}

function undo(args: string[], player:Player) {
    let name = player.name;
    let times = 1;
    if (args.length >= 1 && isNaN(parseInt(args[0]))) {
        times = parseInt(args[0]);
    }
    if (isNaN(parseInt(args[0]))) {
        tellError(player, `Invalid number: ${args[0]}`)
    }
    if (args.length >= 2 && args[1] != '') {
        name = args[1];
    }
    if (historyMap.get(name) == undefined || historyMap.get(name).length <= 0) {
        tellError(player, "Nothing to undo");
        return
    }
    if (historyIndexMap.get(name) == historyMap.get(name).length) {
        tellError(player, "Nothing more to undo");
        return
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        if (historyIndexMap.get(name) == historyMap.get(name).length) {
            break;
        }
        let entry = getHistory(name, historyIndexMap.get(name))
        for (let i = entry.length - 1; i >= 0; i--) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].pre.clone())
            changes++;
        }
        historyIndexMap.set(name, historyIndexMap.get(name) + 1);
        actions++;
    }
    tellMessage(player, `§aUndid ${actions} actions (${changes} blocks)`)
}

function redo(args: string[], player: Player) {
    let name = player.name;
    let times = 1;
    if (args.length >= 1 && isNaN(parseInt(args[0]))) {
        times = parseInt(args[0]);
    }
    if (isNaN(parseInt(args[0]))) {
        tellError(player, `Invalid number: ${args[0]}`)
    }
    if (args.length >= 2 && args[1] != '') {
        name = args[1];
    }
    if (historyMap.get(name) == undefined || historyMap.get(name).length <= 0) {
        tellError(player, "Nothing to redo");
        return
    }
    if (historyIndexMap.get(name) == 0) {
        tellError(player, "Nothing more to redo");
        return
    }
    let changes = 0;
    let actions = 0;
    for (let i = 0; i < times; i++) {
        historyIndexMap.set(name, historyIndexMap.get(name) - 1);
        let entry = getHistory(name, historyIndexMap.get(name))
        for (let i = 0; i < entry.length; i++) {
            player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].post.clone())
            changes++;
        }
        actions++;
    }
    
    tellMessage(player, `§aRedid ${actions} actions (${changes} blocks)`)
}

function clearHistory(args: string[], player: Player) {
    let name = player.name;
    if (args.length >= 1 && args[0] != '') {
        name = args[0];
    }
    historyMap.delete(name);
    historyIndexMap.delete(name);
    tellMessage(player, `§aEdit history cleared`)
}

function pos1(args: string[], player: Player, pos: Vector3 = null) {
    switch(args[0]) {
        case "position": {
            if (args.length < 4) {
                tellError(player, "Not enough arguments");
                return;
            }
            pos = floorVector3(player.location);
            if (args[1][0] != "~") {
                pos.x = 0;
                args[1] = ' ' + args[1]
            }
            if (args[2][0] != "~") {
                pos.y = 0;
                args[2] = ' ' + args[2]
            }
            if (args[3][0] != "~") {
                pos.z = 0;
                args[3] = ' ' + args[3]
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
            let options: BlockRaycastOptions = {
                includeLiquidBlocks: false,
                includePassableBlocks: false,
                maxDistance: 15
            }
            if (args.length > 1 && args[1].charAt(0) == '-') {
                args[1] = args[1].substring(1);
                for (let i = 0; i < args[1].length; i++) {
                    switch(args[1].charAt(i)) {
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
            
            let rayHit = player.getBlockFromViewDirection(options)
            if (rayHit != undefined) {
                pos = rayHit.block.location;
            } else {
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
    if (!pos1Map.has(player.name) || !compareVector3(pos, pos1Map.get(player.name))) {
        pos1Map.set(player.name, pos);
        if (pos2Map.has(player.name)) {
            let diff =  addVector3({x: 1, y: 1, z: 1}, diffVector3(pos, pos2Map.get(player.name)));
            tellMessage(player, `§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z} (${diff.x * diff.y * diff.z} blocks)`);
        } else {
            tellMessage(player, `§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z}`);
        }
    }
}

function pos2(args: string[], player: Player, pos: Vector3 = null) {
    switch(args[0]) {
        case "position": {
            if (args.length < 4) {
                tellError(player, "Not enough arguments");
                return;
            }
            pos = floorVector3(player.location);
            if (args[1][0] != "~") {
                pos.x = 0;
                args[1] = ' ' + args[1]
            }
            if (args[2][0] != "~") {
                pos.y = 0;
                args[2] = ' ' + args[2]
            }
            if (args[3][0] != "~") {
                pos.z = 0;
                args[3] = ' ' + args[3]
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
            let options: BlockRaycastOptions = {
                includeLiquidBlocks: false,
                includePassableBlocks: false,
                maxDistance: 15
            }
            if (args.length > 1 && args[1].charAt(0) == '-') {
                args[1] = args[1].substring(1);
                for (let i = 0; i < args[1].length; i++) {
                    switch(args[1].charAt(i)) {
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
            
            let rayHit = player.getBlockFromViewDirection(options)
            if (rayHit != undefined) {
                pos = rayHit.block.location;
            } else {
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
    if (!pos2Map.has(player.name) || !compareVector3(pos, pos2Map.get(player.name))) {
        pos2Map.set(player.name, pos);
        if (pos1Map.has(player.name)) {
            let diff =  addVector3({x: 1, y: 1, z: 1}, diffVector3(pos, pos1Map.get(player.name)));
            tellMessage(player, `§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z} (${diff.x * diff.y * diff.z} blocks)`);
        } else {
            tellMessage(player, `§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z}`);
        }
    }
}

function shift(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
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
    pos1Map.set(player.name, shiftVector3(pos1Map.get(player.name), direction, amount));
    pos2Map.set(player.name, shiftVector3(pos2Map.get(player.name), direction, amount));
    tellMessage(player, `Shifted selection ${amount} blocks ${direction}`)
}

function shrink(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                })
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                })
                pos1Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + amount
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                })
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + oppositeAmount,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + amount,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + oppositeAmount,
                    z: pos1Map.get(player.name).z
                })
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
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - oppositeAmount,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - amount,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - oppositeAmount,
                    z: pos1Map.get(player.name).z
                })
            }
            break;
        }
    }
    tellMessage(player, `§aShrunk selection ${amount} blocks`);
}

function expand(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
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
    let oppositeAmount = 0;
    if (args.length >= 3) {
        if (isNaN(parseInt(args[2]))) {
            tellError(player, `Invalid opposite amount: ${args[2]}`);
            return;
        }
        oppositeAmount = parseInt(args[2]);
    }
    amount = -amount;
    oppositeAmount = -oppositeAmount
    switch (direction) {
        case Direction.North: {
            if (pos1Map.get(player.name).z > pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z - amount
                })
                pos2Map.set(player.name, {
                    y: pos2Map.get(player.name).y,
                    x: pos2Map.get(player.name).x,
                    z: pos2Map.get(player.name).z + oppositeAmount
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                })
            }
            break;
        }
        case Direction.East: {
            if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x + amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
            }
            break;
        }
        case Direction.South: {
            if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z - amount
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z + oppositeAmount
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z - amount
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z + oppositeAmount
                })
            }
            break;
        }
        case Direction.West: {
            if (pos1Map.get(player.name).x > pos2Map.get(player.name).x) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x + amount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x - oppositeAmount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x + amount,
                    y: pos2Map.get(player.name).y,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x - oppositeAmount,
                    y: pos1Map.get(player.name).y,
                    z: pos1Map.get(player.name).z
                })
            }
            break;
        }
        case Direction.Up: {
            if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - amount,
                    z: pos1Map.get(player.name).z
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + oppositeAmount,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - amount,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + oppositeAmount,
                    z: pos1Map.get(player.name).z
                })
            }
            break;
        }
        case Direction.Down: {
            if (pos1Map.get(player.name).y > pos2Map.get(player.name).y) {
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y + amount,
                    z: pos1Map.get(player.name).z
                })
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y - oppositeAmount,
                    z: pos2Map.get(player.name).z
                })
            } else {
                pos2Map.set(player.name, {
                    x: pos2Map.get(player.name).x,
                    y: pos2Map.get(player.name).y + amount,
                    z: pos2Map.get(player.name).z
                })
                pos1Map.set(player.name, {
                    x: pos1Map.get(player.name).x,
                    y: pos1Map.get(player.name).y - oppositeAmount,
                    z: pos1Map.get(player.name).z
                })
            }
            break;
        }
    }
    tellMessage(player, `§aExpanded selection ${amount} blocks`);
}

function inset(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`)
            return
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
            } else if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                p1.x++;
                p2.x--;
            }
            if (pos1Map.get(player.name).z > pos2Map.get(player.name).z) {
                p1.z--;
                p2.z++;
            } else if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                p1.z++;
                p2.z--;
            }
        }
        if (v) {
            if (pos1Map.get(player.name).y > pos2Map.get(player.name).y) {
                p1.y--;
                p2.y++;
            } else if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                p1.y++;
                p2.y--;
            }
        }
    }
    pos1Map.set(player.name, p1);
    pos2Map.set(player.name, p2);
    tellMessage(player, `§aSelection inset ${amount} blocks`);
}

function outset(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let amount = 1
    if (args.length >= 1) {
        if (Number.isNaN(parseInt(args[0]))) {
            tellError(player, `Invalid amount: '${args[0]}'`)
            return
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
            } else if (pos1Map.get(player.name).x < pos2Map.get(player.name).x) {
                p1.x--;
                p2.x++;
            }
            if (pos1Map.get(player.name).z >= pos2Map.get(player.name).z) {
                p1.z++;
                p2.z--;
            } else if (pos1Map.get(player.name).z < pos2Map.get(player.name).z) {
                p1.z--;
                p2.z++;
            }
        }
        if (v) {
            if (pos1Map.get(player.name).y >= pos2Map.get(player.name).y) {
                p1.y++;
                p2.y--;
            } else if (pos1Map.get(player.name).y < pos2Map.get(player.name).y) {
                p1.y--;
                p2.y++;
            }
        }
    }
    pos1Map.set(player.name, p1);
    pos2Map.set(player.name, p2);
    tellMessage(player, `§aSelection outset ${amount} blocks`);
}

function deselect(args: string[], player: Player) {
    pos1Map.delete(player.name);
    pos2Map.delete(player.name);
    tellMessage(player, `§aDeselected region`);
}

//Beds don't work (Can't actually determine bed color)
async function set(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let perm = getPermFromHand(player);
    if (args.length > 0) {
        perm = getPermFromStr(args[0], player);
        if (perm == null) {
            tellError(player, `Block ${args[0]} not found`)
            return;
        }
    }
    let count = 0;
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
            for (let y = 0; y < selSize.y; y++) {
                    for (let z = 0; z < selSize.z; z++) {
                            forceSetBlockAt(player, addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: x, y: y, z: z}), perm.clone());
                            count++;
                            if (count % 5000 == 0) {
                                await sleep(1);
                            }
                    }
            }
    }
    tellMessage(player, `§aChanged ${selSize.x * selSize.y * selSize.z} blocks to ${perm.type.id}`);
}

function remove(args: string[], player: Player) {
    set(["minecraft:air"], player);
}

function move(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
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
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let sel = Array(selSize.x).fill(null).map(
        () => Array(selSize.y).fill(null).map(
            () => Array(selSize.z).fill(null)
        )
    )
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (!air && player.dimension.getBlock(
                    addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )
                ).permutation.type.id == "minecraft:air") {
                    continue;
                }
                sel[x][y][z] = player.dimension.getBlock(
                    addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )
                ).permutation.clone()
                addToHistoryEntry(player.name, {
                    pos: addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    ),
                    pre: player.dimension.getBlock(addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )).permutation.clone(),
                    post: BlockPermutation.resolve("minecraft:air")
                })
                player.dimension.getBlock(addVector3(
                    minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                    {x: x, y: y, z: z}
                )).setPermutation(BlockPermutation.resolve("minecraft:air"))
            }
        }
    }
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (sel[x][y][z] == undefined || sel[x][y][z] == null) {
                    continue;
                }
                addToHistoryEntry(player.name, {
                    pos: shiftVector3(
                        addVector3(
                            minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                            {x: x, y: y, z: z}
                        ),
                        direction,
                        amount
                    ),
                    pre: player.dimension.getBlock(shiftVector3(
                        addVector3(
                            minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                            {x: x, y: y, z: z}
                        ),
                        direction,
                        amount
                    )).permutation.clone(),
                    post: sel[x][y][z].clone()
                })
                player.dimension.getBlock(
                    shiftVector3(
                        addVector3(
                            minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                            {x: x, y: y, z: z}
                        ),
                        direction,
                        amount
                    )
                ).setPermutation(sel[x][y][z].clone());
                
            }
        }
    }
    pos1Map.set(player.name, shiftVector3(pos1Map.get(player.name), direction, amount));
    pos2Map.set(player.name, shiftVector3(pos2Map.get(player.name), direction, amount));
    tellMessage(player, `§aMoved ${selSize.x * selSize.y * selSize.z} blocks ${direction}`)
}

function stack(args: string[], player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
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
        amount = parseInt(args[0]) + 1;
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
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let sel = Array(selSize.x).fill(null).map(
        () => Array(selSize.y).fill(null).map(
            () => Array(selSize.z).fill(null)
        )
    )
    //#endregion Args

    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (!air && player.dimension.getBlock(
                    addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )
                ).permutation.type.id == "minecraft:air") {
                    continue;
                }
                sel[x][y][z] = player.dimension.getBlock(
                    addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )
                ).permutation.clone()
                addToHistoryEntry(player.name, {
                    pos: addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    ),
                    pre: player.dimension.getBlock(addVector3(
                        minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                        {x: x, y: y, z: z}
                    )).permutation.clone(),
                    post: BlockPermutation.resolve("minecraft:air")
                })
                player.dimension.getBlock(addVector3(
                    minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                    {x: x, y: y, z: z}
                )).setPermutation(BlockPermutation.resolve("minecraft:air"))
            }
        }
    }
    for (let i = 0; i < amount; i++) {
        for (let x = 0; x < selSize.x; x++) {
            for (let y = 0; y < selSize.y; y++) {
                for (let z = 0; z < selSize.z; z++) {
                    if (sel[x][y][z] == undefined || sel[x][y][z] == null) {
                        continue;
                    }
                    let distance;
                    switch(direction) {
                        case Direction.North: {}
                        case Direction.South: {
                            distance = (selSize.z + offset) * i;
                            break;
                        }
                        case Direction.East: {}
                        case Direction.West: {
                            distance = (selSize.x + offset) * i;
                            break;
                        }
                        case Direction.Up: {}
                        case Direction.Down: {
                            distance = (selSize.y + offset) * i;
                            break;
                        }
                    }
                    addToHistoryEntry(player.name, {
                        pos: shiftVector3(
                            addVector3(
                                minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                                {x: x, y: y, z: z}
                            ),
                            direction,
                            distance
                        ),
                        pre: player.dimension.getBlock(shiftVector3(
                            addVector3(
                                minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                                {x: x, y: y, z: z}
                            ),
                            direction,
                            distance
                        )).permutation.clone(),
                        post: sel[x][y][z].clone()
                    })
                    player.dimension.getBlock(
                        shiftVector3(
                            addVector3(
                                minVector3(pos1Map.get(player.name), pos2Map.get(player.name)),
                                {x: x, y: y, z: z}
                            ),
                            direction,
                            distance
                        )
                    ).setPermutation(sel[x][y][z].clone());
                    
                }
            }
        }
    }
    tellMessage(player, `Stacked selection ${amount} times`)
}

function cube(args: string[], player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2 && args[1] != '') {
        if (BlockTypes.get(args[1]) == undefined) {
            tellError(player, `Block ${args[1]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[1]);
    }

    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }

    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let blockCount = 0;

    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (mode == 'filled' || (x == 0 || x == selSize.x - 1) || (y == 0 || y == selSize.y - 1) || (z == 0 || z == selSize.z - 1)) {
                    setBlockAt(player, addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: x, y: y, z: z}), perm);
                    blockCount++;
                }
            }
        }
    }

    tellMessage(player, `§aSuccessfully generated cube (${blockCount} blocks)`)
}

function walls(args: string[], player: Player) {
    let perm = getPermFromHand(player);
    if (args.length >= 1 && args[0] != '') {
        if (BlockTypes.get(args[0]) == undefined) {
            tellError(player, `Block ${args[1]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[0]);
    }

    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let blockCount = 0;

    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if ((x == 0 || x == selSize.x - 1) || (z == 0 || z == selSize.z - 1)) {
                    setBlockAt(player, addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: x, y: y, z: z}), perm);
                    blockCount++;
                }
            }
        }
    }

    tellMessage(player, `§aSuccessfully generated walls (${blockCount} blocks)`)
}

function cylinder(args: string[], player: Player) {
    let direction = 'ud';
    let mode = 'filled'
    let perm = getPermFromHand(player);
    let fillFaces = true;

    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'ud' && args[0].toLowerCase() != 'ns' && args[0].toLowerCase() != 'ew') {
            tellError(player, `Invalid direction: ${args[0]}`)
            return
        }
        direction = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1].toLowerCase() != 'thick' && args[1].toLowerCase() != 'thin' && args[1].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[1]}`)
            return
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
            tellError(player, `Block ${args[3]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[3]);
    }

    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    let mat: boolean[][];
    switch(direction) {
        case 'ud': {
            mat = generateEllipse(selSize.x, selSize.z, mode as ShapeModes)
            break;
        }
        case 'ns': {
            mat = generateEllipse(selSize.x, selSize.y, mode as ShapeModes)
            break;
        }
        case 'ew': {
            mat = generateEllipse(selSize.z, selSize.y, mode as ShapeModes)
            break;
        }
    }
    
    let blockCount = 0;

    addHistoryEntry(player.name);

    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
                switch(direction) {
                    case 'ud': {
                        if (fillFaces && (j == 0 || j == selSize.y - 1)) {
                            let mat2 = generateEllipse(selSize.x, selSize.z, ShapeModes.filled);
                            if (mat2[i][k].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        } else if (mat[i][k].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ns': {
                        if (fillFaces && (k == 0 || k == selSize.z - 1)) {
                            let mat2 = generateEllipse(selSize.x, selSize.y, ShapeModes.filled);
                            if (mat2[i][j].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        } else if (mat[i][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ew': {
                        if (fillFaces && (i == 0 || i == selSize.x - 1)) {
                            let mat2 = generateEllipse(selSize.z, selSize.y, ShapeModes.filled);
                            if (mat2[k][j].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        } else if (mat[k][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated cylinder (${blockCount} blocks)`);
}

function ellipsoid(args: string[], player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2 && args[1] != '') {
        if (BlockTypes.get(args[1]) == undefined) {
            tellError(player, `Block ${args[1]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[1]);
    }

    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    let mat = generateEllipsoid(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    
    let blockCount = 0;

    addHistoryEntry(player.name);

    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
                if (mat[i][j][k].valueOf() == true) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated ellipsoid (${blockCount} blocks)`);
}

function dome(args: string[], player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
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
            tellError(player, `Block ${args[2]} not found`)
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
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    let mat = generateDome(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    
    let blockCount = 0;

    addHistoryEntry(player.name);

    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0 && generateEllipse(selSize.x, selSize.z, ShapeModes.filled)[i][k].valueOf() == true)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated a dome (${blockCount} blocks)`);
}

function pyramid(args: string[], player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
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
            tellError(player, `Block ${args[2]} not found`)
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
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    let mat = generatePyramid(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    
    let blockCount = 0;

    addHistoryEntry(player.name);

    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated pyramid (${blockCount} blocks)`);
}

// Doesn't work (offset is off and top of odd diameter has 2x2)
function cone(args: string[], player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`)
            return
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
            tellError(player, `Block ${args[2]} not found`)
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
    let selSize = addVector3({x: 1, y: 1, z: 1}, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));

    let mat = generateCone(selSize.x, selSize.y, selSize.z, mode as ShapeModes);
    
    let blockCount = 0;

    addHistoryEntry(player.name);

    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: i, y: j, z: k})
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0 && generateEllipse(selSize.x, selSize.z, ShapeModes.filled)[i][k].valueOf() == true)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated a cone (${blockCount} blocks)`);
}


export {
    commands,
    pos1,
    pos2
}