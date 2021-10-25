import { Constraint } from "./constraint";
import Vec2 from "./vec2";
import { Vertex } from "./vertex";
import { System } from "./system";
import { ThreadedSystem } from "./threadedSystem";

let mySystem = new System();
let threadSystem = new ThreadedSystem(100*100, 100*200);

function makeCloth(w:number, h:number) {
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

function makeClothThreaded (w:number, h:number) {
	for(let i = 0; i < h; i++) {
		for(let j = 0; j < w; j++) {
			threadSystem.addVert(new Vertex(new Vec2(j * 10, i * 10)))
			if(j > 0 ) {
				threadSystem.addConstraint(i * w + j, i * w + j -1)
			}
			if(i > 0 ) {
				threadSystem.addConstraint((i * w) + j, (i - 1) * w + j)
			}
		}
	}
}


makeClothThreaded(100, 100)

// console.log(threadSystem.verticies_count)
// console.log(threadSystem.constraints_count)

// mySystem.vertecies[0].pin();
// mySystem.vertecies[49].pin();
// mySystem.vertecies[99].pin();

threadSystem.pin(0)
threadSystem.pin(24)
threadSystem.pin(49)
threadSystem.pin(99)

document.body.appendChild (threadSystem.elm);


// mySystem.draw();

// let steps = 0;
// let step = setInterval(() => {
// 	const t0 = performance.now();
// 	while(performance.now() - t0 < 10){
// 		steps++;
// 		mySystem.step(1);
// 	}
// }, 10)

// setInterval(() => {
// 	console.log(steps);
// 	steps = 0;
// }, 1000)

// let draw = setInterval(() => {
// 	mySystem.draw();
// }, 8)


threadSystem.start();

let draw = setInterval(() => {
	threadSystem.draw();
}, 16)