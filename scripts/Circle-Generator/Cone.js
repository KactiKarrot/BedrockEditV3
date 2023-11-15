import { Ellipse } from "./Circle";
export class Cone {
    constructor(mode, widthX, heightY, depthZ) {
        this.mode = mode;
        this.width = widthX;
        this.height = heightY;
        this.depth = depthZ;
    }
    isFilled(x, y, z) {
        let percent = (this.height - y) / this.height;
        let circle = new Ellipse(this.mode, Math.ceil(percent * this.width), Math.ceil(percent * this.depth));
        return circle.isFilled(x - y / 2, z - y / 2);
    }
}
