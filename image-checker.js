const http = require("http");
const clc = require('cli-color');
const notifier = require('node-notifier');
const readline = require('readline');

const rlUserInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


let image_host;
let image_path;
let second_counter;
let timeout_id;
let timeout_id_image;
let full_path;
let run_count = 0;
let original_image;
let current_image;
let today;
let result_status_code;
let result_content_type;

function count_second() {
    if (run_count > 0) {
        process.stdout.write(".");
    } else {
        process.stdout.write(" . ");
    }
}

function getSysTime() {
    today = new Date();
    today = today.toLocaleString();
    let first_slice = today.indexOf(':') - 2;
    let last_slice = today.lastIndexOf(':') + 3;
    today = today.slice(first_slice, last_slice);
    return today;
}

function end_notification(title, message) {
    notifier.notify({
        'title': title.toString(),
        'message': (image_host).concat(image_path).concat(message)
    });
    console.log(clc.greenBright('Uploaded, terminating script.'));
}





function checkForTrailingSlashes(listOfArguments) {
    for(argIndex in listOfArguments){
        arg = listOfArguments[argIndex];
        if (typeof arg === "string") {
            if (arg.indexOf('//') !== -1 || arg.indexOf('www') !== -1 || arg.indexOf('.com') !== -1) {
                if (arg.trim().slice(-1) === "/") {
                    return true
                }
            }
        }
    }

    return false
}



function processUrlArguments(urlArguments) {
    if ((urlArguments.indexOf('//') !== -1 || urlArguments.indexOf('.com') !== -1)) {
        let start_slice = urlArguments.indexOf('.com/') + 4;

        if (urlArguments.indexOf('https') > -1) {
            urlArguments = urlArguments.replace('https', 'http');
        }

        if (urlArguments.indexOf('http') === -1) {
            urlArguments = 'http://'.concat(urlArguments);
        }

        if (urlArguments.indexOf('.com/') === -1) {
            image_host = urlArguments;
        } else {
            full_path = urlArguments;
            image_path = urlArguments.slice(start_slice);
            image_host = urlArguments.replace(image_path, '');
        }
    }
}


function simpleHttpResquest(request_host, request_path, run_count, type_check) {
    let request = http.get(full_path, function (res) {
        let html_response = "";
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            html_response += chunk;
        });

        res.on('end', function () {
            // var result_headers = JSON.stringify(res.headers);
            if (run_count === 0) { //Only run once to ensure that it doesn't change checking function partway through
                result_content_type = res.headers["content-type"];
            }

            result_status_code = res.statusCode;

            if (run_count === 0) {
                if (result_content_type.indexOf('image') > -1) {
                    console.log(clc.magenta(html_response.substring(0, 250).concat('.............'))); //Truncated as image strings as very long
                } else {
                    console.log(clc.magenta(html_response));
                }
            }


            if (result_content_type.indexOf('image') > -1) {
                // if(result_content_type.indexOf('image') > -1 && run_count === 0){
                if (run_count === 0) {
                    original_image = html_response;
                }

                console.log(result_content_type.indexOf('image'));

                checkModifiedImage(original_image, current_image);
            } else {
                check404(html_response);
            }
        });

    });

    request.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    request.write('data\n');
    request.write('data\n');

    request.end();
}

function check404(full_html) {
    if (run_count === 0 && result_status_code !== 404) {
        getSysTime();

        if ((result_status_code === 200) && (result_content_type.indexOf('html') === -1)) {
            console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ').concat("Okay but isnt a page (could be a directory)")));
            console.log(clc.redBright('Terminating script.'));
            return;
        } else if ((result_status_code === 200) && (result_content_type.indexOf('html') > -1)) {
            console.log('\n'.concat(today).concat(clc.green(' Status:200 OK ').concat("- Okay and is a page")));
            console.log(clc.redBright('Terminating script.'));
            return;
        } else if (result_status_code === 301) {
            console.log('\n'.concat(today).concat(clc.green(' Status:301 OK ').concat("- A redirect to another page (you may have left off the www.)")));
            console.lkog(clc.redBright('Terminating script.'));
            return;
        }
    } else {
        if (result_status_code === 404) {
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
        }
    }
}

function checkModifiedImage(original_image, current_image) {
    getSysTime();
    console.log(clc.blue('Image exists.'));
    if (typeof current_image === 'undefined') {
        current_image = original_image;
    }

    if (current_image == original_image) {
        getSysTime();
        console.log('\n'.concat(today).concat(clc.yellow(' Status:Not updated ')).concat(image_host).concat(image_path));
        timeout_id_image = setTimeout(simpleHttpResquest, 20000, image_host, image_path, run_count, 'check-update');
        clearInterval(second_counter);
        second_counter = setInterval(count_second, 1000);
    } else {
        if (run_count === 0) {
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



function main(){
    if (checkForTrailingSlashes(process.argv) === true) {
        if (process.argv.includes("-f")) {
            console.log("Found a trailing slash, but -f flag included. Continuing anyway!");
            return startUserExec()

        } else {
            console.log("Found a trailing slash, these usually cause problems. Use -f if you want to force it");

            rlUserInput.question('Do you want to continue with a URL with a trailing slash? \n Answer \"Y\" or \"N\" \n', (answer) => {
                rlUserInput.close();
                let processedAnswer = answer.trim();
                if(processedAnswer === "Y" || processedAnswer === "y"){
                    startUserExec()
                } else {
                    return process.exit()
                }
            });
        }
    } else {
       return  startUserExec()
    }
}

function startUserExec(){
    process.argv.forEach(function (val) {
        processUrlArguments(val)
    });

    simpleHttpResquest(image_host, image_path, run_count);
}

main();



