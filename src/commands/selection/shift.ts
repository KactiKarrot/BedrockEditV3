import { Player, Direction } from "@minecraft/server";
import { commands } from "commands";
import { compSelMap } from "selectionUtils";
import { tellError, getPrimaryDirection, rotateDirection, shiftVector3, tellMessage, getPosVector3 } from "utils";

commands.set('shift', {
    function: shift,
    description: "Moves the selection",
    extDescription: "Moves the selection\ndistance: Distance to move selection (defaults to 1)\ndirection: Direction to move selection (defaults to me/facing/forward)",
    usage: [
        "[distance: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down]"
    ]
})

function shift(args: string[], player: Player) {
    if (!compSelMap.has(player.name)) {
        tellError(player, 'Compound selection not set');
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
    compSelMap.get(player.name).translateOrigin(shiftVector3(getPosVector3(), direction, amount))
    tellMessage(player, `§aShifted selection ${amount} blocks ${direction}`)
}