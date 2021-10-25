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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Constraint\": () => (/* binding */ Constraint)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nvar drag = 0.999;\nvar Constraint = /** @class */ (function () {\n    function Constraint(a, b, len, rigidity) {\n        this.norm = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.a = a;\n        this.b = b;\n        this.len = len;\n        this.rigidity = rigidity;\n    }\n    Constraint.prototype.apply = function () {\n        this.norm.set(this.a.pos);\n        this.norm.setSub(this.b.pos);\n        var mag = this.norm.magnitude();\n        this.norm.setMultiplyScalor(0.25 / mag * Math.max((mag - this.len), 0));\n        this.a.vol.setSub(this.norm);\n        this.b.vol.setAdd(this.norm);\n        this.a.vol.setMultiplyScalor(drag);\n        this.a.vol.setMultiplyScalor(drag);\n    };\n    return Constraint;\n}());\n\n\n\n//# sourceURL=webpack://cloth/./src/constraint.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _constraint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constraint */ \"./src/constraint.ts\");\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n/* harmony import */ var _vertex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vertex */ \"./src/vertex.ts\");\n/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./system */ \"./src/system.ts\");\n\n\n\n\nvar mySystem = new _system__WEBPACK_IMPORTED_MODULE_3__.System();\nfunction makeCloth(w, h) {\n    for (var i = 0; i < h; i++) {\n        for (var j = 0; j < w; j++) {\n            mySystem.addVert(new _vertex__WEBPACK_IMPORTED_MODULE_2__.Vertex(new _vec2__WEBPACK_IMPORTED_MODULE_1__[\"default\"](j * 10, i * 10)));\n            if (j > 0) {\n                mySystem.addConstraint(new _constraint__WEBPACK_IMPORTED_MODULE_0__.Constraint(mySystem.vertecies[i * w + j], mySystem.vertecies[i * w + j - 1], 10, 2));\n            }\n            if (i > 0) {\n                mySystem.addConstraint(new _constraint__WEBPACK_IMPORTED_MODULE_0__.Constraint(mySystem.vertecies[(i * w) + j], mySystem.vertecies[(i - 1) * w + j], 10, 2));\n            }\n        }\n    }\n}\nmakeCloth(100, 100);\nmySystem.vertecies[0].pin();\nmySystem.vertecies[49].pin();\nmySystem.vertecies[99].pin();\ndocument.body.appendChild(mySystem.elm);\nmySystem.draw();\nvar steps = 0;\nvar step = setInterval(function () {\n    var t0 = performance.now();\n    while (performance.now() - t0 < 10) {\n        steps++;\n        mySystem.step(1);\n    }\n}, 10);\nsetInterval(function () {\n    console.log(steps);\n    steps = 0;\n}, 1000);\nvar draw = setInterval(function () {\n    mySystem.draw();\n}, 8);\n\n\n//# sourceURL=webpack://cloth/./src/index.ts?");

/***/ }),

/***/ "./src/system.ts":
/*!***********************!*\
  !*** ./src/system.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"System\": () => (/* binding */ System)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nvar System = /** @class */ (function () {\n    function System() {\n        var _this = this;\n        this.constraints = [];\n        this.vertecies = [];\n        this.elm = document.createElement(\"canvas\");\n        this.draw = function () {\n            _this.ctx.clearRect(-_this.elm.width, -_this.elm.width, _this.elm.width * 4, _this.elm.height * 4);\n            _this.ctx.beginPath();\n            _this.constraints.forEach(function (c) {\n                _this.ctx.moveTo(c.a.pos.x, c.a.pos.y);\n                _this.ctx.lineTo(c.b.pos.x, c.b.pos.y);\n            });\n            _this.ctx.stroke();\n        };\n        console.log(this.elm);\n        this.elm.width = 800 * 2;\n        this.elm.height = 800 * 2;\n        this.ctx = this.elm.getContext(\"2d\");\n        this.elm.addEventListener('mousedown', function () {\n            _this.elm.addEventListener(\"mousemove\", _this.mouseAction.bind(_this));\n        });\n        this.elm.addEventListener('mouseup', function () {\n            _this.elm.removeEventListener(\"mousemove\", _this.mouseAction.bind(_this));\n        });\n    }\n    System.prototype.addConstraint = function (constraint) {\n        this.constraints.push(constraint);\n    };\n    System.prototype.step = function (t) {\n        this.applyConstraints();\n        this.applyMotion(t);\n    };\n    System.prototype.applyConstraints = function () {\n        var i = 0, len = this.constraints.length;\n        while (i < len) {\n            this.constraints[i].apply();\n            i++;\n        }\n    };\n    System.prototype.applyMotion = function (t) {\n        var i = 0, len = this.vertecies.length;\n        while (i < len) {\n            this.vertecies[i].step(t);\n            i++;\n        }\n    };\n    System.prototype.addVert = function (vert) {\n        this.vertecies.push(vert);\n    };\n    System.prototype.mouseAction = function (e) {\n        var x = e.clientX * 1.5;\n        var y = e.clientY * 1.5;\n        var i = 0, len = this.constraints.length;\n        var mid = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        while (i < len) {\n            mid.set(this.constraints[i].a.pos);\n            mid.sub(this.constraints[i].b.pos);\n            mid.setMultiplyScalor(0.5);\n            mid.setAdd(this.constraints[i].a.pos);\n            var xdist = Math.abs(mid.x - x);\n            var ydist = Math.abs(mid.y - y);\n            if (ydist + xdist < 10) {\n                this.constraints.splice(i, 1);\n                len -= 1;\n            }\n            i++;\n        }\n    };\n    return System;\n}());\n\n\n\n//# sourceURL=webpack://cloth/./src/system.ts?");

/***/ }),

/***/ "./src/vec2.ts":
/*!*********************!*\
  !*** ./src/vec2.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar Vec2 = /** @class */ (function () {\n    function Vec2(x, y) {\n        var _this = this;\n        if (x === void 0) { x = 0; }\n        if (y === void 0) { y = 0; }\n        this.copy = function () { return new Vec2(_this.x, _this.y); };\n        this.magnitude = function () { return Math.sqrt(Math.pow(_this.x, 2) + Math.pow(_this.y, 2)); };\n        this.multiplyScalor = function (s) { return new Vec2(_this.x * s, _this.y * s); };\n        this.add = function (v) { return new Vec2(_this.x + v.x, _this.y + v.y); };\n        this.sub = function (v) { return new Vec2(_this.x - v.x, _this.y - v.y); };\n        this.normalize = function () { return _this.multiplyScalor(1 / _this.magnitude()); };\n        this.toAngle = function (v) {\n            if (v === void 0) { v = _this.normalize(); }\n            return Math.atan2(v.x, v.y);\n        };\n        this.rotateByVec = function (vec) { return _this.rotate(vec.toAngle()); };\n        this.rotate = function (a) {\n            var sina = Math.sin(a);\n            var cosa = Math.cos(a);\n            var _x = _this.x * cosa - _this.y * sina;\n            var _y = _this.x * sina + _this.y * cosa;\n            return new Vec2(_x, _y);\n        };\n        this.x = x;\n        this.y = y;\n    }\n    Vec2.prototype.setMultiplyScalor = function (s) {\n        this.x = this.x * s;\n        this.y = this.y * s;\n    };\n    Vec2.prototype.setAdd = function (v) {\n        this.x += v.x;\n        this.y += v.y;\n    };\n    Vec2.prototype.setSub = function (v) {\n        this.x -= v.x;\n        this.y -= v.y;\n    };\n    Vec2.prototype.setNormalize = function () {\n        this.setMultiplyScalor(1 / this.magnitude());\n    };\n    Vec2.prototype.set = function (v) {\n        this.x = v.x;\n        this.y = v.y;\n    };\n    Vec2.copy = function (v) { return new Vec2(v.x, v.y); };\n    Vec2.dotProduct = function (v1, v2) { return (v1.x * v2.x + v1.y * v2.y); };\n    Vec2.dist = function (v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y).magnitude(); };\n    return Vec2;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vec2);\n\n\n//# sourceURL=webpack://cloth/./src/vec2.ts?");

/***/ }),

/***/ "./src/vertex.ts":
/*!***********************!*\
  !*** ./src/vertex.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Vertex\": () => (/* binding */ Vertex)\n/* harmony export */ });\n/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec2 */ \"./src/vec2.ts\");\n\nvar G = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0.005);\nvar Vertex = /** @class */ (function () {\n    function Vertex(pos) {\n        this.vol = new _vec2__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.pinned = false;\n        this.pos = pos;\n    }\n    Vertex.prototype.step = function (t) {\n        if (this.pinned) {\n            return;\n        }\n        this.pos.setAdd(this.vol);\n        this.vol.setAdd(G);\n    };\n    Vertex.prototype.pin = function () {\n        this.pinned = true;\n    };\n    Vertex.prototype.unpin = function () {\n        this.pinned = false;\n    };\n    return Vertex;\n}());\n\n\n\n//# sourceURL=webpack://cloth/./src/vertex.ts?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;