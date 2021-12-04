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

/***/ "./src/fVec2.ts":
/*!**********************!*\
  !*** ./src/fVec2.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FVec2)\n/* harmony export */ });\nclass FVec2 {\n    static dotProduct(x1, y1, x2, y2) {\n        return (x1 * x2 + y1 * y2);\n    }\n    static magnitude(x, y) {\n        return (x ** 2 + y ** 2) ** 0.5;\n    }\n    static multiplyScalor(x, y, s) {\n        return {\n            x: x * s,\n            y: y * s\n        };\n    }\n    static add(x1, y1, x2, y2) {\n        return {\n            x: x1 + x2,\n            y: y1 + y2\n        };\n    }\n    static sub(x1, y1, x2, y2) {\n        return {\n            x: x1 - x2,\n            y: y1 - y2\n        };\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/fVec2.ts?");

/***/ }),

/***/ "./node_modules/ts-loader/index.js!./src/worker.ts":
/*!*********************************************************!*\
  !*** ./node_modules/ts-loader/index.js!./src/worker.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _fVec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fVec2 */ \"./src/fVec2.ts\");\n\nconst ctx = self;\nclass SystemThread {\n    constructor(buffers, vmin, vmax, cmin, cmax, threads) {\n        this.stepNum = 0;\n        this.constraint_settings = {\n            len: 10,\n            drag: 0.998\n        };\n        this.vert_step_size = 4;\n        this.coms = new BigInt64Array(buffers[0]);\n        this.constraints = new Float32Array(buffers[1]);\n        this.verticies = new Float32Array(buffers[2]);\n        this.pinned = new Int8Array(buffers[3]);\n        this.thread_count = threads;\n        this.vmin = vmin;\n        this.vmax = vmax;\n        this.cmin = cmin;\n        this.cmax = cmax;\n    }\n    constrainAsync(_a, _b) {\n        let i_a = _a * this.vert_step_size;\n        let i_b = _b * this.vert_step_size;\n        let nx = (this.verticies[i_a + 0] - this.verticies[i_b + 0]);\n        let ny = (this.verticies[i_a + 1] - this.verticies[i_b + 1]);\n        let mag = _fVec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"].magnitude(nx, ny);\n        let mult = (0.01) * Math.max(mag - this.constraint_settings.len);\n        mult = Math.log10(mult + 1);\n        nx *= mult;\n        ny *= mult;\n        // let n = FVec2.multiplyScalor(nx, ny, (0.01) * Math.max((mag - this.constraint_settings.len), 0));\n        this.verticies[i_a + 2] -= nx;\n        this.verticies[i_a + 3] -= ny;\n        this.verticies[i_b + 2] += nx;\n        this.verticies[i_b + 3] += ny;\n    }\n    constrain(_a, _b) {\n        if (_a >= this.vmin &&\n            _a < this.vmax &&\n            _b >= this.vmin &&\n            _b < this.vmax) {\n            this.constrainAsync(_a, _b);\n            // this.constrainSync(_a, _b)\n        }\n        else {\n            // this.constrainSync(_a, _b);\n            this.constrainAsync(_a, _b);\n        }\n    }\n    applyConstraint(index) {\n        let i = index * 2;\n        this.constrainAsync(this.constraints[i], this.constraints[i + 1]);\n    }\n    stepVertex(index) {\n        let i = index * this.vert_step_size;\n        if (this.pinned[index] == 1)\n            return;\n        this.verticies[i] += this.verticies[i + 2];\n        this.verticies[i + 1] += this.verticies[i + 3];\n        this.verticies[i + 2] *= this.constraint_settings.drag;\n        this.verticies[i + 3] = (this.verticies[i + 3] + 0.005) * this.constraint_settings.drag;\n    }\n    stepConstraints() {\n        for (let i = this.cmin; i < this.cmax; i++) {\n            this.applyConstraint(i);\n        }\n    }\n    stepVerts() {\n        for (let i = this.vmin; i < this.vmax; i++) {\n            this.stepVertex(i);\n        }\n    }\n    stepComponents() {\n        if (this.stepNum == 0) {\n            this.stepConstraints();\n            this.stepNum = 1;\n        }\n        else {\n            this.stepVerts();\n            this.stepNum = 0;\n        }\n    }\n    alertSiblings() {\n        let notified = 1;\n        Atomics.store(this.coms, 0, BigInt(0));\n        while (notified < this.thread_count) {\n            let not = Atomics.notify(this.coms, 1);\n            notified += not;\n        }\n    }\n    step() {\n        this.stepComponents();\n        if (Atomics.add(this.coms, 0, BigInt(1)) < BigInt(this.thread_count - 1)) {\n            Atomics.wait(this.coms, 1 + this.stepNum, BigInt(0));\n        }\n        else {\n            Atomics.store(this.coms, 0, BigInt(0));\n            let not = 0;\n            while (not < 10)\n                not += Atomics.notify(this.coms, 1 + this.stepNum);\n        }\n    }\n    start() {\n        while (true) {\n            this.step();\n        }\n    }\n}\nctx.onmessage = (evt) => {\n    let thread = new SystemThread(evt.data.buffers, evt.data.vmin, evt.data.vmax, evt.data.cmin, evt.data.cmax, evt.data.threads);\n    thread.start();\n};\n\n\n//# sourceURL=webpack://cloth/./src/worker.ts?./node_modules/ts-loader/index.js");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./node_modules/ts-loader/index.js!./src/worker.ts");
/******/ 	
/******/ })()
;