const backendUrl = "https://hethongthitracnghiem-k3p2.onrender.com"
function loginTeacher() {
    var username = document.getElementById('loginUsernameTeacher').value;
    var password = document.getElementById('loginPasswordTeacher').value;
    console.log('Login:', username, password);

    fetch(`${backendUrl}/teacher/loginTeacher`,{
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
                window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/TeacherDashboard/teacherDashboard.html';
            } else {
                console.error('Token not saved');
            }
        })
    .catch((error) => {
        console.error("Error:", error);
    });
}