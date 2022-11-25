type V2 = {
	x: number,
	y: number
}

export default class FVec2 {
	static dotProduct(
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): number {
		return (x1 * x2 + y1 * y2);
	}

	static magnitude(x: number, y: number): number {
		return (x ** 2 + y ** 2) ** 0.5;
	}

	static multiplyScalor(x: number, y: number, s: number): V2 {
		return {
			x: x * s,
			y: y * s
		}
	}

	static add(x1: number, y1: number, x2: number, y2: number): V2 {
		return {
			x: x1 + x2,
			y: y1 + y2
		}
	}

	static sub(x1: number, y1: number, x2: number, y2: number): V2 {
		return {
			x: x1 - x2,
			y: y1 - y2
		}
	}
}