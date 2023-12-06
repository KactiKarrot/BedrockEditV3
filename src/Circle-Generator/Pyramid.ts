import { ShapeModes } from "./Controller";

export class Pyramid {
    private mode: ShapeModes;
    private depth: number;
    private width: number;
    private height: number;

    constructor(mode: ShapeModes, widthX: number, heightY: number, depthZ: number) {
        this.mode = mode;
        this.width = widthX;
        this.height = heightY;
        this.depth = depthZ;
    }

    public isFilled(x: number, y: number, z: number): boolean {
        let yRatioX = Math.floor((this.width + 1) / 2) / this.height
        let yRatioZ = Math.floor((this.width + 1) / 2) / this.height
        if (this.mode == ShapeModes.filled) {
            if ((x >= Math.floor(y * yRatioX) && x < this.width - Math.floor(y * yRatioX)) && (z >= Math.floor(y * yRatioZ) && z < this.depth - Math.floor(y * yRatioZ))) {
                return true;
            }
        } else {
            if (
                (x == Math.floor(y * yRatioX) || x == this.width - Math.floor(y * yRatioX) - 1) && (z >= Math.floor(y * yRatioZ) && z < this.depth - Math.floor(y * yRatioZ)) ||
                (x >= Math.floor(y * yRatioX) && x < this.width - Math.floor(y * yRatioX)) && (z == Math.floor(y * yRatioZ) || z == this.depth - Math.floor(y * yRatioZ) - 1)
            ) {
                return true;
            }
        }
        return false;
    }
}