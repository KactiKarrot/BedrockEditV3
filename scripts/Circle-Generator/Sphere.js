import { ShapeModes } from "./Controller";
import { distance3D } from "./Math";
function filled(x, y, z, radius, yRatio, zRatio) {
    return distance3D(x, y, z, yRatio, zRatio) <= radius;
}
function fatFilled(x, y, z, radius, yRatio, zRatio) {
    return filled(x, y, z, radius, yRatio, zRatio) && !(filled(x + 1, y, z, radius, yRatio, zRatio) &&
        filled(x - 1, y, z, radius, yRatio, zRatio) &&
        filled(x, y + 1, z, radius, yRatio, zRatio) &&
        filled(x, y - 1, z, radius, yRatio, zRatio) &&
        filled(x, y, z + 1, radius, yRatio, zRatio) &&
        filled(x, y, z - 1, radius, yRatio, zRatio) &&
        filled(x + 1, y + 1, z, radius, yRatio, zRatio) &&
        filled(x + 1, y - 1, z, radius, yRatio, zRatio) &&
        filled(x - 1, y - 1, z, radius, yRatio, zRatio) &&
        filled(x - 1, y + 1, z, radius, yRatio, zRatio) &&
        filled(x + 1, y, z + 1, radius, yRatio, zRatio) &&
        filled(x + 1, y, z - 1, radius, yRatio, zRatio) &&
        filled(x - 1, y, z - 1, radius, yRatio, zRatio) &&
        filled(x - 1, y, z + 1, radius, yRatio, zRatio) &&
        filled(x, y + 1, z + 1, radius, yRatio, zRatio) &&
        filled(x, y - 1, z + 1, radius, yRatio, zRatio) &&
        filled(x, y - 1, z - 1, radius, yRatio, zRatio) &&
        filled(x, y + 1, z - 1, radius, yRatio, zRatio) &&
        filled(x + 1, y + 1, z + 1, radius, yRatio, zRatio) &&
        filled(x - 1, y + 1, z + 1, radius, yRatio, zRatio) &&
        filled(x + 1, y - 1, z + 1, radius, yRatio, zRatio) &&
        filled(x + 1, y + 1, z - 1, radius, yRatio, zRatio) &&
        filled(x - 1, y - 1, z + 1, radius, yRatio, zRatio) &&
        filled(x + 1, y - 1, z - 1, radius, yRatio, zRatio) &&
        filled(x - 1, y - 1, z - 1, radius, yRatio, zRatio));
}
function thinFilled(x, y, z, radius, yRatio, zRatio) {
    return filled(x, y, z, radius, yRatio, zRatio) && !(filled(x + 1, y, z, radius, yRatio, zRatio) &&
        filled(x - 1, y, z, radius, yRatio, zRatio) &&
        filled(x, y + 1, z, radius, yRatio, zRatio) &&
        filled(x, y - 1, z, radius, yRatio, zRatio) &&
        filled(x, y, z + 1, radius, yRatio, zRatio) &&
        filled(x, y, z - 1, radius, yRatio, zRatio));
}
export class Ellipsoid {
    constructor(mode, widthX, heightY, depthZ) {
        this.mode = mode;
        this.width = widthX;
        this.height = heightY;
        this.depth = depthZ;
    }
    isFilled(x, y, z) {
        x = -0.5 * (this.width - 2 * (x + 0.5));
        y = -0.5 * (this.height - 2 * (y + 0.5));
        z = -0.5 * (this.depth - 2 * (z + 0.5));
        switch (this.mode) {
            case ShapeModes.thick: {
                return fatFilled(x, y, z, (this.width / 2), (this.width / this.height), (this.width / this.depth));
            }
            case ShapeModes.thin: {
                return thinFilled(x, y, z, (this.width / 2), (this.width / this.height), (this.width / this.depth));
            }
            default: {
                return filled(x, y, z, (this.width / 2), (this.width / this.height), (this.width / this.depth));
            }
        }
    }
}
