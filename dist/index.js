!function(e,r){if("object"==typeof exports&&"object"==typeof module)module.exports=r();else if("function"==typeof define&&define.amd)define([],r);else{var t=r();for(var n in t)("object"==typeof exports?exports:e)[n]=t[n]}}(this,(function(){return function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(e,r,t){"use strict";t.r(r),t.d(r,"workerMiddleware",(function(){return u})),t.d(r,"workerAsPromiseMiddleware",(function(){return m})),t.d(r,"initWorker",(function(){return D})),t.d(r,"SUCCESS",(function(){return n})),t.d(r,"ERROR",(function(){return o})),t.d(r,"PREFIX",(function(){return i}));var n="_SUCCESS",o="_ERROR",i="WORKER!",u=function(e){return function(r){var t=function(e,r){return e.addEventListener("message",(function(e){return r(e.data)})),{process:function(r){return new Promise((function(t,n){e.postMessage(r),t()}))}}}(e,r.dispatch);return function(e){return function(r){return r.type.startsWith(i)?t.process(r).then((function(t){t&&t.type?e(t):e(r)})).catch((function(t){e(r)})):e(r)}}}};var c="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),f=new Uint8Array(16);function a(){if(!c)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return c(f)}var s=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;for(var p=function(e){return"string"==typeof e&&s.test(e)},l=[],d=0;d<256;++d)l.push((d+256).toString(16).substr(1));var y=function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,t=(l[e[r+0]]+l[e[r+1]]+l[e[r+2]]+l[e[r+3]]+"-"+l[e[r+4]]+l[e[r+5]]+"-"+l[e[r+6]]+l[e[r+7]]+"-"+l[e[r+8]]+l[e[r+9]]+"-"+l[e[r+10]]+l[e[r+11]]+l[e[r+12]]+l[e[r+13]]+l[e[r+14]]+l[e[r+15]]).toLowerCase();if(!p(t))throw TypeError("Stringified UUID is invalid");return t};var v=function(e,r,t){var n=(e=e||{}).random||(e.rng||a)();if(n[6]=15&n[6]|64,n[8]=63&n[8]|128,r){t=t||0;for(var o=0;o<16;++o)r[t+o]=n[o];return r}return y(n)};function O(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function b(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?O(Object(t),!0).forEach((function(r){j(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):O(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function j(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}var g={},m=function(){return function(e){return function(r){if(r.type&&r.type.startsWith(i)&&r.resolvers){var t=function(e,r){var t,u,c=r.resolvers.workerID||v(),f=r.resolvers.resolveOn||[r.type.replace(i,"")+n],a=r.resolvers.rejectOn||[r.type.replace(i,"")+o],s=new Promise((function(n,o){t=n,u=o,e(b(b({},r),{},{workerID:c,resolvers:{resolveOn:f,rejectOn:a}}))}));return{doResolve:w(t,u,{resolveOn:f,rejectOn:a}),promise:s,id:c}}(e,r);return g[t.id]=t,t.promise}return g[r.workerID]?(e(r),g[r.workerID].doResolve(r),void delete g[r.workerID]):e(r)}}},w=function(e,r,t){return function(n){var o=n.type,i=t.resolveOn,u=t.rejectOn;if(i){if("string"==typeof i&&i===o)return e(n);if(Array.isArray(i)&&i.find((function(e){return e===o})))return e(n)}if(u){if("string"==typeof u&&u===o)return r(n);if(Array.isArray(u)&&u.find((function(e){return e===o})))return r(n)}}};function P(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function h(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function S(e,r){var t={};if(e.type)t=function(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?P(Object(t),!0).forEach((function(r){h(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):P(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}({},e);else{var n=r;Array.isArray(r)&&(n=n[0]),t={type:n,payload:e}}return t}function D(e){self.addEventListener("message",(function(r){return function e(r,t,u){if(r&&r.type){var c=function(r){return e(r,t,u)},f=r.type,a=r.workerID,s=r.resolvers||{resolveOn:f.replace(i,"")+n,rejectOn:f.replace(i,"")+o};return u[f]?u[f](r,c).then((function(e){var r=S(e,s.resolveOn);r.workerID=a,c(r)})).catch((function(e){var r=S(e,s.rejectOn);r.workerID=a,c(r)})):r.type.startsWith(i)?void console.warn("Worker call action with ".concat(i," (").concat(r.type,"), to prevent infinite loop, action is discarded")):t(r)}}(r.data,self.postMessage,e)}))}}])}));