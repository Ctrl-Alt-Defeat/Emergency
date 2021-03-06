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

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

navigator.geolocation.getCurrentPosition(data => {
    let coordinates = `${data.coords.longitude},${data.coords.latitude}`;
    document.getElementById('location').value = coordinates;
}, error, options);
