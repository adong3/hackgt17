jQuery(document).ready(function(){
	resultLog = jQuery('#resultLog');
	equation = jQuery('#equation');

	jQuery('#switch').val('off');
	updateCoinTable();
	var updateCoinTableInterval = null;


	var pemdas = [
		["^"],
		["*", "/"],
		["+","-"]
	];

	var openers = ["{", "[", "("];
	var closers = ["}", "]", ")"];

	jQuery('#switch').click(function(event){
		if (jQuery('#switch').val() == 'on') {
			jQuery('#switch').val('off');
			if (updateCoinTableInterval != null) {
				clearInterval(updateCoinTableInterval);
			}
		} else {
			jQuery('#switch').val('on');
			updateCoinTableInterval = setInterval(updateCoinTable, 60 * 1000);
		}
	});

	jQuery('#calculateButton').click(function(event){
		beginCalculation();
	});

	function beginCalculation() {
		var answer = 0;
		var str = equation.val().replace(/\s/g, '');
		var result = parseInput(str);

		resultLog.append("<p>" + result + "</p>");
	}

	function parseInput(str) {
		if (!validParentheses(str)) {
			return "invalid parentheses";
		}

		var arr = []
		var lastPush = -1;

		for(var i = 0; i < str.length; i++) {
			var char = str.charAt(i);
			if (isNaN(char) && char !== ".") {
				if ((i - lastPush) > 1) {
					arr.push($.trim(str.substring(lastPush + 1, i)));
				}
				arr.push($.trim(str.substring(i, i + 1)));
				lastPush = i;
			}
		}
		//puts the last number (if not followed by parentheses) into the array
		if (!isNaN(str.charAt(str.length - 1))) {
			arr.push($.trim(str.substring(lastPush + 1, str.length)));
		}

		var evaluation = evaluate(arr);
		if(isNaN(evaluation)) {
			return evaluation;
		}
		return str + ' = ' + Number((evaluation).toFixed(4));
	}

	function evaluate(arr) {
		var stack = [];
		for (var i = 0; i < arr.length; i++) {
			var symbol = arr[i];
			if ($.inArray(symbol, openers) > -1) {
				stack.push(i);
			} else if ($.inArray(symbol, closers) > -1) {
				var lastOpener = stack.pop();
				var tmpVal = evaluate(arr.slice(lastOpener + 1, i));
				arr.splice(lastOpener, i - lastOpener);
				arr[lastOpener] = tmpVal;
				i -= (i - lastOpener);
			}
		}

		if(arr.length === 1) {
			return arr[0];
		}

		var calculation = 0;
		var pemdasIndex = 0;

		while(pemdasIndex < pemdas.length) {
			var ops = pemdas[pemdasIndex];
			for (var i = 2; i < arr.length; i += 2) {
				if ($.inArray(arr[i - 1], ops) > -1) {
					var num1 = arr[i - 2];
					var operator = arr[i - 1];
					var num2 = arr[i];
					calculation = calculate(num1, operator, num2);
					if (isNaN(calculation)) {
						return "you broke me";
					}
					arr[i - 2] = calculation;
					arr.splice(i - 1, 2);
					i -= 2;
				}
			}
			pemdasIndex++;
		}
		return calculation;
	}

	function calculate(num1, operator, num2) {
		if (isNaN(num1) || isNaN(num2)) {
			return "error1";
		}
		var float1 = parseFloat(num1);
		var float2 = parseFloat(num2);
		switch(operator) {
			case "^":
				return Math.pow(float1, float2);
				break;
			case "*":
				return float1 * float2;
				break;
			case "/":
				return float1 / float2;
				break;
			case "+":
				return float1 + float2;
				break;
			case "-":
				return float1 - float2;
				break;
			default:
				return "error2";
		}
	}

	function validParentheses(str) {
		var stack = [];

		for (var i = 0; i < str.length; i++) {
			var char = str.charAt(i);
			if ($.inArray(char, openers) > -1) {
				stack.push(char);
			} else if ($.inArray(char, closers) > -1) {
				var popped = stack.pop();
				if (openers.indexOf(popped) !== closers.indexOf(char)) {
					return false;
				}
			}
		}
		return (stack.length === 0);
	}

	jQuery( "#clearLogs" ).click(function(event) {
		resultLog.empty();
	});

	jQuery('#otherButton').click(function(event){
		alert("Hello, I'm another dialog.");
	});

	jQuery("#equation").keypress(function (e) {
	    if (e.keyCode == 13) {
	    	e.preventDefault();
	        beginCalculation();
	    }
	 });

	function updateCoinTable() {
		$('#coinTableBody').empty();
		$.get( "https://api.coinmarketcap.com/v1/ticker/?limit=100", function( data ) {
		  	for (var i = 0; i < 100; i++) {
		  		var rank = "<tr><td>" + data[i].rank + "</td>";
		  		var name = "<td>" + data[i].name + "</td>";
		  		var price = "<td>$" + data[i].price_usd + "</td>";

		  		var oneHr = data[i].percent_change_1h;
		  		var twentyfourHr = data[i].percent_change_24h;
		  		var sevenDay = data[i].percent_change_7d;

		  		var success = 'class="success"';
		  		var danger = 'class="danger"';

		  		if (oneHr.charAt(0) !== "-") {
		  			oneHr = "<td " + success + ">" + "+" + oneHr + "%</td>";
		  		} else {
		  			oneHr = "<td " + danger + ">" + oneHr + "%</td>";
		  		}

		  		if (twentyfourHr.charAt(0) !== "-") {
		  			twentyfourHr = "<td " + success + ">" + "+" + twentyfourHr + "%</td>";
		  		} else {
		  			twentyfourHr = "<td " + danger + ">" + twentyfourHr + "%</td>";
		  		}

		  		if (sevenDay.charAt(0) !== "-") {
		  			sevenDay = "<td " + success + ">" + "+" + sevenDay + "%</td></tr>";
		  		} else {
		  			sevenDay = "<td " + danger + ">" + sevenDay + "%</td></tr>";
		  		}

		  		$("#coinTableBody").append(rank + name+ price + oneHr + twentyfourHr + sevenDay);
		  	}

		}, "json" );
	}
});