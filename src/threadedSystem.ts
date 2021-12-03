import Vec2 from "../src/vec2";
import { Vertex } from "./vertex";
import ClothWorker from "worker-loader!./worker";
const G = -0.05;
const acc = 100000;

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
	verticies: Int32Array;
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

		this.coms_buffer = new SharedArrayBuffer(24);
		this.coms = new BigInt64Array(this.coms_buffer);

		// Initalizing buffers
		this.constraints_buffer = new SharedArrayBuffer(numConstraints * 8)
		this.verticies_buffer = new SharedArrayBuffer(numVerts * 16)
		this.pinned_buffer = new SharedArrayBuffer(numVerts)

		// Setting up view for buffers
		this.constraints = new Int32Array(this.constraints_buffer)
		this.verticies = new Int32Array(this.verticies_buffer)
		this.pinned = new Int8Array(this.pinned_buffer)

		this.elm.width = 1200;
		this.elm.height = 1200;
		this.ctx = this.elm.getContext("2d")!;
		this.ctx.globalAlpha
	}

	createGrid(w:number, h:number) {
		for(let i = 0; i < h; i++) {
			for(let j = 0; j < w; j++) {
				this.addVert(new Vertex(new Vec2(j * 10, i * 10)))
				if(j > 0 ) {
					this.addConstraint(i * w + j, i * w + j -1)
				}
				if(i > 0 ) {
					this.addConstraint((i * w) + j, (i - 1) * w + j)
				}
			}
		}
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
				vert.pos.x*acc,
				vert.pos.y*acc,
				vert.vol.x*acc,
				vert.vol.y*acc
			], i)
		return this.verticies_count++;
	}

	addConstraint(a:number, b:number) {
		let i = 2 * this.constraints_count++;
		this.constraints[ i ] = a;
		this.constraints[i+1] = b;
	}

	pin(index:number){ 
		Atomics.store(this.pinned, index, 1)
	}

	unpin(index:number){
		Atomics.store(this.pinned, index, 0)
	}

	draw = () => {
		let now = performance.now();
		this.ctx.clearRect(0, 0, this.elm.width, this.elm.height)
		this.ctx.beginPath();

		for( let i = 0; i < this.constraints_count * 2; i += 2 ) {
			let m = 1/acc;

			let x1 = this.verticies[this.constraints[ i ] * this.vert_step_size ] * m;
			let y1 = this.verticies[this.constraints[ i ] * this.vert_step_size + 1] * m;
			let x2 = this.verticies[this.constraints[i+1] * this.vert_step_size ] * m;
			let y2 = this.verticies[this.constraints[i+1] * this.vert_step_size + 1] * m;

			this.ctx.moveTo(x1*0.5, y1*0.5) 
			this.ctx.lineTo(x2*0.5, y2*0.5)
		}
		this.ctx.stroke();
		console.log(performance.now()-now);
	}
}