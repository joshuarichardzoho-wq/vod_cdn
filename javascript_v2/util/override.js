//$Id$
/**********override functions *********/

/**
 * 
 * !!!IMPORTANT
 * Don't use $ alias of jQuery.
 * Use RTCPJQuery instead. This file is used as a component.
 * 
 */

window.RTCPJQuery = window.jQuery;

function isJQueryAvailable() {
	return typeof window.jQuery !== 'undefined' && window.$ == window.jQuery && typeof jQuery.fn != 'undefined' && typeof jQuery.fn.on === 'function';		//No i18n 
}

_rtcpDefineReadOnlyProperty = function(obj, propertyName, value) //not used
{
	Object.defineProperty(obj, propertyName, {
		value : value,
		writable : false
	});
}

_rtcpDefineReadOnlyProperties = function(obj, propNameVsValue) //not used
{
	for(var propertyName in propNameVsValue)
	{
		Object.defineProperty(obj, propertyName, {
			value : propNameVsValue[propertyName],
			writable : false
		});
	}
}

function injectZRJQueryOverrides() {
	if (typeof window.RTCPJQuery === 'undefined') {
		window.RTCPJQuery = window.jQuery;
	}
	
	/**
	 * Criteria to apply to initDragContainer, allowed keys are,
	 * 
	 * draggablearea - elem from which the drag can be initiated whereas the parent drag element should have [dragitem] attribute
	 * ondragstart - a callback function that will be called before mousedown is handled, return true/false to handle/ignore the event
	 * ondragend - a callback function that will be called on mouseup after drag was started
	 * 
	 */
	
	RTCPJQuery.fn.initDragContainerZR = function(criteria) //not used
	{
		var drgBox = this;
		//For caching values for drag events
		var drag;
		var posOldCorrection;
		var posParentTop;
		var posParentBottom;
		var posOld;
		var draggableArea = '[dragitem]';		//by default draggable area is the whole dragging element
		criteria = RTCPJQuery.extend({},criteria);
		if(typeof criteria.draggable_area !== "undefined")
		{
			draggableArea = criteria.draggable_area;
		}
		RTCPJQuery(draggableArea).addClass("drag");
		
		drgBox.on('mousedown',draggableArea,function(e){
			e.preventDefault();
			
			drag = RTCPJQuery(this);
			if(draggableArea !== '[dragitem]')
			{
				drag = RTCPJQuery(this).closest('[dragitem]');
			}
			if(typeof criteria.ondragstart === 'function') {
				criteria.ondragstart(event);
			}
			posParentTop = drgBox.offset().top;
			posParentBottom = posParentTop + drgBox.height();
			posOld = drag.offset().top;
			posOldCorrection = e.pageY - posOld;
			
			drgBox.on('mousemove', mouseMove).one('mouseup', mouseUp).off('mouseleave').one('mouseleave', mouseUp);   //NO I18N
		});
		
		var mouseMove = function(e)
		{
			var posNew = e.pageY - posOldCorrection;
			if(posNew < posParentTop)
			{
				drag.offset({'top': posParentTop});	//NO I18N
				if (drag.prev().length > 0) {
					drag.insertBefore(drag.prev());	//NO I18N
				}
			} 
			else if(posNew + drag.height() > posParentBottom)
			{
				drag.offset({'top': posParentBottom - drag.height()});	//NO I18N
				if (drag.next().length > 0) {
					drag.insertAfter(drag.next());	//NO I18N
				}
			}
			else 
			{
				drag.offset({'top': posNew});	//NO I18N
				drag.css('z-index', '1');
				var marginTop = parseInt(drag.css("margin-top")) / 2;
				var haschange = false;
				if (posOld - posNew > drag.outerHeight() + marginTop){
					drag.insertBefore( drag.prev() );	//NO I18N
					haschange = true;
				} else if (posNew - posOld > drag.outerHeight() + marginTop){
					drag.insertAfter( drag.next() );	//NO I18N
					haschange = true;
				}
				if(haschange)
				{
					drag.offset({'top':posNew});  //NO I18N
					posOld = drag.offset().top;
					posNew = e.pageY - posOldCorrection;
					posOldCorrection = e.pageY - posOld;
				}
			}
		};
		var mouseUp = function(e){
			drgBox.off('mousemove', mouseMove).off('mouseup', mouseUp);
			drag.animate({'top':0}, 100, function(){	//NO I18N
				drag.css('z-index', '0');
			});
			if(typeof criteria.ondragend === 'function') {
				criteria.ondragend(e);
			}
		};
	}

	RTCPJQuery.getImgStaticUrlZR = function()		
	{
		return typeof RTCPMediaUtil !== 'undefined' && typeof RTCPMediaUtil.BRIDGE !== 'undefined' ? RTCPMediaUtil.BRIDGE.Constants._IMGSTATICURL : $RTCPGlobal._IMGSTATICURL;		//No i18n 
	}
	
	RTCPJQuery.fn.hasOnlyChildrenlikeZR = function(name, value) //not used		// if the element has same kind of childrens 		iteration benefit > instead of using chilren()
	{
		return RTCPJQuery(this[0].firstChild).attr(name) === value;
	};

	(function() {
		
		var ANIMATIONENDLISTENERS = { 
			noprefix: "animationend",		//No I18N 
			Moz: "animationend",			//No I18N 
			Webkit: "webkitAnimationEnd",	//No I18N 
			O: "oAnimationEnd",				//No I18N 
			ms: "MSAnimationEnd"			//No I18N 
		};
		
		var TRANSITIONENDLISTENERS = {
			noprefix: 'transitionend',		//No i18n
			Moz: 'transitionend',			//No i18n
			Webkit: 'webkitTransitionEnd',	//No i18n
			O: 'oTransitionEnd',			//No i18n
			ms: 'MSTransitionEnd'			//No i18n
		};
		
		function getAnimationEndListener() {
			return getListenerType(ANIMATIONENDLISTENERS);
		}
		
		function getTransitionEndListener() {
			return getListenerType(TRANSITIONENDLISTENERS);
		}
		
		function getListenerType(listener) {
			var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];				//No i18n
	 
		    if( document.body.style.animationName !== undefined )  { 
		    	return listener.noprefix; 
		    }     
		    else { 
				for( var i = 0, len = domPrefixes.length; i < len; i++ ) { 
				    if( document.body.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) { 
				    	return listener[ domPrefixes[i] ]; 
				    } 
				} 
		    }
		}
		
		//Will remove element if no callback function is passed
		function handleListenerEnd(elem, endListener, options, callback) {
			function triggerCallback(event, elem) {
				if(typeof callback === 'function') {
					callback(event, elem);
				}
				else {
					elem.remove();
				}	
			}
			
			if(endListener) {
				function handler(event) {
					triggerCallback(event, RTCPJQuery(this));
				}
				
				if(typeof options.selector !== 'undefined') {
					elem.on(endListener, options.selector, handler)
				}
				else {
					elem.off(endListener).on(endListener, handler);
				}
			}
			else {
				triggerCallback();
			}
		}
		
		/**
		 * If no callback function is passed, element will be removed after end
		 * 
		 * Options param can contain the following,
		 * 
		 * Selector - any child selector  
		 * 
		 */
		
		RTCPJQuery.fn.handleAnimationEndZR = function(callback, options) {
			var opts = RTCPJQuery.extend({}, options);
			
			if(this.length) {
				var animEndListener = getAnimationEndListener();
				handleListenerEnd(this, animEndListener, opts, callback);
			}
		}
	
		RTCPJQuery.fn.handleTransitionEndZR = function(callback, options) {
			var opts = RTCPJQuery.extend({}, options);
			
			if(this.length) {
				var transitionEndListener = getTransitionEndListener();
				handleListenerEnd(this, transitionEndListener, opts, callback);
			}
		}
	}());


	//Can pass string of classes or array
	
	RTCPJQuery.fn.cssAnimationZR = function(classes) { //not used
		if(Array.isArray(classes)) {
			classes = classes.join(' ');
		}
		
		this.addClass(classes);
		this.handleAnimationEndZR(function(event, elem) { //not used
			elem.removeClass(classes);
		})
	}
	
	RTCPJQuery.fn.cssTransitionZR = function(classes) { //not used
		if(Array.isArray(classes)) {
			classes = classes.join(' ');
		}
		
		this.addClass(classes);
		this.handleTransitionEndZR(function(event, elem) { //not used
			elem.removeClass(classes);
		})
	};

	/**
	 * Criteria to apply to the drag events, allowed keys are,
	 * 
	 * draggablearea - elem to which drag events can be restricted
	 * dragboundary - elem within which drag can be done
	 * ondragstart - a callback function that will be called before mousedown is handled, return true/false to handle/ignore the event
	 * ondrag - a callback function that will be called during mousemove (NOTE: is fired a lot of times per second)
	 * ondragend - a callback function that will be called on mouseup after drag was started
	 * areaToBeVisible - an object with width and height specified which resctricts the container from getting hidden completely ( If not specified the container width and height will be taken as default )
	 * 
	 */
	
	RTCPJQuery.fn.setAsDraggableZR = function(criteria)
	{
		var doc = RTCPJQuery(document);
		var container = this;
		var criteria = RTCPJQuery.extend({}, {
			areaToBeVisible : {
				width : container.width(),
				height : container.height() 
			}
		},
		criteria);
		
		//If no draggable area is defined make the container as the draggable area
		var draggableArea = (!$RTCPWC.Util.isEmpty(criteria.draggablearea) && criteria.draggablearea.length) ? criteria.draggablearea : container;	
		
		if(draggableArea.length === 0)
		{
			return;
		}
		
		draggableArea.addClass("ZRdrag");
		
		//Data to be cached for drag on mousedown
		var diff = {};
		
		//To limit the drag to a container
		var isDragBound = !$RTCPWC.Util.isEmpty(criteria.dragboundary) && criteria.dragboundary.length;
		var isDragBoundBasedOnElem  = criteria.isPositionBasedOnElem ? criteria.isPositionBasedOnElem : false;
		var boundaryElem = isDragBound ? criteria.dragboundary : RTCPJQuery(window);
		var boundaryOffset = { left: 0, top: 0 };
		
		var startPos = {};
		
		var boundaryWidth = 0;
		var boundaryHeight = 0;
		var containerWidth = 0;
		var containerHeight = 0;
		
		//To prevent click on child elements after drag stop
		var preventClick = function(event) {
			var currentPos = { left: event.clientX, top: event.clientY };
			
			if(Math.abs(startPos.left - currentPos.left) > 5 || Math.abs(startPos.top - currentPos.top) > 5)
			{
				event.stopImmediatePropagation();
			}
		}
		
		var onDrag = function(dragEvent)
		{
			dragEvent.preventDefault();
	
			var left = Math.max(boundaryOffset.left - containerWidth + criteria.areaToBeVisible.width, dragEvent.clientX - diff.left);
			var top = Math.max(boundaryOffset.top - containerHeight + criteria.areaToBeVisible.height, dragEvent.clientY - diff.top);
			left = Math.min(left, boundaryWidth + boundaryOffset.left - criteria.areaToBeVisible.width);
			top = Math.min(top, boundaryHeight + boundaryOffset.top -  criteria.areaToBeVisible.height);
			
			if(container.length)
			{
				container[0].style.top = top + 'px';
				container[0].style.left = left + 'px';
			}
			
			if(typeof criteria.ondrag === 'function') {
				criteria.ondrag(dragEvent);
			}
			
			container.off('click', preventClick).one('click', preventClick);		//No i18n
		};
		
		var onDrop = function(dropEvent)
		{
			dropEvent.preventDefault();
			doc.off("mousemove", onDrag);
			
			if(typeof criteria.ondragend === 'function') {
				criteria.ondragend(dropEvent);
			}
		};
		
		var mouseDown = function(event) 
		{
			event.stopImmediatePropagation();
			
			if(criteria.isClickoutside && typeof RTCPClickoutside !== "undefined")
			{
				RTCPClickoutside.handleClickOnChild(event);
			}
			
			if(typeof criteria.ondragstart === 'function') {
				var isValidEvent = criteria.ondragstart(event);
				if(!isValidEvent) {
					return;
				}
			}
			
			//Calculates on every mouse down ( cached for drag )
			containerWidth = container.width();
			containerHeight = container.height();
			boundaryWidth = boundaryElem.width();
			boundaryHeight = boundaryElem.height();
			
			if(isDragBound && !isDragBoundBasedOnElem) {
				var boundaryClientRect = boundaryElem[0].getBoundingClientRect();
				boundaryOffset = { left: boundaryClientRect.left, top: boundaryClientRect.top };
			}
			
			var offset = container.offset();
			if(isDragBound && isDragBoundBasedOnElem)
			{
				var draggableAreaOffset = criteria.dragboundary.offset();
				offset.left = offset.left - draggableAreaOffset.left;
				offset.top = offset.top - draggableAreaOffset.top;
			}
			diff.left = event.clientX - offset.left;
			diff.top = event.clientY - offset.top;
			startPos = { left: event.clientX, top: event.clientY };
			
			doc.on("mousemove", onDrag);
			doc.one("mouseup", onDrop);		//No i18n
		};
		
		//Event binded to draggable area
		draggableArea.off("mousedown").on("mousedown", mouseDown);
	};

		/* 
		 * resizeBoundaryElem - area with in resize to be done
		 * aspectratio - width & height will be calculated based on aspect ratio [1.6* will be the apt resize for both height & width]
		 * callBack - callback which give width and height for each position change
		 * widthRage, heightRange - min and max rage for resize (if not given default value will be 245*154[Min], boundary size[Max])
		 *
		 * SAMPLE :
		 * var criteria = { 
		 * 				aspectratio : 1.6,
		 *				widthRange : { max : 800, min : 580 },
		 *				heightRange : { max : 345, min : 145 },
		 *				callBack : function(width, height){ }
		 *		};
		 */
	RTCPJQuery.fn.setAsNonDraggableZR = function(criteria)
	{
		var container = this;
		var draggableArea = ( typeof criteria != "undefined" && !$RTCPWC.Util.isEmpty(criteria.draggablearea) && criteria.draggablearea.length) ? criteria.draggablearea : container; //No i18n

		if(draggableArea.length === 0)
		{
			return;
		}

		draggableArea.removeClass("ZRdrag");

		//remove event binded to draggable area
		draggableArea.off("mousedown");
	};

	RTCPJQuery.fn.setAsResizableZR = function(givenCriteria)
	{
		var doc = RTCPJQuery(document);
		var win = RTCPJQuery(window);
	
		var criteria = RTCPJQuery.extend({}, {
					resizeBoundaryElem : win,
					aspectRatio : 1,
					widthRange : {
						min : 245,
						max : win.width()
					},
					heightRange : {
						min : 154,
						max : win.height()
					},
					avoidResizeUsingBorders : false
		}, givenCriteria);
		
		var container = RTCPJQuery(this);
		
		var resizeBoundaryElem = criteria.resizeBoundaryElem;
		
		if(resizeBoundaryElem)
		{
			win = resizeBoundaryElem;
		}
		
		var isAspectRatioNeeded = (criteria.aspectRatio === 1) ? false : true;
		
		var callBack = criteria.callBack;
		
		var diff = {};
		var originalSize = {};
		var originalMousePosition = {};
		var position = 0;
		var containerPos = {};
		var element = container[0];
		var currentResizePoint = "top_left_corner";		//No I18N
		
		var mouseDown = function(event)
		{
			event.stopImmediatePropagation();
			
			originalSize = {
					width : container.width(),
					height : container.height()
			};
			originalMousePosition = {
					x : event.pageX,
					y : event.pageY
			};
		    position = container.position();
		    containerPos = {
		    		right : win.width() - position.left - originalSize.width,
		    		bottom : win.height() - position.top - originalSize.height,
		    		left : position.left,
		    		top :  position.top
		    };
		    
		    currentResizePoint = event.target.getAttribute("position");
		    
			doc.on('mousemove', mouseMove);
			doc.one('mouseup', mouseUp); //No I18N
		}
		
		function getFitSize(size, minSize, maxSize)
		{
			return Math.min(Math.max(size, minSize), maxSize);
		}
	
		function isValidWidth(position, width)
		{
			return position + width <= resizeBoundaryElem.width();
		}
	
		function isValidHeight(position, height)
		{
			return position + height <= resizeBoundaryElem.height();
		}
		
		function setContainerProperty(width, height, top, bottom, left, right)
		{
			container.css({"width":width, "height":height, "top":top, "bottom":bottom, "left":left, "right":right});
			callBack(width, height);
		}
	
		function getRange(inverseValue)
		{
			//If side is left value will be -1 
			//If side is right value will be 1
			var value = (inverseValue) ? 1 : -1; 
			return {
					width : getFitSize(originalSize.width + (value * diff.x), criteria.widthRange.min, criteria.widthRange.max),
					height : getFitSize(originalSize.height + (value * diff.y), criteria.heightRange.min, criteria.heightRange.max),
					aspectRatioWidth : getFitSize(originalSize.width + (diff.y * (value * criteria.aspectRatio)), criteria.widthRange.min, criteria.widthRange.max),
					aspectRatioHeight : getFitSize(originalSize.height + (diff.x / (value * criteria.aspectRatio)), criteria.heightRange.min, criteria.heightRange.max)
				};
		}
		
		function calculateRange(width, height, widthPosition, heightPosition)
		{
			if(isValidHeight(heightPosition, height) && isValidWidth(widthPosition, width))
			{
				var top = "";
				var bottom = "";
				var left = "";
				var right = "";
				if(heightPosition === containerPos.top)
				{
					top = containerPos.top;
				}
				else
				{
					bottom = containerPos.bottom;
				}
				if(widthPosition === containerPos.left)
				{
					left = containerPos.left;
				}
				else
				{
					right = containerPos.right;
				}		
				setContainerProperty(width, height, top, bottom, left, right);
			}
		}
		
		var handlePosition =
		{
			top_left_corner : function()
			{
				var range = getRange(false);
				calculateRange(range.aspectRatioWidth, range.height, containerPos.right, containerPos.bottom);
			},
			top_border : function()
			{
				var range = getRange(false);
				calculateRange((isAspectRatioNeeded) ? range.aspectRatioWidth : originalSize.width, range.height, containerPos.right, containerPos.bottom);
			},
			top_right_corner : function()
			{
				var range = getRange(true);
				calculateRange(range.width, range.aspectRatioHeight, containerPos.left, containerPos.bottom);
			},
			right_border : function()
			{
				var range = getRange(true);
				calculateRange(range.width, (isAspectRatioNeeded) ? range.aspectRatioHeight : originalSize.height, containerPos.left, containerPos.bottom);
			},
			bottom_right_corner : function()
			{
				var range = getRange(true);
				calculateRange(range.aspectRatioWidth, range.height, containerPos.left, containerPos.top);
			},
			bottom_border : function()
			{
				var range = getRange(true);
				calculateRange((isAspectRatioNeeded) ? range.aspectRatioWidth : originalSize.width, range.height, containerPos.left, containerPos.top);
			},
			bottom_left_corner : function()
			{
				var range = getRange(false);
				calculateRange(range.width, range.aspectRatioHeight, containerPos.right, containerPos.top);
			},
			left_border : function()
			{
				var range = getRange(false);
				calculateRange(range.width, (isAspectRatioNeeded) ? range.aspectRatioHeight : originalSize.height, containerPos.right, containerPos.top);
			}
		};
		
		var mouseMove = function(event) 
		{
			event.preventDefault();
			
			diff = {
				 x : event.pageX - originalMousePosition.x,
				 y : event.pageY - originalMousePosition.y
			};
			
			handlePosition[currentResizePoint](event);
		}
		
	    var mouseUp = function(event) 
		{
			doc.off('mousemove', mouseMove);
		}
	    
	    if(!container.find('[enable_resize]').length)
	    {
	    		var cornerArray = [{className:'zc-av-top-left-corner', keyName:'top_left_corner'},{className:'zc-av-top-right-corner', keyName:'top_right_corner'},{className:'zc-av-bottom-right-corner', keyName:'bottom_right_corner'},{className:'zc-av-bottom-left-corner', keyName:'bottom_left_corner'}]; //No I18N
	    		var borderArray = [{className:'zc-av-top-border', keyName:'top_border'},{className:'zc-av-right-border', keyName:'right_border'},{className:'zc-av-bottom-border', keyName:'bottom_border'},{className:'zc-av-left-border', keyName:'left_border'}]; //No I18N
	    		
	    		var directionArray = borderArray.concat(cornerArray);
	    		if( criteria.avoidResizeUsingBorders )
	    		{
	    			directionArray = cornerArray;
	    		}
	    		var html = '';
	    		for(var i = 0; i < directionArray.length; i++)
	    		{
	    			html += '<div enable_resize class="zc-av-drag-handle '+ directionArray[i].className +'" position='+ directionArray[i].keyName +'></div>';
	    		} 
	    		container = container.append(html);
	    }
	    
	    container.find('[enable_resize]').on('mousedown', mouseDown);
	};
	
	RTCPJQuery.fn.removeResizableZR = function ()
	{
		var container = RTCPJQuery(this);
		container.find('[enable_resize]').remove();
	};

	RTCPJQuery.fn.isScrolledToViewZR = function(container, x, y) //not used
	{
	    /* Function to check whether an element is in visible area or not
	     * 
	     * Usage :
	     * RTCPJQuery("#<elemid>").isOnScreen();		//returns true, if an element is completely visible on screen
	     * RTCPJQuery("#<elemid>").isOnScreen(container, 0.2, 0.5);		//returns true, if atleast 20% of element's width and 50% of element's height is visible inside the container
	     * */
		
		if(x == null || typeof x == 'undefined')
	    {
	    	x = 1;
	    }
	    if(y == null || typeof y == 'undefined')
	    {
	    	y = 1;
	    }
	    
	    var win = container ? RTCPJQuery(container) : RTCPJQuery(window);
	    var viewport = 
	    {
	        top : win.offset().top,
	        left : win.offset().left
	    };
	    viewport.right = viewport.left + win.width(); 
	    viewport.bottom = viewport.top + win.height();
	    
	    var height = this.outerHeight();
	    var width = this.outerWidth();
	 
	    if(!width || !height)
	    {
	        return false;
	    }
	    
	    var bounds = this.offset();
	    bounds.right = bounds.left + width;
	    bounds.bottom = bounds.top + height;
	    
	    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	    
	    if(!visible)
	    {
	        return false;   
	    }
	    
	    var deltas = 
	    {
	        top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
	        bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
	        left : Math.min(1, ( bounds.right - viewport.left ) / width),
	        right : Math.min(1, ( viewport.right - bounds.left ) / width)
	    };
	    
	    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
	    
	};

	if(typeof RTCPJQuery.escapeSelector !== 'function') {
		RTCPJQuery.escapeSelector = function(selector) {
			if(typeof selector === 'string' && selector.length > 0) {
				//Not exhaustive, but covers most CSS selector special characters
				selector = selector.replace(/([!"#$%&'()*+,-./:;<=>?@[\]^`{|}~])/g, '\\$1');
			}
			
			return selector;
		}
	}
	var $originalFindMethod =  RTCPJQuery.fn.find;

	RTCPJQuery.fn.find = function( selector )
	{   
		//if a channel contains threads, $(chid).find("#chatbody") includes both parent chat's chatbody and thread's chatbody
		//so restricting find method to return only first matched element( i.e parent chat )
		if( ( selector == "#chatbody" || selector == "#msgarea" ) && this.length == 1  ){ //No I18n
			return $originalFindMethod.apply( this, arguments ).first();
		}
		
		return $originalFindMethod.apply( this, arguments );
	}
}

if (isJQueryAvailable()) {
	if (typeof window.RTCPJQuery === 'undefined') {
		window.RTCPJQuery = window.jQuery;
	}
	
	injectZRJQueryOverrides();
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if(!Date.prototype.addDays){
	Date.prototype.addDays = function(days) {
	    this.setDate(this.getDate() + days);
	};
}

Object.defineProperty(Array.prototype, 'insert', {		//No i18n
    enumerable: false,
    writable: true,
    value: function(index, element) {
    	this.splice(index, 0, element);
    }
});

//Removes only first instance !!
Object.defineProperty(Array.prototype, 'removeElement', {		//No i18n
    enumerable: false,
    writable: true,
    value: function(element) {
    	var index = this.indexOf(element);
    	if(index > -1) { this.splice(index,1) };
    }
});

if(typeof HTMLElement.prototype.scrollIntoViewZR !== "undefined" && typeof HTMLElement.prototype.scrollIntoViewIfNeededZR === "undefined") {
	HTMLElement.prototype.scrollIntoViewIfNeededZR = function(alignTop) {
		this.scrollIntoViewZR({
			block : alignTop ? "start" : "nearest"	//No I18N
		});
	}
} else if(typeof HTMLElement.prototype.scrollIntoViewZR === "undefined" && typeof HTMLElement.prototype.scrollIntoViewIfNeededZR !== "undefined") {	//No I18N
	HTMLElement.prototype.scrollIntoViewZR = function(scrollIntoViewOptions) {
		var alignTop = typeof scrollIntoViewOptions === "object" && scrollIntoViewOptions.block === "start";	//No I18N
		this.scrollIntoViewIfNeededZR(alignTop);
	}
}
