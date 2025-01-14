document.getElementById('admin').addEventListener('click', function() {
    alert('Admin login clicked');
    window.location.href = 'http://127.0.0.1:5501/Frontend/AdminSign/index.html';
});

document.getElementById('student').addEventListener('click', function() {
    alert('Student login clicked');
    window.location.href = 'http://127.0.0.1:5501/Frontend/StudentSign/studentsign.html';
});

document.getElementById('teacher').addEventListener('click', function() {
    alert('Teacher login clicked');
    window.location.href = 'http://127.0.0.1:5501/Frontend/TeacherSign/teachersign.html';
});
