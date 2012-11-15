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
 * members are stored within the namespace object hblltoolbar.ISBNFinder
 */

// If the namespace hblltoolbar doesn't already exist, create it
if (!hblltoolbar)
	var hblltoolbar = {};

//If the ISBNFinder object doesn't exist within the hblltoolbar namespace, create it
if(!hblltoolbar.ISBNFinder)
	hblltoolbar.ISBNFinder = {};

hblltoolbar.ISBNFinder = function() {
	///////////////////////////////////////
	/////////// PRIVATE MEMBERS ///////////
	///////////////////////////////////////
	
	//================
	// Private Methods
	//================
	
	function findThirteenDigitISBNs(currentPage) {
		
		/*
		 * This regular expression finds 13 digit ISBNs that are separated by dashes
		 * or spaces. 
		 * 
		 * For example: 
		 * 		978-901-856-231-3   FOUND
		 * 		979 812 42 3382 1   FOUND
		 * 		978-34521-64 71 4   NOT FOUND
		 */
		var thirteenDigitRegExpr1 = /\b(?=.{17})97(?:8|9)([- ])\d{1,5}\1\d{1,7}\1\d{1,6}\1\d\b/gm;
		/*
		 * This regular expression finds 13 digit ISBNs that either have one dash after the 
		 * the first three numbers OR have no dashes at all.
		 *
		 * For example: 
		 * 		9789018562313       FOUND
		 * 		979-8124233821      FOUND
		 * 		978-34521-64-71-4   NOT FOUND
		 */
		var thirteenDigitRegExpr2 = /\b(?=.{13})97(?:8|9)\d{9}\d\b|\b(?=.{14})97(?:8|9)-\d{9}\d\b/gm;

		var thirteenDigitISBNs1 = currentPage.match(thirteenDigitRegExpr1);
		var thirteenDigitISBNs2 = currentPage.match(thirteenDigitRegExpr2);
		
		if (thirteenDigitISBNs1 != null && thirteenDigitISBNs2 != null) {
			return thirteenDigitISBNs1.concat(thirteenDigitISBNs2);
		} 
		else if (thirteenDigitISBNs1 != null) {
			return thirteenDigitISBNs1;
		} 
		else if (thirteenDigitISBNs2 != null) {
			return thirteenDigitISBNs2;
		}
		
		return null;
	}

	function findTenDigitISBNs(currentPage) {

		/*
		 * This regulars expression finds 10 digit ISBNs that either have 
		 * three dashes, three spaces, or no spaces and dashes. 
		 * 
		 * For example:
		 *      1880416778       FOUND
		 *      1-901631-01-x    FOUND 
		 *      0 393 95696 2    FOUND
		 *      1-80122752-4     NOT FOUND
		 *      0 324 16 789 1   NOT FOUND    
		 */
		var tenDigitRegExpr = /\b(?=.{13})\d{1,5}([- ])\d{1,7}\1\d{1,6}\1[\dxX]\b|\b(?=.{10})\d{9}[\dxX]\b/gm;
		return currentPage.match(tenDigitRegExpr);
	}

	function validateISBNs(ISBNs) {
		
		var validatedISBNs = new Array();
		var j = 0;
		var isbn;

		// Boolean value that represents whether or not the current isbn is valid
		var valid;
		for ( var i = 0; i < ISBNs.length; i++) {
			valid = false;
			isbn = ISBNs[i].replace(/\s|-/g, '');

			if (isbn.length == 10)
				valid = validateTenDigitISBN(isbn);
			else if(isbn.length == 13) {			
				valid = validateThirteenDigitISBN(isbn);
			}
			
			if (valid) {
				validatedISBNs[j] = isbn;
				j++;
			}
		}
		return validatedISBNs;
	}

	function validateTenDigitISBN(isbn) {
		var result = false;
		var summation = 0;

		for ( var i = 1; (i - 1) < isbn.length - 1; i++) {
			summation += i * parseInt(isbn.charAt(i - 1));
		}

		if ((summation % 11) == getCheckDigit(isbn))
			result = true;

		return result;
	}

	function validateThirteenDigitISBN(isbn) {
		var result = false;
		var summation = 0;
		var alternate = 1;
		var checkDigit = getCheckDigit(isbn);

		for ( var i = 0; i < isbn.length - 1; i++) {
			summation += alternate * parseInt(isbn.charAt(i));
			alternate = (alternate == 1 ? 3 : 1);
		}

		if ((10 - (summation % 10)) == (checkDigit == 0 ? 10 : checkDigit))
			result = true;

		return result;
	}

	function getCheckDigit(isbn) {
		if (isbn.charAt(isbn.length - 1).toLowerCase() == "x")
			return 10;

		return parseInt(isbn.charAt(isbn.length - 1));
	}

	// Removes duplicates in an array
	function unique(array){
		array.sort();
		for(var i = 1;i < array.length;){
			if(array[i-1] == array[i] ){
				array.splice(i, 1);
			}
			
			// handling the case when both ISBNs end in an 'x' or 'X'
			else if(array[i-1].charAt(array[i-1].length-1) == 'x' && 
					array[i].charAt(array[i].length-1) == 'X' ||
					array[i-1].charAt(array[i-1].length-1) == 'X' && 
					array[i].charAt(array[i].length-1) == 'x')
				array.splice(i, 1);
			else{
				i++;
			}
		}
		return array;
	}

	
	///////////////////////////////////////
	/////////// PUBLIC MEMBERS ////////////
	///////////////////////////////////////
	return {
		
		//===============
		// Public Methods
		//===============
		
		/* 
		 * This method searches for ISBN's in the body tag of the current page. The
		 * results are stored in an array and returned.
		 * 
		 * NOTES ON ISBN FORMATTING(FROM http://www.isbn.org/Standards/Home/isbn/us/isbnqa.asp) 
		 * 	Format of the 10 digit ISBN (< 2007)
		 * 		Every ISBN consists of ten digits....The ten-digit number is
		 * 		divided into four parts of variable length, each part separated by a hyphen.
		 * 	Format of the 13 digit ISBN (> 2007) Every ISBN will consist of thirteen
		 * 		digits in 2007. The thirteen digit number is divided into five parts of
		 * 		variable length, each part separated by a hyphen. 
		 * 	Additional note 	
		 * 		In the case of the check digit, the last digit of the ISBN, the upper case X can appear.
		 * 		The Roman numeral X is used in lieu of 10 where ten would occur as a check digit.
		 * 	See http://en.wikipedia.org/wiki/International_Standard_Book_Number for more info on valid ISBNs
		 */
		findAllISBNs: function() {
			var currentPage = content.document.body.innerHTML;
			
			// removing tags from document
			currentPage = currentPage.replace(
					/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->|<[\s\S]*?>/gi, " ");
			
			var thirteenDigitISBNs = findThirteenDigitISBNs(currentPage);
			/* 
			 * Removing thirteen digit ISBNs from original text.  If we don't do this, then 
			 * a part of the thirteen digit isbn would be captured again when searching for ten
			 * digit isbns.
			*/
			if (thirteenDigitISBNs != null) {
				for ( var i = 0; i < thirteenDigitISBNs.length; i++) {
					currentPage = currentPage.replace(thirteenDigitISBNs[i], " ");
				}
			}

			var tenDigitISBNs = findTenDigitISBNs(currentPage);
			var validISBNs;
			if(thirteenDigitISBNs != null && tenDigitISBNs != null) {
				validISBNs = validateISBNs(unique(thirteenDigitISBNs.concat(tenDigitISBNs)));
			}
			else if(thirteenDigitISBNs != null) {
				validISBNs = validateISBNs(unique(thirteenDigitISBNs));
			}
			else if (tenDigitISBNs != null) {
				validISBNs = validateISBNs(unique(tenDigitISBNs));
			}
			
			return validISBNs;
		}
	};
}();



