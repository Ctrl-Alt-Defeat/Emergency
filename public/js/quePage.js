document.getElementById('user_id').value = localStorage.getItem('id');
document.getElementById('user_id_replay').value = localStorage.getItem('id');
console.log(localStorage.getItem('id'),'userid');

function showAddReply(ele){
    console.log(ele);
    document.getElementById(`repForm${ele}`).style.display = 'block';
}
