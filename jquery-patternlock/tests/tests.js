var testDefaults = {
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
  timeout: 500
};
test('Check if plugin function availabel', function(assert) {
  expect(1);
  var varType = typeof $.fn.patternLock;
  assert.equal("function", varType, "Plugin loaded");
});

test('Testing if wrapper elements are created', function() {
  expect(3);
  $("#qunit-fixture").patternLock({});
  var fixture = $('#qunit-fixture');
  equal($(fixture).find("div.patternlock").length, 1, 'div.patternlock created');
  equal($(fixture).find("div.patternlock").find("div.insideWrapper").length, 1, 'div.insideWrapper created');
  equal($(fixture).find("table.tbl").length, 1, 'table.tbl.tbl1 created');
  $("#qunit-fixture").patternLock('destroy');
});


function testOptionGroup1(option) {
  test('Testing rows,columns,width,height,fieldName options', function() {
    expect(6);
    $("#qunit-fixture").patternLock(option);
    // extending option 
    option = $.extend({}, testDefaults, option);
    var fixture = $('#qunit-fixture');
    var hiddenField = 0;
    if ($.isEmptyObject(option.fieldName) === false) {
      hiddenField = 1;
    }
    equal($(fixture).find("input[type=hidden]").length, hiddenField, 'Verifying if hidden field created');
    equal($(fixture).find("div.patternlock").width(), option.width, 'Verifying div.patternlock width');
    equal($(fixture).find("div.patternlock").height(), option.height, 'Verifying div.patternlock height');
    equal($(fixture).find("table.tbl").length, 1, 'Table.tbl.tbl1 created');
    equal($(fixture).find("table.tbl >tbody >tr").length, option.rows, 'Verifying number of Rows created');
    equal($(fixture).find("table.tbl >tbody >tr:first >td").length, option.columns, ' Verifying number of Columns created');
    $("#qunit-fixture").patternLock('destroy');
  });
}

testOptionGroup1();
testOptionGroup1({
  rows: 4,
  columns: 4
});
testOptionGroup1({
  rows: 4,
  columns: 2
});
testOptionGroup1({
  width: 300
});
testOptionGroup1({
  height: 300
});
testOptionGroup1({
  width: 300,
  height: 400
});
testOptionGroup1({
  rows: 2,
  column: 3,
  width: 300,
  height: 400
});
testOptionGroup1({
  fieldName: "pattern"
});
testOptionGroup1({
  rows: 2,
  column: 4,
  width: 400,
  height: 500,
  fieldName: "testHiddenField"
});


function testOptionGroup2(option,cells) {

test('Testing if proper pattern generated based on mouse/touch movement,valueSeparator,valueArray', function() {
  expect(1);
  $("#qunit-fixture").patternLock(option);
  // extending option 
  option = $.extend({}, testDefaults, option);
  //Initialising value array 
  if (option.valueArray.length === 0 || option.valueArray.length !== option.rows * option.columns) {
                for (i = 0, len = (option.rows * option.columns); i < len; i++) {
                    option.valueArray[i] = i + 1;
  }}
  var fixture = $('#qunit-fixture');
  var patternExpected = [];

  //Simulation tap and move
  $("table  tr:nth("+cells[0].r+")  td:nth("+cells[0].c+")").mousedown();
  patternExpected.push(option.valueArray[cells[0].r*3+cells[0].c]);

  for(var i=1;i < (cells.length);i++){
    $("table  tr:nth("+cells[i].r+")  td:nth("+cells[i].c+")").mouseenter().mouseleave();
    patternExpected.push(option.valueArray[cells[i].r*option.rows+cells[i].c]);
  }

  $("table  tr:nth("+cells[cells.length-1].r+")  td:nth("+cells[cells.length-1].c+")").mouseup();
  


  equal($(fixture).find("input[type=hidden]").val(), patternExpected.join(option.valueSeparator), 'Matching generated pattern :: Expected pattern '+patternExpected.join(option.valueSeparator));
  $("#qunit-fixture").patternLock('destroy');
});

}

testOptionGroup2({fieldName: "pattern"},[{r:0,c:0},{r:0,c:1},{r:0,c:2}]); //1,2,3
testOptionGroup2({fieldName: "pattern"},[{r:0,c:0},{r:1,c:1},{r:1,c:2},{r:2,c:2}]); //1,5,6,9
testOptionGroup2({fieldName: "pattern"},[{r:0,c:0},{r:1,c:1},{r:1,c:2},{r:2,c:2},{r:2,c:1},{r:2,c:0}]); //1,5,6,9,8,7
testOptionGroup2({fieldName: "pattern",valueSeparator:"-"},[{r:0,c:0},{r:0,c:1},{r:0,c:2}]); //1-2-3
testOptionGroup2({fieldName: "pattern",valueArray:['a','b','c','d','e','f','g','h','i']},[{r:0,c:0},{r:0,c:1},{r:0,c:2}]); //a,b,c
testOptionGroup2({fieldName: "pattern",valueSeparator:"$",valueArray:['a','b','c','d','e','f','g','h','i']},[{r:0,c:0},{r:0,c:1},{r:0,c:2}]); //a$b$c
testOptionGroup2({fieldName: "pattern",rows:4,columns:4},[{r:0,c:0},{r:1,c:1},{r:1,c:2},{r:2,c:2},{r:3,c:3}]); //1,2,3