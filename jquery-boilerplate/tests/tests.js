
test('Check if plugin function availabel', function(assert ) {
  expect(1);
  var varType = typeof $.fn.patternLock;
  assert.equal("function",varType , "Plugin loaded" );
});

test('Testing if wrapper elements are created', function() {
    expect(3);
    $("#qunit-fixture").patternLock({});
    var fixture = $('#qunit-fixture');
    equal($(fixture).find("div.patternlock").length,1, 'div.patternlock created');
    equal($(fixture).find("div.patternlock").find("div.insideWrapper").length,1, 'div.insideWrapper created');
    equal($(fixture).find("table.tbl").length,1, 'table.tbl.tbl1 created');
});


//function testRowsNCol(option){
//        test('Testing rows and columns options', function() {
//            expect(3);
//            $("#qunit-fixture").patternLock({});
//            var fixture = $('#qunit-fixture');
//            equal($(fixture).find("table.tbl").length,1, 'table.tbl.tbl1 created');
//            equal($(fixture).find("table.tbl >tbody >tr").length,option.rows, option.rows + 'rows created');
//            equal($(fixture).find("table.tbl >tbody >tr:first >td").length,option.columns, option.columns + 'columns created');
//        });
//}
//
//testRowsNCol({rows:3,columns:3});
