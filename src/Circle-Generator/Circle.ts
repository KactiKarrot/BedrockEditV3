import { ShapeModes } from "./Controller";
import { distance } from "./Math"



function filled(x: number, y: number, radius: number, ratio: number): boolean {
	return distance(x, y, ratio) <= radius;
}

function fatfilled(x: number, y: number, radius: number, ratio: number): boolean {
	return filled(x, y, radius, ratio) && !(
		filled(x + 1, y, radius, ratio) &&
		filled(x - 1, y, radius, ratio) &&
		filled(x, y + 1, radius, ratio) &&
		filled(x, y - 1, radius, ratio) &&
		filled(x + 1, y + 1, radius, ratio) &&
		filled(x + 1, y - 1, radius, ratio) &&
		filled(x - 1, y - 1, radius, ratio) &&
		filled(x - 1, y + 1, radius, ratio)
	);
}

function thinfilled(x: number, y: number, radius: number, ratio: number): boolean {
	return filled(x, y, radius, ratio) && !(
		filled(x + 1, y, radius, ratio) &&
		filled(x - 1, y, radius, ratio) &&
		filled(x, y + 1, radius, ratio) &&
		filled(x, y - 1, radius, ratio)
	);
}

export class Ellipse {
	private mode: ShapeModes;
	private width: number;
	private height: number;

	constructor(mode: ShapeModes, width: number, height: number) {
		this.mode = mode;
		this.width = width;
		this.height = height;
	}

	public isFilled(x: number, y: number): boolean {
		x = -.5 * (this.width - 2 * (x + .5));
		y = -.5 * (this.height - 2 * (y + .5));

		switch (this.mode) {
			case ShapeModes.thick: {
				return fatfilled(x, y, (this.width / 2), this.width / this.height);
			}
			case ShapeModes.thin: {
				return thinfilled(x, y, (this.width / 2), this.width / this.height);
			}
			default: {
				return filled(x, y, (this.width / 2), this.width / this.height);
			}
		}
	}
}
