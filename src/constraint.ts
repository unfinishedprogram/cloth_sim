import Vec2 from "./vec2";
import { Vertex } from "./vertex";
let drag = 0.999;

export class Constraint {
	a: Vertex;
	b: Vertex;
	len: number;
	rigidity: number;
	norm: Vec2 = new Vec2(0, 0);
	constructor(a: Vertex, b: Vertex, len: number, rigidity: number) {
		this.a = a;
		this.b = b;
		this.len = len;
		this.rigidity = rigidity;
	}

	apply() {
		this.norm.set(this.a.pos);
		this.norm.setSub(this.b.pos);
		let mag = this.norm.magnitude();

		this.norm.setMultiplyScalor(0.25 / mag * Math.max((mag - this.len), 0));

		this.a.vol.setSub(this.norm);
		this.b.vol.setAdd(this.norm);

		this.a.vol.setMultiplyScalor(drag)
		this.a.vol.setMultiplyScalor(drag)
	}
}
