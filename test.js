
var request = require("request");

var options = { method: 'POST',
  url: 'http://127.0.0.1:23119/connector/document/execCommand',
  headers: 
   { 'Postman-Token': '8485fb2d-ec0e-409b-9e3d-0654aa2dd25d',
     'cache-control': 'no-cache',
     'Zotero-Allowed-Request': '1',
     'Content-Type': 'application/json' },
  body: 
   { command: 'addCitation',
     docId: '1ro9AmDxrwbys-xjazJqQG7UlSbBC76CU5xRJ71I8UjE' },
  json: true };


var options_2 = { method: 'POST',
  url: 'http://127.0.0.1:23119/connector/document/response',
  headers: 
   { 'Postman-Token': '8485fb2d-ec0e-409b-9e3d-0654aa2dd25d',
     'cache-control': 'no-cache',
     'Zotero-Allowed-Request': '1',
     'Content-Type': 'application/json' },
  body: 
		  {
		      documentID:"1ro9AmDxrwbys-xjazJqQG7UlSbBC76CU5xRJ71I8UjE",
		      outputFormat:"html",
		      supportedNotes:["footnotes"]
		  }
		};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
    console.log(body);
    request(options_2, function (error_2, response_2, body_2) {
	if (error_2) throw new Error(error_2);
	console.log(body_2);
    });

});