import FVec2 from "./fVec2";

const ctx: Worker = self as any;
const acc = 100000;

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
	constraints: Int32Array;
	verticies: Int32Array;
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
		this.constraints = new Int32Array(buffers[1])
		this.verticies = new Int32Array(buffers[2])
		this.pinned = new Int8Array(buffers[3])
		this.thread_count = threads;

		this.vmin = vmin;
		this.vmax = vmax;
		this.cmin = cmin;
		this.cmax = cmax;
	}

	constrainSync(_a:number, _b:number) {
		let i_a = _a * this.vert_step_size;
		let i_b = _b * this.vert_step_size;

		let n = FVec2.sub (
			Atomics.load(this.verticies,i_a) / acc,
			Atomics.load(this.verticies,i_a+1) / acc,
			Atomics.load(this.verticies,i_b) / acc,
			Atomics.load(this.verticies,i_b+1) / acc
		);
			
		let mag = FVec2.magnitude(n.x, n.y);

		n = FVec2.multiplyScalor(n.x, n.y, (0.01) * Math.max((mag - this.constraint_settings.len), 0));

		Atomics.sub(this.verticies, i_a+2, n.x * acc);
		Atomics.sub(this.verticies, i_a+3, n.y * acc);

		Atomics.add(this.verticies, i_b+2, n.x * acc);
		Atomics.add(this.verticies, i_b+3, n.y * acc);
	}

	constrainAsync(_a:number, _b:number) {
		let i_a = _a * this.vert_step_size;
		let i_b = _b * this.vert_step_size;

		let nx = (this.verticies[i_a+0] - this.verticies[i_b+0]) /  acc;
		let ny = (this.verticies[i_a+1] - this.verticies[i_b+1]) /  acc;

		// let n = FVec2.sub (
		// 	this.verticies[i_a+0] / acc,
		// 	this.verticies[i_a+1] / acc,
		// 	this.verticies[i_b+0] / acc,
		// 	this.verticies[i_b+1] / acc
		// );


		
		let mag = FVec2.magnitude(nx, ny);

		let mult = (0.01) * Math.max((mag - this.constraint_settings.len));

		nx *= mult;
		ny *= mult;

		// let n = FVec2.multiplyScalor(nx, ny, (0.01) * Math.max((mag - this.constraint_settings.len), 0));

		this.verticies[i_a+2] -= nx * acc;
		this.verticies[i_a+3] -= ny * acc;
		this.verticies[i_b+2] += nx * acc;
		this.verticies[i_b+3] += ny * acc;
	}


	constrain(_a:number, _b:number) {
		if(
			_a >= this.vmin && 
			_a < this.vmax &&
			_b >= this.vmin &&
			_b < this.vmax
		){
			this.constrainAsync(_a, _b)
			// this.constrainSync(_a, _b)

		} else{
			// this.constrainSync(_a, _b);

			this.constrainAsync(_a, _b)
		}
	}

	applyConstraint(index:number){
		let i = index * 2;

		this.constrainAsync(this.constraints[i], this.constraints[i+1]);
	}

	stepVertex(index:number){
		let i = index * this.vert_step_size;

		if(this.pinned[index] == 1) return;
		this.verticies[i] += this.verticies[i+2];
		this.verticies[i+1] += this.verticies[i+3];
		this.verticies[i+2] *= this.constraint_settings.drag;
		this.verticies[i+3] = (this.verticies[i+3] + 0.005 * acc) * this.constraint_settings.drag;
	}

	stepConstraints() {
		for(let i = this.cmin; i < this.cmax; i++){
			this.applyConstraint(i);
		}
	}

	stepVerts() {
		for(let i = this.vmin; i < this.vmax; i++){
			this.stepVertex(i);
		}
	}

	stepComponents() {
		if(this.stepNum == 0) {
			this.stepConstraints();
			this.stepNum = 1;
		} else {
			this.stepVerts();
			this.stepNum = 0;
		}
	}

	alertSiblings(){
		let notified = 1;
		Atomics.store(this.coms, 0, BigInt(0));
		while(notified < this.thread_count) {
			let not = Atomics.notify(this.coms, 1);
			notified += not;
		}
	}

	step() {
		this.stepComponents();
		
		if(Atomics.add(this.coms, 0, BigInt(1)) < BigInt(this.thread_count-1)){
			Atomics.wait(this.coms, 1 + this.stepNum, BigInt(0));
		} else {
			Atomics.store(this.coms, 0, BigInt(0));
			let not = 0;
			while(not < 10) not+=Atomics.notify(this.coms, 1 + this.stepNum);
		}
	}
	
	start() {
		console.log("Starting loop")
		while(true) {
			this.step();
		}
	}
}

ctx.onmessage = (evt:_Event) => {
	console.log("receved message")
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
