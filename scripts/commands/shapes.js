import { BlockTypes, CompoundBlockVolume, BlockVolumeUtils, BlockPermutation } from "@minecraft/server";
import { ShapeModes, generateEllipse, generateEllipsoid, generateDome, generatePyramid, generateCone } from "Circle-Generator/Controller";
import { pos1Map, pos2Map } from "main";
import { Axis, addCuboid, compApplyToAllBlocks, compSelMap, selMap } from "selection";
import { tellError, getPermFromHand, getPermFromStr, addHistoryEntry, floorVector3, multiplyVector3, setBlockAt, sleep, tellMessage, addVector3, diffVector3, minVector3 } from "utils";
//done?
export function cube(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let mode = 'filled';
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2 && args[1] != '') {
        if (BlockTypes.get(args[1]) == undefined) {
            tellError(player, `Block ${args[1]} not found`);
            return;
        }
        perm = getPermFromStr(args[1], player);
    }
    addHistoryEntry(player.name);
    compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), mode);
    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    });
    compSelMap.delete(player.name);
    tellMessage(player, `§aSuccessfully generated cube (${count} blocks)`);
}
export function walls(args, player) {
    if ((selMap.get(player.name)?.from == undefined)) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if ((selMap.get(player.name)?.to == undefined)) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let perm = getPermFromHand(player);
    if (args.length >= 1 && args[0] != '') {
        if (BlockTypes.get(args[0]) == undefined) {
            tellError(player, `Block ${args[1]} not found`);
            return;
        }
        perm = BlockPermutation.resolve(args[0]);
    }
    addHistoryEntry(player.name);
    compSelMap.set(player.name, new CompoundBlockVolume(floorVector3(player.location)));
    addCuboid(compSelMap.get(player.name), BlockVolumeUtils.translate(selMap.get(player.name), multiplyVector3(compSelMap.get(player.name).getOrigin(), { x: -1, y: -1, z: -1 })), ShapeModes.thin, Axis.Y);
    let count = 0;
    compApplyToAllBlocks(compSelMap.get(player.name), player.dimension, async (b, l) => {
        setBlockAt(player, l, perm.clone());
        count++;
        if (count % 5000 == 0) {
            await sleep(1);
        }
    });
    compSelMap.delete(player.name);
    tellMessage(player, `§aSuccessfully generated walls (${count} blocks)`);
}
export function cylinder(args, player) {
    let direction = 'ud';
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'ud' && args[0].toLowerCase() != 'ns' && args[0].toLowerCase() != 'ew') {
            tellError(player, `Invalid direction: ${args[0]}`);
            return;
        }
        direction = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1].toLowerCase() != 'thick' && args[1].toLowerCase() != 'thin' && args[1].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[1]}`);
            return;
        }
        mode = args[1].toLowerCase();
    }
    if (args.length >= 3) {
        if (args[2] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 4 && args[3] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[3]} not found`);
            return;
        }
        perm = BlockPermutation.resolve(args[3]);
    }
    if (!pos1Map.has(player.name) || pos1Map.get(player.name) == undefined) {
        tellError(player, "Position 1 not set!");
        return;
    }
    if (!pos2Map.has(player.name) || pos2Map.get(player.name) == undefined) {
        tellError(player, "Position 2 not set!");
        return;
    }
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat;
    switch (direction) {
        case 'ud': {
            mat = generateEllipse(selSize.x, selSize.z, mode);
            break;
        }
        case 'ns': {
            mat = generateEllipse(selSize.x, selSize.y, mode);
            break;
        }
        case 'ew': {
            mat = generateEllipse(selSize.z, selSize.y, mode);
            break;
        }
    }
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                switch (direction) {
                    case 'ud': {
                        if (fillFaces && (j == 0 || j == selSize.y - 1)) {
                            let mat2 = generateEllipse(selSize.x, selSize.z, ShapeModes.filled);
                            if (mat2[i][k].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        }
                        else if (mat[i][k].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ns': {
                        if (fillFaces && (k == 0 || k == selSize.z - 1)) {
                            let mat2 = generateEllipse(selSize.x, selSize.y, ShapeModes.filled);
                            if (mat2[i][j].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        }
                        else if (mat[i][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                    case 'ew': {
                        if (fillFaces && (i == 0 || i == selSize.x - 1)) {
                            let mat2 = generateEllipse(selSize.z, selSize.y, ShapeModes.filled);
                            if (mat2[k][j].valueOf() == true) {
                                setBlockAt(player, pos, perm.clone());
                                blockCount++;
                            }
                        }
                        else if (mat[k][j].valueOf() == true) {
                            setBlockAt(player, pos, perm.clone());
                            blockCount++;
                        }
                        break;
                    }
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated cylinder (${blockCount} blocks)`);
}
export function ellipsoid(args, player) {
    let mode = 'filled';
    let perm = getPermFromHand(player);
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2 && args[1] != '') {
        if (BlockTypes.get(args[1]) == undefined) {
            tellError(player, `Block ${args[1]} not found`);
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat = generateEllipsoid(selSize.x, selSize.y, selSize.z, mode);
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                if (mat[i][j][k].valueOf() == true) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated ellipsoid (${blockCount} blocks)`);
}
export function dome(args, player) {
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 3 && args[2] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[2]} not found`);
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat = generateDome(selSize.x, selSize.y, selSize.z, mode);
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0 && generateEllipse(selSize.x, selSize.z, ShapeModes.filled)[i][k].valueOf() == true)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated a dome (${blockCount} blocks)`);
}
export function pyramid(args, player) {
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'hollow' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 3 && args[2] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[2]} not found`);
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat = generatePyramid(selSize.x, selSize.y, selSize.z, mode);
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated pyramid (${blockCount} blocks)`);
}
// Doesn't work (offset is off and top of odd diameter has 2x2)
export function cone(args, player) {
    let mode = 'filled';
    let perm = getPermFromHand(player);
    let fillFaces = true;
    if (args.length >= 1) {
        if (args[0].toLowerCase() != 'thick' && args[0].toLowerCase() != 'thin' && args[0].toLowerCase() != 'filled') {
            tellError(player, `Invalid mode: ${args[0]}`);
            return;
        }
        mode = args[0].toLowerCase();
    }
    if (args.length >= 2) {
        if (args[1] == 'false') {
            fillFaces = false;
        }
    }
    if (args.length >= 3 && args[2] != '') {
        if (BlockTypes.get(args[2]) == undefined) {
            tellError(player, `Block ${args[2]} not found`);
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
    let selSize = addVector3({ x: 1, y: 1, z: 1 }, diffVector3(pos1Map.get(player.name), pos2Map.get(player.name)));
    let mat = generateCone(selSize.x, selSize.y, selSize.z, mode);
    let blockCount = 0;
    addHistoryEntry(player.name);
    for (let i = 0; i < selSize.x; i++) {
        for (let j = 0; j < selSize.y; j++) {
            for (let k = 0; k < selSize.z; k++) {
                let pos = addVector3(minVector3(pos1Map.get(player.name), pos2Map.get(player.name)), { x: i, y: j, z: k });
                if (mat[i][j][k].valueOf() == true || (fillFaces && j == 0 && generateEllipse(selSize.x, selSize.z, ShapeModes.filled)[i][k].valueOf() == true)) {
                    setBlockAt(player, pos, perm.clone());
                    blockCount++;
                }
            }
        }
    }
    tellMessage(player, `§aSuccessfully generated a cone (${blockCount} blocks)`);
}
