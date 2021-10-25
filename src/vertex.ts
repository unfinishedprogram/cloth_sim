import Vec2 from "./vec2";

const G = new Vec2(0, 0.005);

export class Vertex {
	pos:Vec2;
	vol:Vec2 = new Vec2(0, 0);
	pinned:boolean = false;

	constructor(pos:Vec2){
		this.pos = pos;
	}
	
	step(t:number){
		if(this.pinned) {
			return;
		}
		this.pos.setAdd(this.vol)
		this.vol.setAdd(G);
	}
	pin(){
		this.pinned = true;
	}
	unpin(){
		this.pinned = false;
	}
}