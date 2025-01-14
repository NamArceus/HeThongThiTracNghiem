function loginTeacher() {
    var username = document.getElementById('loginUsernameTeacher').value;
    var password = document.getElementById('loginPasswordTeacher').value;
    console.log('Login:', username, password);

    fetch('http://localhost:8000/teacher/loginTeacher',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
        .then(data => {
            console.log('Teacher login successfull:', data);
            if(data.accessToken) {
                localStorage.setItem('userToken', data.accessToken);
                localStorage.setItem('teacherId', data.teacherId);
                console.log('Token saved.');
                window.location.href = 'http://127.0.0.1:5501/Frontend/TeacherDashboard/teacherDashboard.html';
            } else {
                console.error('Token not saved');
            }
        })
    .catch((error) => {
        console.error("Error:", error);
    });
}