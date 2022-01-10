/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ts-loader/index.js!./src/worker.ts":
/*!*********************************************************!*\
  !*** ./node_modules/ts-loader/index.js!./src/worker.ts ***!
  \*********************************************************/
/***/ (() => {

eval("\nconst ctx = self;\nconst BIG_ZERO = BigInt(0);\nconst BIG_ONE = BigInt(1);\nclass SystemThread {\n    constructor(buffers, vmin, vmax, cmin, cmax, threads) {\n        this.stepNum = 0;\n        this.constraint_settings = {\n            len: 10,\n            drag: 0.998\n        };\n        this.vert_step_size = 4;\n        this.coms = new BigInt64Array(buffers[0]);\n        this.constraints = new Uint16Array(buffers[1]);\n        this.verticies = new Float64Array(buffers[2]);\n        this.pinned = new Int8Array(buffers[3]);\n        this.thread_count = threads;\n        this.vmin = vmin;\n        this.vmax = vmax;\n        this.cmin = cmin;\n        this.cmax = cmax;\n    }\n    constrain(_a, _b) {\n        if (_a == _b)\n            return;\n        let i_a = _a * this.vert_step_size;\n        let i_b = _b * this.vert_step_size;\n        let nx = (this.verticies[i_a + 0] - this.verticies[i_b + 0]);\n        let ny = (this.verticies[i_a + 1] - this.verticies[i_b + 1]);\n        let d = (nx ** 2 + ny ** 2) ** 0.5;\n        if (d == 0)\n            return;\n        let mult = (Math.log2(Math.max(d - 10, 0) * 0.125 + 1) * 2) / d;\n        nx *= mult;\n        ny *= mult;\n        this.verticies[i_a + 2] -= nx;\n        this.verticies[i_a + 3] -= ny;\n        this.verticies[i_b + 2] += nx;\n        this.verticies[i_b + 3] += ny;\n    }\n    stepVertex(index) {\n        let i = index * this.vert_step_size;\n        if (this.pinned[index] == 1)\n            return;\n        this.verticies[i] += this.verticies[i + 2]; // Velocity\n        this.verticies[i + 1] += this.verticies[i + 3]; // Velocity\n        this.verticies[i + 3] += 0.002; // Gravity\n        this.verticies[i + 2] *= 0.998; // Drag\n        this.verticies[i + 3] *= 0.998; // Drag\n    }\n    stepConstraints() {\n        for (let i = this.cmin; i < this.cmax; i++) {\n            this.constrain(this.constraints[i * 2], this.constraints[i * 2 + 1]);\n        }\n    }\n    stepVerts() {\n        for (let i = this.vmin; i < this.vmax; i++) {\n            this.stepVertex(i);\n        }\n    }\n    stepComponents() {\n        this.stepNum ? this.stepConstraints() : this.stepVerts();\n        this.stepNum = this.stepNum ? 0 : 1;\n    }\n    step() {\n        this.stepComponents();\n        if (Atomics.add(this.coms, 0, BIG_ONE) < BigInt(this.thread_count - 1)) {\n            Atomics.wait(this.coms, 1 + this.stepNum, BIG_ZERO);\n        }\n        else {\n            Atomics.store(this.coms, 0, BIG_ZERO);\n            let notified = 1;\n            while (notified < this.thread_count)\n                notified += Atomics.notify(this.coms, 1 + this.stepNum);\n            this.coms[3]++; // Tracking iteration count\n        }\n    }\n    start() {\n        while (true) {\n            this.step();\n        }\n    }\n}\nctx.onmessage = (evt) => {\n    let thread = new SystemThread(evt.data.buffers, evt.data.vmin, evt.data.vmax, evt.data.cmin, evt.data.cmax, evt.data.threads);\n    thread.start();\n};\n\n\n//# sourceURL=webpack://cloth/./src/worker.ts?./node_modules/ts-loader/index.js");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./node_modules/ts-loader/index.js!./src/worker.ts"]();
/******/ 	
/******/ })()
;