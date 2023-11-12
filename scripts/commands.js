import { BlockPermutation, BlockTypes, Direction } from "@minecraft/server";
import { copy, cut, mirror, paste, rotate } from "clipboard";
import { PREFIX, historyIndexMap, historyMap, pos1Map, pos2Map } from "main";
import { addHistoryEntry, addToHistoryEntry, addVector3, compareVector3, diffVector3, floorVector3, getHistory, getPrimaryDirection, minVector3, rotateDirection, shiftVector3, tell, tellError } from "utils";
let commands = [
    {
        name: "help",
        alias: "?",
        function: help,
        description: "Lists all commands and what they do",
        usage: [
            "",
            "[page: int]",
            "[command: CommandName]"
        ]
    },
    {
        name: "copy",
        alias: "cp",
        function: copy,
        description: "Copies a region to the player's clipboard",
        usage: [
            ""
        ]
    },
    {
        name: "cut",
        alias: "",
        function: cut,
        description: "Cuts a region to the player's clipboard",
        usage: [
            ""
        ]
    },
    {
        name: "paste",
        alias: "",
        function: paste,
        description: "Pastes a region from the player's clipboard",
        usage: [
            "[-a]"
        ]
    },
    {
        name: "pos1",
        alias: "p1",
        function: pos1,
        description: "Saves a position to pos1",
        usage: [
            "",
            "facing [-lp]",
            "position <pos: x y z>"
        ]
    },
    {
        name: "pos2",
        alias: "p2",
        function: pos2,
        description: "Saves a position to pos1",
        usage: [
            "",
            "facing [-lp]",
            "position <pos: x y z>"
        ]
    },
    {
        name: "set",
        alias: "",
        function: set,
        description: "Sets selection to given or held block",
        usage: [
            "[tileName: Block]"
        ]
    },
    {
        name: "remove",
        alias: "rm",
        function: remove,
        description: "Removes a selection",
        usage: [
            ""
        ]
    },
    {
        name: "undo",
        alias: "",
        function: undo,
        description: "Undoes an action",
        usage: [
            ""
        ]
    },
    {
        name: "redo",
        alias: "",
        function: redo,
        description: "Redoes an action",
        usage: [
            ""
        ]
    },
    {
        name: "move",
        alias: "mv",
        function: move,
        description: "Moves the selection",
        usage: [
            "[distance: int] [me|facing|forward|right|backward|left|north|east|south|west|up|down] [-a]"
        ]
    },
    {
        name: "stack",
        alias: "",
        function: stack,
        description: "Moves the selection",
        usage: [
            "[amount: int] [me|facing|forward|right|backward|left|north|east|south|west|up|down] [offset: int] [-a]"
        ]
    },
    {
        name: "rotate",
        alias: "",
        function: rotate,
        description: "Rotates the clipboard",
        usage: [
            "<rotationAngle: angle>"
        ]
    },
    {
        name: "mirror",
        alias: "flip",
        function: mirror,
        description: "Rotates the clipboard",
        usage: [
            "<rotationAngle: angle>"
        ]
    },
];
function help(args, player) {
    if (args.length > 0 && isNaN(parseInt(args[0]))) {
        let found = false;
        let index;
        commands.forEach((c, i) => {
            if (args[0] == c.name || (args[0] == c.alias && c.alias != '')) {
                found = true;
                index = i;
            }
        });
        if (!found) {
            tellError(player, `Command '${args[0]}' not found`);
            return;
        }
        else {
            let msg = `§e${commands[index].name}`;
            if (commands[index].alias != '') {
                msg += ` (also ${commands[index].alias})`;
            }
            msg += `\\n§e${commands[index].description}\\n§rUsage`;
            commands[index].usage.forEach((e) => {
                msg += `\\n- ${PREFIX}${commands[index].name} ${e}`;
            });
            tell(player, msg);
            return;
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
        msg += `\\n§r- ${PREFIX}${commands[i].name}: §b${commands[i].description}`;
        if (i >= startPage * 7 + 6) {
            break;
        }
    }
    // tell(player, `§7- ${PREFIX}help: §bLists all commands and what they do\\n§7- ${PREFIX}copy: §bCopies a region to the player's clipboard\\n§7- ${PREFIX}cut: §bCuts a region to the player's clipboard\\n§7- ${PREFIX}paste: §bPastes a region from the player's clipboard\\n§7- ${PREFIX}pos1: §bSaves your current position to pos1\\n§7- ${PREFIX}pos2: §bSaves your current position to pos2`)
    tell(player, msg);
}
function undo(args, player) {
    if (historyMap.get(player.name) == undefined || historyMap.get(player.name).length <= 0) {
        tellError(player, "Nothing to undo");
        return;
    }
    if (historyIndexMap.get(player.name) == historyMap.get(player.name).length) {
        tellError(player, "Nothing more to undo");
        return;
    }
    let entry = getHistory(player.name, historyIndexMap.get(player.name));
    for (let i = entry.length - 1; i >= 0; i--) {
        player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].pre.clone());
    }
    historyIndexMap.set(player.name, historyIndexMap.get(player.name) + 1);
    tell(player, `§aUndid ${entry.length} block changes`);
}
function redo(args, player) {
    if (historyMap.get(player.name) == undefined || historyMap.get(player.name).length <= 0) {
        tellError(player, "Nothing to redo");
        return;
    }
    if (historyIndexMap.get(player.name) == 0) {
        tellError(player, "Nothing more to redo");
        return;
    }
    historyIndexMap.set(player.name, historyIndexMap.get(player.name) - 1);
    let entry = getHistory(player.name, historyIndexMap.get(player.name));
    for (let i = 0; i < entry.length; i++) {
        player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].post.clone());
    }
    tell(player, `§aRedid ${entry.length} block changes`);
}
function move(args, player) {
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let sel = Array(selSize.x).fill(null).map(() => Array(selSize.y).fill(null).map(() => Array(selSize.z).fill(null)));
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (!air && player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.type.id == "minecraft:air") {
                    continue;
                }
                sel[x][y][z] = player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.clone();
                addToHistoryEntry(player.name, {
                    pos: addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }),
                    pre: player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.clone(),
                    post: BlockPermutation.resolve("minecraft:air")
                });
                player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).setPermutation(BlockPermutation.resolve("minecraft:air"));
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
                    pos: shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, amount),
                    pre: player.dimension.getBlock(shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, amount)).permutation.clone(),
                    post: sel[x][y][z].clone()
                });
                player.dimension.getBlock(shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, amount)).setPermutation(sel[x][y][z].clone());
            }
        }
    }
    pos1Map.set(player.name, shiftVector3(pos1Map.get(player.name), direction, amount));
    pos2Map.set(player.name, shiftVector3(pos2Map.get(player.name), direction, amount));
    tell(player, `§aMoved ${selSize.x * selSize.y * selSize.z} blocks`);
}
function stack(args, player) {
    let amount = 1;
    //#region Args
    if (args.length == 0) {
        help(['stack'], player);
        return;
    }
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let sel = Array(selSize.x).fill(null).map(() => Array(selSize.y).fill(null).map(() => Array(selSize.z).fill(null)));
    //#endregion Args
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                if (!air && player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.type.id == "minecraft:air") {
                    continue;
                }
                sel[x][y][z] = player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.clone();
                addToHistoryEntry(player.name, {
                    pos: addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }),
                    pre: player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).permutation.clone(),
                    post: BlockPermutation.resolve("minecraft:air")
                });
                player.dimension.getBlock(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z })).setPermutation(BlockPermutation.resolve("minecraft:air"));
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
                    switch (direction) {
                        case Direction.North: { }
                        case Direction.South: {
                            distance = (selSize.z + offset) * i;
                            break;
                        }
                        case Direction.East: { }
                        case Direction.West: {
                            distance = (selSize.x + offset) * i;
                            break;
                        }
                        case Direction.Up: { }
                        case Direction.Down: {
                            distance = (selSize.y + offset) * i;
                            break;
                        }
                    }
                    addToHistoryEntry(player.name, {
                        pos: shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, distance),
                        pre: player.dimension.getBlock(shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, distance)).permutation.clone(),
                        post: sel[x][y][z].clone()
                    });
                    player.dimension.getBlock(shiftVector3(addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: x, y: y, z: z }), direction, distance)).setPermutation(sel[x][y][z].clone());
                }
            }
        }
    }
    tell(player, `Stacked selection ${amount} times`);
}
function set(args, player) {
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let typeId = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlot).typeId;
    if (BlockTypes.get(typeId) == undefined) {
        typeId = "minecraft:air";
    }
    if (args.length > 0) {
        typeId = args[0];
        if (BlockTypes.get(typeId) == undefined) {
            tellError(player, `Block ${typeId} not found`);
            return;
        }
    }
    let perm = BlockPermutation.resolve(typeId);
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
    tell(player, `§aChanged ${selSize.x * selSize.y * selSize.z} blocks to ${typeId}`);
}
function remove(args, player) {
    set(["minecraft:air"], player);
}
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
            }
            if (args[2][0] != "~") {
                pos.y = 0;
            }
            if (args[3][0] != "~") {
                pos.z = 0;
            }
            if (args[1].length > 1) {
                pos.x += parseInt(args[1].substring(1));
            }
            if (args[2].length > 1) {
                pos.y += parseInt(args[2].substring(1));
            }
            if (args[3].length > 1) {
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
    if (!compareVector3(pos, pos1Map.get(player.name))) {
        pos1Map.set(player.name, pos);
        tell(player, `§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z}`);
    }
}
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
            }
            if (args[2][0] != "~") {
                pos.y = 0;
            }
            if (args[3][0] != "~") {
                pos.z = 0;
            }
            if (args[1].length > 1) {
                pos.x += parseInt(args[1].substring(1));
            }
            if (args[2].length > 1) {
                pos.y += parseInt(args[2].substring(1));
            }
            if (args[3].length > 1) {
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
    if (!compareVector3(pos, pos2Map.get(player.name))) {
        pos2Map.set(player.name, pos);
        tell(player, `§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z}`);
    }
}
export { commands, help, copy, cut, paste, pos1, pos2 };
