import Vec2 from "../src/vec2";
import { Vertex } from "./vertex";
import ClothWorker from "worker-loader!./worker";
import FVec2 from "../src/fVec2";
import PerformanceMetrics from "./performanceMetrics";


export class ThreadedSystem {

	elm:HTMLCanvasElement = document.createElement("canvas");
	ctx:CanvasRenderingContext2D;


	ips:HTMLElement = document.querySelector("#ips")!;

	constraints_buffer: SharedArrayBuffer;
	verticies_buffer: SharedArrayBuffer;
	pinned_buffer: SharedArrayBuffer;

	coms_buffer: SharedArrayBuffer;

	constraints: Uint16Array;
	verticies: Float64Array;
	pinned: Int8Array;
	coms: BigInt64Array;

	mousex = 100000;
	mousey = 100000;

	thread_count:number;

	workers: Worker[] = [];

	constraints_count = 0;
	verticies_count = 0;
	vert_step_size = 4;
	perf:PerformanceMetrics;
	altDown = false;
	mouseDeltaX = 0;
	mouseDeltaY = 0;
	heldVerts: number[] = []
	holding:boolean = false;
	constructor(numVerts:number, numConstraints:number) {	
		this.perf = new PerformanceMetrics();

		document.body.appendChild(this.perf.elm);

		// Getting the thread count for optomal performance
		this.thread_count = navigator.hardwareConcurrency
		this.thread_count = 16;
		this.perf.setMetric("thread_count", this.thread_count);
		// this.thread_count = 4;

		this.coms_buffer = new SharedArrayBuffer(32);
		this.coms = new BigInt64Array(this.coms_buffer);

		// Initalizing buffers
		this.constraints_buffer = new SharedArrayBuffer(numConstraints * 8)
		this.verticies_buffer = new SharedArrayBuffer(numVerts * 8 * 4)
		this.pinned_buffer = new SharedArrayBuffer(numVerts)

		// Setting up view for buffers
		this.constraints = new Uint16Array(this.constraints_buffer)
		this.verticies = new Float64Array(this.verticies_buffer)
		this.pinned = new Int8Array(this.pinned_buffer)

		this.elm.width = 1200;
		this.elm.height = 1200;
		this.ctx = this.elm.getContext("2d")!;		
		this.ctx.scale(0.5, 0.5);

		document.addEventListener("keydown", (e) => {
			if(e.code == "AltLeft"){
				// this.startHold();
			}
		})

		document.addEventListener("keyup", (e) => {
			if(e.code == "AltLeft"){
				this.endHold();
			}
		})

		this.elm.addEventListener("mousemove", (e) => {
			this.mousex = e.offsetX;
			this.mousey = e.offsetY;
			this.altDown = e.altKey;
			this.mouseDeltaX = e.movementX;
			this.mouseDeltaY = e.movementY;
			this.hold();
		})
		
		let ips_buff = new Array(10);

		let t = performance.now();
		setInterval(() => {
			let delta = performance.now()-t;
			t = performance.now();

			ips_buff.shift();
			ips_buff.push(Number(this.coms[3]) * (1000/delta))

			const sum = ips_buff.reduce((a, n) => a+n, 0) / ips_buff.length;
			this.perf.setMetric("ips", Number(this.coms[3]) * (1000/delta));
			this.perf.setMetric("ips10", sum)
			this.coms[3] = BigInt(0);
		}, 500)
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

	pin(index:number){ 
		Atomics.store(this.pinned, index, 1)
	}

	unpin(index:number){
		Atomics.store(this.pinned, index, 0)
	}


	hold(){
		this.heldVerts.forEach(i => {
			this.verticies[i * this.vert_step_size] += this.mouseDeltaX * 2;
			this.verticies[i * this.vert_step_size + 1] += this.mouseDeltaY * 2;
		})
	}

	startHold(){
		if(this.holding == true) return;

		for( let i = 0; i < this.verticies_count; i++) {
			let x = this.verticies[i * this.vert_step_size];
			let y = this.verticies[i * this.vert_step_size + 1];
			let d = FVec2.magnitude((x-this.mousex*2), (y-this.mousey*2));
			if(d < 50){
				this.pin(i)
				this.heldVerts.push(i);
				this.verticies[i * this.vert_step_size + 2] = 0;
				this.verticies[i * this.vert_step_size + 3] = 0;
			}
		}
		this.holding = true;
	}

	endHold() {
		this.heldVerts.forEach(i => {
			// this.unpin(i);/
		})
		this.heldVerts = [];
		this.holding = false;
	}

	draw = () => {
		let start = performance.now();

		this.ctx.clearRect(0, 0, this.elm.width*2, this.elm.height*2)
		this.ctx.beginPath();
		
		const vstep = this.vert_step_size;
		const c_width = this.elm.width*2;
		const c_height = this.elm.height*2;

		for( let i = 0; i < this.constraints_count * 2; i += 2 ) {
			if(this.constraints[i]==-1) continue;
			if(this.constraints[i+1]==-1) continue;

			let x1 = this.verticies[this.constraints[ i ] * vstep ];
			let x2 = this.verticies[this.constraints[i+1] * vstep ];

			let y1 = this.verticies[this.constraints[ i ] * vstep + 1];
			let y2 = this.verticies[this.constraints[i+1] * vstep + 1];


			if((x1 < 0 && x2 < 0) || (y1 < 0 && y2 < 0)) continue;
			if((x1 > c_width && x2 > c_width) || (y1 > c_height && y2 > c_height)) continue;

			this.ctx.moveTo(x1, y1) 
			this.ctx.lineTo(x2, y2)

			let x0 = this.mousex;
			let y0 = this.mousey;

			let d = FVec2.magnitude((x1-x0*2), (y1-y0*2));

			if(d < 20 && this.altDown) {
				// this.verticies[this.constraints[ i ] * vstep + 3] = this.mouseDeltaY;
				// this.verticies[this.constraints[ i ] * vstep + 2] = this.mouseDeltaX;
				this.constraints[i] = -1;
				this.constraints[i+1] = -1;
			}
		}

		this.ctx.stroke();
		this.perf.setMetric("draw_fps", 1000/(performance.now() - start));
	}
}
