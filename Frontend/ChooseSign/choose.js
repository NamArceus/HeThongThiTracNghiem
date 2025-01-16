document.getElementById('admin').addEventListener('click', function() {
    alert('Admin login clicked');
    window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/AdminSign/index.html';
});

document.getElementById('student').addEventListener('click', function() {
    alert('Student login clicked');
    window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/StudentSign/studentsign.html';
});

document.getElementById('teacher').addEventListener('click', function() {
    alert('Teacher login clicked');
    window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/TeacherSign/teachersign.html';
});
