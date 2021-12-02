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

/***/ "./src/constraint.ts":
/*!***************************!*\
  !*** ./src/constraint.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Constraint\": () => (/* binding */ Constraint)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nlet drag = 0.999;\nclass Constraint {\n    constructor(a, b, len, rigidity) {\n        this.norm = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.a = a;\n        this.b = b;\n        this.len = len;\n        this.rigidity = rigidity;\n    }\n    apply() {\n        this.norm.set(this.a.pos);\n        this.norm.setSub(this.b.pos);\n        let mag = this.norm.magnitude();\n        this.norm.setMultiplyScalor(0.25 / mag * Math.max((mag - this.len), 0));\n        this.a.vol.setSub(this.norm);\n        this.b.vol.setAdd(this.norm);\n        this.a.vol.setMultiplyScalor(drag);\n        this.a.vol.setMultiplyScalor(drag);\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/constraint.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _constraint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constraint */ \"./src/constraint.ts\");\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n/* harmony import */ var _vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vertex */ \"./src/vertex.ts\");\n/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./system */ \"./src/system.ts\");\n/* harmony import */ var _threadedSystem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./threadedSystem */ \"./src/threadedSystem.ts\");\n\n\n\n\n\nlet mySystem = new _system__WEBPACK_IMPORTED_MODULE_3__.System();\nlet threadSystem = new _threadedSystem__WEBPACK_IMPORTED_MODULE_4__.ThreadedSystem(200 * 200, 400 * 200);\nfunction makeCloth(w, h) {\n    for (let i = 0; i < h; i++) {\n        for (let j = 0; j < w; j++) {\n            mySystem.addVert(new _vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(new _vec2__WEBPACK_IMPORTED_MODULE_1__[\"default\"](j * 10, i * 10)));\n            if (j > 0) {\n                mySystem.addConstraint(new _constraint__WEBPACK_IMPORTED_MODULE_0__.Constraint(mySystem.vertecies[i * w + j], mySystem.vertecies[i * w + j - 1], 10, 2));\n            }\n            if (i > 0) {\n                mySystem.addConstraint(new _constraint__WEBPACK_IMPORTED_MODULE_0__.Constraint(mySystem.vertecies[(i * w) + j], mySystem.vertecies[(i - 1) * w + j], 10, 2));\n            }\n        }\n    }\n}\nfunction makeClothThreaded(w, h) {\n    for (let i = 0; i < h; i++) {\n        for (let j = 0; j < w; j++) {\n            threadSystem.addVert(new _vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(new _vec2__WEBPACK_IMPORTED_MODULE_1__[\"default\"](j * 10, i * 10)));\n            if (j > 0) {\n                threadSystem.addConstraint(i * w + j, i * w + j - 1);\n            }\n            if (i > 0) {\n                threadSystem.addConstraint((i * w) + j, (i - 1) * w + j);\n            }\n        }\n    }\n}\nmakeClothThreaded(200, 200);\n// console.log(threadSystem.verticies_count)\n// console.log(threadSystem.constraints_count)\n// mySystem.vertecies[0].pin();\n// mySystem.vertecies[49].pin();\n// mySystem.vertecies[99].pin();\nthreadSystem.pin(0);\nthreadSystem.pin(49);\nthreadSystem.pin(99);\nthreadSystem.pin(149);\nthreadSystem.pin(199);\ndocument.body.appendChild(threadSystem.elm);\n// mySystem.draw();\n// let steps = 0;\n// let step = setInterval(() => {\n// \tconst t0 = performance.now();\n// \twhile(performance.now() - t0 < 10){\n// \t\tsteps++;\n// \t\tmySystem.step(1);\n// \t}\n// }, 10)\n// setInterval(() => {\n// \tconsole.log(steps);\n// \tsteps = 0;\n// }, 1000)\n// let draw = setInterval(() => {\n// \tmySystem.draw();\n// }, 8)\nthreadSystem.start();\nlet draw = setInterval(() => {\n    threadSystem.draw();\n}, 16);\n\n\n//# sourceURL=webpack://cloth/./src/index.ts?");

/***/ }),

/***/ "./src/system.ts":
/*!***********************!*\
  !*** ./src/system.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"System\": () => (/* binding */ System)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nclass System {\n    constructor() {\n        this.constraints = [];\n        this.vertecies = [];\n        this.elm = document.createElement(\"canvas\");\n        this.draw = () => {\n            this.ctx.clearRect(-this.elm.width, -this.elm.width, this.elm.width * 4, this.elm.height * 4);\n            this.ctx.beginPath();\n            this.constraints.forEach(c => {\n                this.ctx.moveTo(c.a.pos.x, c.a.pos.y);\n                this.ctx.lineTo(c.b.pos.x, c.b.pos.y);\n            });\n            this.ctx.stroke();\n        };\n        console.log(this.elm);\n        this.elm.width = 800 * 2;\n        this.elm.height = 800 * 2;\n        this.ctx = this.elm.getContext(\"2d\");\n        this.elm.addEventListener('mousedown', () => {\n            this.elm.addEventListener(\"mousemove\", this.mouseAction.bind(this));\n        });\n        this.elm.addEventListener('mouseup', () => {\n            this.elm.removeEventListener(\"mousemove\", this.mouseAction.bind(this));\n        });\n    }\n    addConstraint(constraint) {\n        this.constraints.push(constraint);\n    }\n    step(t) {\n        this.applyConstraints();\n        this.applyMotion(t);\n    }\n    applyConstraints() {\n        let i = 0, len = this.constraints.length;\n        while (i < len) {\n            this.constraints[i].apply();\n            i++;\n        }\n    }\n    applyMotion(t) {\n        let i = 0, len = this.vertecies.length;\n        while (i < len) {\n            this.vertecies[i].step(t);\n            i++;\n        }\n    }\n    addVert(vert) {\n        this.vertecies.push(vert);\n    }\n    mouseAction(e) {\n        let x = e.clientX * 1.5;\n        let y = e.clientY * 1.5;\n        let i = 0, len = this.constraints.length;\n        let mid = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        while (i < len) {\n            mid.set(this.constraints[i].a.pos);\n            mid.sub(this.constraints[i].b.pos);\n            mid.setMultiplyScalor(0.5);\n            mid.setAdd(this.constraints[i].a.pos);\n            let xdist = Math.abs(mid.x - x);\n            let ydist = Math.abs(mid.y - y);\n            if (ydist + xdist < 10) {\n                this.constraints.splice(i, 1);\n                len -= 1;\n            }\n            i++;\n        }\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/system.ts?");

/***/ }),

/***/ "./src/threadedSystem.ts":
/*!*******************************!*\
  !*** ./src/threadedSystem.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ThreadedSystem\": () => (/* binding */ ThreadedSystem)\n/* harmony export */ });\n/* harmony import */ var worker_loader_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! worker-loader!./worker */ \"./node_modules/worker-loader/dist/cjs.js!./src/worker.ts\");\n\nconst G = -0.05;\nconst acc = 100000;\nclass ThreadedSystem {\n    constructor(numVerts, numConstraints) {\n        this.elm = document.createElement(\"canvas\");\n        this.constraint_settings = {\n            len: 10,\n            drag: 0.999\n        };\n        this.workers = [];\n        this.constraints_count = 0;\n        this.verticies_count = 0;\n        this.vert_step_size = 4;\n        this.draw = () => {\n            this.ctx.clearRect(0, 0, this.elm.width * 4, this.elm.height * 4);\n            this.ctx.beginPath();\n            for (let i = 0; i < this.constraints_count * 2; i += 2) {\n                let x1 = this.verticies[this.constraints[i] * this.vert_step_size] / acc;\n                let y1 = this.verticies[this.constraints[i] * this.vert_step_size + 1] / acc;\n                let x2 = this.verticies[this.constraints[i + 1] * this.vert_step_size] / acc;\n                let y2 = this.verticies[this.constraints[i + 1] * this.vert_step_size + 1] / acc;\n                this.ctx.moveTo(x1, y1);\n                this.ctx.lineTo(x2, y2);\n            }\n            this.ctx.stroke();\n        };\n        // Getting the thread count for optomal performance\n        this.thread_count = navigator.hardwareConcurrency;\n        this.coms_buffer = new SharedArrayBuffer(24);\n        this.coms = new BigInt64Array(this.coms_buffer);\n        // Initalizing buffers\n        this.constraints_buffer = new SharedArrayBuffer(numConstraints * 8);\n        this.verticies_buffer = new SharedArrayBuffer(numVerts * 16);\n        this.pinned_buffer = new SharedArrayBuffer(numVerts);\n        // Setting up view for buffers\n        this.constraints = new Int32Array(this.constraints_buffer);\n        this.verticies = new Int32Array(this.verticies_buffer);\n        this.pinned = new Int8Array(this.pinned_buffer);\n        this.elm.width = 800;\n        this.elm.height = 800;\n        this.ctx = this.elm.getContext(\"2d\");\n        this.ctx.scale(0.25, 0.25);\n    }\n    start() {\n        let buffers = [\n            this.coms_buffer,\n            this.constraints_buffer,\n            this.verticies_buffer,\n            this.pinned_buffer\n        ];\n        for (let i = 0; i < this.thread_count; i++) {\n            this.workers.push(new worker_loader_worker__WEBPACK_IMPORTED_MODULE_0__[\"default\"]());\n            let vper_thread = Math.floor(this.verticies_count / this.thread_count);\n            let cper_thread = Math.floor(this.constraints_count / this.thread_count);\n            let message = {\n                buffers: buffers,\n                vmin: i * vper_thread,\n                vmax: i == this.thread_count - 1 ? this.verticies_count : (i + 1) * vper_thread,\n                cmin: i * cper_thread,\n                cmax: i == this.thread_count - 1 ? this.constraints_count : (i + 1) * cper_thread,\n                threads: this.thread_count\n            };\n            this.workers[i].postMessage(message);\n        }\n    }\n    addVert(vert) {\n        let i = this.vert_step_size * this.verticies_count;\n        this.verticies.set([\n            vert.pos.x * acc,\n            vert.pos.y * acc,\n            vert.vol.x * acc,\n            vert.vol.y * acc\n        ], i);\n        return this.verticies_count++;\n    }\n    addConstraint(a, b) {\n        let i = 2 * this.constraints_count++;\n        this.constraints[i] = a;\n        this.constraints[i + 1] = b;\n    }\n    pin(index) {\n        Atomics.store(this.pinned, index, 1);\n    }\n    unpin(index) {\n        Atomics.store(this.pinned, index, 0);\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/threadedSystem.ts?");

/***/ }),

/***/ "./src/vec2.ts":
/*!*********************!*\
  !*** ./src/vec2.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Vec2)\n/* harmony export */ });\nclass Vec2 {\n    constructor(x = 0, y = 0) {\n        this.copy = () => new Vec2(this.x, this.y);\n        this.magnitude = () => Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));\n        this.multiplyScalor = (s) => new Vec2(this.x * s, this.y * s);\n        this.add = (v) => new Vec2(this.x + v.x, this.y + v.y);\n        this.sub = (v) => new Vec2(this.x - v.x, this.y - v.y);\n        this.normalize = () => this.multiplyScalor(1 / this.magnitude());\n        this.toAngle = (v = this.normalize()) => Math.atan2(v.x, v.y);\n        this.rotateByVec = (vec) => this.rotate(vec.toAngle());\n        this.rotate = (a) => {\n            const sina = Math.sin(a);\n            const cosa = Math.cos(a);\n            const _x = this.x * cosa - this.y * sina;\n            const _y = this.x * sina + this.y * cosa;\n            return new Vec2(_x, _y);\n        };\n        this.x = x;\n        this.y = y;\n    }\n    setMultiplyScalor(s) {\n        this.x = this.x * s;\n        this.y = this.y * s;\n    }\n    setAdd(v) {\n        this.x += v.x;\n        this.y += v.y;\n    }\n    setSub(v) {\n        this.x -= v.x;\n        this.y -= v.y;\n    }\n    setNormalize() {\n        this.setMultiplyScalor(1 / this.magnitude());\n    }\n    set(v) {\n        this.x = v.x;\n        this.y = v.y;\n    }\n}\nVec2.copy = (v) => new Vec2(v.x, v.y);\nVec2.dotProduct = (v1, v2) => (v1.x * v2.x + v1.y * v2.y);\nVec2.dist = (v1, v2) => new Vec2(v1.x - v2.x, v1.y - v2.y).magnitude();\n\n\n//# sourceURL=webpack://cloth/./src/vec2.ts?");

/***/ }),

/***/ "./src/vertex.ts":
/*!***********************!*\
  !*** ./src/vertex.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Vertex\": () => (/* binding */ Vertex)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nconst G = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0.005);\nclass Vertex {\n    constructor(pos) {\n        this.vol = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.pinned = false;\n        this.pos = pos;\n    }\n    step(t) {\n        if (this.pinned) {\n            return;\n        }\n        this.pos.setAdd(this.vol);\n        this.vol.setAdd(G);\n    }\n    pin() {\n        this.pinned = true;\n    }\n    unpin() {\n        this.pinned = false;\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/vertex.ts?");

/***/ }),

/***/ "./node_modules/worker-loader/dist/cjs.js!./src/worker.ts":
/*!****************************************************************!*\
  !*** ./node_modules/worker-loader/dist/cjs.js!./src/worker.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Worker_fn)\n/* harmony export */ });\nfunction Worker_fn() {\n  return new Worker(__webpack_require__.p + \"bundle.worker.js\");\n}\n\n\n//# sourceURL=webpack://cloth/./src/worker.ts?./node_modules/worker-loader/dist/cjs.js");

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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;