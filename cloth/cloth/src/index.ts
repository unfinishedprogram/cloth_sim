import { Constraint } from "./constraint";
import Vec2 from "./vec2";
import { Vertex } from "./vertex";
import { System } from "./system";

let mySystem = new System();

function makeCloth(w:number, h:number){
	for(let i = 0; i < h; i++) {
		for(let j = 0; j < w; j++) {
			mySystem.addVert(new Vertex(new Vec2(j * 10, i * 10)))
			if(j > 0 ) {
				mySystem.addConstraint(new Constraint(mySystem.vertecies[i * w + j], mySystem.vertecies[i * w + j -1], 10, 2))
			}
			if(i > 0 ) {
				mySystem.addConstraint(new Constraint(mySystem.vertecies[(i * w) + j], mySystem.vertecies[(i - 1) * w + j], 10, 2))
			}
		}
	}
}

makeCloth(100, 100)

mySystem.vertecies[0].pin();
mySystem.vertecies[49].pin();
mySystem.vertecies[99].pin();

document.body.appendChild (mySystem.elm);

mySystem.draw();
let steps = 0;
let step = setInterval(() => {
	const t0 = performance.now();
	while(performance.now() - t0 < 10){
		steps++;
		mySystem.step(1);
	}
}, 10)

setInterval(() => {
	console.log(steps);
	steps = 0;
}, 1000)

let draw = setInterval(() => {
	mySystem.draw();
}, 8)