import { Player, BlockTypes, BlockPermutation, Direction, CompoundBlockVolume, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { Axis, addDome, cloneVol, compApplyToAllBlocks, selMap } from "selectionUtils";
import { getPermFromHand, tellError, addHistoryEntry, setBlockAt, tellMessage, getPrimaryDirection, rotateDirection, floorVector3, multiplyVector3, sleep } from "utils";

commands.set('dome', {
    function: dome,
    description: "Generates a dome",
    extDescription: "Generates a dome between Position 1 and Position 2\nmode: Whether the dome is filled, has thin edges, or thick edges\norientation: Direction the rounded part of the dome will face (defaults to up)\ntileName: Block to set (defaults to block in players hand. If hand is empty or is not a placeable item, sets air",
    usage: [
        "[mode: thick | thin | filled] [orientation: me|facing|forward|right|backward|left|north|east|south|west|up|down] [fillFaces: boolean] [tileName: Block]"
    ]
})

//only works with up, down also generates up
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
    if (args.length >= 3) {
        if (args[2] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 4 && args[3] != '') {
        if (BlockTypes.get(args[3]) == undefined) {
            tellError(player, `Block ${args[3]} not found`)
            return;
        }
        perm = BlockPermutation.resolve(args[2]);
    }

    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }


    addHistoryEntry(player.name);
    let vol =  new CompoundBlockVolume(floorVector3(player.location));
    let newVol = cloneVol(selMap.get(player.name));
    newVol.translate(multiplyVector3(vol.getOrigin(), {x: -1, y: -1, z: -1}));
    addDome(
        vol,
        newVol, 
        mode as ShapeModes,
        ((direction == Direction.Up || direction == Direction.Down) ? Axis.Y : ((direction == Direction.North || direction == Direction.South) ? Axis.Z : Axis.X)),
        (direction == Direction.Up || direction == Direction.South || direction == Direction.East),
        fillFaces
    );
    let count = 0;
    system.runJob(compApplyToAllBlocks(vol, player.dimension, async (b, l) => {
        setBlockAt(player, l, perm/*.clone()*/);
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    }, () => {
        tellMessage(player, `§aSuccessfully generated dome (${count} blocks)`);
    }))
}