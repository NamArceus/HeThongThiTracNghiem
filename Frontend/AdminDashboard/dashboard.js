document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.menu-item');
    const contentHeader = document.querySelector('.main-content header');
    const statsArea = document.querySelector('.stats');
    const accessToken = localStorage.getItem('userToken');
    //Classes
    const classesContent = document.getElementById('classes-content');
    const classForm = document.getElementById('class-form');
    const cancelClassBtn = document.getElementById('cancel-class-btn');
    //Teachers
    const teachersContent = document.getElementById('teachers-content');
    const teacherForm = document.getElementById('teacher-form');
    const cancelTeacherBtn = document.getElementById('cancel-teacher-btn');
    //Students
    const studentsContent = document.getElementById('students-content');
    const studentForm = document.getElementById('student-form');
    const cancelStudentBtn = document.getElementById('cancel-student-btn');

    if(accessToken) {
        console.log('User token logged in');
        updateClassList();
        updateTeacherList();
        updateStudentList();
    } else {    
        console.log('No user token found');
    }
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Gỡ bỏ class 'active' khỏi tất cả các tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Thêm class 'active' cho tab được nhấn
            this.classList.add('active');
    
            // Ẩn tất cả các nội dung
            classesContent.style.display = 'none';
            classForm.style.display = 'none';
            teachersContent.style.display = 'none';
            teacherForm.style.display = 'none';
            studentsContent.style.display = 'none';
            studentForm.style.display = 'none';
            statsArea.style.display = 'none';
            document.getElementById('profile-content').style.display = 'none'; 
    
            // Cập nhật tiêu đề của nội dung chính
            contentHeader.innerHTML = this.textContent + ' Dashboard';
    
            // Kiểm tra id của tab được nhấn và hiển thị nội dung tương ứng
            if (this.id === 'classes-tab') {
                classesContent.style.display = 'block';
                document.getElementById('new-class-btn').style.display = 'block';
                
            } else if (this.id === 'home-tab') {
                statsArea.style.display = 'block';
                statsArea.style.display = 'flex'; 
                // Gọi hàm để load các thống kê nếu có
                loadHomeStats();
            } else if (this.id === 'profile-tab') {
                document.getElementById('profile-content').style.display = 'block';
            } else if (this.id === 'teachers-tab') {
                teachersContent.style.display = 'block';
                document.getElementById('new-teacher-btn').style.display = 'block';  // Hiển thị nút tạo mới giáo viên
            } else if (this.id === 'students-tab') {
                studentsContent.style.display = 'block';
                document.getElementById('new-student-btn').style.display = 'block';  // Hiển thị nút tạo mới học sinh
            }
        });
    });
    
    const backendUrl = "https://hethongthitracnghiem-tdxf.onrender.com";

    //interface new class
    document.getElementById('new-class-btn').addEventListener('click', function() {
        classForm.style.display = 'block'; // Hiển thị form khi nhấn nút
        document.getElementById('classes-list').style.display ='none';
        document.getElementById('new-class-btn').style.display = 'none'; 
      });

    cancelClassBtn.addEventListener('click', function() {
        classForm.style.display = 'none';
        document.getElementById('new-class-btn').style.display ='block';
        classesContent.style.display = 'block';
        document.getElementById('classes-list').style.display = 'table';
        
    });

    //interface new teacher
    document.getElementById('new-teacher-btn').addEventListener('click', function() {
        teacherForm.style.display = 'block'; // Hiển thị form khi nhấn nút
        this.style.display ='none';
        document.getElementById('teachers-list').style.display = 'none';
    });

    cancelTeacherBtn.addEventListener('click', function() {
        teacherForm.style.display = 'none';
        document.getElementById('new-teacher-btn').style.display ='block';
        teachersContent.style.display = 'block';
        document.getElementById('teachers-list').style.display = 'table';
    });
   
    //interface new student
    document.getElementById('new-student-btn').addEventListener('click', function() {
        studentForm.style.display = 'block'; // Hiển thị form khi nhấn nút
        this.style.display ='none';
    });

    cancelStudentBtn.addEventListener('click', function() {
        studentForm.style.display = 'none';
        document.getElementById('new-student-btn').style.display ='block';
        studentsContent.style.display = 'block';
    })

    //CREATE CLASS
    document.getElementById('submit-class').addEventListener('click', function(e) {
        e.preventDefault();
        
        var nameClass = document.getElementById('class-name').value;
        
    
        fetch(`${backendUrl}/class/createclass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({ 
                nameClass: nameClass,
                
             })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong');
            }
        })
        .then(data => {
            console.log('Class created:', data);
            console.log('Class ID:', data.classId);
            document.getElementById('class-form').style.display = 'none';
            document.getElementById('new-class-btn').style.display ='block';
            document.getElementById('classes-list').style.display = 'table';
            updateClassList();
            loadHomeStats();
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    });  
    

    //DELETE CLASS
    function deleteClass(classId) {
        console.log('Class ID:', classId);
        if (!classId) {
            console.error('Invalid class ID');
            return;
        }
        fetch(`${backendUrl}/class/deleteclass/${classId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete response:', data);
            updateClassList();
            loadHomeStats();
        })
        .catch(error => console.error('Error:', error));
    }


    function updateClassList() {
        fetch(`${backendUrl}/class/getclass`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(classes => {
            const classesTable = document.getElementById('classes-list'); 
            classesTable.innerHTML = ''; // Xóa các hàng hiện có trong bảng
    
            // Thêm tiêu đề cho bảng
            const header = classesTable.createTHead();
            const headerRow = header.insertRow(0);
            const headerCell0 = headerRow.insertCell(0);
            headerCell0.textContent = 'ID';
            const headerCell1 = headerRow.insertCell(1);
            headerCell1.textContent = 'Tên lớp';
            const headerCell2 = headerRow.insertCell(2);
            headerCell2.textContent = 'Hành động';
    
            // Thêm các hàng cho mỗi lớp học
            const body = classesTable.createTBody();
            classes.forEach((classItem, index) => {
                const row = body.insertRow(); // Thêm hàng mới
                const cell0 = row.insertCell(0); // Thêm ô cho số thứ tự
                cell0.textContent = index + 1;
                const cell1 = row.insertCell(1); // Thêm ô cho tên lớp học
                cell1.textContent = classItem.nameClass;
    
                const cell2 = row.insertCell(2); // Thêm ô cho nút
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';
                deleteButton.style.marginLeft = '10px'; // Giảm khoảng cách giữa text và button
                deleteButton.addEventListener('click', function() {
                    deleteClass(classItem._id);
                });
                cell2.appendChild(deleteButton);
            });
            loadHomeStats();
        })
        .catch(error => console.error('Error:', error));
    }
    
    document.getElementById('classes-tab').addEventListener('click', function() {
        updateClassList();
    })
    
    

    //REGISTER TEACHER
    document.getElementById('submit-teacher').addEventListener('click', function(e) {
        e.preventDefault();

        var firstName = document.getElementById('teacher-firstname').value;
        var lastName = document.getElementById('teacher-lastname').value;
        var username = document.getElementById('teacher-username').value;
        var password = document.getElementById('teacher-password').value;

        fetch(`${backendUrl}/teacher/registerTeacher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({ firstName: firstName, lastName: lastName, username: username, password: password })
        })
        .then(response => {
            if (response.status) {
                return response.json();
            } else {
                throw new Error('Something went wrong');
            }
        })
        .then(data => {
            console.log("Teacher created", data);
            console.log("ID Teacher", data.teacherId);
            document.getElementById('teacher-form').style.display = 'none';
            document.getElementById('new-teacher-btn').style.display = 'block';
            updateTeacherList();
            
            loadHomeStats();
        })
        .catch(error => {
            console.error("Error: ", error);
        })
    })


    //DELETE TEACHER
    function deleteTeacher(teacherId) {
        console.log('Class ID:', teacherId);
        if (!teacherId) {
            console.error('Invalid teacher ID');
            return;
        }
        fetch(`${backendUrl}/teacher/deleteTeacher/${teacherId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete response:', data);
            updateTeacherList(); 
            loadHomeStats();
            
        })
        .catch(error => console.error('Error:', error));
    }



    //Update TEACHER
    function updateTeacherList() {
        fetch(`${backendUrl}/teacher/getTeachers`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(teachers => {
            const teachersList = document.getElementById('teachers-list');
            teachersList.innerHTML = ''; // Xóa các phần tử cũ trong danh sách giáo viên
        
            // Tạo tiêu đề cho bảng giáo viên
            const header = teachersList.createTHead();
            const headerRow = header.insertRow(0);
            const headerCell0 = headerRow.insertCell(0);
            headerCell0.textContent = 'ID';
            const headerCell1 = headerRow.insertCell(1);
            headerCell1.textContent = 'Tên Giáo Viên';
            const headerCell2 = headerRow.insertCell(2);
            headerCell2.textContent = 'Hành động';
            
            // Tạo thân bảng cho danh sách giáo viên
            const body = teachersList.createTBody();
        
            teachers.forEach((teacherItem, index) => {
                const row = body.insertRow(); // Thêm hàng mới cho mỗi giáo viên
                const cell0 = row.insertCell(0); // Thêm ô cho số thứ tự
                cell0.textContent = index + 1;
        
                const cell1 = row.insertCell(1); // Thêm ô cho tên giáo viên
                cell1.textContent = teacherItem.lastName;
        
                const cell2 = row.insertCell(2); // Thêm ô cho các nút hành động
                // Tạo nút xóa giáo viên
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.style.backgroundColor = 'red';
                deleteButton.style.marginLeft = '30px';
                deleteButton.addEventListener('click', function() {
                    deleteTeacher(teacherItem._id);
                });
        
                // Tạo nút thêm giáo viên vào lớp
                const addButton = document.createElement('button');
                addButton.textContent = 'Add to class';
                addButton.style.marginLeft = '80px';
                addButton.addEventListener('click', function() {
                    displayClassListModal(teacherItem);
                });
        
                cell2.appendChild(addButton);
                cell2.appendChild(deleteButton);
            });
        
            loadHomeStats(); // Giả sử đây là một hàm để làm mới dữ liệu khác
        })
        
        .catch(error => console.error('Error:', error));
    }


    function displayClassListModal(teacherItem) {
        const modal = document.getElementById('class-list-modal');
        modal.style.display = 'flex'; // Thay đổi thành flex để căn giữa
    
        // Lấy danh sách các lớp
        fetchClasses().then(classes => {
            const classListDiv = document.getElementById('class-list');
            classListDiv.innerHTML = ''; // Xóa danh sách cũ
    
            classes.forEach(cls => {
                const classElement = document.createElement('tr');
                classElement.innerHTML = `
                    <td>${cls.nameClass}</td>
                    <td><button class="choose-button">Choose</button></td>
                `;
    
                const chooseButton = classElement.querySelector('.choose-button');
                chooseButton.addEventListener('click', function() {
                    console.log(`Adding ${teacherItem.username} to class ${cls.nameClass}`);
                    const teacherId = teacherItem._id; 
                    const classId = cls._id; 
    
                    console.log('Class ID being sent: ', classId);
                    fetch(`${backendUrl}/class/assignteacher`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('userToken') 
                        },
                        body: JSON.stringify({ classId: classId, teacherId: teacherId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        alert('Assign teacher successfully');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
    
                classListDiv.appendChild(classElement);
            });
        });
    }
    
    // Hàm giả định để lấy danh sách các lớp học
    function fetchClasses() {
        return fetch(`${backendUrl}/class/getclass`) 
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            }); 
    }

    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('class-list-modal').style.display = 'none'; // Ẩn modal lựa chọn lớp
        document.getElementById('teachers-list').style.display = 'block'; // Hiển thị lại danh sách giáo viên
    });
    
    document.getElementById('teachers-tab').addEventListener('click', function() {
        updateTeacherList();
    })
    
    

    //REGISTER STUDENT
    document.getElementById('submit-student').addEventListener('click', function(e) {
        e.preventDefault();

        var firstName = document.getElementById('student-firstname').value;
        var lastName = document.getElementById('student-lastname').value;
        var username = document.getElementById('student-username').value;
        var password = document.getElementById('student-password').value;

        fetch(`${backendUrl}/student/registerStudent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({ firstName: firstName, lastName: lastName, username: username, password: password })
        })
        .then(response => {
            if (response.status) {
                return response.json();
            } else {
                throw new Error('Something went wrong');
            }
        })
        .then(data => {
            console.log("Student created", data);
            console.log("ID Student", data.studentId);
            document.getElementById('student-form').style.display = 'none';
            document.getElementById('new-student-btn').style.display = 'block';
            updateStudentList();
            
            loadHomeStats();
        })
        .catch(error => {
            console.error("Error: ", error);
        })
    })


    //DELETE STUDENT
    function deleteStudent(studentId) {
        console.log('Student ID:', studentId);
        if (!studentId) {
            console.error('Invalid student ID');
            return;
        }
        fetch(`${backendUrl}/deleteStudent/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete response:', data);
            updateStudentList(); 
            loadHomeStats();
        })
        .catch(error => console.error('Error:', error));
    }


    function updateStudentList() {
        fetch(`${backendUrl}/student/getStudents`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(students => {
            const studentsList = document.getElementById('students-list');
            studentsList.innerHTML = ''; 
        
            // Tạo tiêu đề cho bảng 
            const header = studentsList.createTHead();
            const headerRow = header.insertRow(0);
            const headerCell0 = headerRow.insertCell(0);
            headerCell0.textContent = 'ID';
            const headerCell1 = headerRow.insertCell(1);
            headerCell1.textContent = 'Tên Học Sinh';
            const headerCell2 = headerRow.insertCell(2);
            headerCell2.textContent = 'Hành động';
            
        
            
            const body = studentsList.createTBody();
        
            students.forEach((studentItem, index) => {
                const row = body.insertRow(); 
                const cell0 = row.insertCell(0); // Thêm ô cho số thứ tự
                cell0.textContent = index + 1;
        
                const cell1 = row.insertCell(1); 
                cell1.textContent = studentItem.lastName;
        
                const cell2 = row.insertCell(2); // Thêm ô cho các nút hành động
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.style.backgroundColor = 'red';
                deleteButton.style.marginLeft = '30px';
                deleteButton.addEventListener('click', function() {
                    deleteStudent(studentItem._id);
                });
        
                
                const addButton = document.createElement('button');
                addButton.textContent = 'Add to class';
                addButton.style.marginLeft = '80px';
                addButton.addEventListener('click', function() {
                    displayStudentClassListModal(studentItem);
                });
        
                cell2.appendChild(addButton);
                cell2.appendChild(deleteButton);
            });
        
            loadHomeStats(); 
        })
        .catch(error => console.error('Error:', error));
    }

    function displayStudentClassListModal(studentItem) {
        const modal = document.getElementById('student-class-list-modal');
        modal.style.display = 'block';
    
        // Lấy danh sách các lớp
        fetchStudentClasses().then(classes => {
            const classListDiv = document.getElementById('student-class-list');
            classListDiv.innerHTML = ''; // Xóa danh sách cũ
    
            classes.forEach(cls => {
                const classElement = document.createElement('div');
                classElement.textContent = cls.nameClass; 
                const chooseButton = document.createElement('button');
                chooseButton.textContent = 'Choose';
                chooseButton.addEventListener('click', function() {
                    console.log(`Adding ${studentItem.username} to class ${cls.nameClass}`);
                    const studentId = studentItem._id; 
                    const classId = cls._id; 
                
                    console.log('Class ID being sent: ', classId);
                    fetch(`${backendUrl}/class/assignstudent`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('userToken') 
                        },
                        body: JSON.stringify({ classId: classId, studentId: studentId })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        alert('Assign successfully');
                        
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
                
                classElement.appendChild(chooseButton);
                classListDiv.appendChild(classElement);
            });
        });
    }

    function fetchStudentClasses() {
        return fetch(`${backendUrl}/class/getclass`) 
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            }); 
    }

    document.getElementById('student-close-modal').addEventListener('click', function() {
        document.getElementById('student-class-list-modal').style.display = 'none'; 
        document.getElementById('students-list').style.display = 'block'; 
    });

    document.getElementById('students-tab').addEventListener('click', function() {
        updateStudentList();
    })

    //PROFILE
    const userId = localStorage.getItem('userId');
    getProfile(userId);
    async function getProfile(userId) {
        try {
            const token = localStorage.getItem('userToken'); 
            const response = await fetch(`${backendUrl}/user/getprofile/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error("User not found");
            }
            const data = await response.json();
            
            // Cập nhật nội dung profile
            document.getElementById("user-firstname").innerText = data.data.firstName;
            document.getElementById("user-lastname").innerText = data.data.lastName;
            document.getElementById("user-username").innerText = data.data.username;
            loadHomeStats();
            
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }
    
    //UPDATE PROFILE
    document.getElementById("edit-profile-btn").addEventListener("click", function() {
        document.getElementById("edit-profile").style.display = "block";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("edit-profile-btn").style.display = "none";
        document.getElementById("user-info").style.display = "none";
    });

    

    document.getElementById('submit-edit-profile').addEventListener("click", async function() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('userToken');

        // Lấy thông tin hiện tại từ DOM
        const currentFirstName = document.getElementById("user-firstname").innerText;
        const currentLastName = document.getElementById("user-lastname").innerText;
        const currentUsername = document.getElementById("user-username").innerText;
    
        const updatedProfile = {
            firstName: document.getElementById('edit-firstname').value,
            lastName: document.getElementById('edit-lastname').value,
            username: document.getElementById('edit-username').value,
        };

        // Tạo đối tượng cập nhật chỉ với các trường thay đổi
        const profileToUpdate = {
            firstName: updatedProfile.firstName || currentFirstName, 
            lastName: updatedProfile.lastName || currentLastName,   
            username: updatedProfile.username || currentUsername,    
        };
    
        try {
            const response = await fetch(`${backendUrl}/user/editprofile/${userId}`, {
                method: 'PATCH', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileToUpdate)
            });
    
            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
    
            const data = await response.json();
            if (data.success) {
                
            } else {
                alert(data.message);
                document.getElementById('user-info').style.display = "block";
                document.getElementById('logoutBtn').style.display = "block";
                document.getElementById('edit-profile-btn').style.display = "block";
                document.getElementById('edit-profile').style.display = "none"; 
                document.getElementById("user-firstname").innerText = profileToUpdate.firstName;
                document.getElementById("user-lastname").innerText = profileToUpdate.lastName;
                document.getElementById("user-username").innerText = profileToUpdate.username;
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });
    document.getElementById("cancel-edit-profile").addEventListener("click", function() {
            document.getElementById("edit-profile").style.display = "none";
            document.getElementById("logoutBtn").style.display = "block";
            document.getElementById("edit-profile-btn").style.display = "block";
            document.getElementById("user-info").style.display = "block";
        });

    //LOG OUT
    var logoutButton = document.getElementById('logoutBtn');
        if (logoutButton) {
            logoutButton.addEventListener('click', function() {
            console.log('User logged out');
            logout();
        });
    }

    function logout() {
        localStorage.removeItem('userToken');
        window.location.href = 'https://he-thong-thi-trac-nghiem.vercel.app/ChooseSign/choose.html';
    }
    

    function getCount(selector) {
        return document.querySelectorAll(selector).length;
        
    }
    
    function loadHomeStats() {
        // Đếm các thực thể từ DOM
        const totalClasses = getCount('.class-item');  
        const totalTeachers = getCount('.teacher-item');  
        const totalStudents = getCount('.student-item');  
    
        // Cập nhật các giá trị vào DOM
        document.getElementById('total-classes').textContent = totalClasses;
        document.getElementById('total-teachers').textContent = totalTeachers;
        document.getElementById('total-students').textContent = totalStudents;

    }
    
    loadHomeStats();
    
});
