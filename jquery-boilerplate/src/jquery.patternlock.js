// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function($, window, document, undefined) {
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
            randomizeIds: false, // this should be used to randomizeId of td
            isCircle: true, // this will be required to identify if holes are of shape circle or square
            showPatternLine: true,
            patternLineColor: '#000000',
            fieldName: '',
            valueSeparator: ',',
            valueArray: [],
            centerCircle: false,
            lineWidth: 4,
            centerCircleSize: 10
        },
        isCanvas = (function() {
            //function taken from http://stackoverflow.com/questions/2745432/best-way-to-detect-that-html5-canvas-is-not-supported
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        }()),
        i, j, idCounter, _that, context;
    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.started = false,
        this.nums = [],
        this.arrCoordinates = [],
        this.patternClearTimeout = null,
        this.canvas = null,
        this.canvasContext = null,
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
            var _that = this;
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
            //Initializing value array
            if (this.options.valueArray.length === 0 || this.options.valueArray.length !== this.options.rows * this.options.columns) {
                for (i = 0; i < (this.options.rows * this.options.columns); i++) {
                    this.options.valueArray[i] = i + 1;
                }
            }
            var content = '<div class="patternlock" style="width:' + this.options.width + 'px;height:' + this.options.height + 'px"><div class="insideWrapper">';
            if (this.options.fieldName != undefined && this.options.fieldName !== '' && this.options.fieldName != null) {
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
                        content = content + '<div class="centerCircle cir-' + this.options.valueArray[idCounter++] + '" style="width:' + this.options.centerCircleSize + 'px;height:' + this.options.centerCircleSize + 'px">&nbsp;</div>';
                    }
                    content = content + '</td>';
                }
                content = content + "</tr>";
            }
            content = content + '</table></div></div>';
            $(this.element).append(content);
            if (isCanvas === true && this.options.showPatternLine === true) {
                _that.canvas = $('.patternLockCanvas', this.element)[0];
                _that.canvas.width = this.options.width;
                _that.canvas.height = this.options.width;
                _that.canvasContext = _that.canvas.getContext('2d');
            }
            this.bindEvents();
        },
        bindEvents: function() {
            var _that = this;
            $('td.lockTd', this.element).bind('mouseenter', function(evt) {
                evt.preventDefault();
                _that.lockMoveMouse(this);
            });
            $('td.lockTd', this.element).bind('mousedown', function(evt) {
                if (_that.patternClearTimeout) {
                    clearTimeout(_that.patternClearTimeout);
                    _that.clearSelection();
                }
                _that.lockStartMouse($(this));
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
            $(thatTd).removeClass('selected');
            this.clearCanvas();
            $(thatTd).addClass('selected');
            this.nums.push($(thatTd).attr('data-value'));
            this.arrCoordinates.push(this.getCenter(thatTd));
        },
        lockMoveMouse: function(thatTd) {
            var num = $(thatTd).attr('data-value'),
                lastNum = this.nums[this.nums.length - 1];
            if (this.started === true && lastNum !== num) {
                this.arrCoordinates.push(this.getCenter(thatTd));
                this.drawLine();
                $(thatTd).addClass('selected');
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
                    $(element).addClass('selected');
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
                    if (_that.started === true && lastNum !== num) {
                        _that.arrCoordinates.push(_that.getCenter(element));
                        _that.drawLine();
                        $(element).addClass('selected');
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
                centerY = offset.top + height / 2,
                rect = this.canvas.getBoundingClientRect();
            // centerX = centerX - rect.left;
            // centerY = centerY - rect.top;
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
                }, 500);


                var patternValue = this.nums.join(this.options.valueSeparator);
                if (this.options.fieldName != undefined && this.options.fieldName !== '' && this.options.fieldName != null) {
                    $('input[type=hidden][name=' + this.options.fieldName + ']').val(patternValue);
                }
                if (this.options.drawEnd && $.isFunction(this.options.drawEnd)) {
                    this.options.drawEnd.call(null, patternValue);
                }
            }
        },
        clearSelection: function() {
            $('.tbl td', this.element).removeClass('selected');
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
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);