/*!
 * Cropper.js v1.3.4
 * https://github.com/fengyuanchen/cropperjs
 *
 * Copyright (c) 2015-2018 Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2018-03-31T06:49:16.394Z
 */
!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define(i):t.Cropper=i()}(this,function(){"use strict";var n="undefined"!=typeof window,r=n?window:{},c="cropper",k="all",T="crop",W="move",E="zoom",H="e",N="w",L="s",z="n",O="ne",Y="nw",X="se",R="sw",h=c+"-crop",t=c+"-disabled",S=c+"-hidden",l=c+"-hide",o=c+"-modal",p=c+"-move",m="action",g="preview",s="crop",d="move",u="none",a="crop",f="cropend",v="cropmove",w="cropstart",b="dblclick",x="load",y=r.PointerEvent?"pointerdown":"touchstart mousedown",M=r.PointerEvent?"pointermove":"touchmove mousemove",C=r.PointerEvent?"pointerup pointercancel":"touchend touchcancel mouseup",D="ready",B="resize",I="wheel mousewheel DOMMouseScroll",A="zoom",U=/^(?:e|w|s|n|se|sw|ne|nw|all|crop|move|zoom)$/,j=/^data:/,P=/^data:image\/jpeg;base64,/,q=/^(?:img|canvas)$/i,$={viewMode:0,dragMode:s,aspectRatio:NaN,data:null,preview:"",responsive:!0,restore:!0,checkCrossOrigin:!0,checkOrientation:!0,modal:!0,guides:!0,center:!0,highlight:!0,background:!0,autoCrop:!0,autoCropArea:.8,movable:!0,rotatable:!0,scalable:!0,zoomable:!0,zoomOnTouch:!0,zoomOnWheel:!0,wheelZoomRatio:.1,cropBoxMovable:!0,cropBoxResizable:!0,toggleDragModeOnDblclick:!0,minCanvasWidth:0,minCanvasHeight:0,minCropBoxWidth:0,minCropBoxHeight:0,minContainerWidth:200,minContainerHeight:100,ready:null,cropstart:null,cropmove:null,cropend:null,crop:null,zoom:null},i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Q=function(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")},Z=function(){function a(t,i){for(var e=0;e<i.length;e++){var a=i[e];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}return function(t,i,e){return i&&a(t.prototype,i),e&&a(t,e),t}}(),bt=function(t){if(Array.isArray(t)){for(var i=0,e=Array(t.length);i<t.length;i++)e[i]=t[i];return e}return Array.from(t)},e=Number.isNaN||r.isNaN;function F(t){return"number"==typeof t&&!e(t)}function K(t){return void 0===t}function V(t){return"object"===(void 0===t?"undefined":i(t))&&null!==t}var G=Object.prototype.hasOwnProperty;function J(t){if(!V(t))return!1;try{var i=t.constructor,e=i.prototype;return i&&e&&G.call(e,"isPrototypeOf")}catch(t){return!1}}function _(t){return"function"==typeof t}function tt(i,e){if(i&&_(e))if(Array.isArray(i)||F(i.length)){var t=i.length,a=void 0;for(a=0;a<t&&!1!==e.call(i,i[a],a,i);a+=1);}else V(i)&&Object.keys(i).forEach(function(t){e.call(i,i[t],t,i)});return i}var it=Object.assign||function(e){for(var t=arguments.length,i=Array(1<t?t-1:0),a=1;a<t;a++)i[a-1]=arguments[a];return V(e)&&0<i.length&&i.forEach(function(i){V(i)&&Object.keys(i).forEach(function(t){e[t]=i[t]})}),e},et=/\.\d*(?:0|9){12}\d*$/i;function xt(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:1e11;return et.test(t)?Math.round(t*i)/i:t}var at=/^(?:width|height|left|top|marginLeft|marginTop)$/;function nt(t,i){var e=t.style;tt(i,function(t,i){at.test(i)&&F(t)&&(t+="px"),e[i]=t})}function ot(t,i){if(i)if(F(t.length))tt(t,function(t){ot(t,i)});else if(t.classList)t.classList.add(i);else{var e=t.className.trim();e?e.indexOf(i)<0&&(t.className=e+" "+i):t.className=i}}function ht(t,i){i&&(F(t.length)?tt(t,function(t){ht(t,i)}):t.classList?t.classList.remove(i):0<=t.className.indexOf(i)&&(t.className=t.className.replace(i,"")))}function rt(t,i,e){i&&(F(t.length)?tt(t,function(t){rt(t,i,e)}):e?ot(t,i):ht(t,i))}var st=/([a-z\d])([A-Z])/g;function dt(t){return t.replace(st,"$1-$2").toLowerCase()}function ct(t,i){return V(t[i])?t[i]:t.dataset?t.dataset[i]:t.getAttribute("data-"+dt(i))}function lt(t,i,e){V(e)?t[i]=e:t.dataset?t.dataset[i]=e:t.setAttribute("data-"+dt(i),e)}function pt(i,e){if(V(i[e]))try{delete i[e]}catch(t){i[e]=void 0}else if(i.dataset)try{delete i.dataset[e]}catch(t){i.dataset[e]=void 0}else i.removeAttribute("data-"+dt(e))}var mt=/\s\s*/,gt=function(){var t=!1;if(n){var i=!1,e=function(){},a=Object.defineProperty({},"once",{get:function(){return t=!0,i},set:function(t){i=t}});r.addEventListener("test",e,a),r.removeEventListener("test",e,a)}return t}();function ut(e,t,a){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},o=a;t.trim().split(mt).forEach(function(t){if(!gt){var i=e.listeners;i&&i[t]&&i[t][a]&&(o=i[t][a],delete i[t][a],0===Object.keys(i[t]).length&&delete i[t],0===Object.keys(i).length&&delete e.listeners)}e.removeEventListener(t,o,n)})}function ft(o,t,h){var r=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},s=h;t.trim().split(mt).forEach(function(a){if(r.once&&!gt){var t=o.listeners,n=void 0===t?{}:t;s=function(){for(var t=arguments.length,i=Array(t),e=0;e<t;e++)i[e]=arguments[e];delete n[a][h],o.removeEventListener(a,s,r),h.apply(o,i)},n[a]||(n[a]={}),n[a][h]&&o.removeEventListener(a,n[a][h],r),n[a][h]=s,o.listeners=n}o.addEventListener(a,s,r)})}function vt(t,i,e){var a=void 0;return _(Event)&&_(CustomEvent)?a=new CustomEvent(i,{detail:e,bubbles:!0,cancelable:!0}):(a=document.createEvent("CustomEvent")).initCustomEvent(i,!0,!0,e),t.dispatchEvent(a)}function wt(t){var i=t.getBoundingClientRect();return{left:i.left+(window.pageXOffset-document.documentElement.clientLeft),top:i.top+(window.pageYOffset-document.documentElement.clientTop)}}var yt=r.location,Mt=/^(https?:)\/\/([^:/?#]+):?(\d*)/i;function Ct(t){var i=t.match(Mt);return i&&(i[1]!==yt.protocol||i[2]!==yt.hostname||i[3]!==yt.port)}function Dt(t){var i="timestamp="+(new Date).getTime();return t+(-1===t.indexOf("?")?"?":"&")+i}function Bt(t){var i=t.rotate,e=t.scaleX,a=t.scaleY,n=t.translateX,o=t.translateY,h=[];F(n)&&0!==n&&h.push("translateX("+n+"px)"),F(o)&&0!==o&&h.push("translateY("+o+"px)"),F(i)&&0!==i&&h.push("rotate("+i+"deg)"),F(e)&&1!==e&&h.push("scaleX("+e+")"),F(a)&&1!==a&&h.push("scaleY("+a+")");var r=h.length?h.join(" "):"none";return{WebkitTransform:r,msTransform:r,transform:r}}function kt(t,i){var e=t.pageX,a=t.pageY,n={endX:e,endY:a};return i?n:it({startX:e,startY:a},n)}var Tt=Number.isFinite||r.isFinite;function Wt(t){var i=t.aspectRatio,e=t.height,a=t.width,n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"contain",o=function(t){return Tt(t)&&0<t};if(o(a)&&o(e)){var h=e*i;"contain"===n&&a<h||"cover"===n&&h<a?e=a/i:a=e*i}else o(a)?e=a/i:o(e)&&(a=e*i);return{width:a,height:e}}var Et=String.fromCharCode;var Ht=/^data:.*,/;function Nt(t){var i=new DataView(t),e=void 0,a=void 0,n=void 0,o=void 0;if(255===i.getUint8(0)&&216===i.getUint8(1))for(var h=i.byteLength,r=2;r<h;){if(255===i.getUint8(r)&&225===i.getUint8(r+1)){n=r;break}r+=1}if(n){var s=n+10;if("Exif"===function(t,i,e){var a="",n=void 0;for(e+=i,n=i;n<e;n+=1)a+=Et(t.getUint8(n));return a}(i,n+4,4)){var d=i.getUint16(s);if(((a=18761===d)||19789===d)&&42===i.getUint16(s+2,a)){var c=i.getUint32(s+4,a);8<=c&&(o=s+c)}}}if(o){var l=i.getUint16(o,a),p=void 0,m=void 0;for(m=0;m<l;m+=1)if(p=o+12*m+2,274===i.getUint16(p,a)){p+=8,e=i.getUint16(p,a),i.setUint16(p,1,a);break}}return e}var Lt={render:function(){this.initContainer(),this.initCanvas(),this.initCropBox(),this.renderCanvas(),this.cropped&&this.renderCropBox()},initContainer:function(){var t=this.element,i=this.options,e=this.container,a=this.cropper;ot(a,S),ht(t,S);var n={width:Math.max(e.offsetWidth,Number(i.minContainerWidth)||200),height:Math.max(e.offsetHeight,Number(i.minContainerHeight)||100)};nt(a,{width:(this.containerData=n).width,height:n.height}),ot(t,S),ht(a,S)},initCanvas:function(){var t=this.containerData,i=this.imageData,e=this.options.viewMode,a=Math.abs(i.rotate)%180==90,n=a?i.naturalHeight:i.naturalWidth,o=a?i.naturalWidth:i.naturalHeight,h=n/o,r=t.width,s=t.height;t.height*h>t.width?3===e?r=t.height*h:s=t.width/h:3===e?s=t.width/h:r=t.height*h;var d={aspectRatio:h,naturalWidth:n,naturalHeight:o,width:r,height:s};d.left=(t.width-r)/2,d.top=(t.height-s)/2,d.oldLeft=d.left,d.oldTop=d.top,this.canvasData=d,this.limited=1===e||2===e,this.limitCanvas(!0,!0),this.initialImageData=it({},i),this.initialCanvasData=it({},d)},limitCanvas:function(t,i){var e=this.options,a=this.containerData,n=this.canvasData,o=this.cropBoxData,h=e.viewMode,r=n.aspectRatio,s=this.cropped&&o;if(t){var d=Number(e.minCanvasWidth)||0,c=Number(e.minCanvasHeight)||0;1<h?(d=Math.max(d,a.width),c=Math.max(c,a.height),3===h&&(d<c*r?d=c*r:c=d/r)):0<h&&(d?d=Math.max(d,s?o.width:0):c?c=Math.max(c,s?o.height:0):s&&((d=o.width)<(c=o.height)*r?d=c*r:c=d/r));var l=Wt({aspectRatio:r,width:d,height:c});d=l.width,c=l.height,n.minWidth=d,n.minHeight=c,n.maxWidth=1/0,n.maxHeight=1/0}if(i)if(h){var p=a.width-n.width,m=a.height-n.height;n.minLeft=Math.min(0,p),n.minTop=Math.min(0,m),n.maxLeft=Math.max(0,p),n.maxTop=Math.max(0,m),s&&this.limited&&(n.minLeft=Math.min(o.left,o.left+(o.width-n.width)),n.minTop=Math.min(o.top,o.top+(o.height-n.height)),n.maxLeft=o.left,n.maxTop=o.top,2===h&&(n.width>=a.width&&(n.minLeft=Math.min(0,p),n.maxLeft=Math.max(0,p)),n.height>=a.height&&(n.minTop=Math.min(0,m),n.maxTop=Math.max(0,m))))}else n.minLeft=-n.width,n.minTop=-n.height,n.maxLeft=a.width,n.maxTop=a.height},renderCanvas:function(t,i){var e=this.canvasData,a=this.imageData;if(i){var n=function(t){var i=t.width,e=t.height,a=t.degree;if(90==(a=Math.abs(a)%180))return{width:e,height:i};var n=a%90*Math.PI/180,o=Math.sin(n),h=Math.cos(n),r=i*h+e*o,s=i*o+e*h;return 90<a?{width:s,height:r}:{width:r,height:s}}({width:a.naturalWidth*Math.abs(a.scaleX||1),height:a.naturalHeight*Math.abs(a.scaleY||1),degree:a.rotate||0}),o=n.width,h=n.height,r=e.width*(o/e.naturalWidth),s=e.height*(h/e.naturalHeight);e.left-=(r-e.width)/2,e.top-=(s-e.height)/2,e.width=r,e.height=s,e.aspectRatio=o/h,e.naturalWidth=o,e.naturalHeight=h,this.limitCanvas(!0,!1)}(e.width>e.maxWidth||e.width<e.minWidth)&&(e.left=e.oldLeft),(e.height>e.maxHeight||e.height<e.minHeight)&&(e.top=e.oldTop),e.width=Math.min(Math.max(e.width,e.minWidth),e.maxWidth),e.height=Math.min(Math.max(e.height,e.minHeight),e.maxHeight),this.limitCanvas(!1,!0),e.left=Math.min(Math.max(e.left,e.minLeft),e.maxLeft),e.top=Math.min(Math.max(e.top,e.minTop),e.maxTop),e.oldLeft=e.left,e.oldTop=e.top,nt(this.canvas,it({width:e.width,height:e.height},Bt({translateX:e.left,translateY:e.top}))),this.renderImage(t),this.cropped&&this.limited&&this.limitCropBox(!0,!0)},renderImage:function(t){var i=this.canvasData,e=this.imageData,a=e.naturalWidth*(i.width/i.naturalWidth),n=e.naturalHeight*(i.height/i.naturalHeight);it(e,{width:a,height:n,left:(i.width-a)/2,top:(i.height-n)/2}),nt(this.image,it({width:e.width,height:e.height},Bt(it({translateX:e.left,translateY:e.top},e)))),t&&this.output()},initCropBox:function(){var t=this.options,i=this.canvasData,e=t.aspectRatio,a=Number(t.autoCropArea)||.8,n={width:i.width,height:i.height};e&&(i.height*e>i.width?n.height=n.width/e:n.width=n.height*e),this.cropBoxData=n,this.limitCropBox(!0,!0),n.width=Math.min(Math.max(n.width,n.minWidth),n.maxWidth),n.height=Math.min(Math.max(n.height,n.minHeight),n.maxHeight),n.width=Math.max(n.minWidth,n.width*a),n.height=Math.max(n.minHeight,n.height*a),n.left=i.left+(i.width-n.width)/2,n.top=i.top+(i.height-n.height)/2,n.oldLeft=n.left,n.oldTop=n.top,this.initialCropBoxData=it({},n)},limitCropBox:function(t,i){var e=this.options,a=this.containerData,n=this.canvasData,o=this.cropBoxData,h=this.limited,r=e.aspectRatio;if(t){var s=Number(e.minCropBoxWidth)||0,d=Number(e.minCropBoxHeight)||0,c=Math.min(a.width,h?n.width:a.width),l=Math.min(a.height,h?n.height:a.height);s=Math.min(s,a.width),d=Math.min(d,a.height),r&&(s&&d?s<d*r?d=s/r:s=d*r:s?d=s/r:d&&(s=d*r),c<l*r?l=c/r:c=l*r),o.minWidth=Math.min(s,c),o.minHeight=Math.min(d,l),o.maxWidth=c,o.maxHeight=l}i&&(h?(o.minLeft=Math.max(0,n.left),o.minTop=Math.max(0,n.top),o.maxLeft=Math.min(a.width,n.left+n.width)-o.width,o.maxTop=Math.min(a.height,n.top+n.height)-o.height):(o.minLeft=0,o.minTop=0,o.maxLeft=a.width-o.width,o.maxTop=a.height-o.height))},renderCropBox:function(){var t=this.options,i=this.containerData,e=this.cropBoxData;(e.width>e.maxWidth||e.width<e.minWidth)&&(e.left=e.oldLeft),(e.height>e.maxHeight||e.height<e.minHeight)&&(e.top=e.oldTop),e.width=Math.min(Math.max(e.width,e.minWidth),e.maxWidth),e.height=Math.min(Math.max(e.height,e.minHeight),e.maxHeight),this.limitCropBox(!1,!0),e.left=Math.min(Math.max(e.left,e.minLeft),e.maxLeft),e.top=Math.min(Math.max(e.top,e.minTop),e.maxTop),e.oldLeft=e.left,e.oldTop=e.top,t.movable&&t.cropBoxMovable&&lt(this.face,m,e.width>=i.width&&e.height>=i.height?W:k),nt(this.cropBox,it({width:e.width,height:e.height},Bt({translateX:e.left,translateY:e.top}))),this.cropped&&this.limited&&this.limitCanvas(!0,!0),this.disabled||this.output()},output:function(){this.preview(),vt(this.element,a,this.getData())}},zt={initPreview:function(){var e=this.crossOrigin,t=this.options.preview,a=e?this.crossOriginUrl:this.url,i=document.createElement("img");if(e&&(i.crossOrigin=e),i.src=a,this.viewBox.appendChild(i),this.viewBoxImage=i,t){var n=t;"string"==typeof t?n=this.element.ownerDocument.querySelectorAll(t):t.querySelector&&(n=[t]),tt(this.previews=n,function(t){var i=document.createElement("img");lt(t,g,{width:t.offsetWidth,height:t.offsetHeight,html:t.innerHTML}),e&&(i.crossOrigin=e),i.src=a,i.style.cssText='display:block;width:100%;height:auto;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;image-orientation:0deg!important;"',t.innerHTML="",t.appendChild(i)})}},resetPreview:function(){tt(this.previews,function(t){var i=ct(t,g);nt(t,{width:i.width,height:i.height}),t.innerHTML=i.html,pt(t,g)})},preview:function(){var r=this.imageData,t=this.canvasData,i=this.cropBoxData,s=i.width,d=i.height,c=r.width,l=r.height,p=i.left-t.left-r.left,m=i.top-t.top-r.top;this.cropped&&!this.disabled&&(nt(this.viewBoxImage,it({width:c,height:l},Bt(it({translateX:-p,translateY:-m},r)))),tt(this.previews,function(t){var i=ct(t,g),e=i.width,a=i.height,n=e,o=a,h=1;s&&(o=d*(h=e/s)),d&&a<o&&(n=s*(h=a/d),o=a),nt(t,{width:n,height:o}),nt(t.getElementsByTagName("img")[0],it({width:c*h,height:l*h},Bt(it({translateX:-p*h,translateY:-m*h},r))))}))}},Ot={bind:function(){var t=this.element,i=this.options,e=this.cropper;_(i.cropstart)&&ft(t,w,i.cropstart),_(i.cropmove)&&ft(t,v,i.cropmove),_(i.cropend)&&ft(t,f,i.cropend),_(i.crop)&&ft(t,a,i.crop),_(i.zoom)&&ft(t,A,i.zoom),ft(e,y,this.onCropStart=this.cropStart.bind(this)),i.zoomable&&i.zoomOnWheel&&ft(e,I,this.onWheel=this.wheel.bind(this)),i.toggleDragModeOnDblclick&&ft(e,b,this.onDblclick=this.dblclick.bind(this)),ft(t.ownerDocument,M,this.onCropMove=this.cropMove.bind(this)),ft(t.ownerDocument,C,this.onCropEnd=this.cropEnd.bind(this)),i.responsive&&ft(window,B,this.onResize=this.resize.bind(this))},unbind:function(){var t=this.element,i=this.options,e=this.cropper;_(i.cropstart)&&ut(t,w,i.cropstart),_(i.cropmove)&&ut(t,v,i.cropmove),_(i.cropend)&&ut(t,f,i.cropend),_(i.crop)&&ut(t,a,i.crop),_(i.zoom)&&ut(t,A,i.zoom),ut(e,y,this.onCropStart),i.zoomable&&i.zoomOnWheel&&ut(e,I,this.onWheel),i.toggleDragModeOnDblclick&&ut(e,b,this.onDblclick),ut(t.ownerDocument,M,this.onCropMove),ut(t.ownerDocument,C,this.onCropEnd),i.responsive&&ut(window,B,this.onResize)}},Yt={resize:function(){var t=this.options,i=this.container,e=this.containerData,a=Number(t.minContainerWidth)||200,n=Number(t.minContainerHeight)||100;if(!(this.disabled||e.width<=a||e.height<=n)){var o=i.offsetWidth/e.width;if(1!==o||i.offsetHeight!==e.height){var h=void 0,r=void 0;t.restore&&(h=this.getCanvasData(),r=this.getCropBoxData()),this.render(),t.restore&&(this.setCanvasData(tt(h,function(t,i){h[i]=t*o})),this.setCropBoxData(tt(r,function(t,i){r[i]=t*o})))}}},dblclick:function(){var t,i;this.disabled||this.options.dragMode===u||this.setDragMode((t=this.dragBox,i=h,(t.classList?t.classList.contains(i):-1<t.className.indexOf(i))?d:s))},wheel:function(t){var i=this,e=Number(this.options.wheelZoomRatio)||.1,a=1;this.disabled||(t.preventDefault(),this.wheeling||(this.wheeling=!0,setTimeout(function(){i.wheeling=!1},50),t.deltaY?a=0<t.deltaY?1:-1:t.wheelDelta?a=-t.wheelDelta/120:t.detail&&(a=0<t.detail?1:-1),this.zoom(-a*e,t)))},cropStart:function(t){if(!this.disabled){var i=this.options,e=this.pointers,a=void 0;t.changedTouches?tt(t.changedTouches,function(t){e[t.identifier]=kt(t)}):e[t.pointerId||0]=kt(t),a=1<Object.keys(e).length&&i.zoomable&&i.zoomOnTouch?E:ct(t.target,m),U.test(a)&&!1!==vt(this.element,w,{originalEvent:t,action:a})&&(t.preventDefault(),this.action=a,this.cropping=!1,a===T&&(this.cropping=!0,ot(this.dragBox,o)))}},cropMove:function(t){var i=this.action;if(!this.disabled&&i){var e=this.pointers;t.preventDefault(),!1!==vt(this.element,v,{originalEvent:t,action:i})&&(t.changedTouches?tt(t.changedTouches,function(t){it(e[t.identifier],kt(t,!0))}):it(e[t.pointerId||0],kt(t,!0)),this.change(t))}},cropEnd:function(t){if(!this.disabled){var i=this.action,e=this.pointers;t.changedTouches?tt(t.changedTouches,function(t){delete e[t.identifier]}):delete e[t.pointerId||0],i&&(t.preventDefault(),Object.keys(e).length||(this.action=""),this.cropping&&(this.cropping=!1,rt(this.dragBox,o,this.cropped&&this.options.modal)),vt(this.element,f,{originalEvent:t,action:i}))}}},Xt={change:function(t){var i=this.options,e=this.canvasData,a=this.containerData,n=this.cropBoxData,o=this.pointers,h=this.action,r=i.aspectRatio,s=n.left,d=n.top,c=n.width,l=n.height,p=s+c,m=d+l,g=0,u=0,f=a.width,v=a.height,w=!0,b=void 0;!r&&t.shiftKey&&(r=c&&l?c/l:1),this.limited&&(g=n.minLeft,u=n.minTop,f=g+Math.min(a.width,e.width,e.left+e.width),v=u+Math.min(a.height,e.height,e.top+e.height));var x,y,M,C=o[Object.keys(o)[0]],D={x:C.endX-C.startX,y:C.endY-C.startY},B=function(t){switch(t){case H:p+D.x>f&&(D.x=f-p);break;case N:s+D.x<g&&(D.x=g-s);break;case z:d+D.y<u&&(D.y=u-d);break;case L:m+D.y>v&&(D.y=v-m)}};switch(h){case k:s+=D.x,d+=D.y;break;case H:if(0<=D.x&&(f<=p||r&&(d<=u||v<=m))){w=!1;break}B(H),c+=D.x,r&&(l=c/r,d-=D.x/r/2),c<0&&(h=N,c=0);break;case z:if(D.y<=0&&(d<=u||r&&(s<=g||f<=p))){w=!1;break}B(z),l-=D.y,d+=D.y,r&&(c=l*r,s+=D.y*r/2),l<0&&(h=L,l=0);break;case N:if(D.x<=0&&(s<=g||r&&(d<=u||v<=m))){w=!1;break}B(N),c-=D.x,s+=D.x,r&&(l=c/r,d+=D.x/r/2),c<0&&(h=H,c=0);break;case L:if(0<=D.y&&(v<=m||r&&(s<=g||f<=p))){w=!1;break}B(L),l+=D.y,r&&(c=l*r,s-=D.y*r/2),l<0&&(h=z,l=0);break;case O:if(r){if(D.y<=0&&(d<=u||f<=p)){w=!1;break}B(z),l-=D.y,d+=D.y,c=l*r}else B(z),B(H),0<=D.x?p<f?c+=D.x:D.y<=0&&d<=u&&(w=!1):c+=D.x,D.y<=0?u<d&&(l-=D.y,d+=D.y):(l-=D.y,d+=D.y);c<0&&l<0?(h=R,c=l=0):c<0?(h=Y,c=0):l<0&&(h=X,l=0);break;case Y:if(r){if(D.y<=0&&(d<=u||s<=g)){w=!1;break}B(z),l-=D.y,d+=D.y,c=l*r,s+=D.y*r}else B(z),B(N),D.x<=0?g<s?(c-=D.x,s+=D.x):D.y<=0&&d<=u&&(w=!1):(c-=D.x,s+=D.x),D.y<=0?u<d&&(l-=D.y,d+=D.y):(l-=D.y,d+=D.y);c<0&&l<0?(h=X,c=l=0):c<0?(h=O,c=0):l<0&&(h=R,l=0);break;case R:if(r){if(D.x<=0&&(s<=g||v<=m)){w=!1;break}B(N),c-=D.x,s+=D.x,l=c/r}else B(L),B(N),D.x<=0?g<s?(c-=D.x,s+=D.x):0<=D.y&&v<=m&&(w=!1):(c-=D.x,s+=D.x),0<=D.y?m<v&&(l+=D.y):l+=D.y;c<0&&l<0?(h=O,c=l=0):c<0?(h=X,c=0):l<0&&(h=Y,l=0);break;case X:if(r){if(0<=D.x&&(f<=p||v<=m)){w=!1;break}B(H),l=(c+=D.x)/r}else B(L),B(H),0<=D.x?p<f?c+=D.x:0<=D.y&&v<=m&&(w=!1):c+=D.x,0<=D.y?m<v&&(l+=D.y):l+=D.y;c<0&&l<0?(h=Y,c=l=0):c<0?(h=R,c=0):l<0&&(h=O,l=0);break;case W:this.move(D.x,D.y),w=!1;break;case E:this.zoom((y=it({},x=o),M=[],tt(x,function(r,t){delete y[t],tt(y,function(t){var i=Math.abs(r.startX-t.startX),e=Math.abs(r.startY-t.startY),a=Math.abs(r.endX-t.endX),n=Math.abs(r.endY-t.endY),o=Math.sqrt(i*i+e*e),h=(Math.sqrt(a*a+n*n)-o)/o;M.push(h)})}),M.sort(function(t,i){return Math.abs(t)<Math.abs(i)}),M[0]),t),w=!1;break;case T:if(!D.x||!D.y){w=!1;break}b=wt(this.cropper),s=C.startX-b.left,d=C.startY-b.top,c=n.minWidth,l=n.minHeight,0<D.x?h=0<D.y?X:O:D.x<0&&(s-=c,h=0<D.y?R:Y),D.y<0&&(d-=l),this.cropped||(ht(this.cropBox,S),this.cropped=!0,this.limited&&this.limitCropBox(!0,!0))}w&&(n.width=c,n.height=l,n.left=s,n.top=d,this.action=h,this.renderCropBox()),tt(o,function(t){t.startX=t.endX,t.startY=t.endY})}},Rt={crop:function(){return!this.ready||this.cropped||this.disabled||(this.cropped=!0,this.limitCropBox(!0,!0),this.options.modal&&ot(this.dragBox,o),ht(this.cropBox,S),this.setCropBoxData(this.initialCropBoxData)),this},reset:function(){return this.ready&&!this.disabled&&(this.imageData=it({},this.initialImageData),this.canvasData=it({},this.initialCanvasData),this.cropBoxData=it({},this.initialCropBoxData),this.renderCanvas(),this.cropped&&this.renderCropBox()),this},clear:function(){return this.cropped&&!this.disabled&&(it(this.cropBoxData,{left:0,top:0,width:0,height:0}),this.cropped=!1,this.renderCropBox(),this.limitCanvas(!0,!0),this.renderCanvas(),ht(this.dragBox,o),ot(this.cropBox,S)),this},replace:function(i){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1];return!this.disabled&&i&&(this.isImg&&(this.element.src=i),t?(this.url=i,this.image.src=i,this.ready&&(this.viewBoxImage.src=i,tt(this.previews,function(t){t.getElementsByTagName("img")[0].src=i}))):(this.isImg&&(this.replaced=!0),this.options.data=null,this.uncreate(),this.load(i))),this},enable:function(){return this.ready&&this.disabled&&(this.disabled=!1,ht(this.cropper,t)),this},disable:function(){return this.ready&&!this.disabled&&(this.disabled=!0,ot(this.cropper,t)),this},destroy:function(){var t=this.element;return ct(t,c)&&(this.isImg&&this.replaced&&(t.src=this.originalUrl),this.uncreate(),pt(t,c)),this},move:function(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:t,e=this.canvasData,a=e.left,n=e.top;return this.moveTo(K(t)?t:a+Number(t),K(i)?i:n+Number(i))},moveTo:function(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:t,e=this.canvasData,a=!1;return t=Number(t),i=Number(i),this.ready&&!this.disabled&&this.options.movable&&(F(t)&&(e.left=t,a=!0),F(i)&&(e.top=i,a=!0),a&&this.renderCanvas(!0)),this},zoom:function(t,i){var e=this.canvasData;return t=(t=Number(t))<0?1/(1-t):1+t,this.zoomTo(e.width*t/e.naturalWidth,null,i)},zoomTo:function(t,i,e){var a,n,o,h=this.options,r=this.canvasData,s=r.width,d=r.height,c=r.naturalWidth,l=r.naturalHeight;if(0<=(t=Number(t))&&this.ready&&!this.disabled&&h.zoomable){var p=c*t,m=l*t;if(!1===vt(this.element,A,{originalEvent:e,oldRatio:s/c,ratio:p/c}))return this;if(e){var g=this.pointers,u=wt(this.cropper),f=g&&Object.keys(g).length?(o=n=a=0,tt(g,function(t){var i=t.startX,e=t.startY;a+=i,n+=e,o+=1}),{pageX:a/=o,pageY:n/=o}):{pageX:e.pageX,pageY:e.pageY};r.left-=(p-s)*((f.pageX-u.left-r.left)/s),r.top-=(m-d)*((f.pageY-u.top-r.top)/d)}else J(i)&&F(i.x)&&F(i.y)?(r.left-=(p-s)*((i.x-r.left)/s),r.top-=(m-d)*((i.y-r.top)/d)):(r.left-=(p-s)/2,r.top-=(m-d)/2);r.width=p,r.height=m,this.renderCanvas(!0)}return this},rotate:function(t){return this.rotateTo((this.imageData.rotate||0)+Number(t))},rotateTo:function(t){return F(t=Number(t))&&this.ready&&!this.disabled&&this.options.rotatable&&(this.imageData.rotate=t%360,this.renderCanvas(!0,!0)),this},scaleX:function(t){var i=this.imageData.scaleY;return this.scale(t,F(i)?i:1)},scaleY:function(t){var i=this.imageData.scaleX;return this.scale(F(i)?i:1,t)},scale:function(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:t,e=this.imageData,a=!1;return t=Number(t),i=Number(i),this.ready&&!this.disabled&&this.options.scalable&&(F(t)&&(e.scaleX=t,a=!0),F(i)&&(e.scaleY=i,a=!0),a&&this.renderCanvas(!0,!0)),this},getData:function(){var e=0<arguments.length&&void 0!==arguments[0]&&arguments[0],t=this.options,i=this.imageData,a=this.canvasData,n=this.cropBoxData,o=void 0;if(this.ready&&this.cropped){o={x:n.left-a.left,y:n.top-a.top,width:n.width,height:n.height};var h=i.width/i.naturalWidth;tt(o,function(t,i){t/=h,o[i]=e?Math.round(t):t})}else o={x:0,y:0,width:0,height:0};return t.rotatable&&(o.rotate=i.rotate||0),t.scalable&&(o.scaleX=i.scaleX||1,o.scaleY=i.scaleY||1),o},setData:function(t){var i=this.options,e=this.imageData,a=this.canvasData,n={};if(this.ready&&!this.disabled&&J(t)){var o=!1;i.rotatable&&F(t.rotate)&&t.rotate!==e.rotate&&(e.rotate=t.rotate,o=!0),i.scalable&&(F(t.scaleX)&&t.scaleX!==e.scaleX&&(e.scaleX=t.scaleX,o=!0),F(t.scaleY)&&t.scaleY!==e.scaleY&&(e.scaleY=t.scaleY,o=!0)),o&&this.renderCanvas(!0,!0);var h=e.width/e.naturalWidth;F(t.x)&&(n.left=t.x*h+a.left),F(t.y)&&(n.top=t.y*h+a.top),F(t.width)&&(n.width=t.width*h),F(t.height)&&(n.height=t.height*h),this.setCropBoxData(n)}return this},getContainerData:function(){return this.ready?it({},this.containerData):{}},getImageData:function(){return this.sized?it({},this.imageData):{}},getCanvasData:function(){var i=this.canvasData,e={};return this.ready&&tt(["left","top","width","height","naturalWidth","naturalHeight"],function(t){e[t]=i[t]}),e},setCanvasData:function(t){var i=this.canvasData,e=i.aspectRatio;return this.ready&&!this.disabled&&J(t)&&(F(t.left)&&(i.left=t.left),F(t.top)&&(i.top=t.top),F(t.width)?(i.width=t.width,i.height=t.width/e):F(t.height)&&(i.height=t.height,i.width=t.height*e),this.renderCanvas(!0)),this},getCropBoxData:function(){var t=this.cropBoxData,i=void 0;return this.ready&&this.cropped&&(i={left:t.left,top:t.top,width:t.width,height:t.height}),i||{}},setCropBoxData:function(t){var i=this.cropBoxData,e=this.options.aspectRatio,a=void 0,n=void 0;return this.ready&&this.cropped&&!this.disabled&&J(t)&&(F(t.left)&&(i.left=t.left),F(t.top)&&(i.top=t.top),F(t.width)&&t.width!==i.width&&(a=!0,i.width=t.width),F(t.height)&&t.height!==i.height&&(n=!0,i.height=t.height),e&&(a?i.height=i.width/e:n&&(i.width=i.height*e)),this.renderCropBox()),this},getCroppedCanvas:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};if(!this.ready||!window.HTMLCanvasElement)return null;var i,e,a,n,o,h,r,s,d,c,l,p,m,g,u,f,v,w,b,x,y,M,C,D,B,k,T,W,E,H,N,L,z,O,Y,X,R,S,I,A,U,j=this.canvasData,P=(i=this.image,e=this.imageData,a=j,n=t,o=e.aspectRatio,h=e.naturalWidth,r=e.naturalHeight,s=e.rotate,d=void 0===s?0:s,c=e.scaleX,l=void 0===c?1:c,p=e.scaleY,m=void 0===p?1:p,g=a.aspectRatio,u=a.naturalWidth,f=a.naturalHeight,v=n.fillColor,w=void 0===v?"transparent":v,b=n.imageSmoothingEnabled,x=void 0===b||b,y=n.imageSmoothingQuality,M=void 0===y?"low":y,C=n.maxWidth,D=void 0===C?1/0:C,B=n.maxHeight,k=void 0===B?1/0:B,T=n.minWidth,W=void 0===T?0:T,E=n.minHeight,H=void 0===E?0:E,N=document.createElement("canvas"),L=N.getContext("2d"),z=Wt({aspectRatio:g,width:D,height:k}),O=Wt({aspectRatio:g,width:W,height:H},"cover"),Y=Math.min(z.width,Math.max(O.width,u)),X=Math.min(z.height,Math.max(O.height,f)),R=Wt({aspectRatio:o,width:D,height:k}),S=Wt({aspectRatio:o,width:W,height:H},"cover"),I=Math.min(R.width,Math.max(S.width,h)),A=Math.min(R.height,Math.max(S.height,r)),U=[-I/2,-A/2,I,A],N.width=xt(Y),N.height=xt(X),L.fillStyle=w,L.fillRect(0,0,Y,X),L.save(),L.translate(Y/2,X/2),L.rotate(d*Math.PI/180),L.scale(l,m),L.imageSmoothingEnabled=x,L.imageSmoothingQuality=M,L.drawImage.apply(L,[i].concat(bt(U.map(function(t){return Math.floor(xt(t))})))),L.restore(),N);if(!this.cropped)return P;var q=this.getData(),$=q.x,Q=q.y,Z=q.width,F=q.height,K=P.width/Math.floor(j.naturalWidth);1!==K&&($*=K,Q*=K,Z*=K,F*=K);var V=Z/F,G=Wt({aspectRatio:V,width:t.maxWidth||1/0,height:t.maxHeight||1/0}),J=Wt({aspectRatio:V,width:t.minWidth||0,height:t.minHeight||0},"cover"),_=Wt({aspectRatio:V,width:t.width||(1!==K?P.width:Z),height:t.height||(1!==K?P.height:F)}),tt=_.width,it=_.height;tt=Math.min(G.width,Math.max(J.width,tt)),it=Math.min(G.height,Math.max(J.height,it));var et=document.createElement("canvas"),at=et.getContext("2d");et.width=xt(tt),et.height=xt(it),at.fillStyle=t.fillColor||"transparent",at.fillRect(0,0,tt,it);var nt=t.imageSmoothingEnabled,ot=void 0===nt||nt,ht=t.imageSmoothingQuality;at.imageSmoothingEnabled=ot,ht&&(at.imageSmoothingQuality=ht);var rt=P.width,st=P.height,dt=$,ct=Q,lt=void 0,pt=void 0,mt=void 0,gt=void 0,ut=void 0,ft=void 0;dt<=-Z||rt<dt?ut=mt=lt=dt=0:dt<=0?(mt=-dt,dt=0,ut=lt=Math.min(rt,Z+dt)):dt<=rt&&(mt=0,ut=lt=Math.min(Z,rt-dt)),lt<=0||ct<=-F||st<ct?ft=gt=pt=ct=0:ct<=0?(gt=-ct,ct=0,ft=pt=Math.min(st,F+ct)):ct<=st&&(gt=0,ft=pt=Math.min(F,st-ct));var vt=[dt,ct,lt,pt];if(0<ut&&0<ft){var wt=tt/Z;vt.push(mt*wt,gt*wt,ut*wt,ft*wt)}return at.drawImage.apply(at,[P].concat(bt(vt.map(function(t){return Math.floor(xt(t))})))),et},setAspectRatio:function(t){var i=this.options;return this.disabled||K(t)||(i.aspectRatio=Math.max(0,t)||NaN,this.ready&&(this.initCropBox(),this.cropped&&this.renderCropBox())),this},setDragMode:function(t){var i=this.options,e=this.dragBox,a=this.face;if(this.ready&&!this.disabled){var n=t===s,o=i.movable&&t===d;t=n||o?t:u,i.dragMode=t,lt(e,m,t),rt(e,h,n),rt(e,p,o),i.cropBoxMovable||(lt(a,m,t),rt(a,h,n),rt(a,p,o))}return this}},St=r.Cropper,It=function(){function e(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};if(Q(this,e),!t||!q.test(t.tagName))throw new Error("The first argument is required and must be an <img> or <canvas> element.");this.element=t,this.options=it({},$,J(i)&&i),this.cropped=!1,this.disabled=!1,this.pointers={},this.ready=!1,this.reloading=!1,this.replaced=!1,this.sized=!1,this.sizing=!1,this.init()}return Z(e,[{key:"init",value:function(){var t=this.element,i=t.tagName.toLowerCase(),e=void 0;if(!ct(t,c)){if(lt(t,c,this),"img"===i){if(this.isImg=!0,e=t.getAttribute("src")||"",!(this.originalUrl=e))return;e=t.src}else"canvas"===i&&window.HTMLCanvasElement&&(e=t.toDataURL());this.load(e)}}},{key:"load",value:function(t){var i=this;if(t){this.url=t,this.imageData={};var e=this.element,a=this.options;if(a.checkOrientation&&window.ArrayBuffer)if(j.test(t))P.test(t)?this.read((n=t.replace(Ht,""),o=atob(n),h=new ArrayBuffer(o.length),tt(r=new Uint8Array(h),function(t,i){r[i]=o.charCodeAt(i)}),h)):this.clone();else{var n,o,h,r,s=new XMLHttpRequest;this.reloading=!0,this.xhr=s;var d=function(){i.reloading=!1,i.xhr=null};s.ontimeout=d,s.onabort=d,s.onerror=function(){d(),i.clone()},s.onload=function(){d(),i.read(s.response)},a.checkCrossOrigin&&Ct(t)&&e.crossOrigin&&(t=Dt(t)),s.open("get",t),s.responseType="arraybuffer",s.withCredentials="use-credentials"===e.crossOrigin,s.send()}else this.clone()}}},{key:"read",value:function(t){var i,e,a,n=this.options,o=this.imageData,h=Nt(t),r=0,s=1,d=1;if(1<h){this.url=(i="image/jpeg",e=new Uint8Array(t),a="",tt(e,function(t){a+=Et(t)}),"data:"+i+";base64,"+btoa(a));var c=function(t){var i=0,e=1,a=1;switch(t){case 2:e=-1;break;case 3:i=-180;break;case 4:a=-1;break;case 5:i=90,a=-1;break;case 6:i=90;break;case 7:i=90,e=-1;break;case 8:i=-90}return{rotate:i,scaleX:e,scaleY:a}}(h);r=c.rotate,s=c.scaleX,d=c.scaleY}n.rotatable&&(o.rotate=r),n.scalable&&(o.scaleX=s,o.scaleY=d),this.clone()}},{key:"clone",value:function(){var t=this.element,i=this.url,e=void 0,a=void 0;this.options.checkCrossOrigin&&Ct(i)&&((e=t.crossOrigin)?a=i:(e="anonymous",a=Dt(i))),this.crossOrigin=e,this.crossOriginUrl=a;var n=document.createElement("img");e&&(n.crossOrigin=e),n.src=a||i;var o=this.start.bind(this),h=this.stop.bind(this);this.image=n,this.onStart=o,this.onStop=h,this.isImg?t.complete?this.timeout=setTimeout(o,0):ft(t,x,o,{once:!0}):(n.onload=o,n.onerror=h,ot(n,l),t.parentNode.insertBefore(n,t.nextSibling))}},{key:"start",value:function(t){var e=this,i=this.isImg?this.element:this.image;t&&(i.onload=null,i.onerror=null),this.sizing=!0;var a=r.navigator&&/(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i.test(r.navigator.userAgent),n=function(t,i){it(e.imageData,{naturalWidth:t,naturalHeight:i,aspectRatio:t/i}),e.sizing=!1,e.sized=!0,e.build()};if(!i.naturalWidth||a){var o=document.createElement("img"),h=document.body||document.documentElement;(this.sizingImage=o).onload=function(){n(o.width,o.height),a||h.removeChild(o)},o.src=i.src,a||(o.style.cssText="left:0;max-height:none!important;max-width:none!important;min-height:0!important;min-width:0!important;opacity:0;position:absolute;top:0;z-index:-1;",h.appendChild(o))}else n(i.naturalWidth,i.naturalHeight)}},{key:"stop",value:function(){var t=this.image;t.onload=null,t.onerror=null,t.parentNode.removeChild(t),this.image=null}},{key:"build",value:function(){if(this.sized&&!this.ready){var t=this.element,i=this.options,e=this.image,a=t.parentNode,n=document.createElement("div");n.innerHTML='<div class="cropper-container" touch-action="none"><div class="cropper-wrap-box"><div class="cropper-canvas"></div></div><div class="cropper-drag-box"></div><div class="cropper-crop-box"><span class="cropper-view-box"></span><span class="cropper-dashed dashed-h"></span><span class="cropper-dashed dashed-v"></span><span class="cropper-center"></span><span class="cropper-face"></span><span class="cropper-line line-e" data-action="e"></span><span class="cropper-line line-n" data-action="n"></span><span class="cropper-line line-w" data-action="w"></span><span class="cropper-line line-s" data-action="s"></span><span class="cropper-point point-e" data-action="e"></span><span class="cropper-point point-n" data-action="n"></span><span class="cropper-point point-w" data-action="w"></span><span class="cropper-point point-s" data-action="s"></span><span class="cropper-point point-ne" data-action="ne"></span><span class="cropper-point point-nw" data-action="nw"></span><span class="cropper-point point-sw" data-action="sw"></span><span class="cropper-point point-se" data-action="se"></span></div></div>';var o=n.querySelector("."+c+"-container"),h=o.querySelector("."+c+"-canvas"),r=o.querySelector("."+c+"-drag-box"),s=o.querySelector("."+c+"-crop-box"),d=s.querySelector("."+c+"-face");this.container=a,this.cropper=o,this.canvas=h,this.dragBox=r,this.cropBox=s,this.viewBox=o.querySelector("."+c+"-view-box"),this.face=d,h.appendChild(e),ot(t,S),a.insertBefore(o,t.nextSibling),this.isImg||ht(e,l),this.initPreview(),this.bind(),i.aspectRatio=Math.max(0,i.aspectRatio)||NaN,i.viewMode=Math.max(0,Math.min(3,Math.round(i.viewMode)))||0,ot(s,S),i.guides||ot(s.getElementsByClassName(c+"-dashed"),S),i.center||ot(s.getElementsByClassName(c+"-center"),S),i.background&&ot(o,c+"-bg"),i.highlight||ot(d,"cropper-invisible"),i.cropBoxMovable&&(ot(d,p),lt(d,m,k)),i.cropBoxResizable||(ot(s.getElementsByClassName(c+"-line"),S),ot(s.getElementsByClassName(c+"-point"),S)),this.render(),this.ready=!0,this.setDragMode(i.dragMode),i.autoCrop&&this.crop(),this.setData(i.data),_(i.ready)&&ft(t,D,i.ready,{once:!0}),vt(t,D)}}},{key:"unbuild",value:function(){this.ready&&(this.ready=!1,this.unbind(),this.resetPreview(),this.cropper.parentNode.removeChild(this.cropper),ht(this.element,S))}},{key:"uncreate",value:function(){var t=this.element;this.ready?(this.unbuild(),this.ready=!1,this.cropped=!1):this.sizing?(this.sizingImage.onload=null,this.sizing=!1,this.sized=!1):this.reloading?this.xhr.abort():this.isImg?t.complete?clearTimeout(this.timeout):ut(t,x,this.onStart):this.image&&this.stop()}}],[{key:"noConflict",value:function(){return window.Cropper=St,e}},{key:"setDefaults",value:function(t){it($,J(t)&&t)}}]),e}();return it(It.prototype,Lt,zt,Ot,Yt,Xt,Rt),It});