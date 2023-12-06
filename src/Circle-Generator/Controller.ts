import { Ellipse } from "./Circle";
import { Cone } from "./Cone";
import { Dome } from "./Dome";
import { Pyramid } from "./Pyramid";
import { Ellipsoid } from "./Sphere";

export enum ShapeModes {
	thick = 'thick',
	thin = 'thin',
	filled = 'filled',
}

export function generateEllipse(width: number, height: number, mode: ShapeModes): boolean[][] {
	let ellipse = new Ellipse(mode, width, height);

	let mat = Array(width).fill(null).map(
		() => Array(height).fill(null)
	);
	
	for (let x = 0; x < mat.length; x++) {
		for (let y = 0; y < mat[x].length; y++) {
			mat[x][y] = ellipse.isFilled(x, y);
		}
	}

	return mat
}

export function generateEllipsoid(width: number, height: number, depth: number, mode: ShapeModes): boolean[][][] {
	let ellipsoid = new Ellipsoid(mode, width, height, depth);

	let mat = Array(width).fill(null).map(
		() => Array(height).fill(null).map(
			() => Array(depth).fill(null)
		)
	);
	
	for (let x = 0; x < mat.length; x++) {
		for (let y = 0; y < mat[x].length; y++) {
			for (let z = 0; z < mat[x][y].length; z++) {
				mat[x][y][z] = ellipsoid.isFilled(x, y, z);
			}
		}
	}

	return mat
}

export function generateDome(width: number, height: number, depth: number, mode: ShapeModes): boolean[][][] {
	let dome = new Dome(mode, width, height, depth);

	let mat = Array(width).fill(null).map(
		() => Array(height).fill(null).map(
			() => Array(depth).fill(null)
		)
	);
	
	for (let x = 0; x < mat.length; x++) {
		for (let y = 0; y < mat[x].length; y++) {
			for (let z = 0; z < mat[x][y].length; z++) {
				mat[x][y][z] = dome.isFilled(x, y, z);
			}
		}
	}

	return mat
}

export function generatePyramid(width: number, height: number, depth: number, mode: ShapeModes): boolean[][][] {
	let pyramid = new Pyramid(mode, width, height, depth);

	let mat = Array(width).fill(null).map(
		() => Array(height).fill(null).map(
			() => Array(depth).fill(null)
		)
	);
	
	for (let x = 0; x < mat.length; x++) {
		for (let y = 0; y < mat[x].length; y++) {
			for (let z = 0; z < mat[x][y].length; z++) {
				mat[x][y][z] = pyramid.isFilled(x, y, z);
			}
		}
	}

	return mat
}

export function generateCone(width: number, height: number, depth: number, mode: ShapeModes): boolean[][][] {
	

	let mat = Array(width).fill(null).map(
		() => Array(height).fill(null).map(
			() => Array(depth).fill(null)
		)
	);
	
	for (let x = 0; x < mat.length; x++) {
		for (let y = 0; y < mat[x].length; y++) {
			for (let z = 0; z < mat[x][y].length; z++) {
				let cone = new Cone(mode, width, height, depth);
				mat[x][y][z] = cone.isFilled(x, y, z);
			}
		}
	}

	return mat
}