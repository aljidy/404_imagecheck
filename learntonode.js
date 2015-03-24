// var possible_pages = [];
// var http = require("http");

// process.argv.forEach(function (val, index, array) {
//   // console.log(index + ': ' + val);
//   if((val.indexOf('//') != -1 || val.indexOf('.com') != -1)  ){
//   	possible_pages.push(val);
//   }
// });

// console.log(possible_pages);

// possible_pages.forEach(function(val, index, array){


// 	var options = {
// 	  host: val,
// 	  port: 80,
// 	  // path: '/upload',
// 	  method: 'GET'

// 	};
// 	 console.log(options);

// 	var req = http.request(options, function(res) {
	  
// 	  res.setEncoding('utf8');
// 	  res.on('data', function (chunk) {
// 	    console.log('BODY: ' + chunk);
// 	  });
// 	});

// 	req.on('error', function(e) {
// 	  console.log('problem with request: ' + e.message);
// 	});

// 	// write data to request body
// 	req.write('data\n');
// 	req.write('data\n');
// 	req.end();

// });

var cheerio = require('cheerio');
var http = require("http");
var image_host;
var image_path;
var second_counter;
var timeout_id;
var full_path;
var run_count = 0 ;

process.argv.forEach(function (val, index, array) {
  if((val.indexOf('//') != -1 || val.indexOf('.com') != -1)  ){
  	
  	start_slice = val.indexOf('.com/')  + 4 ;

  	if(val.indexOf('.com/') === -1){
  		image_host = val;
  	} else{
  		full_path = val;
		image_path = val.slice(start_slice);
  		image_host = val.replace(image_path, '');
  	}

  }
});

console.log(image_host);
console.log(image_path);


function check_404(full_html){

	$ = cheerio.load(full_html);
	
	if($('title').text().indexOf('404')!= -1){
		console.log(image_host.concat(image_path).concat(' is still 404'));
		timeout_id = setTimeout(simpleHttpResquest, 10000, image_host, image_path);
		clearInterval(second_counter);
		second_counter = setInterval(count_second, 2000);
	} else {
		clearInterval(second_counter);
		clearTimeout(timeout_id);
		console.log(image_host.concat(image_path).concat(' not 404!'));
		return; 
		
	}
}
function count_second(){
	console.log('.');
}

function simpleHttpResquest(request_host, request_path, request_port){

	if(request_port === undefined){
		request_port = 80;
	}

	// var options = {
	//   host: request_host,
	//   port: request_port,
	//   path: request_path,
	//   method: 'GET'

	// };

	var req = http.get(full_path, function(res) {
		var html_response = "";
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			// console.log(chunk);
			html_response += chunk;
		});

		res.on('end', function(){
			console.log('FINAL'+html_response);
			check_404(html_response);
		});
	  
	});

	
	

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write('data\n');
	req.write('data\n');

	req.end();
}


simpleHttpResquest(image_host,image_path);