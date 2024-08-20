import { BlockVolume, CompoundBlockVolumeAction } from "@minecraft/server";
import { ShapeModes, generateDome, generateEllipse, generateEllipsoid, generatePyramid } from "Circle-Generator/Controller";
import { addVector3, shrinkVolume, subVector3 } from "utils";
/*
Basis of 3.0.1 update
Existing BE cuboid selection will become 'standard' selection
New advanced mode will add various stanard selections together as a compound
Commands
- pos1: same as before but for standard selection
- pos2: same as before but for standard selection
- undoLastSel: Undoes last change to advanced selection //  Maybe, hard to implement with multi volume additions (such as spheres)
- clearSel: Removes all block volumes from advanced selection
- addCuboid
- addEllipsoid
- addCylinder
- addCone
- addPyramid
*/
export var Axis;
(function (Axis) {
    Axis[Axis["X"] = 0] = "X";
    Axis[Axis["Y"] = 1] = "Y";
    Axis[Axis["Z"] = 2] = "Z";
})(Axis || (Axis = {}));
;
export let selMap = new Map();
export let compSelMap = new Map();
export function cloneVol(vol) {
    return new BlockVolume(vol.from, vol.to);
}
export function setStandardSel(sel, from, to) {
    sel = new BlockVolume(from, to);
}
// Apply a function to all blocks with a block volume (no safety checks)
export function* applyToAllBlocks(vol, dimension, callback, finished) {
    for (let bl of vol.getBlockLocationIterator()) {
        let b = dimension.getBlock(bl);
        if (b) {
            callback(b, bl);
        }
        yield;
    }
    if (finished) {
        finished();
    }
}
// Apply a function to all blocks with a compound block volume (no safety checks)
export function* compApplyToAllBlocks(vol, dimension, callback, finished) {
    for (let bl of vol.getBlockLocationIterator()) {
        let b = dimension.getBlock(bl);
        if (b) {
            callback(b, bl);
        }
        yield;
    }
    if (finished) {
        finished();
    }
}
export function getCompSpan(vol) {
    return addVector3({ x: 1, y: 1, z: 1 }, subVector3(vol.getBoundingBox().max, vol.getBoundingBox().min));
}
// Mode thick means standard hollow cube, mode thin means just walls
// Orientation only needed if mode is thin (walls)
// positions should be relative to origin
export function addCuboid(compSel, cube, mode, orientation) {
    compSel.pushVolume({ volume: cube, action: CompoundBlockVolumeAction.Add });
    if (mode != ShapeModes.filled) {
        compSel.pushVolume({ volume: shrinkVolume(cloneVol(cube), { x: (mode == ShapeModes.thin && orientation == Axis.X ? 0 : 1), y: (mode == ShapeModes.thin && orientation == Axis.Y ? 0 : 1), z: (mode == ShapeModes.thin && orientation == Axis.Z ? 0 : 1) }), action: CompoundBlockVolumeAction.Subtract });
    }
}
export function subtractCuboid(compSel, cube, mode, orientation) {
    compSel.pushVolume({ volume: cube, action: CompoundBlockVolumeAction.Subtract });
    if (mode != ShapeModes.filled) {
        compSel.pushVolume({ volume: shrinkVolume(cloneVol(cube), { x: (mode == ShapeModes.thin && orientation == Axis.X ? 0 : 1), y: (mode == ShapeModes.thin && orientation == Axis.Y ? 0 : 1), z: (mode == ShapeModes.thin && orientation == Axis.Z ? 0 : 1) }), action: CompoundBlockVolumeAction.Add });
    }
}
export function addCylinder(compSel, area, mode, orientation, faces) {
    let span = area.getSpan();
    let mat = generateEllipse((orientation == Axis.X ? span.z : span.x), (orientation == Axis.Y ? span.z : span.y), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch (orientation) {
                    case Axis.X: {
                        if (mat[z][y] || (faces && (x == 0 || x == span.x - 1) && generateEllipse(span.z, span.y, ShapeModes.filled)[z][y])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                    case Axis.Y: {
                        if (mat[x][z] || (faces && (y == 0 || y == span.y - 1) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                    case Axis.Z: {
                        if (mat[x][y] || (faces && (z == 0 || z == span.z - 1) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][y])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                }
            }
        }
    }
}
export function subtractCylinder(compSel, area, mode, orientation, faces) {
    let span = area.getSpan();
    let mat = generateEllipse((orientation == Axis.X ? span.z : span.x), (orientation == Axis.Y ? span.z : span.y), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch (orientation) {
                    case Axis.X: {
                        if (mat[z][y] || (faces && (x == 0 || x == span.x - 1) && generateEllipse(span.z, span.y, ShapeModes.filled)[z][y])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                    case Axis.Y: {
                        if (mat[x][z] || (faces && (y == 0 || y == span.y - 1) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                    case Axis.Z: {
                        if (mat[x][y] || (faces && (z == 0 || z == span.z - 1) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][y])) {
                            let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                }
            }
        }
    }
}
export function addEllipsoid(compSel, area, mode) {
    let span = area.getSpan();
    let mat = generateEllipsoid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                    compSel.pushVolume({
                        volume: new BlockVolume(pos, pos),
                        action: CompoundBlockVolumeAction.Add
                    });
                }
            });
        });
    });
}
export function subtractEllipsoid(compSel, area, mode) {
    let span = area.getSpan();
    let mat = generateEllipsoid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                    compSel.pushVolume({
                        volume: new BlockVolume(pos, pos),
                        action: CompoundBlockVolumeAction.Subtract
                    });
                }
            });
        });
    });
}
export function addPyramid(compSel, area, mode) {
    let span = area.getSpan();
    let mat = generatePyramid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                    compSel.pushVolume({
                        volume: new BlockVolume(pos, pos),
                        action: CompoundBlockVolumeAction.Add
                    });
                }
            });
        });
    });
}
export function subtractPyramid(compSel, area, mode) {
    let span = area.getSpan();
    let mat = generatePyramid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({ x: x, y: y, z: z }, area.getMin());
                    compSel.pushVolume({
                        volume: new BlockVolume(pos, pos),
                        action: CompoundBlockVolumeAction.Add
                    });
                }
            });
        });
    });
}
export function addDome(compSel, area, mode, orientation, positiveOrientation, faces) {
    let span = area.getSpan();
    let mat = generateDome((orientation == Axis.Y ? span.x : (orientation == Axis.X ? span.y : span.z)), (orientation == Axis.Y ? span.y : (orientation == Axis.X ? span.x : span.z)), (orientation == Axis.Y ? span.z : (orientation == Axis.X ? span.z : span.x)), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch (orientation) {
                    case Axis.X: {
                        if (mat[positiveOrientation ? x : span.x - 1 - y][y][z] || (faces && ((positiveOrientation && x == 0) || (!positiveOrientation && x == span.x - 1))) && generateEllipse(span.y, span.z, ShapeModes.filled)[y][z]) {
                            let pos = addVector3({ x: positiveOrientation ? x : span.x - 1 - x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                    case Axis.Y: {
                        if (mat[x][positiveOrientation ? y : span.y - 1 - y][z] || (faces && ((positiveOrientation && y == 0) || (!positiveOrientation && y == span.y - 1))) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z]) {
                            let pos = addVector3({ x: x, y: positiveOrientation ? y : span.y - 1 - y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                    case Axis.Z: {
                        if (mat[x][y][positiveOrientation ? z : span.z - 1 - z] || (faces && ((positiveOrientation && z == 0) || (!positiveOrientation && z == span.z - 1))) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][z]) {
                            let pos = addVector3({ x: x, y: y, z: positiveOrientation ? z : span.z - 1 - z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Add
                            });
                        }
                        break;
                    }
                }
            }
        }
    }
}
export function subtractDome(compSel, area, mode, orientation, positiveOrientation, faces) {
    let span = area.getSpan();
    let mat = generateDome((orientation == Axis.Y ? span.x : (orientation == Axis.X ? span.y : span.z)), (orientation == Axis.Y ? span.y : (orientation == Axis.X ? span.x : span.z)), (orientation == Axis.Y ? span.z : (orientation == Axis.X ? span.z : span.x)), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch (orientation) {
                    case Axis.X: {
                        if (mat[positiveOrientation ? x : span.x - 1 - y][y][z] || (faces && ((positiveOrientation && x == 0) || (!positiveOrientation && x == span.x - 1))) && generateEllipse(span.y, span.z, ShapeModes.filled)[y][z]) {
                            let pos = addVector3({ x: positiveOrientation ? x : span.x - 1 - x, y: y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                    case Axis.Y: {
                        if (mat[x][positiveOrientation ? y : span.y - 1 - y][z] || (faces && ((positiveOrientation && y == 0) || (!positiveOrientation && y == span.y - 1))) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z]) {
                            let pos = addVector3({ x: x, y: positiveOrientation ? y : span.y - 1 - y, z: z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                    case Axis.Z: {
                        if (mat[x][y][positiveOrientation ? z : span.z - 1 - z] || (faces && ((positiveOrientation && z == 0) || (!positiveOrientation && z == span.z - 1))) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][z]) {
                            let pos = addVector3({ x: x, y: y, z: positiveOrientation ? z : span.z - 1 - z }, area.getMin());
                            compSel.pushVolume({
                                volume: new BlockVolume(pos, pos),
                                action: CompoundBlockVolumeAction.Subtract
                            });
                        }
                        break;
                    }
                }
            }
        }
    }
}
