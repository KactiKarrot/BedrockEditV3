import { ShapeModes } from "./Controller";
import { distance3D } from "./Math";
import { Ellipse } from "./Circle"

export class Cone {
    private mode: ShapeModes;
    private width: number;
    private depth: number;
    private height: number;

    constructor(mode: ShapeModes, widthX: number, heightY: number, depthZ: number) {
        this.mode = mode;
        this.width = widthX;
        this.height = heightY;
        this.depth = depthZ;
    }

    public isFilled(x: number, y: number, z: number) {
        let percent = (this.height - y) / this.height;
        let circle = new Ellipse(this.mode, Math.ceil(percent * this.width), Math.ceil(percent * this.depth));

        return circle.isFilled(x - y / 2, z - y / 2);
    }
}