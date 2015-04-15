// var cheerio = require('cheerio');
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
var current_image;
var today;
var result_status_code;
var result_content_type;

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
    return today;
}	

function end_notification(title, message){
	notifier.notify({
			'title': title.toString(),
  			'message': (image_host).concat(image_path).concat(message)
		});
		console.log(clc.greenBright('Uploaded, terminating script.'));
}


process.argv.forEach(function (val, index, array) {
	 if((val.indexOf('//') !== -1 || val.indexOf('.com') !== -1)  ){
  	var start_slice = val.indexOf('.com/')  + 4 ;

  	if(val.indexOf('https') > -1){
  		val = val.replace('https','http');
  	}

  	if(val.indexOf('http') === -1){
  		val = 'http://'.concat(val);
  	}

  	if( val[('.com'.lenth + val.indexOf('.com') + 1 )] !== '/'){		
  		val = val.concat('/');
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

function simpleHttpResquest(request_host, request_path, run_count, type_check){
	var req = http.get(full_path, function(res) {
		var html_response = "";
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			html_response += chunk;
		});

		res.on('end', function(){
			// var result_headers = JSON.stringify(res.headers);
			result_content_type = res.headers["content-type"];
			result_status_code = res.statusCode;

			if(run_count === 0){
				if (result_content_type.indexOf('image') > -1){
					console.log(clc.magenta(html_response.substring(0,250).concat('.............'))); //Truncated as image strings as very long
				} else {
					console.log(clc.magenta(html_response));
				}
			}

			
			
			if(result_content_type.indexOf('image') > -1){
			// if(result_content_type.indexOf('image') > -1 && run_count === 0){
				if (run_count === 0){
					original_image = html_response;
				}

				console.log(result_content_type.indexOf('image'));

				checkModifiedImage(original_image,current_image);
			} else{
				check404(html_response);	
			}
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

function check404(full_html){
	if(run_count === 0 && result_status_code !== 404){
		getSysTime();
		
		if ((result_status_code === 200) && (result_content_type.indexOf('html') === -1)){
			console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ').concat("Okay but isnt a page (could be a directory)")));
			console.log(clc.redBright('Terminating script.'));
			return;
		} else if((result_status_code === 200) && (result_content_type.indexOf('html') > -1)) {
			console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ').concat("- Okay and is a page")));
			console.log(clc.redBright('Terminating script.'));
			return;
		} else if(result_status_code === 301){
			console.log('\n'.concat(today).concat(clc.green(' Status:301 OK ').concat("- A redirect to another page (you may have left off the www.)")));
			console.log(clc.redBright('Terminating script.'));
			return;
		}
	} else {
		if(result_status_code === 404){
			run_count++;
			getSysTime();
			console.log('\n'.concat(today).concat(clc.yellow(' Status:404 ')).concat(full_path));
			timeout_id = setTimeout(simpleHttpResquest, 20000, image_host, image_path, run_count, 'check-404');
			clearInterval(second_counter);
			second_counter = setInterval(count_second, 1000);
		} else {
			clearInterval(second_counter);
			clearTimeout(timeout_id);
			console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ')).concat(full_path));
			end_notification('Image Uploaded!', ' has been uploaded.');
			return; 
		}
	}
}

function checkModifiedImage(original_image, current_image){
	getSysTime();
	console.log('running');
	if (typeof current_image === 'undefined'){
		current_image = original_image;
	}

	if(current_image == original_image){
		getSysTime();
		console.log('\n'.concat(today).concat(clc.yellow(' Status:Not updated ')).concat(image_host).concat(image_path));
		timeout_id_image = setTimeout(simpleHttpResquest, 20000, image_host, image_path, run_count, 'check-update');
		clearInterval(second_counter);
		second_counter = setInterval(count_second, 1000);
	} else {
		if (run_count === 0){
			console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ').concat("Image is live.")));
			console.log(clc.yellowBright('Terminating script.'));
			return;
		}
		clearInterval(second_counter);
		clearTimeout(timeout_id_image);
		console.log('\n'.concat(today).concat(clc.green(' Status:Updated ')).concat(image_host).concat(image_path));
		end_notification('Image Updated!', ' has been updated.');
		return; 
	}

	run_count++;
}



simpleHttpResquest(image_host, image_path, run_count);