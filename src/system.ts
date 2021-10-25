import Vec2 from "./vec2";
import { Constraint } from "./constraint";
import { Vertex } from "./vertex";

export class System {
	constraints:Constraint[] = [];
	vertecies:Vertex[] = [];
	elm:HTMLCanvasElement = document.createElement("canvas");
	ctx:CanvasRenderingContext2D;
	
	constructor(){
		console.log(this.elm)
		this.elm.width = 800*2;
		this.elm.height = 800*2;
		this.ctx = this.elm.getContext("2d")!;
		this.elm.addEventListener('mousedown', () => {
			this.elm.addEventListener("mousemove", this.mouseAction.bind(this));
		})
		this.elm.addEventListener('mouseup', () => {
			this.elm.removeEventListener("mousemove", this.mouseAction.bind(this));
		})
	}

	addConstraint(constraint:Constraint){
		this.constraints.push(constraint)
	}

	step(t:number){
		this.applyConstraints()
		this.applyMotion(t)
	}

	applyConstraints(){
		let i = 0, len = this.constraints.length;
		while(i<len){
			this.constraints[i].apply();
			i++;
		}
	}

	applyMotion(t:number){
		let i = 0, len = this.vertecies.length;
		while(i<len){
			this.vertecies[i].step(t);
			i++;
		}
	}

	addVert(vert:Vertex){
		this.vertecies.push(vert);
	}

	draw = () => {
		this.ctx.clearRect(-this.elm.width, -this.elm.width, this.elm.width*4, this.elm.height*4)

		this.ctx.beginPath();

		this.constraints.forEach(c => {
			this.ctx.moveTo(c.a.pos.x, c.a.pos.y)
			this.ctx.lineTo(c.b.pos.x, c.b.pos.y)
		})

		this.ctx.stroke();
	}


	mouseAction(e:MouseEvent){
		let x = e.clientX *1.5
		let y = e.clientY *1.5
		let i = 0, len = this.constraints.length;
		let mid = new Vec2();
		while(i<len){
			mid.set(this.constraints[i].a.pos);
			mid.sub(this.constraints[i].b.pos);
			mid.setMultiplyScalor(0.5);
			mid.setAdd(this.constraints[i].a.pos);

			let xdist = Math.abs(mid.x-x);
			let ydist = Math.abs(mid.y-y);

			if(ydist + xdist < 10){
				this.constraints.splice(i, 1);
				len -= 1;
			}
			i++;
		}
	}
}