var cheerio = require('cheerio');
var http = require("http");
var clc = require('cli-color');
var notifier = require('node-notifier');


var image_host;
var image_path;
var second_counter;
var timeout_id;
var timeout_id_image;
var full_path;
var run_count = 0 ;
var original_image;
var content_type;
var today;

process.argv.forEach(function (val, index, array) {
	
  if((val.indexOf('//') != -1 || val.indexOf('.com') != -1)  ){
  	
  	start_slice = val.indexOf('.com/')  + 4 ;

  	if(val.indexOf('https') > -1){
  		val = val.replace('https','http');
  	}

  	if(val.indexOf('http') === -1){
  		val = 'http://'.concat(val);
  	}
  	
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
	} else if($('title').text().indexOf('400')!= -1){
		console.log('\n'.concat(today).concat(clc.red(' Status:400')).concat(' - something is wrong with the url/argument provided'));
		console.log(clc.redBright('Terminating script.'));
	} else {
		clearInterval(second_counter);
		clearTimeout(timeout_id);
		console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ')).concat(image_host).concat(image_path));
		notifier.notify({
			'title': 'Image Uploaded!',
  			'message': (image_host).concat(image_path).concat(' has been uploaded.')
		});
		console.log(clc.greenBright('Uploaded, terminating script.'));
		return; 
	}


}

function checkModifiedImage(original_image, current_image){
	if(current_image == original_image){
		run_count++;
		getSysTime();
		console.log('\n'.concat(today).concat(clc.yellow(' Status:Not updated')).concat(image_host).concat(image_path));
		timeout_id_image = setTimeout(simpleHttpResquest, 20000, image_host, image_path, run_count);
		clearInterval(second_counter);
		second_counter = setInterval(count_second, 1000);
	} else {
		clearInterval(second_counter);
		clearTimeout(timeout_id_image);
		console.log('\n'.concat(today).concat(clc.green(' Status:Updated')).concat(image_host).concat(image_path));
		console.log(clc.greenBright('Uploaded, terminating script.'));
		return; 
	}
}


function count_second(){
	if(run_count > 0){ process.stdout.write(".");
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
    return today;
}	


function simpleHttpResquest(request_host, request_path, run_count){
	var req = http.get(full_path, function(res) {
		var html_response = "";
		res.setEncoding('utf8');


		res.on('data', function (chunk) {
			html_response += chunk;
		});

		res.on('end', function(){
			if(run_count === 0){
				console.log(clc.magenta(html_response));
			}

			// if(res["content-type"]){
			// 	checkModifiedImage(a,b);
			// } else{
			// 	check_404(html_response);	
			// }
			
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