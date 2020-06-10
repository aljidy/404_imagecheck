const http = require("http");
const clc = require("cli-color");
const notifier = require("node-notifier");
const readline = require("readline");

const rlUserInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let run_count = 0;

let elipsis_counter;

let request_timeout;
let timeout_id_image;

let result_content_type;
let result_status_code;

let full_path;
let image_host;
let image_path;

let original_image;
let current_image;


function processUrlArgument(url_argument) {
    if ((url_argument.indexOf("//") !== -1 || url_argument.indexOf(".") !== -1)) {
        let start_slice = url_argument.indexOf(".com/") + 4;

        if (url_argument.indexOf("https") > -1) {
            url_argument = url_argument.replace("https", "http");
        }

        if (url_argument.indexOf("http") === -1) {
            url_argument = "http://".concat(url_argument);
        }

        if (url_argument.indexOf(".com/") === -1) {
            image_host = url_argument;
        } else {
            full_path = url_argument;
            image_path = url_argument.slice(start_slice);
            image_host = url_argument.replace(image_path, "");
        }
    }
}


function createHttpRequest(request_host, request_path, run_count, function_to_run_on_end) {
    let request = http.get(full_path, function (res) {
        let html_response = "";
        res.setEncoding("utf8");

        res.on("data", function (chunk) {
            html_response += chunk;
        });

        res.on("end", function () {
            if (run_count === 0) { //Only run once to ensure that it doesn't change checking function partway through
                result_content_type = res.headers["content-type"];
            }
            result_status_code = res.statusCode;

            if (run_count === 0) {
                if (result_content_type.indexOf("image") > -1) {
                    console.log(clc.magenta(html_response.substring(0, 250) + ".............")); //Truncated as image strings as very long
                } else {
                    console.log(clc.magenta(html_response));
                }
            }

            if (result_content_type.indexOf("image") > -1) {
                if (run_count === 0) {
                    original_image = html_response;
                }

                console.log(result_content_type.indexOf("image"));

                checkModifiedImage(original_image, current_image);
            } else {
                check404(html_response);
            }
        });

    });

    request.on("error", function (e) {
        console.log("problem with request: " + e.message);
    });

    // write data to request body
    request.write("data\n");

    request.end();
}



function imageCheckingLoop(){

}

function check404() {
    if (run_count === 0 && result_status_code !== 404) {
        if ((result_status_code === 200) && (result_content_type.indexOf("html") === -1)) {
            console.log("\n" + getCurrTime() + clc.green(" Status:200 - OK ") + "Found, but this isn't a page (could be a directory)");
            console.log(clc.redBright("Terminating script."));
        } else if ((result_status_code === 200) && (result_content_type.indexOf("html") > -1)) {
            console.log("\n" + getCurrTime() + clc.green(" Status:200 - OK ") + "- Okay and is a page");
            console.log(clc.redBright("Terminating script."));
        } else if (result_status_code === 301) {
            console.log("\n" + getCurrTime() + clc.green(" Status:301") + "- A redirect to another page (you may have left off the www.)");
            console.log(clc.redBright("Terminating script."));
        }
    } else {
        if (result_status_code === 404) {
            run_count++;
            console.log("\n" + getCurrTime() + clc.yellow(" Status:404 ") + full_path);
            request_timeout = setTimeout(createHttpRequest, 20000, image_host, image_path, run_count, "check-404");
            clearInterval(elipsis_counter);
            elipsis_counter = setInterval(printEllipsis, 1000);
        } else {
            clearInterval(elipsis_counter);
            clearTimeout(request_timeout);
            console.log("\n" + getCurrTime() + clc.green(" Status:200 - OK ") + full_path);
            endNotification("Image Uploaded!", " has been uploaded.");
        }
    }
}

function checkModifiedImage(original_image, current_image) {
    console.log(clc.blue("Image exists."));
    if (typeof current_image === "undefined") {
        current_image = original_image;
    }

    if (current_image == original_image) {
        console.log("\n" + getCurrTime() + clc.yellow(" Status: Not updated ") + image_host + image_path);
        timeout_id_image = setTimeout(createHttpRequest, 20000, image_host, image_path, run_count, "check-update");
        clearInterval(elipsis_counter);
        elipsis_counter = setInterval(printEllipsis, 1000);
    } else {
        if (run_count === 0) {
            console.log("\n" + getCurrTime() + clc.green(" Status:200 OK " + "Image is live."));
            console.log(clc.yellowBright("Terminating script."));
            return;
        }
        clearInterval(elipsis_counter);
        clearTimeout(timeout_id_image);
        console.log("\n" + getCurrTime() + clc.green(" Status:Updated ") + image_host + image_path);
        endNotification("Image Updated!", " has been updated.");
        return;
    }

    run_count++;
}


function main() {
    if (checkForTrailingSlashes(process.argv) === true) {
        if (process.argv.includes("-f")) {
            console.log("Found a trailing slash, but -f flag included. Continuing anyway!");
            return beginImageCheckProcess();

        } else {
            console.log(clc.yellow("Warning: Found a trailing slash, these usually cause problems. Use -f next time if you want to force it\n"));
            processTrailingSlashQuestionAnswer("Do you want to continue with a URL with a trailing slash?\n" + "Answer \"Y\" or \"N\": \n");
        }
    } else {
        return beginImageCheckProcess();
    }
}

function beginImageCheckProcess() {
    process.argv.forEach(function (val) {
        processUrlArgument(val);
    });

    createHttpRequest(image_host, image_path, run_count);
}

function processTrailingSlashQuestionAnswer(question) {
    rlUserInput.question(question, (answer) => {
        answer = answer.trim();

        if (answer === "Y" || answer === "y") {
            rlUserInput.close();
            return beginImageCheckProcess();
        } else if (answer === "N" || answer === "n") {
            rlUserInput.close();
            return process.exit();
        } else {
            console.log(clc.red("Invalid Input!"));
            processTrailingSlashQuestionAnswer(question);
        }
    });
}


function printEllipsis() {
    if (run_count > 0) {
        process.stdout.write(".");
    } else {
        process.stdout.write(" . ");
    }
}

function getCurrTime() {
    let currentDateTime = Date().toLocaleString();
    return currentDateTime.slice((currentDateTime.indexOf(":") - 2), (currentDateTime.lastIndexOf(":") + 3));
}

function endNotification(title, message) {
    notifier.notify({
        "title": title.toString(),
        "message": image_host.toString() + image_path.toString() + message.toString()
    });
    console.log(clc.greenBright(title + ", " + "terminating script."));
}


function checkForTrailingSlashes(listOfArguments) {
    for (let i in listOfArguments) {
        let arg = listOfArguments[i];
        if (typeof arg === "string") {
            if (arg.indexOf("//") !== -1 || arg.indexOf("www") !== -1 || arg.indexOf(".com") !== -1) {
                if (arg.trim().slice(-1) === "/") {
                    return true;
                }
            }
        }
    }

    return false;
}

main();
