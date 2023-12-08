import { Player, BlockVolumeUtils, CompoundBlockVolume } from "@minecraft/server";
import { ShapeModes } from "Circle-Generator/Controller";
import { addCuboid, addEllipsoid, compSelMap, selMap, subtractCuboid, subtractEllipsoid } from "selection";
import { floorVector3, multiplyVector3, tellError, tellMessage } from "utils";

/* Need to add:
- Line (curved line, use circle algorithm)
- Disable history (for performance)
*/

export let commands = new Map<string, command>();

interface command {
    alias?: string,
    function: (args: string[], player: Player) => any,
    description: string,
    extDescription: string,
    usage: string[]
}

function addcuboid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled
    if (args.length >= 1) {
        switch(args[0]) {
            case 'hollow': {
                mode = ShapeModes.thick;
                break;
            }
            case 'filled': {
                mode = ShapeModes.filled;
                break;
            }
            case 'walls': {
                mode = ShapeModes.thin;
                break;
            }
            default: {
                tellError(player, `Invalid mode: ${args[0]}`)
                return
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode);
    tellMessage(player, '§aAdded cuboid to compound selection');
}

function subtractcuboid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = ShapeModes.filled
    if (args.length >= 1) {
        switch(args[0]) {
            case 'hollow': {
                mode = ShapeModes.thick;
                break;
            }
            case 'filled': {
                mode = ShapeModes.filled;
                break;
            }
            case 'walls': {
                mode = ShapeModes.thin;
                break;
            }
            default: {
                tellError(player, `Invalid mode: ${args[0]}`)
                return
            }
        }
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    subtractCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode);
    tellMessage(player, '§aAdded negative cuboid to compound selection');
}

function addellipsoid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    let mode = 'filled'
    if (args.length >= 1) {
        mode = args[0]
    }
    addEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode as ShapeModes);
    player.sendMessage('done')
}

function subtractellipsoid(args: string[], player: Player) {
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!compSelMap.has(player.name) && (selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    if (!compSelMap.has(player.name)) {
        compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    }
    let mode = 'filled'
    if (args.length >= 1) {
        mode = args[0]
    }
    subtractEllipsoid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), {x: -1, y: -1, z: -1})), mode as ShapeModes);
    player.sendMessage('done')
}