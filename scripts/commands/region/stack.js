import { Direction, CompoundBlockVolume, BlockVolumeUtils, system } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { commands } from "commands";
import { compSelMap, selMap, addCuboid, getCompSpan, compApplyToAllBlocks } from "selectionUtils";
import { tellError, getPrimaryDirection, rotateDirection, floorVector3, multiplyVector3, addHistoryEntry, shiftVector3, getZeroVector3, tellMessage } from "utils";
commands.set('stack', {
    function: stack,
    description: "Stacks the selected region",
    extDescription: "Stacks the selected region\namount: Number of times to copy selected region\noffset: Amount of blocks between each copy\n-a: Doesn't stack air blocks",
    usage: [
        "[amount: int] [me|facing|forward|right|backward|left|north|east|south|west|up|down] [offset: int] [-a]"
    ]
});
async function stack(args, player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    //#region Args
    if (args.length == 0) {
        commands.get('help').function(['stack'], player);
        return;
    }
    if (Number.isNaN(parseInt(args[0])) || args[0] == '0') {
        tellError(player, `Invalid amount: '${args[0]}'`);
        return;
    }
    let amount = parseInt(args[0]);
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
    system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
        if (!air && b.permutation.type.id == 'minecraft:air') {
            return;
        }
        sel[l.x - min.x][l.y - min.y][l.z - min.z] = b.permutation.clone();
    }, () => {
        let count = 0;
        let originalSel = selMap.get(player.name);
        function stackgen(i) {
            if (i >= amount) {
                compSelMap.get(player.name).setOrigin(origin);
                if (!manualSel) {
                    compSelMap.delete(player.name);
                }
                selMap.set(player.name, originalSel);
                tellMessage(player, `§aStacked selection ${amount} times (${count} blocks)`);
                return;
            }
            ;
            const deltaVec = shiftVector3(getZeroVector3(), direction, (direction == Direction.North || direction == Direction.South ? selSize.z : (direction == Direction.Up || direction == Direction.Down ? selSize.y : selSize.x)) + offset);
            compSelMap.get(player.name).translateOrigin(deltaVec);
            selMap.set(player.name, BlockVolumeUtils.translate(selMap.get(player.name), deltaVec));
            min = compSelMap.get(player.name).getMin();
            system.runJob(compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, (b, l) => {
                b.setPermutation(sel[l.x - min.x][l.y - min.y][l.z - min.z].clone());
                count++;
            }, () => {
                stackgen(i + 1);
            }));
        }
        stackgen(0);
    }));
}
