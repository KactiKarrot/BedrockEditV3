import { ShapeModes } from "./Controller";
export class Pyramid {
    constructor(mode, widthX, heightY, depthZ) {
        this.mode = mode;
        this.width = widthX;
        this.height = heightY;
        this.depth = depthZ;
    }
    isFilled(x, y, z) {
        let yRatioX = Math.floor((this.width + 1) / 2) / this.height;
        let yRatioZ = Math.floor((this.width + 1) / 2) / this.height;
        if (this.mode == ShapeModes.filled) {
            if ((x >= Math.floor(y * yRatioX) && x < this.width - Math.floor(y * yRatioX)) && (z >= Math.floor(y * yRatioZ) && z < this.depth - Math.floor(y * yRatioZ))) {
                return true;
            }
        }
        else {
            if ((x == Math.floor(y * yRatioX) || x == this.width - Math.floor(y * yRatioX) - 1) && (z >= Math.floor(y * yRatioZ) && z < this.depth - Math.floor(y * yRatioZ)) ||
                (x >= Math.floor(y * yRatioX) && x < this.width - Math.floor(y * yRatioX)) && (z == Math.floor(y * yRatioZ) || z == this.depth - Math.floor(y * yRatioZ) - 1)) {
                return true;
            }
        }
        return false;
    }
}
