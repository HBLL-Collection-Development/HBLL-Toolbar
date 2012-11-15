/*
 * ====================================
 * 
 * 		AUTHOR: Devin Lineberry
 * 		DATE: MARCH 2010
 * 
 * ====================================
 */

/*
 * This class is implemented using a JavaScript module pattern. All variable and method 
 * members are stored within the namespace object hblltoolbar.ISBNQueryModule
 */

// If the namespace hblltoolbar doesn't already exist, create it
if (!hblltoolbar)
	var hblltoolbar = {};

// If the ISBNQueryModule object doesn't exist within the hblltoolbar namespace, create it
if (!hblltoolbar.ISBNQueryModule)
	hblltoolbar.ISBNQueryModule = {};

hblltoolbar.ISBNQueryModule = function() {
	
	///////////////////////////////////////
	/////////// PRIVATE MEMBERS ///////////
	///////////////////////////////////////

	//==================
	// Private Variables
	//==================

	// Array of ISBNs found on current page
	var ISBNs = new Array();

	// Array of buttons corresponding to each found ISBN
	var buttonArray = new Array();

	// This boolean value changes when the url is changed
	var urlChanged = true;

	// This serves as the timer that calls the function that updates the pseudo-animated loading label
	var loadingLabelTimer = Components.classes["@mozilla.org/timer;1"]
			.createInstance(Components.interfaces.nsITimer);

	var loadingLabelIndex = 0;

	var loadingLabelEvent = {
		notify : function(loadingLabelTimer) {
			rotateLetters();
		}
	};

	var loadingLabel = document.createElement("label");

	//================
	// Private Methods
	//================

	var getBookTitle = function(responseText) {
		var titleInfo;
		var title;
		titleInfo = /<!-- Print the title, if one exists -->[\s\n]+<strong>[\w\W]+?<\/strong/
				.exec(responseText);
		if (titleInfo != null) {
			title = titleInfo[0].substring(titleInfo[0].lastIndexOf(">") + 1,
					titleInfo[0].lastIndexOf("<"));
		} else
			title = "Title not available";
		return title;
	};

	// This method serves as the engine behind the pseudo-animated loading label
	var createLoadingLabel = function(menupopup) {
		loadingLabel.setAttribute("id", "HBLL_Loading");
		loadingLabel.setAttribute("value", "Loading");
		loadingLabelTimer.initWithCallback(loadingLabelEvent, 120,
				Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
		loadingLabel.setAttribute("width", "92");
		return loadingLabel;
	};

	/*
	 * This function returns true if XHR object associated with it contains text
	 * indicating that the book was found at the library; otherwise, it returns
	 * false
	 */
	var searchCatalogForISBN = function(results) {

		/* 
		 * We only have to search the last part of the html document to verify whether or
		 * not the book corresponding to this ISBN is foudn in the HBLL  
		*/
		return /record1of1forsearch/.test(results.substring(42000,
				results.length).replace(/[\n\s]*/gmi, ""));
	};

	var rotateLetters = function() {
		loadingLabel.setAttribute("value", "Loading".replace("Loading"
				.charAt(loadingLabelIndex), ' '));
		loadingLabelIndex = ((loadingLabelIndex < "Loading".length - 1) ? ++loadingLabelIndex
				: 0);
	};

	var reset = function() {
		hblltoolbar.HttpRequestQueue.reset();
		buttonArray = new Array();
		ISBNs = new Array();
		loadingLabelTimer.cancel();
		loadingLabelIndex = 0;
	};

	/*
	 * These eventListeners make sure that whenever the url changes, the
	 * HttpRequestQueue is reset (otherwise, we could have outstanding XHR calls).
	 */
	window.addEventListener("load", function() {
		myExtension.init();
	}, false);

	window.addEventListener("unload", function() {
		myExtension.uninit();
	}, false);

	var myExt_urlBarListener = {
		QueryInterface : function(aIID) {
			if (aIID.equals(Components.interfaces.nsIWebProgressListener)
					|| aIID
							.equals(Components.interfaces.nsISupportsWeakReference)
					|| aIID.equals(Components.interfaces.nsISupports))
				return this;
			throw Components.results.NS_NOINTERFACE;
		},

		onLocationChange : function(aProgress, aRequest, aURI) {
			myExtension.processNewURL(aURI);
		}
	};

	var myExtension = {
		oldURL : null,

		init : function() {
			// Listen for when web page loads
			gBrowser.addProgressListener(myExt_urlBarListener,
					Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);

			// Listen for when browser loads
			var appcontent = document.getElementById("appcontent"); // browser
			if (appcontent)
				appcontent.addEventListener("DOMContentLoaded",
						myExtension.checkForISBNs, true);
		},

		uninit : function() {
			gBrowser.removeProgressListener(myExt_urlBarListener);
		},

		processNewURL : function(aURI) {

			// Checking to see if the url has changed
		if (aURI.spec == this.oldURL) {
			return;
		}

		hblltoolbar.HttpRequestQueue.abortAllXHR();
		reset();
		urlChanged = true;
		this.oldURL = aURI.spec;

		myExtension.checkForISBNs();
	},

		/*
		* Search current web page for ISBNs. If found, the button that searches for
		* ISBNS will be enabled, disabled otherwise.
		*/
		checkForISBNs : function(aEvent) {
			var element;
			if ((ISBNs = hblltoolbar.ISBNFinder.findAllISBNs()) == null) {
				if ((element = document.getElementById("HBLL_ISBN_Found")) != null) {
					element.setAttribute("disabled", "true");
					element.setAttribute("id", "HBLL_No_ISBN_Found");
					element.setAttribute("tooltiptext",
							"No ISBNs found on this page");
				}
			} else if ((element = document.getElementById("HBLL_No_ISBN_Found")) != null) {
				element.setAttribute("disabled", "false");
				element.setAttribute("id", "HBLL_ISBN_Found");
				element.setAttribute("tooltiptext",
						"Click to search for books in BYU's library\ncatalog with ISBN(s) found on"
								+ " this page");
			}
		}
	};

	///////////////////////////////////////
	/////////// PUBLIC MEMBERS ////////////
	///////////////////////////////////////
	return {

		//===============
		// Public Methods
		//===============

		populateISBNLookupMenu : function() {
			/*
			 * If the state of the page has changed (i.e. url has changed, page
			 * refreshed, tab changed, etc.)
			 */
			if (urlChanged) {
				urlChanged = false;
				var menupopup = document
						.getElementById("HBLL_ISBN_Lookup_Menupopup");
				// If they exist, remove all current toolbarbutton elements
				if (menupopup.hasChildNodes()) {
					while (menupopup.childNodes.length > 0) {
						menupopup.removeChild(menupopup.firstChild);
					}
				}

				// Adding a temporary button that notifies the user that the
				// ISBN list is loading. When the ISBNs have all been processed, this
				// button is removed
				menupopup.appendChild(createLoadingLabel());
				hblltoolbar.HttpRequestQueue.setTotalNumberOfRequests(ISBNs.length);
				
				/*
				 * Querying BYU's library catalog with each ISBN. After the
				 * query is finished, an appropriate button is created and
				 * appended to the drop-down menu.
				 */
				while (ISBNs.length > 0) {
					try {
						hblltoolbar.HttpRequestQueue.makeHttpRequest(
										"http://catalog.lib.byu.edu/uhtbin/isbn-search/",
										ISBNs[ISBNs.length - 1]);
					} catch (e) {
						alert("Error occurred while querying BYU's library catalog: "
								+ e);
					}
					ISBNs.pop();
				}
			}
		},

		/*
		 * This function loads all of the buttons that represent each ISBN into the
		 * extensions menupopup element
		 */
		loadButtons : function() {
			var menupopup = document
					.getElementById("HBLL_ISBN_Lookup_Menupopup");

			// Removing the "Loading..." label
			menupopup.removeChild(menupopup.firstChild);
			loadingLabelTimer.cancel();
			for ( var i = 0; i < buttonArray.length; i++) {
				menupopup.appendChild(buttonArray[i]);
			}
		},

		createISBNButton : function(isbn, request) {
			var button = document.createElement("toolbarbutton");
			button.setAttribute("label", isbn);

			/*
			* This makes it so that when the user clicks on the button associated with
			* this ISBN, the user will be taken to BYU's online catalog to view search
			* results
			*/
			button.setAttribute("oncommand",
					"gBrowser.loadOneTab('http://catalog.lib.byu.edu/uhtbin/isbn-search/"
							+ isbn + "', null, null, null, false, false)");

			// Book found in catalog
			if (/class="searchsum"/.test(request.responseText)) {
				button.setAttribute("id", "HBLL_BookFound");
				button.setAttribute("tooltiptext",
						getBookTitle(request.responseText));
			}

			// Book not found in catalog
			else {
				button.setAttribute("id", "HBLL_BookNotFound");
				button.setAttribute("tooltiptext",
						"This book was not found in BYU's library catalog");
			}

			// Storing our newly created button
			buttonArray.push(button);
		}
	};
}();