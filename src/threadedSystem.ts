import FVec2 from "./fVec2";
import { Vertex } from "./vertex";
import ClothWorker from "worker-loader!./worker";
const G = -0.05;

export class ThreadedSystem {
	elm:HTMLCanvasElement = document.createElement("canvas");
	ctx:CanvasRenderingContext2D;

	constraints_buffer: SharedArrayBuffer;
	verticies_buffer: SharedArrayBuffer;
	pinned_buffer: SharedArrayBuffer;

	coms_buffer: SharedArrayBuffer;

	constraint_settings = {
		len:10,
		drag:0.999
	}

	constraints: Int32Array;
	verticies: Float32Array;
	pinned: Int8Array;
	coms: BigInt64Array;

	thread_count:number;

	workers: Worker[] = [];

	constraints_count = 0;
	verticies_count = 0;
	vert_step_size = 4;
	
	constructor(numVerts:number, numConstraints:number) {	
		// Getting the thread count for optomal performance
		this.thread_count = navigator.hardwareConcurrency
		this.thread_count = 4;
		console.log(this.thread_count);

		this.coms_buffer = new SharedArrayBuffer(16);
		this.coms = new BigInt64Array(this.coms_buffer);

		// Initalizing buffers
		this.constraints_buffer = new SharedArrayBuffer(numConstraints * 8)
		this.verticies_buffer = new SharedArrayBuffer(numVerts * 16)
		this.pinned_buffer = new SharedArrayBuffer(numVerts)

		// Setting up view for buffers
		this.constraints = new Int32Array(this.constraints_buffer)
		this.verticies = new Float32Array(this.verticies_buffer)
		this.pinned = new Int8Array(this.pinned_buffer)

		this.elm.width = 800*2;
		this.elm.height = 800*2;
		this.ctx = this.elm.getContext("2d")!;
	}

	start() {
		let buffers = [
			this.coms_buffer,
			this.constraints_buffer,
			this.verticies_buffer,
			this.pinned_buffer
		];

		for(let i = 0; i < this.thread_count; i++) {
			this.workers.push(new ClothWorker());
			let vper_thread = Math.floor(this.verticies_count/this.thread_count);
			let cper_thread = Math.floor(this.constraints_count/this.thread_count);
			
			let message = {
				buffers: buffers,
				vmin: i * vper_thread,
				vmax: i == this.thread_count - 1 ? this.verticies_count : (i+1) * vper_thread,
				cmin: i * cper_thread,
				cmax: i == this.thread_count - 1 ? this.constraints_count : (i+1) * cper_thread,
				threads:this.thread_count
			};
			this.workers[i].postMessage(message); 
		}
	}

	addVert(vert:Vertex):number {
		let i = this.vert_step_size * this.verticies_count;
		this.verticies.set([
				vert.pos.x,
				vert.pos.y,
				vert.vol.x,
				vert.vol.y
			], i)
		return this.verticies_count++;
	}

	addConstraint(a:number, b:number) {
		let i = 2 * this.constraints_count++;
		this.constraints[ i ] = a;
		this.constraints[i+1] = b;
	}

	stepVertex(index:number){
		let vert = this.getVertex(index);
		let i = index * this.vert_step_size;

		// Adding the velocity to position
		if(this.pinned[index] == 1) return;
		this.verticies[ i ] = vert.px + vert.vx;
		this.verticies[i+1] = vert.py + vert.vy;
		this.verticies[i+2] = vert.vx;
		this.verticies[i+3] = vert.vy + 0.005;
	}

	pin(index:number){
		Atomics.store(this.pinned, index, 1)
	}

	unpin(index:number){
		Atomics.store(this.pinned, index, 0)
	}

	getVertex(index:number) {
		const i = index * this.vert_step_size;
		return {
			px: this.verticies[i+0],
			py: this.verticies[i+1],
			vx: this.verticies[i+2],
			vy: this.verticies[i+3]
		}
	}

	constrain(_a:number, _b:number) {
		let a = this.getVertex(_a);
		let b = this.getVertex(_b);

		let i_a = _a * this.vert_step_size;
		let i_b = _b * this.vert_step_size;

		let n = FVec2.sub(a.px, a.py, b.px, b.py);
		let mag = FVec2.magnitude(n.x, n.y);
		n = FVec2.multiplyScalor(n.x, n.y,
			 (0.25 / mag) * Math.max((mag - this.constraint_settings.len), 0));
		
		this.verticies[i_a+2] = (a.vx - n.x) * this.constraint_settings.drag;
		this.verticies[i_a+3] = (a.vy - n.y) * this.constraint_settings.drag;
		this.verticies[i_b+2] = (b.vx + n.x) * this.constraint_settings.drag;
		this.verticies[i_b+3] = (b.vy + n.y) * this.constraint_settings.drag;
	}

	applyConstraint(index:number){
		let i = index * 2;
		this.constrain(this.constraints[i], this.constraints[i+1]);
	}

	draw = () => {
		this.ctx.clearRect(-this.elm.width, -this.elm.width, this.elm.width*4, this.elm.height*4)
		this.ctx.beginPath();
		for( let i = 0; i < this.constraints_count * 2; i += 2 ) {
			let x1 = this.verticies[this.constraints[ i ] * this.vert_step_size ]
			let y1 = this.verticies[this.constraints[ i ] * this.vert_step_size + 1]
			let x2 = this.verticies[this.constraints[i + 1] * this.vert_step_size ]
			let y2 = this.verticies[this.constraints[i + 1] * this.vert_step_size + 1]

			this.ctx.moveTo(x1, y1)
			this.ctx.lineTo(x2, y2)
		}
		this.ctx.stroke();
	}
}