export default class Vec2 {
	x: number; 
	y: number;

	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}
	
	static copy = (v: Vec2) => new Vec2(v.x, v.y);
	copy = () => new Vec2(this.x, this.y);
	static dotProduct = (v1:Vec2, v2:Vec2) => (v1.x * v2.x + v1.y * v2.y);
	static dist = (v1:Vec2, v2:Vec2) => new Vec2(v1.x-v2.x, v1.y-v2.y).magnitude();
	magnitude = () => Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	multiplyScalor = (s:number) => new Vec2(this.x * s, this.y * s);
	add = (v:Vec2) => new Vec2(this.x + v.x, this.y + v.y);
	sub = (v:Vec2) => new Vec2(this.x - v.x, this.y - v.y);
	normalize = () => this.multiplyScalor(1 / this.magnitude());
	toAngle = (v = this.normalize()) => Math.atan2(v.x, v.y)
	rotateByVec = (vec:Vec2) => this.rotate(vec.toAngle());

	rotate = (a:number) => {
		const sina = Math.sin(a);
		const cosa = Math.cos(a);
		const _x = this.x * cosa - this.y * sina;
		const _y = this.x * sina + this.y * cosa;
		return new Vec2(_x, _y);
	} 

	setMultiplyScalor(s:number):void{
		this.x = this.x * s;
		this.y = this.y * s;
	}

	setAdd (v:Vec2) {
		this.x += v.x;
		this.y += v.y;
	}
	setSub (v:Vec2){
		this.x -= v.x;
		this.y -= v.y;
	}

	setNormalize(){
		this.setMultiplyScalor(1 / this.magnitude());
	} 

	set(v:Vec2){
		this.x = v.x;
		this.y = v.y;
	}
}