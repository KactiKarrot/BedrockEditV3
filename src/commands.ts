import { Player, BlockRaycastOptions, Vector3, EntityInventoryComponent, BlockPermutation, BlockTypes, Direction, ItemStack, ItemTypes } from "@minecraft/server";
import { ShapeModes, generateEllipse, generateEllipsoid } from "Circle-Generator/Controller";
import { copy, cut, mirror, paste, rotate } from "clipboard";
import { PREFIX, VERSION, WAND_NAME, currentWand, historyIndexMap, historyMap, pos1Map, pos2Map, scoreboard, setWand, setWelcome, welcomeMessage } from "main";
import { addHistoryEntry, addToHistoryEntry, addVector3, compareVector3, diffVector3, floorVector3, getHistory, getPermFromHand, getPrimaryDirection, minVector3, rotateDirection, setBlockAt, shiftVector3, tellError } from "utils";

let commands = [
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
    {
        name: "paste",
        alias: "",
        function: paste,
        description: "Pastes a region from the player's clipboard",
        extDescription: "Pastes a region from the player's clipboard\n-a: Doesn't paste air blocks",
        usage: [
            "[-a]"
        ]
    },
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
    {
        name: "set",
        alias: "",
        function: set,
        description: "Sets selection to given or held block",
        extDescription: "Sets selection to given or held block\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
        usage: [
            "[tileName: Block]"
        ]
    },
    {
        name: "remove",
        alias: "rm",
        function: remove,
        description: "Removes a selection",
        extDescription: "Removes a selection",
        usage: [
            ""
        ]
    },
    {
        name: "undo",
        alias: "",
        function: undo,
        description: "Undoes an action",
        extDescription: "Undoes an action",
        usage: [
            ""
        ]
    },
    {
        name: "redo",
        alias: "",
        function: redo,
        description: "Redoes an action",
        extDescription: "Redoes an action",
        usage: [
            ""
        ]
    },
    {
        name: "move",
        alias: "mv",
        function: move,
        description: "Moves the selection",
        extDescription: "Moves the selection\ndistance: Distance to move selection (defaults to 1)\ndirection: Direciton to move selection (defaults to me/facing/forward)\n-a: Doesn't move air blocks",
        usage: [
            "[distance: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [-a]"
        ]
    },
    {
        name: "stack",
        alias: "",
        function: stack,
        description: "Stacks the selection",
        extDescription: "Stacks the selection\namount: Number of times to copy selection\noffset: Amount of blocks between each copy\n-a: Doesn't stack air blocks",
        usage: [
            "[amount: int] [me|facing|forward|right|backward|left|north|east|south|west|up|down] [offset: int] [-a]"
        ]
    },
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
    {
        name: "wand",
        alias: "",
        function: wand,
        description: "Sets or gives the wand item",
        extDescription: "Sets or gives the wand item\nitemName: Name of the item to set as the wand. If not given the player is given the current wand item.",
        usage: [
            "[itemName: Item]"
        ]
    },
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
    {
        name: "cylinder",
        alias: "cyl",
        function: cylinder,
        description: "Generates a cylinder",
        extDescription: "Generates an cylinder between Position 1 and Position 2",
        usage: [
            "[direction: ud | ns | ew] [border: thick | thin | filled] [tileName: Block]"
        ]
    },
    {
        name: "ellipsoid",
        alias: "sphere",
        function: ellipsoid,
        description: "Generates an ellipsoid",
        extDescription: "Generates an ellipsoid between Position 1 and Position 2",
        usage: [
            "[border: thick | thin | filled] [tileName: Block]"
        ]
    },
]

function cylinder(args, player: Player) {
    let direction = 'ud';
    let mode = 'filled'
    let perm = getPermFromHand(player);

    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'ud' && args[0].toLowerCase() != 'ns' && args[0].toLowerCase() != 'ew') {
            tellError(player, `Invalid direction: ${args[0]}`)
            return
        }
        direction = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1].toLowerCase() != 'thick' && args[1].toLowerCase() != 'thin' && args[1].toLowerCase() != 'filled') {
            tellError(player, `Invalid border: ${args[1]}`)
            return
        }
        mode = args[1].toLowerCase();
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
                        if (mat[i][k].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ns': {
                        if (mat[i][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ew': {
                        if (mat[k][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                }
            }
        }
    }
    player.sendMessage(`§aSuccessfully generated cylinder (${blockCount} blocks)`);
}

function ellipsoid(args, player: Player) {
    let mode = 'filled'
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid border: ${args[1]}`)
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
    player.sendMessage(`§aSuccessfully generated ellipsoid (${blockCount} blocks)`);
}

function help(args, player: Player) {
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
            // player.sendMessage(msg);
            player.sendMessage(msg)
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
    // player.sendMessage(`§7- ${PREFIX}help: §bLists all commands and what they do\n§7- ${PREFIX}copy: §bCopies a region to the player's clipboard\n§7- ${PREFIX}cut: §bCuts a region to the player's clipboard\n§7- ${PREFIX}paste: §bPastes a region from the player's clipboard\n§7- ${PREFIX}pos1: §bSaves your current position to pos1\n§7- ${PREFIX}pos2: §bSaves your current position to pos2`)
    player.sendMessage(msg)
}

function welcome(args, player: Player) {
    setWelcome();
    if (welcomeMessage) {
        player.sendMessage('§aWelcome message enabled')
    } else {
        player.sendMessage('§aWelcome message disabled')
    }
}

function version(args, player: Player) {
    player.sendMessage(`<§bBedrockEdit§r> §aBedrockEdit §5v${VERSION}§a is installed!`);
}

function undo(args, player:Player) {
    if (historyMap.get(player.name) == undefined || historyMap.get(player.name).length <= 0) {
        tellError(player, "Nothing to undo");
        return
    }
    if (historyIndexMap.get(player.name) == historyMap.get(player.name).length) {
        tellError(player, "Nothing more to undo");
        return
    }
    let entry = getHistory(player.name, historyIndexMap.get(player.name))
    for (let i = entry.length - 1; i >= 0; i--) {
        player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].pre.clone())
    }
    historyIndexMap.set(player.name, historyIndexMap.get(player.name) + 1);
    player.sendMessage(`§aUndid ${entry.length} block changes`)
}

function redo(args, player: Player) {
    if (historyMap.get(player.name) == undefined || historyMap.get(player.name).length <= 0) {
        tellError(player, "Nothing to redo");
        return
    }
    if (historyIndexMap.get(player.name) == 0) {
        tellError(player, "Nothing more to redo");
        return
    }
    historyIndexMap.set(player.name, historyIndexMap.get(player.name) - 1);
    let entry = getHistory(player.name, historyIndexMap.get(player.name))
    for (let i = 0; i < entry.length; i++) {
        player.dimension.getBlock(entry[i].pos).setPermutation(entry[i].post.clone())
    }
    player.sendMessage(`§aRedid ${entry.length} block changes`)
}

function move(args, player: Player) {
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
    player.sendMessage(`§aMoved ${selSize.x * selSize.y * selSize.z} blocks`)
}

function stack(args, player: Player) {
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }

    let amount = 1

    //#region Args
    if (args.length == 0) {
        help(['stack'], player);
        return;
    }
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
    player.sendMessage(`Stacked selection ${amount} times`)
}

function set(args, player: Player) {
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
    if (args.length > 0 && args[0] != '') {
        if (BlockPermutation.resolve(args[0]) == undefined) {
            tellError(player, `Block ${args[0]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[0]);
    }
    addHistoryEntry(player.name);
    for (let x = 0; x < selSize.x; x++) {
        for (let y = 0; y < selSize.y; y++) {
            for (let z = 0; z < selSize.z; z++) {
                setBlockAt(player, addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), {x: x, y: y, z: z}), perm.clone());
            }
        }
    }
    player.sendMessage(`§aChanged ${selSize.x * selSize.y * selSize.z} blocks to ${perm.type.id}`);
}

function remove(args, player: Player) {
    set(["minecraft:air"], player);
}

function wand(args, player: Player) {
    if (args.length < 1) {
        (player.getComponent('minecraft:inventory') as EntityInventoryComponent).container.addItem(currentWand.clone());
        player.sendMessage(`You have been given ${WAND_NAME}`)
        return;
    }
    let itemType = ItemTypes.get(args[0]);
    if (itemType == undefined) {
        tellError(player, `Item ${args[0]} not found`);
        return;
    }
    scoreboard.removeParticipant('wand.' + currentWand.typeId);
    scoreboard.setScore("wand." + itemType.id, 0);
    setWand();
    player.sendMessage(`§aSet wand item to ${currentWand.typeId}`)
}

function pos1(args, player: Player, pos: Vector3 = null) {
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
    if (pos1Map.has(player.name) || !compareVector3(pos, pos1Map.get(player.name))) {
        pos1Map.set(player.name, pos);
        player.sendMessage(`§5Position 1 set to ${pos.x}, ${pos.y}, ${pos.z}`);
    }
}

function pos2(args, player: Player, pos: Vector3 = null) {
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
    if (pos2Map.has(player.name) || !compareVector3(pos, pos2Map.get(player.name))) {
        pos2Map.set(player.name, pos);
        player.sendMessage(`§5Position 2 set to ${pos.x}, ${pos.y}, ${pos.z}`);
    }
}

export {
    commands,
    pos1,
    pos2
}