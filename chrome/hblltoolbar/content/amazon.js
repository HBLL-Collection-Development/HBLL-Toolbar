// ==UserScript==
// @name          Harold B. Lee Library
// @namespace     http://www.lib.byu.edu/
// @description	  Search the Harold B. Lee Library Catalog from Amazon book listings.
// @include       http://*.amazon.*
// ==/UserScript==

(

function() {
  mainmatch = window._content.location.href.match(/\/(\d{9}[\d|X])\//);
  if (mainmatch){
  	var isbn = mainmatch[1];
  	var header = document.evaluate("//h1[@class='parseasinTitle']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  	if (header) {
            	
      var spl_link = document.createElement('a');
          spl_link.setAttribute('href', 'http://xisbn.worldcat.org/liblook/resolve.htm?res_id=http%3A%2F%2Fcatalog.lib.byu.edu%2Fuhtbin%2Fcgisirsi%2FX%2F0%2F0%2F57%2F5%2F&opactype=sirsi6&siteparams=user_id%3DWEBSERVER%26new_gatewaydb%3DILINK%26library%3DALL&rft.isbn=' + isbn);
   	  spl_link.setAttribute('title', 'Check to see if the BYU library has this item');
   	  spl_link.innerHTML 
	   	= '<p style="{font-size:medium;font-weight:bold;color:#039;text-decoration:underline;border:1px dotted #000;background:#a9cfe1;width:45%;padding:5px;margin:5px 5px 5px 250px;}">Lookup this book at the Harold B. Lee Library</p>';
      	
      header.parentNode.insertBefore(spl_link, header.nextSibling);
    }
  } 
}
)();