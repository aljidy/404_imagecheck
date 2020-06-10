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
    let first_slice = today.indexOf(":") - 2;
    let last_slice = today.lastIndexOf(":") + 3;
    today = today.slice(first_slice, last_slice);
    return today;
}

function end_notification(title, message) {
    notifier.notify({
        "title": title.toString(),
        "message": (image_host).concat(image_path).concat(message)
    });
    console.log(clc.greenBright("Uploaded, terminating script."));
}
export function checkForTrailingSlashes(listOfArguments) {
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