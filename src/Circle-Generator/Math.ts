export function distance(x: number, y: number, ratio: number): number {
	return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2));
}

export function distance3D(x: number, y: number, z: number, yRatio: number, zRatio: number): number {
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y * yRatio, 2) + Math.pow(z * zRatio, 2));
}

export function xor(left: boolean, right: boolean): boolean {
	return left ? !right : right;
}
