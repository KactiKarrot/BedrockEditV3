import { Direction } from "@minecraft/server";
import { commands } from "commands";
import { selMap } from "selectionUtils";
import { tellError, getPrimaryDirection, rotateDirection, tellMessage } from "utils";
commands.set('shrink', {
    function: shrink,
    description: "Shrinks the selection",
    extDescription: "Shrinks the selection\namount: Amount to shrink selection (defaults to 1)\ndirection: Direction to move selection (defaults to me/facing/forward)\noppositeAmount: Amount to shrink selection in the opposite direction (defaults to 0)",
    usage: [
        "[amount: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [oppositeAmount: int]"
    ]
});
function shrink(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
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
        case Direction.South: {
            amount = -amount;
            oppositeAmount = -oppositeAmount;
        }
        case Direction.North: {
            if (selMap.get(player.name).from.z > selMap.get(player.name).to.z) {
                selMap.get(player.name).from = {
                    x: selMap.get(player.name).from.x,
                    y: selMap.get(player.name).from.y,
                    z: selMap.get(player.name).from.z - amount
                };
                selMap.get(player.name).to = {
                    y: selMap.get(player.name).to.y,
                    x: selMap.get(player.name).to.x,
                    z: selMap.get(player.name).to.z + oppositeAmount
                };
            }
            else {
                selMap.get(player.name).to = {
                    x: selMap.get(player.name).from.x,
                    y: selMap.get(player.name).from.y,
                    z: selMap.get(player.name).from.z - amount
                };
                selMap.get(player.name).from = {
                    y: selMap.get(player.name).to.y,
                    x: selMap.get(player.name).to.x,
                    z: selMap.get(player.name).to.z + oppositeAmount
                };
            }
            break;
        }
        case Direction.East: {
            amount = -amount;
            oppositeAmount = -oppositeAmount;
        }
        case Direction.West: {
            if (selMap.get(player.name).from.x > selMap.get(player.name).to.x) {
                selMap.get(player.name).from = {
                    x: selMap.get(player.name).from.x - amount,
                    y: selMap.get(player.name).from.y,
                    z: selMap.get(player.name).from.z
                };
                selMap.get(player.name).to = {
                    y: selMap.get(player.name).to.y,
                    x: selMap.get(player.name).to.x + oppositeAmount,
                    z: selMap.get(player.name).to.z
                };
            }
            else {
                selMap.get(player.name).to = {
                    x: selMap.get(player.name).from.x - amount,
                    y: selMap.get(player.name).from.y,
                    z: selMap.get(player.name).from.z
                };
                selMap.get(player.name).from = {
                    y: selMap.get(player.name).to.y,
                    x: selMap.get(player.name).to.x + oppositeAmount,
                    z: selMap.get(player.name).to.z
                };
            }
            break;
        }
        case Direction.Up: {
            amount = -amount;
            oppositeAmount = -oppositeAmount;
        }
        case Direction.Down: {
            if (selMap.get(player.name).from.y > selMap.get(player.name).to.y) {
                selMap.get(player.name).from = {
                    x: selMap.get(player.name).from.x,
                    y: selMap.get(player.name).from.y - amount,
                    z: selMap.get(player.name).from.z
                };
                selMap.get(player.name).to = {
                    y: selMap.get(player.name).to.y + oppositeAmount,
                    x: selMap.get(player.name).to.x,
                    z: selMap.get(player.name).to.z
                };
            }
            else {
                selMap.get(player.name).to = {
                    x: selMap.get(player.name).from.x,
                    y: selMap.get(player.name).from.y - amount,
                    z: selMap.get(player.name).from.z
                };
                selMap.get(player.name).from = {
                    y: selMap.get(player.name).to.y + oppositeAmount,
                    x: selMap.get(player.name).to.x,
                    z: selMap.get(player.name).to.z
                };
            }
            break;
        }
    }
    tellMessage(player, `§aShrunk selection ${amount} blocks`);
}
