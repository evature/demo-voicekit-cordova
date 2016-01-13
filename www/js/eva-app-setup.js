window.init_demo_app = function() {

	// To get your Site Code and API Key register to Evature's webservice at http://www.evature.com/registration/form
	var site_code = credentials.site_code; // this is where you put your Site Code 
	var api_key =  credentials.api_key; // this is where you put your API Key
	

	eva.init(site_code, api_key, function(result) {
		console.log("Eva init result ",result);
		if (result.error) {
			$('.eva-record_button').hide();
		}
		else {
			eva.setupUI();
		}
	});

	
	eva.scope = 'f'; // flights only
	
	var dateFormatOptions =  {
		    weekday: "long", year: "numeric", month: "short",
		    day: "numeric", hour: "2-digit", minute: "2-digit"
		};
	
	
	
	/**
	 * These are the Callbacks the Application implements - Eva will activate them when requested by the user.
	 * 
	 *  All the callbacks return the same, the return value should be one of the following:
	 *
	 *  		false - remove the "thinking..." chat bubble and take no further action
	 * 		    true - replace the "thinking..." chat bubble with Eva's reply and speak it
	 * 			string - html string to be added the Eva's reply
	 *          eva.AppResult - and object containing display_it, say_it, (can use different strings for display/speak)
	 *          Promise - can be used for async operations. The promise should resolve to one of the above return values. 
	 *          
	 * 			Note: You can choose to close Eva chat and display a different page instead  
	 */
	eva.callbacks = {
		//"What is the boarding time"
		boardingTime: function() {
			return ": "+ new Date(+new Date() + 3600000*(2+Math.random()*4)).toLocaleTimeString("en-us", dateFormatOptions);
		},
		
		// What is my gate number"
		gate: function() {
			return ": Gate "+(1+Math.random()*12|0) +" at Terminal "+["A","B","C"][Math.random()*3|0];
		},
		
		//"What is the departure time?"
		departureTime: function() {
			// example of HTML string
			return ":<br><h3>"+(new Date(+new Date() + 3600000*24*(2+Math.random()*4)).toLocaleTimeString("en-us", dateFormatOptions))+"</h3>";
		},
		
	    // "What is the arrival time"
		arrivalTime: function() {
			// example of async promise - in this case using jQuery's Defer 
			var p = $.Deferred(function( defer ) {
				setTimeout(function() {
					var result = new Date(+new Date() + 3600000*24*(2+Math.random()*4)).toLocaleTimeString("en-us", dateFormatOptions);
					defer.resolve(result);
				}, 2500);
			});
			return p;
		},
		
		boardingPass: function() {
			// "Show my boarding pass" 
			console.log("This is where trip details will show");
			return new eva.AppResult("", "<table style='border:1px solid white; margin:5px; padding:5px; text-align:center'><tr><th>Code</th><th>Name</th></tr><tr><td>ABC</td><td>James Jones</td></tr></table>", true);
		},
		
		itinerary: function() {
			// "Show my trip details"
			$('#eva-cover').fadeOut(function() {
				alert("this is where you would show the itinerary");
			}); 
			// nothing to add to the default handling - just show&speak the Eva reply
			return true;
		},
		

		/*****
		 * flightSearch - Search for flights!
		 *  
		 * 
		 * Only the [origin, destination, departDate] parameters are mandatory - the rest are optional
		 *  
		 * @return - see above
		 * 
		 * @param originName - human readable name of the origin location
		 * @param originCode -  Airport code of the departure airport
		 * @param destinationName - as above but for the destination location
		 * @param destinationCode
		 *
		 * @param departDateMin - the earliest  departure date/time requested by the user (possibly null if only an upper limit is requested)
		 * @param departDateMax - the latest date/time requested by the user (possibly same as earliest if only a single date is specified, or null if only a lower limit is requested) 
		 * 				Example:  "fly from NY to LA not sooner than December 15th"  -->  departDateMin = Dec 15,  departDateMax = null
		 * 				Example:                  "... no later than December 15th"  -->  departDateMin = null,    departDateMax = Dec 15
		 * 				Example:                             "... on December 15th"  -->  departDateMin = Dec 15,  departDateMax = Dec 15
		 *         
		 *         Note: the Date object passed will have a time of midnight (UTC) AND have an additional 'DATE_ONLY' flag if no time of day is specified.
		 *         	    Example:  "fly from NY to LA on December 15th at 10am"  --> departDate = Date object of "Dec 15th 10:00am (local timezone)"
		 *              Example:  "fly from NY to LA on December 15th"          --> departDate = Date object of "Dec 15th 00:00am (UTC timezone)"
		 *                                                                      --> and also  departDate.DATE_ONLY == true 		
		 *
		 * @param returnDateMin - same as for the departure date, except that it is possible both returnDateMin and Max are null (if one-way flight is requested)
		 * @param returnDateMax
		 *  
		 * @param travelers - travelers.Adult = number of adults specified (undefined if not specified). Same for Infant, Child, Elderly (see enums in eva.enums.TravelersType)
		 * @param nonstop - undefined if not specified,  true/false if requested
		 * @param seatClass - Economy/Business/etc.. see  eva.enums.SeatClass
		 * @param airlines - array of IATA Airline codes requested by the user 
		 * @param redeye - undefined if not speficied, true/false if requested by the user
		 * @param food - Food type requested by the user (see eva.enums.FoodType)
		 * @param seatType - Window/Aisle or undefined if not specified (see eva.enums.SeatType)
		 * @param sortBy - sorting criteria if specified by the user (see eva.enums.SortEnum)
		 * @param sortOrder - sort order if specified by the user (see eva.enums.SortOrderEnum)
		 */
		flightSearch: function( originName, originCode,  destinationName, destinationCode, 
				 departDateMin,  departDateMax,
	             returnDateMin,  returnDateMax,
	             travelers,
	             nonstop, seatClass,  airlines,
	             redeye,  food, seatType,
	             sortBy,  sortOrder ) {
			
			console.log("This is where we would search for flights matching the criteria: from "+originName+" to "+destinationName);
			
			var price = 100+Math.random()*300|0;
			var say_it = "I found a flight costing "+price+" $, Would you like to buy it?"
			var html = "I found a flight costing <span style='color:yellow'>"+price+"$</span><br>Would you like to buy it?<br><button class='buy'>Buy!</button><br>or <a class='see-more'>see more results</a>";
			
			// example returning one value for display and another value for the speaking, in a promise 
			var p = $.Deferred(function( defer ) {
				setTimeout(function() {
					var result = new eva.AppResult(say_it, html, true, 1);
					defer.resolve(result);
				}, 2500);
			});
			return p;
		},
			
	}; // end of callbacks
	
} // end of init_demo_app
