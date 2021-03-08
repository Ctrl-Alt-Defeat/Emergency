$(".log-in").click(function () {
    document.getElementById('WRONG').style.display = 'none';
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
    document.getElementById('WRONG').style.display = 'block';
    $(".signIn").addClass("active-dx");
    $(".signUp").addClass("inactive-sx");
    $(".signUp").removeClass("active-sx");
    $(".signIn").removeClass("inactive-dx");
}

if (usernameOrPasswordError != 'Ok') {
    document.getElementById('Used').style.display = 'block';
    $(".signUp").addClass("active-sx");
    $(".signIn").addClass("inactive-dx");
    $(".signIn").removeClass("active-dx");
    $(".signUp").removeClass("inactive-sx");
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

function Validation(ele,val1){
    if(!ele.value){
        console.log('hiiiiiiiiiiiiiiiii1');
        document.getElementById(val1).style.display = 'block';
        document.getElementById(val1).style['margin-bottom'] =  '6px';
        document.getElementById(val1).style['margin-top'] =  '-20px';
        document.getElementById(val1).style['font-size'] = '10px';
        console.log(val1 == 'full_name_input');
        if(val1 == 'full_name_input'){
            console.log( document.getElementById(val1));
            document.getElementById(val1).style['margin-bottom'] =  '-12px';
        }
    }else if ((val1 == 'var_name' && document.getElementById('checkpassWord').value != ele.value) || (val1 == 'phone_num' && /^(\([0-9]{3}\)|[0-9]{3})[-|\s]?[0-9]{3}[-|\s]?[0-9]{4}$/g.test(ele.value))){
        document.getElementById(val1).style.display = 'block';
    }
    else{
        console.log('hiiiiiiiiiiiiiiiii3');
        document.getElementById(val1).style.display = 'none';
    }
}