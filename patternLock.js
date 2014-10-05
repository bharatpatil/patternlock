/*jslint browser: true*/
/*global $, jQuery*/
(function($) {
    'use strict';
    $.fn.patternLock = function(options) {
        var started = false,
            nums = [],
            arrCoordinates = [],
            patternClearTimeout = null,
            isCanvas = (function() {
                //function taken from http://stackoverflow.com/questions/2745432/best-way-to-detect-that-html5-canvas-is-not-supported
                var elem = document.createElement('canvas');
                return !!(elem.getContext && elem.getContext('2d'));
            }()),
            that = this;
        var canvas, canvasContext, context;
        var i, j, idCounter;
        var defaults = function() {
            return {
                rows: 3,
                columns: 3,
                width: 250,
                height: 250,
                randomizeIds: false, // this should be used to randomizeId of td
                isCircle: true, // this will be required to identify if holes are of shape circle or square
                showPatterLine: true,
                patternLineColor: '#000000'
            };
        };
        //this is to keep from overriding our "defaults" object.
        var opts = $.extend({}, defaults(), options);

        var content = '<div class="patternlock" style="width:' + opts.width + 'px;height:' + opts.height + 'px"><div class="insideWrapper">';
        if(isCanvas) {
            content += '<canvas class="patternLockCanvas" width="100%" height="100%;"></canvas>';
        }
        content += '<table class="tbl tbl1" cellspacing="25px">';
        idCounter = 1;
        for (i = 1; i <= opts.rows; i++) {
            content = content + "<tr>";
            for (j = 1; j <= opts.columns; j++) {
                content = content + '<td data-value="' + (idCounter++) + '">&nbsp;</td>';
            }
            content = content + "</tr>";
        }
        content = content + '</table></div></div>';
        this.append(content);

        if(isCanvas) {
            canvas = $('.patternLockCanvas', that)[0];
            canvas.width = opts.width;
            canvas.height = opts.width;
            canvasContext = canvas.getContext('2d');
        }

        function SimpleCircle(x, y, r) {
            this.centerX = x;
            this.centerY = y;
            this.radius = r;
        }

        SimpleCircle.prototype = {
            distanceTo: function(pageX, pageY) {
                return Math.sqrt(Math.pow(pageX - this.centerX, 2) + Math.pow(pageY - this.centerY, 2));
            },
            includesXY: function(x, y) {
                return this.distanceTo(x, y) <= this.radius;
            }
        };

        function isMouseOverLockHoles(element, left, top) {
            var offset = element.offset();
            if (opts.isCircle === true) {
                var radius = element.width() / 2,
                    circle = new SimpleCircle(offset.left + radius, offset.top + radius, radius);
                //TO-DO: are we going to support only circle of square as well
                return circle.includesXY(left, top);
            }
            return top >= offset.top && left >= offset.left && left <= (offset.left + element[0].offsetWidth) && top <= (offset.top + element[0].offsetHeight);
        }

        function getCenter(ele) {
            var offset = $(ele).offset(),
                width = $(ele).outerWidth(),
                height = $(ele).outerHeight(),
                centerX = offset.left + width / 2,
                centerY = offset.top + height / 2,
                rect = canvas.getBoundingClientRect();
            centerX = centerX - rect.left;
            centerY = centerY - rect.top;
            return {
                'x': centerX,
                'y': centerY
            };
        }

        function clearCanvas() {
            if(!isCanvas) {
                return;
            }
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            var w = canvas.width;
            canvas.width = 1;
            canvas.width = w;
        }

        function drawLine() {
            if(!isCanvas || arrCoordinates.length < 2) {
                return;
            }
            var c = arrCoordinates;
            i = c.length - 1;
            canvasContext.lineWidth = 4;
            canvasContext.beginPath();
            canvasContext.moveTo(c[i - 1].x, c[i - 1].y);
            canvasContext.lineTo(c[i].x, c[i].y);
            canvasContext.strokeStyle = opts.patternLineColor;
            canvasContext.stroke();
            canvasContext.closePath();
        }

        function pattenDrawEnd() {
            if (started === true) {
                $('#pattern').text(nums.join(','));
                started = false;
                if (patternClearTimeout) {
                    clearTimeout(patternClearTimeout);
                }
                patternClearTimeout = setTimeout(function() {
                    $('.tbl td').removeClass('selected');
                    clearCanvas();
                }, 1000);
            }
        }
        $('.tbl').on('vmousemove', function(evt) {
            evt.preventDefault();
            context = $(this);
            $('td', context).each(function() {
                if (isMouseOverLockHoles($(this), evt.pageX, evt.pageY)) {
                    var num = $(this).attr('data-value'),
                        lastNum = nums[nums.length - 1];
                    if (started === true && lastNum !== num) {
                        arrCoordinates.push(getCenter(this));
                        drawLine();
                        $(this).addClass('selected');
                        nums.push($(this).attr('data-value'));
                    }
                }
            });
        });
        $('.tbl').on('vmouseup', function(evt) {
            evt.preventDefault();
            pattenDrawEnd();
        });
        $(document).on('vmouseup', function() {
            pattenDrawEnd();
        });
        $('.tbl').on('vmousedown', function(evt) {
            if (patternClearTimeout) {
                clearTimeout(patternClearTimeout);
            }
            evt.preventDefault();
            context = $(this);
            $('td', context).each(function() {
                if (isMouseOverLockHoles($(this), evt.pageX, evt.pageY)) {
                    started = true;
                    nums = [];
                    arrCoordinates = [];
                    $('td', context).removeClass('selected');
                    clearCanvas();
                    $(this).addClass('selected');
                    nums.push($(this).attr('data-value'));
                    arrCoordinates.push(getCenter(this));
                }
            });
        });
    };
}(jQuery));