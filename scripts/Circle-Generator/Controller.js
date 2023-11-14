import { Ellipse } from "./Circle";
import { Ellipsoid } from "./Sphere";
export var ShapeModes;
(function (ShapeModes) {
    ShapeModes["thick"] = "thick";
    ShapeModes["thin"] = "thin";
    ShapeModes["filled"] = "filled";
})(ShapeModes || (ShapeModes = {}));
export function generateEllipse(width, height, mode) {
    let ellipse = new Ellipse(mode, width, height);
    let mat = Array(width).fill(null).map(() => Array(height).fill(null));
    for (let x = 0; x < mat.length; x++) {
        for (let y = 0; y < mat[x].length; y++) {
            mat[x][y] = ellipse.isFilled(x, y);
        }
    }
    return mat;
}
export function generateEllipsoid(width, height, depth, mode) {
    let ellipsoid = new Ellipsoid(mode, width, height, depth);
    let mat = Array(width).fill(null).map(() => Array(height).fill(null).map(() => Array(depth).fill(null)));
    for (let x = 0; x < mat.length; x++) {
        for (let y = 0; y < mat[x].length; y++) {
            for (let z = 0; z < mat[x][y].length; z++) {
                mat[x][y][z] = ellipsoid.isFilled(x, y, z);
            }
        }
    }
    return mat;
}
