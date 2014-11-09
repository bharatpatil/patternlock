/*
 *  Pattern Lock - v1.0.0
 *  Android like pattern lock for web with touch event support
 *  
 *
 *  Made by Bharat Patil
 *  Under CustomLicense License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function($, window, document, undefined) {
    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.
    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).
    // Create the defaults once
    var pluginName = "patternLock",
        defaults = {
            rows: 3,
            columns: 3,
            width: 250,
            height: 250,
            randomizeIds: false, // this should be used to randomizeId of td //todo
            isCircle: true, // this will be required to identify if holes are of shape circle or square // todo
            showPatternLine: true,
            patternLineColor: '#000000',
            fieldName: '',
            valueSeparator: ',',
            valueArray: [],
            centerCircle: false,
            lineWidth: 4,
            centerCircleSize: 10,
            drawEnd: null,
            selectionColor: '#0000ff',
            timeout: 500,
            allowRepeatSelection: false
        },
        isCanvas = (function() {
            //function taken from http://stackoverflow.com/questions/2745432/best-way-to-detect-that-html5-canvas-is-not-supported
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        }()),
        cssstyle = '<style id="patternLockStyylee"></style>',
        i, j, idCounter, context, len;
    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.started = false;
        this.nums = [];
        this.arrCoordinates = [];
        this.patternClearTimeout = null;
        this.canvas = null;
        this.canvasContext = null;
        this.selectionClass = 'myselectionClass' + (new Date().getTime());
        this.selectionClassStyle = '.' + this.selectionClass;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            this.initIESupport();
            if ($('#patternLockStyylee').length === 0) {
                $(cssstyle).appendTo('head');
            }
            //try catch needed for IE8
            try {
                this.selectionClassStyle += '{ background-color: ' + this.options.selectionColor + ' !important; }';
                $('#patternLockStyylee').append(this.selectionClassStyle);
            } catch (e) {
                this.selectionClass = 'ie8FallbackHighlight';
            }
            var _that = this;
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
            //Initializing value array
            if (this.options.valueArray.length === 0 || this.options.valueArray.length !== this.options.rows * this.options.columns) {
                for (i = 0, len = (this.options.rows * this.options.columns); i < len; i++) {
                    this.options.valueArray[i] = i + 1;
                }
            }
            var content = '<div class="patternlock" style="width:' + this.options.width + 'px;height:' + this.options.height + 'px"><div class="insideWrapper">';
            if ($.isEmptyObject(this.options.fieldName) === false) {
                content += '<input type="hidden" name="' + this.options.fieldName + '">';
            }
            if (isCanvas === true && this.options.showPatternLine === true) {
                content += '<canvas class="patternLockCanvas" width="100%" height="100%;"></canvas>';
            }
            content += '<table class="tbl tbl1" cellspacing="25px">';
            idCounter = 0;
            for (i = 1; i <= this.options.rows; i++) {
                content = content + "<tr>";
                for (j = 1; j <= this.options.columns; j++) {
                    content = content + '<td class="lockTd cell-' + this.options.valueArray[idCounter] + '" data-value="' + this.options.valueArray[idCounter] + '">';
                    if (this.options.centerCircle) {
                        content = content + '<div class="centerCircle cir-' + this.options.valueArray[idCounter] + '" style="width:' + this.options.centerCircleSize + 'px;height:' + this.options.centerCircleSize + 'px"></div>';
                    }
                    idCounter++;
                    content = content + '</td>';
                }
                content = content + "</tr>";
            }
            content = content + '</table>';
            content = content + '</div></div>';
            $(this.element).append(content);
            /*** check if container is smaller than table ****/
            var tableWidth = $('table.tbl', this.element).outerWidth(),
                tableHeight = $('table.tbl', this.element).outerHeight(),
                containerElement = $('.patternlock', this.element);
            if (tableWidth > this.options.width) {
                this.options.width = tableWidth;
            }
            if (tableHeight > this.options.height) {
                this.options.height = tableHeight;
            }
            containerElement.css({
                width: this.options.width,
                height: this.options.height
            });
            /**** check if container is smaller than table *****/
            if (isCanvas === true && this.options.showPatternLine === true) {
                _that.canvas = $('.patternLockCanvas', this.element)[0];
                _that.canvas.width = this.options.width;
                _that.canvas.height = this.options.height;
                _that.canvasContext = _that.canvas.getContext('2d');
            }
            this.bindEvents();
        },
        initIESupport: function() {
            //array indexOf not supported :(
            //http://stackoverflow.com/questions/3629183/why-doesnt-indexof-work-on-an-array-ie8
            //https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility    
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function(elt /*, from*/ ) {
                    var len = this.length >>> 0;
                    var from = Number(arguments[1]) || 0;
                    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                    if (from < 0) from += len;
                    for (; from < len; from++) {
                        if (from in this && this[from] === elt) return from;
                    }
                    return -1;
                };
            }
        },
        bindEvents: function() {
            var _that = this;
            $('td.lockTd', this.element).bind('mouseenter', function(evt) {
                evt.preventDefault();
                _that.lockMoveMouse(this);
            });
            $('td.lockTd', this.element).bind('mousedown', function() {
                if (_that.patternClearTimeout) {
                    clearTimeout(_that.patternClearTimeout);
                    _that.clearSelection();
                }
                _that.lockStartMouse(this);
            });
            $('.tbl', this.element).bind('touchmove', function(evt) {
                evt.preventDefault();
                context = $(this);
                var touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0],
                    xpos = touch.pageX,
                    ypos = touch.pageY;
                _that.lockMoveTouch(context, xpos, ypos);
            });
            $('.tbl', this.element).bind('touchstart', function(evt) {
                if (_that.patternClearTimeout) {
                    clearTimeout(_that.patternClearTimeout);
                    _that.clearSelection();
                }
                var touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0],
                    xpos = touch.pageX,
                    ypos = touch.pageY;
                evt.preventDefault();
                context = $(this);
                _that.lockStartTouch(context, xpos, ypos);
            });
            $('.tbl', this.element).bind('mouseup touchend', function(evt) {
                evt.preventDefault();
                _that.pattenDrawEnd();
            });
            $(document).bind('mouseup touchend', function() {
                _that.pattenDrawEnd();
            });
        },
        lockStartMouse: function(thatTd) {
            this.started = true;
            this.nums = [];
            this.arrCoordinates = [];
            $(thatTd).removeClass('selected ' + this.selectionClass);
            this.clearCanvas();
            $(thatTd).addClass('selected ' + this.selectionClass);
            this.nums.push($(thatTd).attr('data-value'));
            this.arrCoordinates.push(this.getCenter(thatTd));
        },
        lockMoveMouse: function(thatTd) {
            var num = $(thatTd).attr('data-value'),
                lastNum = this.nums[this.nums.length - 1];
            if (this.started === true && lastNum !== num && (this.options.allowRepeatSelection || this.nums.indexOf(num) === -1)) {
                this.arrCoordinates.push(this.getCenter(thatTd));
                this.drawLine();
                $(thatTd).addClass('selected ' + this.selectionClass);
                this.nums.push($(thatTd).attr('data-value'));
            }
        },
        lockStartTouch: function(context, xpos, ypos) {
            var element = null,
                _that = this;
            $('td.lockTd', context).each(function() {
                if (_that.isMouseOverLockHoles($(this), xpos, ypos)) {
                    element = $(this);
                    _that.started = true;
                    _that.nums = [];
                    _that.arrCoordinates = [];
                    _that.clearCanvas();
                    $(element).addClass('selected ' + _that.selectionClass);
                    _that.nums.push($(element).attr('data-value'));
                    _that.arrCoordinates.push(_that.getCenter(element));
                    return;
                }
            });
        },
        lockMoveTouch: function(context, xpos, ypos) {
            var element = null,
                _that = this;
            $('td.lockTd', context).each(function() {
                if (_that.isMouseOverLockHoles($(this), xpos, ypos)) {
                    element = $(this);
                    var num = $(element).attr('data-value'),
                        lastNum = _that.nums[_that.nums.length - 1];
                    if (_that.started === true && lastNum !== num && (_that.options.allowRepeatSelection || _that.nums.indexOf(num) === -1)) {
                        _that.arrCoordinates.push(_that.getCenter(element));
                        _that.drawLine();
                        $(element).addClass('selected ' + _that.selectionClass);
                        _that.nums.push($(element).attr('data-value'));
                    }
                    return;
                }
            });
        },
        isInsideCircle: function(x, y, r, left, top) {
            return Math.sqrt(Math.pow(left - x, 2) + Math.pow(top - y, 2)) <= r;
        },
        getCenter: function(ele) {
            if (isCanvas === false || this.options.showPatternLine === false) {
                return;
            }
            var offset = $(ele).position(),
                width = $(ele).outerWidth(),
                height = $(ele).outerHeight(),
                centerX = offset.left + width / 2,
                centerY = offset.top + height / 2;
            return {
                'x': centerX,
                'y': centerY
            };
        },
        clearCanvas: function() {
            if (isCanvas === false || this.options.showPatternLine === false) {
                return;
            }
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var w = this.canvas.width;
            this.canvas.width = 1;
            this.canvas.width = w;
        },
        drawLine: function() {
            if (isCanvas === false || this.options.showPatternLine === false || this.arrCoordinates.length < 2) {
                return;
            }
            var c = this.arrCoordinates;
            i = c.length - 1;
            this.canvasContext.lineWidth = this.options.lineWidth;
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(c[i - 1].x, c[i - 1].y);
            this.canvasContext.lineTo(c[i].x, c[i].y);
            this.canvasContext.strokeStyle = this.options.patternLineColor;
            this.canvasContext.stroke();
            this.canvasContext.closePath();
        },
        pattenDrawEnd: function() {
            if (this.started === true) {
                this.started = false;
                if (this.patternClearTimeout) {
                    clearTimeout(this.patternClearTimeout);
                }
                var _that = this;
                this.patternClearTimeout = setTimeout(function() {
                    _that.clearSelection();
                }, _that.options.timeout);
                var patternValue = this.nums.join(this.options.valueSeparator);
                if ($.isEmptyObject(this.options.fieldName) === false) {
                    $('input[type=hidden][name=' + this.options.fieldName + ']').val(patternValue);
                }
                if (this.options.drawEnd && $.isFunction(this.options.drawEnd)) {
                    this.options.drawEnd.call(null, patternValue);
                }
            }
        },
        clearSelection: function() {
            $('.tbl td', this.element).removeClass('selected ' + this.selectionClass);
            this.clearCanvas();
        },
        isMouseOverLockHoles: function(element, left, top) {
            var offset = element.offset();
            if (this.options.isCircle === true) {
                var radius = element.width() / 2;
                return this.isInsideCircle(offset.left + radius, offset.top + radius, radius, left, top);
            }
            return top >= offset.top && left >= offset.left && left <= (offset.left + element[0].offsetWidth) && top <= (offset.top + element[0].offsetHeight);
        }
    };
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function(options) {
        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));
                }
            });
        }
        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            // Cache the method call
            // to make it possible
            // to return a value
            // var returns;
            this.each(function() {
                // var instance = $.data(this, 'plugin_' + pluginName);
                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                // if (instance instanceof Plugin && typeof instance[options] === 'function') {
                // Call the method of our plugin instance,
                // and pass it the supplied arguments.
                // returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                // }
                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                    $.data(this, 'plugin_' + pluginName, null);
                    $(this).empty();
                }
            });
            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            // return returns !== undefined ? returns : this;
            return this;
        }
    };
})(jQuery, window, document);