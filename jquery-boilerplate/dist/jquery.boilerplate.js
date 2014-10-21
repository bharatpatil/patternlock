/*
 *  jQuery Boilerplate - v3.3.1
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
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
        _that = this;
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
                    content = content + '<td data-value="' + this.options.valueArray[idCounter++] + '">';
                    if (this.options.centerCircle) {
                        content = content + '<div class="centerCircle" style="width:' + this.options.centerCircleSize + 'px;height:' + this.options.centerCircleSize + 'px">&nbsp;</div>';
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
            $('.tbl').on('vmousemove', function(evt) {
                evt.preventDefault();
                context = $(this);
                $('td', context).each(function() {
                    if (_that.isMouseOverLockHoles($(this), evt.pageX, evt.pageY)) {
                        var num = $(this).attr('data-value'),
                            lastNum = _that.nums[_that.nums.length - 1];
                        if (_that.started === true && lastNum !== num) {
                            _that.arrCoordinates.push(_that.getCenter(this));
                            _that.drawLine();
                            $(this).addClass('selected');
                            _that.nums.push($(this).attr('data-value'));
                        }
                    }
                });
            });
            $('.tbl').on('vmouseup', function(evt) {
                evt.preventDefault();
                _that.pattenDrawEnd();
            });
            $(document).on('vmouseup', function() {
                _that.pattenDrawEnd();
            });
            $('.tbl').on('vmousedown', function(evt) {
                if (_that.patternClearTimeout) {
                    clearTimeout(_that.patternClearTimeout);
                }
                evt.preventDefault();
                context = $(this);
                $('td', context).each(function() {
                    if (_that.isMouseOverLockHoles($(this), evt.pageX, evt.pageY)) {
                        _that.started = true;
                        _that.nums = [];
                        _that.arrCoordinates = [];
                        $('td', context).removeClass('selected');
                        _that.clearCanvas();
                        $(this).addClass('selected');
                        _that.nums.push($(this).attr('data-value'));
                        _that.arrCoordinates.push(_that.getCenter(this));
                    }
                });
            });
        },
        yourOtherFunction: function() {
            // some logic
        },
        isInsideCircle: function(x, y, r, left, top) {
            return Math.sqrt(Math.pow(left - x, 2) + Math.pow(top - y, 2)) <= r;
        },
        getCenter: function(ele) {
            if (isCanvas === false || this.options.showPatternLine === false) {
                return;
            }
            var offset = $(ele).offset(),
                width = $(ele).outerWidth(),
                height = $(ele).outerHeight(),
                centerX = offset.left + width / 2,
                centerY = offset.top + height / 2,
                rect = _that.canvas.getBoundingClientRect();
            centerX = centerX - rect.left;
            centerY = centerY - rect.top;
            return {
                'x': centerX,
                'y': centerY
            };
        },
        clearCanvas: function() {
            if (isCanvas === false || this.options.showPatternLine === false) {
                return;
            }
            _that.canvasContext.clearRect(0, 0, _that.canvas.width, _that.canvas.height);
            var w = _that.canvas.width;
            _that.canvas.width = 1;
            _that.canvas.width = w;
        },
        drawLine: function() {
            if (isCanvas === false || this.options.showPatternLine === false || _that.arrCoordinates.length < 2) {
                return;
            }
            var c = _that.arrCoordinates;
            i = c.length - 1;
            _that.canvasContext.lineWidth = this.options.lineWidth;
            _that.canvasContext.beginPath();
            _that.canvasContext.moveTo(c[i - 1].x, c[i - 1].y);
            _that.canvasContext.lineTo(c[i].x, c[i].y);
            _that.canvasContext.strokeStyle = this.options.patternLineColor;
            _that.canvasContext.stroke();
            _that.canvasContext.closePath();
        },
        pattenDrawEnd: function() {
            if (_that.started === true) {
                $('#pattern').text(_that.nums.join(','));
                if (this.options.fieldName != undefined && this.options.fieldName !== '' && this.options.fieldName != null) {
                    $('input[type=hidden][name=' + this.options.fieldName + ']').val(_that.nums.join(this.options.valueSeparator));
                }
                _that.started = false;
                if (_that.patternClearTimeout) {
                    clearTimeout(_that.patternClearTimeout);
                }
                _that.patternClearTimeout = setTimeout(function() {
                    $('.tbl td').removeClass('selected');
                    _that.clearCanvas();
                }, 1000);
            }
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