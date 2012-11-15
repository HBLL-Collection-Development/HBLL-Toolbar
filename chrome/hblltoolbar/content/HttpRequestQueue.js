/*
 * ====================================
 * 
 * 		AUTHOR: Devin Lineberry
 * 		DATE: MARCH 2010
 * 
 * ====================================
 */

/*
 * The main goal of the HttpRequestQueue is to prevent memory leaks and memory
 * corruption when making multiple asynchronous XMLHttpRequest calls. At the
 * time this class was created, there were known bugs in Firefox related to
 * making multiple asynchronous XMLHttpRequest calls. For more info, see the
 * following links: 
 *		https://bugzilla.mozilla.org/show_bug.cgi?id=488605
 * 		https://bugzilla.mozilla.org/show_bug.cgi?id=433313
 * 		ttps://bugzilla.mozilla.org/show_bug.cgi?id=391224
 * 
 * Symptoms of this bug include the browser randomly crashing and/or the
 * XMLHttpRequest objects returning incomplete or incorrect data.
 * 
 * The HttpRequestQueue places asynchronous XHR objects in a queue. Calls are
 * made one at a time. As soon as one returns, another call is made (if the
 * queue is not empty). Thus, at any given time, there is at most one
 * outstanding XMLHttpRequest.
 */

/*
 * This class is implemented using a JavaScript module pattern. All variable and method 
 * members are stored within the namespace object hblltoolbar.HttpRequestQueue
 */

if(!hblltoolbar)
	var hblltoolbar = {};
if(!hblltoolbar.HttpRequestQueue)
	hblltoolbar.HttpRequestQueue = {};

hblltoolbar.HttpRequestQueue = function() {
	
	///////////////////////
	// Private variables //	
	///////////////////////
	var httpRequests = new Array();
	
	// This will serve as the timer that calls the function that checks for waiting requests in the queue
	var queueTimer = Components.classes["@mozilla.org/timer;1"]
	                 .createInstance(Components.interfaces.nsITimer);
				
	// This is the event that is called when the time in the timer has elapsed
	var queueEvent = { notify: function(queueTimer) { tryHttpRequest(); } };
	
	// This boolean lets us know if there is an outstanding XMLHttpRequest
	var requestAvailable = true;
	
	var numberOfProcessedRequests = 0;
	var totalNumberOfRequests = 0;
	
	/////////////////////
	// Private methods //
	/////////////////////
	
	/*
	* This method does two things.  First, it checks to see if there is
	* an XMLHttpRequest in the queue.  If there is, it checks to see if there is
	* an XMLHttpRequest that has not yet returned from the server. If not, then
	* the XHR in the top of the queue is sent.
	*/ 	
	tryHttpRequest = function() {
		if (requestAvailable && httpRequests.length > 0) {
			requestAvailable = false;
			var request = httpRequests.shift();
			request.send(null);
		}
	};

	////////////////////
	// Public methods //
	////////////////////
	
	return {
	
		// This method queues up an XMLHttpRequest
		makeHttpRequest : function(root, path) {
			if(path == null)
				path = "";
			// Start monitoring the queue in 100 millisecond intervals
			queueTimer.initWithCallback(queueEvent,
								100,
								Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
			var request = new XMLHttpRequest();
			request.open('GET', root
				+ path, true);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						// Calling method in ISBNQueryModule
						hblltoolbar.ISBNQueryModule.createISBNButton(path, request);
					} else {
						alert("Error making XMLHttpRequest for " + root
								+ path);
					}
					numberOfProcessedRequests++;
				
					// When all of the XMLHttpRequests have completed, load them all
					// onto the menupopup element and stop the queueMonitor.
					if ((numberOfProcessedRequests / totalNumberOfRequests) == 1) {
					
						// Calling method in ISBNQueryModule
						hblltoolbar.ISBNQueryModule.loadButtons();
						queueTimer.cancel();
					}
					requestAvailable = true;
				}
			};
			httpRequests.push(request);
		},
	
		setTotalNumberOfRequests : function(num) {
			totalNumberOfRequests = num;
		},

		// Cleans up the queue between changing pages
		reset : function() {
			numberOfProcessedRequests = 0;
			totalNumberOfRequests = 0;
			queueTimer.cancel();
		},

		// Aborts all XMLHttpRequest calls
		abortAllXHR : function() {
			while (httpRequests.length > 0) {
				httpRequests.shift().abort();
			}
		}
	};
}();

