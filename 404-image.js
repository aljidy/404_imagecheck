f(document.documentElement.innerHTML.indexOf("404") === -1){
    return "Page isn't 404";
}

if (!Notification) {
    alert('Notifications are supported in modern versions of Chrome, Firefox, Opera and Firefox.'); 
    return;
}
if (Notification.permission !== "granted"){
    Notification.requestPermission();
}

var curr_url = window.location.href;

var notification = new Notification('Image Uploaded', {
    icon: 'http://www.ebuyer.com/assets/img/apple-touch-icon.png',
    body: curr_url.concat(" has been updated!"),
});

setInterval(function(){
    if(document.documentElement.innerHTML.indexOf("404") === -1){
        clearInterval();
        var notification = new Notification('Image Uploaded', {
            icon: 'http://www.ebuyer.com/assets/img/apple-touch-icon.png',
            body: curr_url.concat(" has been updated!"),
        });
        alert('Finshed');
    } else {
        console.log(Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").concat(' Still 404 result. Reloading...'));
        window.location.reload();
    }
}, 5000);
