const backendUrl = "https://hethongthitracnghiem-tdxf.onrender.com"
function loginStudent() {
    var username = document.getElementById('loginUsernameStudent').value;
    var password = document.getElementById('loginPasswordStudent').value;
    console.log('Login:', username, password);

    fetch(`${backendUrl}/student/loginStudent`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
        .then(data => {
            console.log('Student login successfull:', data);
            if(data.accessToken) {
                localStorage.setItem('userToken', data.accessToken);
                localStorage.setItem('studentId', data.studentId);
                console.log('Token saved.');
                window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/StudentDashboard/studentDashboard.html';
            }
        })
    .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
    });
}