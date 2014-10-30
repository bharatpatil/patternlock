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