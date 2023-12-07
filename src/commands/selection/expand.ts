import { Player, Direction } from "@minecraft/server";
import { commands } from "commands";
import { pos1Map, pos2Map } from "main";
import { tellError, getPrimaryDirection, rotateDirection, tellMessage } from "utils";

commands.set('expand', {
    function: expand,
    description: "Expands the selection",
    extDescription: "Expands the selection\namount: Amount to shrink selection (defaults to 1)\ndirection: Direciton to move selection (defaults to me/facing/forward)\noppositeAmount: Amount to shrink selection in the opposite direciton (defaults to 0)",
    usage: [
        "[amount: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [oppositeAmount: int]"
    ]
})

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
