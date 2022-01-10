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

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _threadedSystem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./threadedSystem */ \"./src/threadedSystem.ts\");\n\nlet size = 100;\nlet threadSystem = new _threadedSystem__WEBPACK_IMPORTED_MODULE_0__.ThreadedSystem(size * size, size * size * 2);\nthreadSystem.createGrid(size, size);\nthreadSystem.pin(0);\nthreadSystem.pin(50);\nthreadSystem.pin(99);\ndocument.body.appendChild(threadSystem.elm);\nthreadSystem.start();\nlet step = () => {\n    threadSystem.draw();\n    window.requestAnimationFrame(step);\n};\nstep();\n\n\n//# sourceURL=webpack://cloth/./src/index.ts?");

/***/ }),

/***/ "./src/performanceMetrics.ts":
/*!***********************************!*\
  !*** ./src/performanceMetrics.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PerformanceMetrics)\n/* harmony export */ });\nclass Metric {\n    constructor(name) {\n        this.name = name;\n        this.elm = document.createElement(\"tr\");\n        let label = document.createElement(\"td\");\n        label.innerText = `${name}: `;\n        this.valElm = document.createElement(\"td\");\n        this.elm.classList.add(name);\n        this.elm.classList.add(\"metric\");\n        this.elm.appendChild(label);\n        this.elm.appendChild(this.valElm);\n    }\n    update(newVal) {\n        this.valElm.innerText = `${newVal}`;\n    }\n}\nclass PerformanceMetrics {\n    constructor() {\n        this.metrics = {};\n        this.elm = document.createElement(\"table\");\n        this.elm.id = \"performance_metrics\";\n    }\n    addMetric(name) {\n        this.metrics[name] = new Metric(name);\n        this.elm.appendChild(this.metrics[name].elm);\n    }\n    setMetric(metric, value) {\n        if (!this.metrics[metric])\n            this.addMetric(metric);\n        this.metrics[metric].update(Math.round(value * 1000) / 1000);\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/performanceMetrics.ts?");

/***/ }),

/***/ "./src/threadedSystem.ts":
/*!*******************************!*\
  !*** ./src/threadedSystem.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ThreadedSystem\": () => (/* binding */ ThreadedSystem)\n/* harmony export */ });\n/* harmony import */ var _src_vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/vec2 */ \"./src/vec2.ts\");\n/* harmony import */ var _vertex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vertex */ \"./src/vertex.ts\");\n/* harmony import */ var worker_loader_worker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! worker-loader!./worker */ \"./node_modules/worker-loader/dist/cjs.js!./src/worker.ts\");\n/* harmony import */ var _src_fVec2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../src/fVec2 */ \"./src/fVec2.ts\");\n/* harmony import */ var _performanceMetrics__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./performanceMetrics */ \"./src/performanceMetrics.ts\");\n\n\n\n\n\nclass ThreadedSystem {\n    constructor(numVerts, numConstraints) {\n        this.elm = document.createElement(\"canvas\");\n        this.ips = document.querySelector(\"#ips\");\n        this.mousex = 100000;\n        this.mousey = 100000;\n        this.workers = [];\n        this.constraints_count = 0;\n        this.verticies_count = 0;\n        this.vert_step_size = 4;\n        this.altDown = false;\n        this.mouseDeltaX = 0;\n        this.mouseDeltaY = 0;\n        this.heldVerts = [];\n        this.holding = false;\n        this.draw = () => {\n            let start = performance.now();\n            this.ctx.clearRect(0, 0, this.elm.width * 2, this.elm.height * 2);\n            this.ctx.beginPath();\n            const vstep = this.vert_step_size;\n            const c_width = this.elm.width * 2;\n            const c_height = this.elm.height * 2;\n            for (let i = 0; i < this.constraints_count * 2; i += 2) {\n                if (this.constraints[i] == -1)\n                    continue;\n                if (this.constraints[i + 1] == -1)\n                    continue;\n                let x1 = this.verticies[this.constraints[i] * vstep];\n                let x2 = this.verticies[this.constraints[i + 1] * vstep];\n                let y1 = this.verticies[this.constraints[i] * vstep + 1];\n                let y2 = this.verticies[this.constraints[i + 1] * vstep + 1];\n                if ((x1 < 0 && x2 < 0) || (y1 < 0 && y2 < 0))\n                    continue;\n                if ((x1 > c_width && x2 > c_width) || (y1 > c_height && y2 > c_height))\n                    continue;\n                this.ctx.moveTo(x1, y1);\n                this.ctx.lineTo(x2, y2);\n                let x0 = this.mousex;\n                let y0 = this.mousey;\n                let d = _src_fVec2__WEBPACK_IMPORTED_MODULE_3__[\"default\"].magnitude((x1 - x0 * 2), (y1 - y0 * 2));\n                if (d < 20 && this.altDown) {\n                    // this.verticies[this.constraints[ i ] * vstep + 3] = this.mouseDeltaY;\n                    // this.verticies[this.constraints[ i ] * vstep + 2] = this.mouseDeltaX;\n                    this.constraints[i] = -1;\n                    this.constraints[i + 1] = -1;\n                }\n            }\n            this.ctx.stroke();\n            this.perf.setMetric(\"draw_fps\", 1000 / (performance.now() - start));\n        };\n        this.perf = new _performanceMetrics__WEBPACK_IMPORTED_MODULE_4__[\"default\"]();\n        document.body.appendChild(this.perf.elm);\n        // Getting the thread count for optomal performance\n        this.thread_count = navigator.hardwareConcurrency;\n        this.thread_count = 2;\n        this.perf.setMetric(\"thread_count\", this.thread_count);\n        this.coms_buffer = new SharedArrayBuffer(64);\n        this.coms = new BigInt64Array(this.coms_buffer);\n        // Initalizing buffers\n        this.constraints_buffer = new SharedArrayBuffer(numConstraints * 8);\n        this.verticies_buffer = new SharedArrayBuffer(numVerts * 8 * 4);\n        this.pinned_buffer = new SharedArrayBuffer(numVerts);\n        // Setting up view for buffers\n        this.constraints = new Uint16Array(this.constraints_buffer);\n        this.verticies = new Float64Array(this.verticies_buffer);\n        this.pinned = new Int8Array(this.pinned_buffer);\n        this.elm.width = 1200;\n        this.elm.height = 1200;\n        this.ctx = this.elm.getContext(\"2d\");\n        this.ctx.scale(0.5, 0.5);\n        document.addEventListener(\"keydown\", (e) => {\n            if (e.code == \"AltLeft\") {\n                // this.startHold();\n            }\n        });\n        document.addEventListener(\"keyup\", (e) => {\n            if (e.code == \"AltLeft\") {\n                this.endHold();\n            }\n        });\n        this.elm.addEventListener(\"mousemove\", (e) => {\n            this.mousex = e.offsetX;\n            this.mousey = e.offsetY;\n            this.altDown = e.altKey;\n            this.mouseDeltaX = e.movementX;\n            this.mouseDeltaY = e.movementY;\n            this.hold();\n        });\n        let ips_buff = new Array(10);\n        let delta = 500;\n        let t = performance.now();\n        setInterval(() => {\n            delta = performance.now() - t;\n            t = performance.now();\n            ips_buff.shift();\n            ips_buff.push(Number(this.coms[3]) * (1000 / delta));\n            const sum = ips_buff.reduce((a, n) => a + n, 0) / ips_buff.length;\n            this.perf.setMetric(\"ips\", Number(this.coms[3]) * (1000 / delta));\n            this.perf.setMetric(\"ips10\", sum);\n            this.perf.setMetric(\"waiting\", (Number(this.coms[4]) / 1000) * (1000 / delta));\n            this.perf.setMetric(\"stepping\", (Number(this.coms[5]) / 1000) * (1000 / delta));\n            this.perf.setMetric(\"threadding_overhead\", (Number(this.coms[4]) / Number(this.coms[5])));\n            this.perf.setMetric(\"totalTime\", (Number(this.coms[4]) + Number(this.coms[5])) * (1 / delta));\n            this.coms[3] = BigInt(0);\n            this.coms[4] = BigInt(0);\n            this.coms[5] = BigInt(0);\n        }, 500);\n    }\n    createGrid(w, h) {\n        for (let i = 0; i < h; i++) {\n            for (let j = 0; j < w; j++) {\n                this.addVert(new _vertex__WEBPACK_IMPORTED_MODULE_1__.Vertex(new _src_vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](j * 10, i * 10)));\n                if (j > 0) {\n                    this.addConstraint(i * w + j, i * w + j - 1);\n                }\n                if (i > 0) {\n                    this.addConstraint((i * w) + j, (i - 1) * w + j);\n                }\n            }\n        }\n    }\n    start() {\n        let buffers = [\n            this.coms_buffer,\n            this.constraints_buffer,\n            this.verticies_buffer,\n            this.pinned_buffer\n        ];\n        for (let i = 0; i < this.thread_count; i++) {\n            this.workers.push(new worker_loader_worker__WEBPACK_IMPORTED_MODULE_2__[\"default\"]());\n            let vper_thread = Math.floor(this.verticies_count / this.thread_count);\n            let cper_thread = Math.floor(this.constraints_count / this.thread_count);\n            let message = {\n                buffers: buffers,\n                vmin: i * vper_thread,\n                vmax: i == this.thread_count - 1 ? this.verticies_count : (i + 1) * vper_thread,\n                cmin: i * cper_thread,\n                cmax: i == this.thread_count - 1 ? this.constraints_count : (i + 1) * cper_thread,\n                threads: this.thread_count\n            };\n            this.workers[i].postMessage(message);\n        }\n    }\n    addVert(vert) {\n        let i = this.vert_step_size * this.verticies_count;\n        this.verticies.set([\n            vert.pos.x,\n            vert.pos.y,\n            vert.vol.x,\n            vert.vol.y\n        ], i);\n        return this.verticies_count++;\n    }\n    addConstraint(a, b) {\n        let i = 2 * this.constraints_count++;\n        this.constraints[i] = a;\n        this.constraints[i + 1] = b;\n    }\n    pin(index) {\n        Atomics.store(this.pinned, index, 1);\n    }\n    unpin(index) {\n        Atomics.store(this.pinned, index, 0);\n    }\n    hold() {\n        this.heldVerts.forEach(i => {\n            this.verticies[i * this.vert_step_size] += this.mouseDeltaX * 2;\n            this.verticies[i * this.vert_step_size + 1] += this.mouseDeltaY * 2;\n        });\n    }\n    startHold() {\n        if (this.holding == true)\n            return;\n        for (let i = 0; i < this.verticies_count; i++) {\n            let x = this.verticies[i * this.vert_step_size];\n            let y = this.verticies[i * this.vert_step_size + 1];\n            let d = _src_fVec2__WEBPACK_IMPORTED_MODULE_3__[\"default\"].magnitude((x - this.mousex * 2), (y - this.mousey * 2));\n            if (d < 50) {\n                this.pin(i);\n                this.heldVerts.push(i);\n                this.verticies[i * this.vert_step_size + 2] = 0;\n                this.verticies[i * this.vert_step_size + 3] = 0;\n            }\n        }\n        this.holding = true;\n    }\n    endHold() {\n        this.heldVerts.forEach(i => {\n            // this.unpin(i);/\n        });\n        this.heldVerts = [];\n        this.holding = false;\n    }\n}\n\n\n//# sourceURL=webpack://cloth/./src/threadedSystem.ts?");

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