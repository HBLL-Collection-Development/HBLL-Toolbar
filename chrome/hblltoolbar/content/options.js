/*
 * This class is implemented using a JavaScript module pattern. All variable and method 
 * members are stored within the namespace object hblltoolbar.options
 */

// If the namespace hblltoolbar doesn't already exist, create it
if (!hblltoolbar)
	var hblltoolbar = {};
if(!hblltoolbar.options) 
	hblltoolbar.options = {};

hblltoolbar.options = function() {

	// Firefox services
	const hblltoolbar_prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	
	return {
		// globals
		hblltoolbar_loadedOptions : false,
		HBLLTOOLBAR_SEARCH : "extensions.hblltoolbar.default.search",
		
		// ----- helper functions -----
		
		// returns the value of the argument preference
		hblltoolbar_getPreference : function(pref_name) {
			var pref_type = hblltoolbar_prefs.getPrefType(pref_name);
			if (pref_type == hblltoolbar_prefs.PREF_STRING)
				return hblltoolbar_prefs.getCharPref(pref_name);
			else
				// fallback on error
				return hblltoolbar_prefs.PREF_INVALID;
		}
		
	};	

}();