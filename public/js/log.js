$(".log-in").click(function () {
    $(".signIn").addClass("active-dx");
    $(".signUp").addClass("inactive-sx");
    $(".signUp").removeClass("active-sx");
    $(".signIn").removeClass("inactive-dx");
});

$(".back").click(function () {
    $(".signUp").addClass("active-sx");
    $(".signIn").addClass("inactive-dx");
    $(".signIn").removeClass("active-dx");
    $(".signUp").removeClass("inactive-sx");
});

if (status != 'Ok') {
    alert(status);
    $(".signIn").addClass("active-dx");
    $(".signUp").addClass("inactive-sx");
    $(".signUp").removeClass("active-sx");
    $(".signIn").removeClass("inactive-dx");
}
var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(data => {
    let coordinates = `${data.coords.longitude},${data.coords.latitude}`;
    document.getElementById('location').value = coordinates;
}, error, options);

function changeColor(){
    console.log(document.getElementById('admin').style.display);
    if(document.getElementById('admin').style.display == 'block'){
        document.getElementById('admin').style.display = 'none';
        document.getElementById('signIn').action = "/login"

    }else{
        document.getElementById('admin').style.display = 'block';
        document.getElementById('signIn').action = "/login?role=3"

    }
}