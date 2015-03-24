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
var clc = require('cli-color');

var image_host;
var image_path;
var second_counter;
var timeout_id;
var full_path;
var run_count = 0 ;
var today;

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



function check_404(full_html){

	$ = cheerio.load(full_html);
	
	if($('title').text().indexOf('404')!= -1){
		run_count++;
		getSysTime();
		console.log('\n'.concat(today).concat(clc.yellow(' Status:404 ')).concat(image_host).concat(image_path));
		timeout_id = setTimeout(simpleHttpResquest, 20000, image_host, image_path, run_count);
		clearInterval(second_counter);
		second_counter = setInterval(count_second, 1000);
	} else {
		clearInterval(second_counter);
		clearTimeout(timeout_id);
		console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ')).concat(image_host).concat(image_path));
		console.log(clc.greenBright('Uploaded, terminating script.'));
		return; 
		
	}
}


function count_second(){
	if(run_count > 0){
		process.stdout.write(".");
	} else{
		process.stdout.write(" . ");
	}
}


function getSysTime(){
	today = new Date();
	today = today.toLocaleString();
	var first_slice = today.indexOf(':') - 2;
	var last_slice = today.lastIndexOf(':') + 3;
	today = today.slice(first_slice, last_slice);

	// today = today.match('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')[0];

	// var hour = today.getHours();
 //    hour = (hour < 10 ? "0" : "") + hour;

 //    var min  = today.getMinutes();
 //    min = (min < 10 ? "0" : "") + min;

 //    var sec  = today.getSeconds();
 //    sec = (sec < 10 ? "0" : "") + sec;


    return today;
}	


function simpleHttpResquest(request_host, request_path, run_count){

// function simpleHttpResquest(request_host, request_path, request_port){
	// if(request_port === undefined){
	// 	request_port = 80;
	// }

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
			if(run_count === 0){
				console.log(clc.magenta(html_response));
			}
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


simpleHttpResquest(image_host, image_path, run_count);