/*
 * This class is implemented using a JavaScript module pattern. All variable and method 
 * members are stored within the namespace object hblltoolbar.overlay
 */

if (!hblltoolbar)
	var hblltoolbar = {};
if (!hblltoolbar.overlay) {
	hblltoolbar.overlay = {};
}

hblltoolbar.overlay = function() {

	// Load SetSearch so that the default federated search is set for the first
	// search
	window.addEventListener("load", SetSearch, false);
	window.addEventListener("load", function() {
		var appcontent = window.document.getElementById("appcontent");
		if (appcontent) {
			if (!appcontent.greased_haroldbleelibrary) {
				appcontent.greased_haroldbleelibrary = true;
				appcontent.addEventListener("DOMContentLoaded",
						do_haroldbleelibrary, false);
			}
		}
	}, false);

	/////////////////////
	// Private Methods //
	/////////////////////
	
	function SetSearch() {
		var stringsBundle = document.getElementById("string-bundle");
		var searchFederated = stringsBundle.getString('searchFederated')
				+ " ";
		var searchGoogle = stringsBundle.getString('searchGoogle') + " ";
		var searchJournals = stringsBundle.getString('searchJournals')
				+ " ";
		var searchCatalog = stringsBundle.getString('searchCatalog') + " ";
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		this.hblltoolbar_default_search_pref = this.prefs
				.getCharPref("extensions.hblltoolbar.default.search");
		if (this.hblltoolbar_default_search_pref == 'search_federated') {
			search = "federated";
			document.getElementById('HBLL-Main').setAttribute('class',
					'federated');
			document.getElementById('HBLL-Main').setAttribute('label',
					searchFederated);
			document.getElementById('HBLL-Combined-Federated')
					.setAttribute('selected', 'true');
		} else if (this.hblltoolbar_default_search_pref == 'search_google') {
			search = "google";
			document.getElementById('HBLL-Main').setAttribute('class',
					'scholar');
			document.getElementById('HBLL-Main').setAttribute('label',
					searchGoogle);
			document.getElementById('HBLL-Combined-Google').setAttribute(
					'selected', 'true');
		} else if (this.hblltoolbar_default_search_pref == 'search_journal') {
			search = "journal";
			document.getElementById('HBLL-Main').setAttribute('class',
					'journals');
			document.getElementById('HBLL-Main').setAttribute('label',
					searchJournals);
			document.getElementById('HBLL-Combined-Journal').setAttribute(
					'selected', 'true');
		} else if (this.hblltoolbar_default_search_pref == 'search_catalog') {
			search = "catalog";
			document.getElementById('HBLL-Main').setAttribute('class',
					'catalog');
			document.getElementById('HBLL-Main').setAttribute('label',
					searchCatalog);
			document.getElementById('HBLL-Combined-Catalog').setAttribute(
					'selected', 'true');
		} else {
			search = "federated";
			document.getElementById('HBLL-Main').setAttribute('class',
					'federated');
			document.getElementById('HBLL-Main').setAttribute('label',
					searchFederated);
			document.getElementById('HBLL-Combined-Federated')
					.setAttribute('selected', 'true');
		}
	};

	
	function getContents(aURL) {
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService);
		var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
				.getService(Components.interfaces.nsIScriptableInputStream);
		var channel = ioService.newChannel(aURL, null, null);
		var input = channel.open();
		scriptableStream.init(input);
		var str = scriptableStream.read(input.available());
		scriptableStream.close();
		input.close();
		return str;
	};

	// Add Amazon.com functionality
	function do_haroldbleelibrary(e) {
		if (/^.*\.amazon\..*\/.*$/.test(e.originalTarget.location.href)) {
			var scriptElm = e.originalTarget.createElement("script");
			var text = "//===hblltoolbar===\n"
					+ getContents("chrome://hblltoolbar/content/amazon.js")
					+ "\n\n";
			scriptElm.appendChild(e.originalTarget.createTextNode(text));
			e.originalTarget.body.appendChild(scriptElm);
			e.originalTarget.body.removeChild(scriptElm);
		}
	};

	function HBLL_ConvertTermsToURI(terms) {

		// Split up the search terms based on the space character
		var termArray = new Array();
		termArray = terms.split(" ");
		var result = "";

		// Loop through the search terms, building up the result string
		for ( var i = 0; i < termArray.length; i++) {
			if (i > 0) {
				result += "+";
			}

			// Call the built-in function encodeURIComponent() to clean up
			// this search term (making it safe for use in a URL)
			result += encodeURIComponent(termArray[i]);
		}

		// Return the result
		return result;
	};

	function HBLL_TrimString(string) {

		// Return empty if nothing was passed in
		if (!string)
			return "";

		// Efficiently replace any leading or trailing whitespace
		var value = string.replace(/^\s+/, '');
		value = string.replace(/\s+$/, '');

		// Replace any multiple whitespace characters with a single space
		value = value.replace(/\s+/g, ' ');

		// Return the altered string
		return value;
	};

	////////////////////
	// Public Methods //
	////////////////////
	return {
		
		// Perform search
		HBLL_Search : function(event, type) {
			var URL = "";
			var isEmpty = false;
			
			// Get a handle to our search terms box
			var searchTermsBox = document.getElementById("HBLL-SearchTerms");

			// Get the value in the search terms box, trimming whitespace as necessary
			var searchTerms = HBLL_TrimString(searchTermsBox.value);

			// If there are no search terms, than we set isEmpty to true
			// Otherwise, we convert the search terms to a safe URI version
			if (searchTerms.length == 0) {
				isEmpty = true;
			} else {
				searchTerms = HBLL_ConvertTermsToURI(searchTerms);
			}

			// Do something different for differing search types
			if (search == 'federated') {
				if (isEmpty) {
					URL = "http://www.lib.byu.edu/subsutility/index.php?sid=154";
				} else {
					URL = "http://metalib.lib.byu.edu/V?func=meta-1-check&mode=simple&find_request_1="
							+ searchTerms
							+ "&ckbox=BYU00102&ckbox=BYU00752&ckbox=BYU00732&ckbox=BYU00733&ckbox=BYU00734&ckbox=BYU01353&ckbox=BYU00727";
				}
			} else if (search == 'google') {
				if (isEmpty) {
					URL = "http://scholar.google.com/scholar_setprefs?num=10&inst=3707022252508826337&inst=569367360547434339&scis=yes&scisf=1&submit=Save+Preferences";
				} else {
					URL = "http://scholar.google.com/scholar_setprefs?num=10&inst=3707022252508826337&inst=569367360547434339&scis=yes&scisf=1&submit=Save+Preferences&q="
							+ searchTerms;
				}
			} else if (search == 'journal') {
				if (isEmpty) {
					URL = "http://exlibris.lib.byu.edu/sfxlcl3/az";
				} else {
					URL = "http://exlibris.lib.byu.edu/sfxlcl3/az?param_services2filter_save=getHolding&param_services2filter_save=getFullTxt&param_pattern_value="
							+ searchTerms;
				}
			} else if (search == 'catalog') {
				if (isEmpty) {
					URL = "http://primofe1.byu.edu:1701/primo_library/libweb/action/search.do?vid=byu&fromLogin=true";
				} else {
					URL = "http://primofe1.byu.edu:1701/primo_library/libweb/action/search.do?vl(freeText0)="
							+ searchTerms
							+ "&fn=search&vid=byu&tab=default_tab&mode=Basic&fromLogin=true";
				}
			} else {
				if (isEmpty) {
					URL = "http://www.lib.byu.edu/subsutility/index.php?sid=154";
				} else {
					URL = "http://metalib.lib.byu.edu:8331/V?func=meta-1-check&mode=simple&find_request_1="
							+ searchTerms
							+ "&ckbox=BYU00102&ckbox=BYU00752&ckbox=BYU00732&ckbox=BYU00733&ckbox=BYU00734&ckbox=BYU01353&ckbox=BYU00727";
				}
			}
			// Load the URL in the browser window using the HBLL_LoadURL function
			hblltoolbar.overlay.HBLL_LoadURL(URL);
		},

		HBLL_LoadURL : function(URL) {
			// Make sure we get the focus
			window.content.focus();
			// Set the document's location to the incoming URL
			window._content.document.location = URL;
		}
	};
}();
