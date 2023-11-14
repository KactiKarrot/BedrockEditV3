export function distance(x, y, ratio) {
    return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2));
}
export function distance3D(x, y, z, yRatio, zRatio) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y * yRatio, 2) + Math.pow(z * zRatio, 2));
}
export function xor(left, right) {
    return left ? !right : right;
}
