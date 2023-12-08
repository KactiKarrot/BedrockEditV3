import { BlockVolumeUtils } from "@minecraft/server";
import { commands } from "commands";
import { selMap } from "selectionUtils";
import { tellError, floorVector3, compareVector3, tellMessage } from "utils";
commands.set('pos1', {
    alias: "p1",
    function: pos1,
    description: "Saves a position to pos1",
    extDescription: "Saves a position to pos1\nfacing: Gets block from player's view vector\n-l: Includes liquid blocks (such as water) in the position selection (normally passes through)\n-p: Includes passable blocks (such as vines) in the position selection (normally passes through)\nposition: Gets block from given coordinates",
    usage: [
        "",
        "facing [-lp]",
        "position <pos: x y z>"
    ]
});
commands.set('pos2', {
    alias: "p2",
    function: pos2,
    description: "Saves a position to pos2",
    extDescription: "Saves a position to pos2\nfacing: Gets block from player's view vector\n-l: Includes liquid blocks (such as water) in the position selection (normally passes through)\n-p: Includes passable blocks (such as vines) in the position selection (normally passes through)\nposition: Gets block from given coordinates",
    usage: [
        "",
        "facing [-lp]",
        "position <pos: x y z>"
    ]
});
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
