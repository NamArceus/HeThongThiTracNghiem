function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function login() {
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    console.log('Login with:', username, password);

    fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
        .then(data => {
            console.log('Login successful:', data);
            if (data.accessToken) { // Sửa từ data.token thành data.accessToken
                localStorage.setItem('userToken', data.accessToken); // Lưu token vào localStorage
                localStorage.setItem('userId', data.userId); //
                console.log('Token saved');
                window.location.href = 'http://127.0.0.1:5501/Frontend/AdminDashboard/dashboard.html'; 
                console.error('Token not found in response');
            } 
        })
        
        
    .catch((error) => {
        console.error('Error:', error);
    });
}

function register() {
    var firstName = document.getElementById('registerfirstName').value;
    var lastName = document.getElementById('registerlastName').value;
    var username = document.getElementById('registerUsername').value;
    var password = document.getElementById('registerPassword').value;
    console.log('Register with:', firstName, lastName, username, password);
    
    fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName: firstName, lastName: lastName, username: username, password: password })

    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showLogin(); // Chuyển người dùng về mẫu đăng nhập
        } else {
            alert('Đăng ký thất bại: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
