import FVec2 from "./fVec2";

const ctx: Worker = self as any;

interface _Event extends MessageEvent {
	data: {
		buffers:SharedArrayBuffer[],
		vmin:number,
		vmax:number,
		cmin:number,
		cmax:number,
		threads:number
	}
}

class SystemThread {
	stepNum = 0;
	constraints: Float32Array;
	verticies: Float32Array;
	pinned: Int8Array;
	coms: BigInt64Array;

	thread_count:number;
	
	vmin: number;
	vmax: number;
	cmin: number;
	cmax: number;
	
	constraint_settings = {
		len:10,
		drag:0.998
	}

	vert_step_size = 4;

	constructor(buffers:ArrayBuffer[], vmin:number, vmax:number, cmin:number, cmax:number, threads:number) {
		this.coms = new BigInt64Array(buffers[0])
		this.constraints = new Float32Array(buffers[1])
		this.verticies = new Float32Array(buffers[2])
		this.pinned = new Int8Array(buffers[3])
		this.thread_count = threads;

		this.vmin = vmin;
		this.vmax = vmax;
		this.cmin = cmin;
		this.cmax = cmax;
	}

	constrain(_a:number, _b:number) {
		if(_a==-1) return;
		if(_b==-1) return;

		let i_a = _a * this.vert_step_size;
		let i_b = _b * this.vert_step_size;

		let nx = (this.verticies[i_a+0] - this.verticies[i_b+0]);
		let ny = (this.verticies[i_a+1] - this.verticies[i_b+1]);

		// 10 - Constraint settings length, hard coded for performance
		let mult = Math.log10(((0.01) * Math.max(FVec2.magnitude(nx, ny) - 10)) + 1);

		nx *= mult;
		ny *= mult;

		// let n = FVec2.multiplyScalor(nx, ny, (0.01) * Math.max((mag - this.constraint_settings.len), 0));

		this.verticies[i_a+2] -= nx;
		this.verticies[i_a+3] -= ny;
		this.verticies[i_b+2] += nx;
		this.verticies[i_b+3] += ny;
	}

	stepVertex(index:number){
		let i = index * this.vert_step_size;

		if(this.pinned[index] == 1) return;
		
		this.verticies[i] += this.verticies[i+2]; // Velocity
		this.verticies[i+1] += this.verticies[i+3]; // Velocity
		this.verticies[i+2] *= 0.998; // Drag
		this.verticies[i+3] += 0.005; // Gravity
		this.verticies[i+3] *= 0.998; // Drag
	}

	stepConstraints() {
		for(let i = this.cmin; i < this.cmax; i++){
			this.constrain(this.constraints[i*2], this.constraints[i*2+1]);
		}
	}

	stepVerts() {
		for(let i = this.vmin; i < this.vmax; i++){
			this.stepVertex(i);
		}
	}

	stepComponents() {
		this.stepNum ? this.stepConstraints() : this.stepVerts();
		this.stepNum = this.stepNum ? 0 : 1;
	}

	step() {
		this.stepComponents();

		if(Atomics.add(this.coms, 0, BigInt(1)) < BigInt(this.thread_count-1)){
			Atomics.wait(this.coms, 1 + this.stepNum, BigInt(0));
		} else {
			Atomics.store(this.coms, 0, BigInt(0));
			let notified = 1;
			while(notified < this.thread_count) notified += Atomics.notify(this.coms, 1 + this.stepNum);
			this.coms[3]++; // Tracking iteration count
		}
	}
	
	start() {
		while(true) {
			this.step();
		}
	}
}

ctx.onmessage = (evt:_Event) => {
	let thread = new SystemThread (
		evt.data.buffers,
		evt.data.vmin,
		evt.data.vmax,
		evt.data.cmin,
		evt.data.cmax,
		evt.data.threads
	);
	thread.start();
}
