document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.menu-item');
    const contentHeader = document.querySelector('.main-content header');
    const statsArea = document.querySelector('.stats');
    const accessToken = localStorage.getItem('userToken');
    const classesContent = document.getElementById('classes-content');
    if(accessToken) {
        console.log('User token logged in');
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
            //lassForm.style.display = 'none';
            
            /*studentsContent.style.display = 'none';
            studentForm.style.display = 'none';*/
            statsArea.style.display = 'none';
            document.getElementById('profile-content').style.display = 'none'; 
    
            // Cập nhật tiêu đề của nội dung chính
            contentHeader.innerHTML = this.textContent + ' Dashboard';
    
            // Kiểm tra id của tab được nhấn và hiển thị nội dung tương ứng
            if (this.id === 'classes-tab') {
                classesContent.style.display = 'block';
                
            } else if (this.id === 'home-tab') {
                statsArea.style.display = 'block';
                statsArea.style.display = 'flex';
                // Gọi hàm để load các thống kê nếu có
                loadHomeStats();
            } else if (this.id === 'profile-tab') {
                document.getElementById('profile-content').style.display = 'block';
            } else {
                classesContent.style.display = 'none';
            }
            
        });
    });
    fetchClasses();

    function fetchClasses() {
        const studentId = localStorage.getItem('studentId');
        console.log("StudentId: ",studentId);
    
        if (!studentId) {
            console.error('No studentId found, please login first.');
            return;
        }

        const url = `http://localhost:8000/student/getClassesForStudent?studentId=${studentId}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayClasses(data.data);
            } else {
                console.error('No classes found:', data.message);
            }
        })
        .catch(error => console.error('Error fetching classes:', error));
    }
    
    function displayClasses(classes) {
        const classesList = document.getElementById('classes-list');
        classesList.innerHTML = '';
    
        classes.forEach(cls => {
            const li = document.createElement('li');
            li.textContent = cls.nameClass;

            // Tạo nút "Vào lớp"
            const button = document.createElement('button');
            button.textContent = 'Vào lớp';
            button.classList.add('enterClassButton');
            button.style.marginLeft = '400px';
            button.addEventListener('click', function() {
                enterClass(cls); // Giả sử enterClass là hàm xử lý khi nhấn vào nút
            });
            // Thêm nút vào li
            li.appendChild(button);
            classesList.appendChild(li);
        });
    }
    async function enterClass(cls) {
        var currentClassId = localStorage.getItem('currentClassId');
    
        // Update localStorage if the class ID changes
        if (currentClassId !== cls._id) {
            localStorage.setItem('currentClassId', cls._id);
        }
    
        // Hide the class list and title
        document.getElementById('classes-list').style.display = 'none';
        document.getElementById('classes-title').style.display = 'none';
        document.getElementById('questions-list').style.display = 'block';
    
        // Display class details
        var classDetails = document.getElementById('classDetails');
        classDetails.innerHTML = `
            <div class="class-container">
                <h1>${cls.nameClass}</h1>
                <button id="back" class="btn btn-secondary">Trở về</button>
                <ul id="room-list" class="room-list"></ul>
            </div>
        `;
        classDetails.style.display = 'block';
    
        document.getElementById('back').addEventListener('click', function() {
            // Hide class details
            document.getElementById('classDetails').style.display = 'none';
            
            // Show the class list again
            document.getElementById('classes-list').style.display = 'block';
            document.getElementById('classes-title').style.display = 'block';
        });
    
        // Fetch rooms for the current class
        try {
            const userToken = localStorage.getItem('userToken');
    
            const response = await fetch(`http://localhost:8000/testroom/getRoomInClass?classId=${cls._id}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Error fetching rooms: ' + response.status);
            }
    
            const data = await response.json();
            console.log('Room data fetched:', data);
    
            if (data.success) {
                const roomList = document.getElementById('room-list');
                roomList.innerHTML = ''; // Clear existing rooms

                if(data.rooms.length === 0) {
                    roomList.innerHTML = '<p>Chưa có phòng thi nào trong lớp này</p>';
                    return;
                }

                // Create a list item for each room
                data.rooms.forEach(room => {
                    const listItem = document.createElement('li');
                    listItem.className = 'room-item';
    
                    const roomStatus = room.completed ? 'Đã làm bài' : 'Chưa làm bài';
                    const buttonText = room.completed ? '' : 'Làm bài';
    
                    listItem.innerHTML = `
                        <div class="room-info">
                            <h3>${room.nameRoom}</h3>
                            <p>Thời gian: <strong>${room.duration} phút</strong></p>
                            <p class="${room.completed ? 'completed' : 'not-completed'}">${roomStatus}</p>
                            ${!room.completed ? `<button class="start-exam-btn btn btn-primary" data-room-id="${room._id}">${buttonText}</button>` : ''}
                        </div>
                    `;
                    roomList.appendChild(listItem);
                });
    
                // Add event listeners for each "Start Exam" button
                document.querySelectorAll('.start-exam-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const roomId = this.dataset.roomId;
                        alert("Bắt đầu làm bài");
                        window.location.href = `http://127.0.0.1:5501/Frontend/DoTest/test.html?roomId=${roomId}`;
                    });
                });
            } else {
                console.error('No rooms found:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
    
    
    //PROFILE
    const studentId = localStorage.getItem('studentId');
    getProfile(studentId);
    async function getProfile(studentId) {
        try {
            const token = localStorage.getItem('userToken'); 
            const response = await fetch(`http://localhost:8000/student/getProfileStudent/${studentId}`, {
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
            
            
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }


    //EDIT PROFILE
    document.getElementById("edit-profile-btn").addEventListener("click", function() {
        document.getElementById("edit-profile").style.display = "block";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("edit-profile-btn").style.display = "none";
        document.getElementById("user-info").style.display = "none";
    });

    

    document.getElementById('submit-edit-profile').addEventListener("click", async function() {
        const studentId = localStorage.getItem('studentId');
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
            const response = await fetch(`http://localhost:8000/student/editProfileStudent/${studentId}`, {
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
        window.location.href = 'http://127.0.0.1:5501/Frontend/ChooseSign/choose.html';
    }
    function loadHomeStats() {
        console.log(statsArea);
        statsArea.innerHTML = `
            <div class="card">
                <p>Total Classes</p>
                <h3>1</h3>
            </div>
        `;
        // Add more logic here if stats are dynamically fetched
    }

    // Initial load for home stats
    loadHomeStats();
})