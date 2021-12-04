import { ThreadedSystem } from "./threadedSystem";

let threadSystem = new ThreadedSystem(200 * 200, 200 * 200 * 2);
threadSystem.createGrid(200, 200);

threadSystem.pin(0)
threadSystem.pin(49)
threadSystem.pin(99)
threadSystem.pin(149)
threadSystem.pin(199)

document.body.appendChild (threadSystem.elm);

threadSystem.start();

let step = () => {
	threadSystem.draw();
	window.requestAnimationFrame(step);
}

step();
