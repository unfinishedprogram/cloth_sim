import { ThreadedSystem } from "./threadedSystem";

let size = 100;

let threadSystem = new ThreadedSystem(size * size, size * size * 2);
threadSystem.createGrid(size, size);


threadSystem.pin(0)
threadSystem.pin(50)
threadSystem.pin(99)

document.body.appendChild (threadSystem.elm);
threadSystem.start();

let step = () => {
	threadSystem.draw();
	window.requestAnimationFrame(step);
}

step();
