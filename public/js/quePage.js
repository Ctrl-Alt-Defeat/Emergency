document.getElementById('user_id').value = localStorage.getItem('id');

function showAddAnswer(e){
    document.getElementById('ansForm').style.display = 'block';
};

function showAddReply(ele){
    console.log(ele);
    document.getElementById(`repForm${ele}`).style.display = 'block';
}
