import { Direction, BlockPermutation, CompoundBlockVolume, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { compSelMap, selMap, addCuboid, getCompSpan, compApplyToAllBlocks, cloneVol } from "selectionUtils";
import { tellError, getPrimaryDirection, rotateDirection, floorVector3, multiplyVector3, addHistoryEntry, setBlockAt, shiftVector3, getZeroVector3, tellMessage } from "utils";
commands.set('move', {
    alias: "mv",
    function: move,
    description: "Moves the selected region",
    extDescription: "Moves the selected region\ndistance: Distance to move selected region (defaults to 1)\ndirection: Direction to move selected region (defaults to me/facing/forward)\n-a: Doesn't move air blocks",
    usage: [
        "[distance: int] [direction: me|facing|forward|right|backward|left|north|east|south|west|up|down] [-a]"
    ]
});
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
        let newVol = cloneVol(selMap.get(player.name));
        newVol.translate(multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 }));
        addCuboid(compSelMap.get(player.name), newVol, ShapeModes.filled);
    }
    let selSize = getCompSpan(compSelMap.get(player.name));
    let sel = Array(selSize.x).fill(null).map(() => Array(selSize.y).fill(null).map(() => Array(selSize.z).fill(null)));
    addHistoryEntry(player.name);
    let count = 0;
    // let origin = compSelMap.get(player.name).getOrigin();
    let min = compSelMap.get(player.name).getMin();
    system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
        if (!air && b.permutation.type.id == perm.type.id) {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation; /*.clone()*/
        setBlockAt(player, l, perm /*.clone()*/);
    }, () => {
        compSelMap.get(player.name).translateOrigin(shiftVector3(getZeroVector3(), direction, amount));
        let newVol = cloneVol(selMap.get(player.name));
        newVol.translate(shiftVector3(getZeroVector3(), direction, amount));
        selMap.set(player.name, newVol);
        // origin = compSelMap.get(player.name).getOrigin();
        min = compSelMap.get(player.name).getMin();
        count = 0; // May need to be separate variable
        system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
            if (!air && b.permutation.type.id == perm.type.id) {
                return;
            }
            setBlockAt(player, l, sel[l.x - min.x][l.y - min.y][l.z - min.z] /*.clone()*/);
            count++;
        }, () => {
            if (!manualSel) {
                compSelMap.delete(player.name);
            }
            tellMessage(player, `§aMoved ${count} blocks ${direction}`);
        }));
    }));
}
