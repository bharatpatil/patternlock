
(function( $ ) {
$.fn.patternLock = function( options ) {

var started = false;
var nums = [];
var arrCoordinates = [];
var canvas,context;

  defaults = function(){
      return {
              rows: 3,
              columns:3,
              width : 250,
              height : 250
             };
      };

    //this is to keep from overriding our "defaults" object.
    var opts = $.extend( {},defaults(), options );
  
    var content = '<div class="patternlock"><div class="insideWrapper"><canvas id="patternLockCanvas" width="100%" height="100%;"></canvas><table class="tbl tbl1" cellspacing="25px">';
  for(var i=1;i <= opts.rows;i++){
    content = content+"<tr>";
   for(var j=1;j <= opts.columns;j++){
    content = content+'<td id="'+(i*j)+'">&nbsp;</td>';
    } 
    content = content+"</tr>";
  }
  content= content+'</table></div></div>';    
  this.append(content);   

canvas = document.getElementById('patternLockCanvas');
canvas.width  = opts.width;
canvas.height = opts.width;
context = canvas.getContext('2d');

function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }

function div_overlap(jqo, left, top) {
    var d = jqo.offset();
    return top >= d.top && left >= d.left && left <= (d.left+jqo[0].offsetWidth) && top <= (d.top+jqo[0].offsetHeight);
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
      
  
  return {'x': centerX, 'y': centerY};  
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
}

function drawLines() {
  clearCanvas();
  if(arrCoordinates.length < 2)
    return;
  var c = arrCoordinates;
  context.lineWidth = 4;
  for(var i=1, len = c.length; i<len; i++) {
    context.beginPath();
    context.moveTo(c[i-1].x, c[i-1].y);
    context.lineTo(c[i].x, c[i].y);
    context.strokeStyle = '#000000';
    context.stroke();
    context.closePath();    
  }
}

$('.tbl').on('vmousemove', function(evt){
  evt.preventDefault();
  var context = $(this);
  $('td', context).each(function(index) {
       if ( div_overlap($(this), evt.pageX, evt.pageY) ) {
         var num = $(this).attr('id'),
             lastNum = nums[nums.length-1];
         if(started === true && lastNum !== num) {
          arrCoordinates.push(getCenter(this));          
          $(this).addClass('blue');
          nums.push($(this).attr('id'));
         }          
       }
    });
});

$('.tbl').on('vmouseup', function(evt){
  evt.preventDefault();
  var context = $(this);
  $('td', context).each(function(index) {
       if ( div_overlap($(this), evt.pageX, evt.pageY) ) {
         $('#pattern').text(nums.join(','));
         started = false;     
         drawLines();
       }
  });
});

  $(document).on('vmouseup', function(){
    if(started === true) {
      $('#pattern').text(nums.join(','));
      started = false;
      drawLines();
      window.tmo = setTimeout(function(){
        $('.tbl td').removeClass('blue');
        clearCanvas();
      },1000);
    }
  });
  

$('.tbl').on('vmousedown', function(evt){
  if(window.tmo) clearTimeout(window.tmo);
  evt.preventDefault();
  var context = $(this);
  $('td', context).each(function(index) {
       if ( div_overlap($(this), evt.pageX, evt.pageY) ) {
         started = true;
         nums = [];
         arrCoordinates = [];
         $('td', context).removeClass('blue');
         $(this).addClass('blue');
                     nums.push($(this).attr('id'));                  
         arrCoordinates.push(getCenter(this));

       }
    });
});
 
};
})(jQuery);