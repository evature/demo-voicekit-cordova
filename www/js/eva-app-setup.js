
window.init_demo_app = function() {
	var HOST = "https://chat.evature.com";
	HOST = "http://192.168.86.188:8000"
	
	$(function() {
		
	
	// To get your Site Code and API Key register to Evature's webservice at http://www.evature.com/registration/form
	var site_code = credentials.site_code; // this is where you put your Site Code 
	var api_key =  credentials.api_key; // this is where you put your API Key
	
	eva.startRecordingAfterQuestion = true;

	eva.init(site_code, api_key, function(result) {
		console.log("Eva init result ",result);
		if (result.error) {
			$('.eva-record_button').hide();
		}
		else {
			eva.setupUI({minZIndex: 57});
		}
	});

	
	eva.scope = 'fp'; // flights only
	
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
		
		airline: function(data) {
			console.log("Asking for airline ", data);
			if (data) {
				data = data[0];
				data_str = JSON.stringify(data);
				console.log(">>> data_str");
				var p = $.Deferred(function(defer) {
					$.ajax({
						url:  HOST+"/flight_status", 
						type: "post",
						data: data_str,
						success: function(html) {
							result = new eva.AppResult(false, 
									"<div class='flight-status-cont'>"+html+"</div>", true);
							defer.resolve(result);
						}
					})
				});
				p.SayIt = "Flight "+data.Name + " "+data.Number;
				return p;
			}
		},
		
		// What is my gate number"
		gate: function() {
			return new eva.AppResult(true, "<h3>Gate 12 at Terminal B</h3>", true);
			//return ": Gate "+(1+Math.random()*12|0) +" at Terminal "+["A","B","C"][Math.random()*3|0];
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
			console.log("This is where boarding pass will show");
			return new eva.AppResult("Here is your boarding pass", "<div class='demo-boarding-pass'></div>", true);
		},
		
		itinerary: function() {
			// "Show my trip details"
			/*$('#eva-cover').fadeOut(function() {
				alert("this is where you would show the itinerary");
			});*/
			console.log("This is where boarding pass will show");
			return new eva.AppResult("Here is your itinerary", "<div class='demo-itinerary'></div>", true);
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
			/*
			console.log("This is where we would search for flights matching the criteria: from "+originName+" to "+destinationName);
			*/
			
			var p = $.Deferred(function(defer) {
				$.ajax({
					url: HOST+"/amadeus_flight_search",
					type: "post",
					data: JSON.stringify({
						origin: { allAirportsCode: originCode},
						destination: {allAirportsCode: destinationCode},
						departDateMin: departDateMin,
						departDateMax: departDateMax,
						returnDateMin: returnDateMin,
						returnDateMax: returnDateMax,
			            travelers: travelers,
			            attributes: {
			            	nonstop: nonstop,
			            	seatClass: seatClass,
			            	airlines: airlines,
			            	redeye: redeye,
			            	food: food,
			            	seatType: seatType
			            },
			            sortBy: sortBy,
			            sortOrder: sortOrder
					}),
					success: function(html) {
						var count = (html.match(/<tr class="outbound">/g) || []).length;
						var result;
						if (count > 1) {
							result = new eva.AppResult("Here are the top "+count+" results", 
									"Here are the top "+count+" results:<br> <div class='flight-results-cont'>"+html+"</div>", true, count);
						}
						else if (count > 0) {
							result = new eva.AppResult("", 
									"<div class='flight-results-cont'>"+html+"</div>", true, count);
						}
						else {
							result = new eva.AppResult("Sorry, no matching results found.", false, false, 0);
						}
						defer.resolve(result);
					}
				})
			});
			return p;
			
			
		},
			
	}; // end of callbacks
	});	
} // end of init_demo_app

document.addEventListener('deviceready', init_demo_app, false);
