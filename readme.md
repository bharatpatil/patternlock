How to use Pattern Lock
=======================

Include jquery and provided javascript file inside your html file.

	<link rel="stylesheet" href="css/patternLock.css" />
	<link rel="stylesheet" type="text/css" href="patternLock-theme.css" />
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.patternlock.js"></script>

Simple Use
----------
	<div id="mypatternlock"></div>
	<script type="text/javascript">	
		(document).ready(function(){
			$('#mypatternlock').patternLock();
		});
	</script>


Options available
-----------------
You can use following options like shown below:

	$(selector).patternLock({ optionName: value });

| Options | Default Value | type | Notes |  
|---------|---------------|------|-------|
| rows    |                 3 | number |                   number of rows for lock holes |  
| columns |                 3 | number |                number of columns for lock holes |  
| width | 250 | number | width in pixels |
| height | 250 | number | height in pixels |
| showPatternLine | true | boolean |  show or hide pattern line |
| patternLineColor | #000000 | string |  color of pattern line |
| lineWidth | 4 | number | width of pattern line |
| selectionColor | #0000ff | string | color to be used as a highlight color of pattern hole |
| fieldName | '' | string |  hidden input field name in which drawn pattern value will be available so that it can be used inside form to submit to the server |
| valueSeparator | , | string | string that will be used inside pattern to separate values like 1,2,3,4 |
| valueArray | [] | array | Yes. You can give your own values to each pattern hole. It will be assigned in a sequence from left to right and top to bottom. Make sure array lenght should be equal to (rows * columns) otherwise it will be skipped. If you don't give your own values then 1,2,3,...n values will be assigned to each hole. Where n = rows * columns |
| centerCircle | false | boolean | it will show or hide circles inside holes |
| centerCircleSize | 20 | number | size of center circles in pixels |
| drawEnd | null | function | callback function that will be called after pattern drawing is done and will be receive drawn pattern as argument |
| timeout | 500 | number (milliseconds) | duration in milliseconds, to show drawn pattern for |
| allowRepeatSelection | false | boolean | option to set whether or not allow repeated selection of lock holes. |