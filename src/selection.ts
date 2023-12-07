import { BlockVolume, CompoundBlockVolume, Vector3, BlockVolumeUtils, Block, Dimension, CompoundBlockVolumeAction, CompoundBlockVolumePositionRelativity, Vector } from "@minecraft/server";
import { ShapeModes, generateEllipse, generateEllipsoid } from "Circle-Generator/Controller";
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

export enum Axis { X, Y, Z };

export let selMap = new Map<string, BlockVolume>();
export let compSelMap = new Map<string, CompoundBlockVolume>();

export function cloneVol(vol: BlockVolume): BlockVolume {
    return {from: vol.from, to: vol.to}
}

export function setStandardSel(sel: BlockVolume, from: Vector3, to: Vector3) {
    sel = {from: from, to: to};
}

export function applyToAllBlocks(vol: BlockVolume, dimension: Dimension, callback: (block: Block, location: Vector3) => any) {
    for (let bl of BlockVolumeUtils.getBlockLocationIterator(vol)) {
        callback(dimension.getBlock(bl), bl);
    }
}

export function compApplyToAllBlocks(vol: CompoundBlockVolume, dimension: Dimension, callback: (block: Block, location: Vector3) => any) {
    for (let bl of vol.getBlockLocationIterator()) {
        callback(dimension.getBlock(bl), bl);
    }
}

export function getCompSpan(vol: CompoundBlockVolume): Vector3 {
    return addVector3({x: 1, y: 1, z: 1}, subVector3(vol.getBoundingBox().max, vol.getBoundingBox().min))
}

// Mode thick means standard hollow cube, mode thin means just walls
// Orientation only needed if mode is thin (walls)
// positions should be relative to origin
export function addCuboid(compSel: CompoundBlockVolume, cube: BlockVolume, mode: ShapeModes, orientation?: Axis) {
    compSel.pushVolume({volume: cube, action: CompoundBlockVolumeAction.Add});
    if (mode != ShapeModes.filled) {
        compSel.pushVolume({volume: shrinkVolume(cloneVol(cube), {x: (mode == ShapeModes.thin && orientation == Axis.X ? 0 : 1), y: (mode == ShapeModes.thin && orientation == Axis.Y ? 0 : 1), z: (mode == ShapeModes.thin && orientation == Axis.Z ? 0 : 1)}), action: CompoundBlockVolumeAction.Subtract});
    }
}

export function subtractCuboid(compSel: CompoundBlockVolume, cube: BlockVolume, mode: ShapeModes, orientation?: Axis) {
    compSel.pushVolume({volume: cube, action: CompoundBlockVolumeAction.Subtract});
    if (mode != ShapeModes.filled) {
        compSel.pushVolume({volume: shrinkVolume(cloneVol(cube), {x: (mode == ShapeModes.thin && orientation == Axis.X ? 0 : 1), y: (mode == ShapeModes.thin && orientation == Axis.Y ? 0 : 1), z: (mode == ShapeModes.thin && orientation == Axis.Z ? 0 : 1)}), action: CompoundBlockVolumeAction.Add});
    }
}

export function addCylinder(compSel: CompoundBlockVolume, area: BlockVolume, mode: ShapeModes, orientation: Axis, faces: boolean) {
    let span = BlockVolumeUtils.getSpan(area);
    let mat = generateEllipse((orientation == Axis.X ? span.z : span.x), (orientation == Axis.Y ? span.z : span.y), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch(orientation) {
                    case Axis.X: {
                        if (mat[z][y] || (faces && (x == 0 || x == span.x - 1) && generateEllipse(span.z, span.y, ShapeModes.filled)[z][y])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Add
                            })
                        }
                    }
                    case Axis.Y: {
                        if (mat[x][z] || (faces && (y == 0 || y == span.y - 1) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Add
                            })
                        }
                    }
                    case Axis.Z: {
                        if (mat[x][y] || (faces && (z == 0 || z == span.z - 1) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][y])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Add
                            })
                        }
                    }
                }
            }
        }
    }
}

export function subtractCylinder(compSel: CompoundBlockVolume, area: BlockVolume, mode: ShapeModes, orientation: Axis, faces: boolean) {
    let span = BlockVolumeUtils.getSpan(area);
    let mat = generateEllipse((orientation == Axis.X ? span.z : span.x), (orientation == Axis.Y ? span.z : span.y), mode);
    for (let x = 0; x < span.x; x++) {
        for (let y = 0; y < span.y; y++) {
            for (let z = 0; z < span.z; z++) {
                switch(orientation) {
                    case Axis.X: {
                        if (mat[z][y] || (faces && (x == 0 || x == span.x - 1) && generateEllipse(span.z, span.y, ShapeModes.filled)[z][y])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Subtract
                            })
                        }
                    }
                    case Axis.Y: {
                        if (mat[x][z] || (faces && (y == 0 || y == span.y - 1) && generateEllipse(span.x, span.z, ShapeModes.filled)[x][z])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Subtract
                            })
                        }
                    }
                    case Axis.Z: {
                        if (mat[x][y] || (faces && (z == 0 || z == span.z - 1) && generateEllipse(span.x, span.y, ShapeModes.filled)[x][y])) {
                            let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                            compSel.pushVolume({
                                volume: {
                                    from: pos,
                                    to: pos
                                },
                                action: CompoundBlockVolumeAction.Subtract
                            })
                        }
                    }
                }
            }
        }
    }
}

export function addEllipsoid(compSel: CompoundBlockVolume, area: BlockVolume, mode: ShapeModes) {
    let span = BlockVolumeUtils.getSpan(area);
    let mat = generateEllipsoid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                    compSel.pushVolume({
                        volume: {
                            from: pos,
                            to: pos
                        },
                        action: CompoundBlockVolumeAction.Add
                    })
                }
            })
        })
    })
}

export function subtractEllipsoid(compSel: CompoundBlockVolume, area: BlockVolume, mode: ShapeModes) {
    let span = BlockVolumeUtils.getSpan(area);
    let mat = generateEllipsoid(span.x, span.y, span.z, mode);
    mat.forEach((e, x) => {
        e.forEach((f, y) => {
            f.forEach((b, z) => {
                if (b) {
                    let pos = addVector3({x: x, y: y, z: z}, BlockVolumeUtils.getMin(area))
                    compSel.pushVolume({
                        volume: {
                            from: pos,
                            to: pos
                        },
                        action: CompoundBlockVolumeAction.Subtract
                    })
                }
            })
        })
    })
}