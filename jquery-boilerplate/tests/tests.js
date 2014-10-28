
test('Check if plugin function availabel', function(assert ) {
  expect(1);
  var varType = typeof $.fn.patternLock;
  assert.equal("function",varType , "Plugin loaded" );
});
