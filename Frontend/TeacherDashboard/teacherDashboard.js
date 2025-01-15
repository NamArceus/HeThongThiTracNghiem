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
            
            statsArea.style.display = 'none';
            document.getElementById('profile-content').style.display = 'none'; 
            document.getElementById('room-content').style.display = 'none';
    
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
            } else if(this.id === 'roomtest-tab'){
                document.getElementById('room-content').style.display = 'block';
                
            }
             else if (this.id === 'profile-tab') {
                document.getElementById('profile-content').style.display = 'block';
            } else {
                classesContent.style.display = 'none';
            }
            
        });
    });
    fetchClasses();
    //Điều chỉnh giao diện khi ấn nút
    document.getElementById('create-room-btn').addEventListener('click', function() {
        document.getElementById('room-form').style.display='block';
        document.getElementById('room-option').style.display='none';
        document.getElementById('view-room').style.display='none';
        fetchClasses();
    });

    document.getElementById('cancel-room-btn').addEventListener('click', function() {
        document.getElementById('room-form').style.display='none';
        document.getElementById('room-option').style.display='block';
        document.getElementById('view-room').style.display='block';
    })

    //Lấy danh sách lớp cho giáo viên
    function fetchClasses () {
        const teacherId = localStorage.getItem('teacherId');  // Lấy teacherId từ localStorage
        console.log("TeacherId: ", teacherId);
    
        if (!teacherId) {
            console.error('No teacherId found, please login first.');
            return;
        }

        const url = `http://localhost:8000/teacher/getClassesForTeacher?teacherId=${teacherId}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Fetched classes:', data);
            if (data.success) {
                console.log('Classes array:', data.data);
                displayClasses(data.data);
                populateClassDropdown(data.data);
            } else {
                console.error('No classes found:', data.message);
            }
        })
        .catch(error => console.error('Error fetching classes:', error));
    }
    
    //Màn hình trong tab Classes
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

    //TẠO PHÒNG THI
    function populateClassDropdown(classes) {
        console.log('Classes to populate:', classes);
        const classDropdown = document.getElementById('class-dropdown');
        classDropdown.innerHTML = ''; // Xóa các lựa chọn cũ
        
    
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls._id;
            option.textContent = cls.nameClass;
            classDropdown.appendChild(option);
        });
        console.log('Dropdown options:', classDropdown.innerHTML);
    }
    
    // TẠO PHÒNG
    document.getElementById('submit-room').addEventListener('click', function(e) {
        e.preventDefault();
        const nameRoom = document.getElementById('room-name').value;
        const userToken = localStorage.getItem('userToken');
        const classId = document.getElementById('class-dropdown').value;
        const duration = document.getElementById('duration').value;
        
        if (!userToken) {
            console.error('No user token found, please login first.');
            return;
        }
        console.log('Selected classId:', classId);  
        if (!classId) {
            console.error('Please select a class before submitting.');
            return;
        }
        localStorage.setItem('duration', duration);
        fetch('http://localhost:8000/testroom/createTestRoom' , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken,
            },
            body: JSON.stringify({
                nameRoom: nameRoom,
                classId: classId,
                duration: duration,
                complete: false
            })
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => {
                    throw new Error(error.message || 'Something went wrong!');
                });
            }
        })
        .then(data => {
            console.log('Room created:', data);
            console.log('Room ID: ', data.roomId);
            alert('Phòng đã được tạo thành công!');
            document.getElementById('room-form').style.display='none';
            document.getElementById('room-option').style.display='block';
            document.getElementById('view-room').style.display='block';
        })
        .catch(error => {
            console.error('Error:', error);
        })
    })

    //XÓA ROOM
    function deleteRoom(roomId) {
        const userToken = localStorage.getItem('userToken'); // Lấy user token từ local storage
        
        if (!userToken) {
            console.error('Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
            return;
        }

        fetch(`http://localhost:8000/testroom/deleteTestRoom/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + userToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Lỗi khi xóa phòng: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Phòng đã xóa:', data);
            document.getElementById('view-room-btn').click(); 
        })
        .catch(error => {
            console.error('Lỗi xóa phòng:', error);
        });
    }

    //DANH SÁCH ROOM
    document.getElementById('view-room-btn').addEventListener('click', async function() {
        const userToken = localStorage.getItem('userToken'); // Lấy user token từ local storage
    
        if (!userToken) {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8000/testroom/getTestRoom', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Lỗi khi lấy danh sách phòng: ' + response.status);
            }
    
            const data = await response.json();
            console.log(data);
    
            if (data.success) {
                const roomList = document.getElementById('room-ul');
                roomList.innerHTML = ''; // Xóa danh sách cũ
    
                data.roomId.forEach(room => {
                    const className = room.classId.nameClass; // Lấy tên lớp
                    const listItem = document.createElement('li');
                    const classId = room.classId._id; // Lấy ID từ classId
    
                    listItem.innerHTML = `
                        <div class="room-info">
                            <span>Phòng: ${room.nameRoom}</span>
                            <span>Lớp: ${className}</span>
                            <button class="add-student-to-room-btn" data-room-id="${room._id}" data-class-id="${classId}">Thêm học sinh</button>
                            <button class="delete-room-btn" data-room-id="${room._id}">Xóa</button>
                        </div>
                    `;
                    roomList.appendChild(listItem);
                });
    
                // Hiển thị danh sách phòng
                document.getElementById('room-list').style.display = 'block';
                document.getElementById('room-option').style.display = 'none';
                document.getElementById('view-room').style.display = 'none';
    
                // Gán click thêm học sinh
                const addStudentButtons = document.querySelectorAll('.add-student-to-room-btn');
                addStudentButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const roomId = this.dataset.roomId;
                        const classId = this.dataset.classId; 
                        console.log("ClassId: ", classId); // Kiểm tra giá trị classId
                        showStudentList(classId, roomId); // Hiển thị danh sách học sinh của lớp
                    });
                });
    
                // Gán click xóa
                const deleteButtons = document.querySelectorAll('.delete-room-btn');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const roomId = this.dataset.roomId;
                        deleteRoom(roomId); // Gọi hàm xóa phòng
                    });
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    });
    
    async function showStudentList(classId, roomId) {
        const userToken = localStorage.getItem('userToken');
    
        try {
            const response = await fetch(`http://localhost:8000/class/getStudentsInClass?classId=${classId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Lỗi khi lấy danh sách học sinh: ' + response.status);
            }
    
            const data = await response.json();
    
            if (data.success) {
                const studentList = document.getElementById('student-list');
                studentList.innerHTML = ''; // Xóa danh sách cũ
    
                data.students.forEach(student => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${student.lastName}</span>
                        <button class="add-student-btn" data-student-id="${student._id}">Thêm</button>
                    `;
                    studentList.appendChild(listItem);
                });
    
                // Hiển thị modal danh sách học sinh
                document.getElementById('student-modal').style.display = 'block';
    
                // Gán click thêm học sinh
                const addStudentButtons = document.querySelectorAll('.add-student-btn');
                addStudentButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const studentId = this.dataset.studentId;
                        addStudentToRoom(roomId, studentId); // Gọi hàm thêm học sinh
                    });
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
    
    // Hàm thêm học sinh vào phòng
    async function addStudentToRoom(roomId, studentId) {
        const userToken = localStorage.getItem('userToken');
        
        try {
            const response = await fetch('http://localhost:8000/testroom/addStudentToRoom', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId, studentId }) 
            });
    
            if (!response.ok) {
                throw new Error('Lỗi khi thêm học sinh: ' + response.status);
            }
    
            const data = await response.json();
    
            if (data.success) {
                alert('Thêm học sinh thành công!');
                document.getElementById('student-modal').style.display = 'none';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
    
    // Đóng modal
    document.getElementById('close-modal-btn').addEventListener('click', function() {
        document.getElementById('student-modal').style.display = 'none';
    });
    

    // Xử lý nút "Trở về"
    document.getElementById('back-to-room-btn').addEventListener('click', function() {
        document.getElementById('room-list').style.display = 'none';
        document.getElementById('room-option').style.display = 'block'; // Hiển thị lại tab Rooms
        document.getElementById('view-room').style.display = 'block'; // Hiển thị lại nút xem phòng
    });


    // LẤY DANH SÁCH ROOM CHO CLASSES
    function fetchRoom(classId) {
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId) {
            console.error('No teacherId found, please login first.');
            return;
        }
        console.log('Fetching room for class:', classId);
        const url = `http://localhost:8000/testroom/getRoomForClass?classId=${classId}&teacherId=${teacherId}`;
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Fetched rooms:', data);
            if (data.success) {
                displayRooms(data.rooms); 
            } else {
                console.error('No rooms found:', data.message);
            }
        })
        .catch(error => console.error('Error fetching rooms:', error));
    }

    // MÀN HÌNH GIAO DIỆN TRONG ROOM
    function displayRooms(rooms) {
        const roomsList = document.getElementById('testroom-list');
        roomsList.innerHTML = ''; // Xóa danh sách cũ
    
        if (rooms.length === 0) {
            roomsList.innerHTML = '<p>Không có phòng nào trong lớp</p>';
            return;
        }
    
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = room.nameRoom; 
    
            // Có thể thêm nút hoặc liên kết để vào phòng nếu cần
            const button = document.createElement('button');
            button.textContent = 'Vào phòng';
            button.classList.add('enterRoomButton');
            button.style.marginLeft = '20px';
            button.addEventListener('click', function() {
                enterRoom(room); 
            });
    
            li.appendChild(button);
            roomsList.appendChild(li);
        });
    }


    // VÀO LỚP
    function enterClass(cls) {
        var currentClassId = localStorage.getItem('currentClassId');

        // Cập nhật localStorage nếu ID lớp học thay đổi
        if (currentClassId !== cls._id) {
            localStorage.setItem('currentClassId', cls._id);
        }
        // Ẩn danh sách lớp học và tiêu đề
        document.getElementById('classes-list').style.display = 'none';
        document.getElementById('classes-title').style.display = 'none';
        
        // Hiển thị thông tin chi tiết lớp học
        var classDetails = document.getElementById('classDetails');
        classDetails.innerHTML = `
            <h1>${cls.nameClass}</h1>
            <button id="back">Trở về</button>
        `;
        document.getElementById('testroom-list').style.display = 'block';
        classDetails.style.display = 'block';
        fetchRoom(cls._id);
        //refreshQuestions(cls._id);
        document.getElementById('back').addEventListener('click', function() {
            // Ẩn chi tiết lớp học
            document.getElementById('classDetails').style.display = 'none';
            document.getElementById('testroom-list').style.display = 'none';
            document.getElementById('question-choose').style.display = 'none';
            document.getElementById('question-list').style.display = 'none';
            document.getElementById('question-form-template').style.display = 'none';
            document.getElementById('list-point').style.display = 'none';
            // Hiển thị lại danh sách lớp học
            document.getElementById('classes-list').style.display = 'block';
            document.getElementById('classes-title').style.display = 'block';
        });
    }

    // VÀO PHÒNG
    function enterRoom(room) {

        var currentRoomId = localStorage.getItem('currentRoomId');

        // Cập nhật localStorage nếu ID lớp học thay đổi
        if (currentRoomId !== room._id) {
            localStorage.setItem('currentRoomId', room._id);
        }
        // Cập nhật thông tin chi tiết của phòng
        const roomDetails = document.getElementById('testroom-list');
        roomDetails.innerHTML = `
            <h2>Room: ${room.nameRoom}</h2>
        `;

        document.getElementById('question-choose').style.display = 'block';
        document.getElementById('question-list').style.display = 'block';
        document.getElementById('list-point').style.display = 'block';
        
        // Hiển thị phần tạo đề thi
        const questionFormTemplate = document.getElementById('question-form-template');
        questionFormTemplate.style.display = 'none'; // Ẩn form khi chưa cần thiết
    
        // Hiển thị danh sách câu hỏi nếu cần
        const questionsList = document.getElementById('questions-list');
        questionsList.innerHTML = ''; // Xóa danh sách câu hỏi cũ
        
    
        // Hiển thị nút tạo đề thi
        const createQuestionButton = document.getElementById('createquestion-btn');
        createQuestionButton.addEventListener('click', function() {
            questionFormTemplate.style.display = 'block'; // Hiển thị form tạo câu hỏi
            document.getElementById('question-choose').style.display = 'none';
            document.getElementById('question-list').style.display = 'none';
            document.getElementById('list-point').style.display = 'none';
            document.getElementById('back').style.display = 'none';
        });
        
        
    }
   
    // HIỂN THỊ DANH SÁCH CÂU HỎI
    function displayQuestions(questions) {
        const questionsContainer = document.getElementById('questions-list'); 
        questionsContainer.innerHTML = ''; // Xóa các câu hỏi cũ
    
        // Tạo bảng
        const table = document.createElement('table');
    
        // Tạo tiêu đề bảng
        const headerRow = document.createElement('tr');
        headerRow.appendChild(createHeaderCell('Câu hỏi'));
        headerRow.appendChild(createHeaderCell('Nội dung'));
        headerRow.appendChild(createHeaderCell('Hành động'));
        table.appendChild(headerRow);
    
        if (questions.length === 0) {
            questionsContainer.innerHTML = ' ';
        } else {
            questions.forEach((question, index) => {
                const questionRow = document.createElement('tr');
    
                // Cột câu hỏi
                const questionCell = document.createElement('td');
                questionCell.textContent = `${index + 1}. ${question.questionText}`;
                questionRow.appendChild(questionCell);
    
                // Cột tùy chọn
                const optionsCell = document.createElement('td');
                optionsCell.appendChild(createOptionsList(question.options));
                questionRow.appendChild(optionsCell);
    
                // Cột hành động
                const actionCell = document.createElement('td');
                actionCell.appendChild(createActionButton('Xóa câu hỏi', () => deleteQuestionHandler(question._id, questionRow)));
                actionCell.appendChild(createActionButton('Chỉnh sửa', () => editQuestionHandler(question)));
                questionRow.appendChild(actionCell);
    
                table.appendChild(questionRow);
            });
        }
    
        questionsContainer.appendChild(table); 
        addBackToRoomButton(questionsContainer); 
    }
    
    // Tạo ô tiêu đề cho bảng
    function createHeaderCell(text) {
        const headerCell = document.createElement('th');
        headerCell.textContent = text;
        return headerCell;
    }
    
    // Tạo danh sách tùy chọn
    function createOptionsList(options) {
        const optionsList = document.createElement('ul');
        options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text} - Correct: ${option.isCorrect}`;
            optionsList.appendChild(optionItem);
        });
        return optionsList;
    }
    
    // Tạo nút hành động
    function createActionButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add(text === 'Xóa câu hỏi' ? 'delete-button' : 'edit-button');
        button.addEventListener('click', onClick);
        return button;
    }
    
    // Xử lý xóa câu hỏi
    function deleteQuestionHandler(questionId, questionRow) {
        if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            deleteQuestion(questionId); // Gọi hàm xóa câu hỏi
            questionRow.remove(); // Xóa dòng khỏi bảng
        }
    }
    
    // Xử lý chỉnh sửa câu hỏi
    function editQuestionHandler(question) {
        const editContainer = document.getElementById('editquestion-container');
        editContainer.style.display = 'block';

        const questionsContainer = document.getElementById('questions-list');
    questionsContainer.style.display = 'none'; 

        // Điền thông tin câu hỏi vào form
        document.getElementById('edit-question-text').value = question.questionText;
        const editOptionsContainer = document.getElementById('edit-options-container');
        editOptionsContainer.innerHTML = ''; // Xóa các tùy chọn cũ
    
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-row';
            optionDiv.innerHTML = `
                <input type="text" value="${option.text}" placeholder="Tùy chọn ${String.fromCharCode(65 + index)}" />
                <input type="checkbox" ${option.isCorrect ? 'checked' : ''} /> Correct
            `;
            editOptionsContainer.appendChild(optionDiv);
        });
    
        // Lưu ID câu hỏi để cập nhật sau này
        editContainer.dataset.questionId = question._id;
    
        // Thêm nút lưu thay đổi
        const saveButton = document.getElementById('save-edit-btn');
        saveButton.onclick = function() {
            saveEditedQuestion(editContainer.dataset.questionId);
        };
    }
    document.getElementById('cancel-edit-btn').addEventListener('click', function() {
        document.getElementById('editquestion-container').style.display = 'none';
        document.getElementById('questions-list').style.display = 'block';
        
    });
    
    // Lưu câu hỏi đã chỉnh sửa
    function saveEditedQuestion(questionId) {
        const updatedQuestionText = document.getElementById('edit-question-text').value;
        const updatedOptions = Array.from(document.querySelectorAll('#edit-options-container div')).map(div => {
            const inputText = div.querySelector('input[type="text"]').value;
            const isCorrect = div.querySelector('input[type="checkbox"]').checked;
            return { text: inputText, isCorrect: isCorrect };
        });
    
        // Gửi yêu cầu cập nhật đến server
        fetch(`http://localhost:8000/question/editquestion/${questionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({
                questionText: updatedQuestionText,
                options: updatedOptions
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Câu hỏi đã được cập nhật thành công!');
                location.reload(); 
            } else {
                alert(result.message);
            }
        })
        .catch(error => {
            console.error('Error updating question:', error);
            alert('Có lỗi xảy ra khi cập nhật câu hỏi.');
        });
    }
    
    // Thêm nút "Trở về phòng"
    function addBackToRoomButton(questionsContainer) {
        const backToRoomButton = document.createElement('button');
        backToRoomButton.textContent = 'Trở về phòng';
        backToRoomButton.classList.add('back-to-room-button'); 
        backToRoomButton.addEventListener('click', function() {
            questionsContainer.style.display = 'none'; 
            document.getElementById('question-choose').style.display = 'block';
            document.getElementById('question-list').style.display = 'block';
            document.getElementById('list-point').style.display = 'block';
            document.getElementById('classDetails').style.display = 'block';
        });
    
        questionsContainer.appendChild(backToRoomButton); 
    }

    // LẤY DANH SÁCH CÂU HỎI
    function refreshQuestions(roomId) {
        
        if (!roomId) {
            console.error('Room ID is null or undefined.');
            return;
        }
        fetch(`http://localhost:8000/question/getquestion/${roomId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                // Hiển thị câu hỏi mới tạo
                displayQuestions(data.data); 
            } else {
                console.error('Failed to fetch questions:', data.message);
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
    }
    
    //Tạo Câu hỏi trắc nghiệm
   document.getElementById('multiple-choice-options').style.display = 'block';

    document.getElementById('submit').addEventListener('click', async function(e) {
        e.preventDefault(); // Prevent form from submitting normally
        const questionText = document.getElementById('questionText').value;
        let options = [
            {
                text: document.getElementById('optionA').value,
                isCorrect: document.getElementById('isCorrectA').checked
            },
            {
                text: document.getElementById('optionB').value,
                isCorrect: document.getElementById('isCorrectB').checked
            },
            {
                text: document.getElementById('optionC').value,
                isCorrect: document.getElementById('isCorrectC').checked
            },
            {
                text: document.getElementById('optionD').value,
                isCorrect: document.getElementById('isCorrectD').checked
            }
        ];
        

        const currentRoomId = localStorage.getItem('currentRoomId');
        if (!currentRoomId) {
            console.error('Room ID is not defined.');
            return; 
        }
    
        fetch('http://localhost:8000/question/createquestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({
                questionText: questionText,
                questionType: 'multiple-choice',
                options: options,
                roomId: currentRoomId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch classes: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.quiz) {
                const roomId = localStorage.getItem('currentRoomId');
                console.log("questionId: " , data.questionId);
                refreshQuestions(roomId);
                document.getElementById('classDetails').style.display = 'block';
                document.getElementById('question-form-template').style.display = 'none';
                document.getElementById('questions-list').style.display = 'block';
            } else {
                console.error('No classes found:', data.message);
            }
        })
        .catch(error => console.error('Error fetching classes:', error));
    })    

    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('question-form-template').style.display = 'none';
        document.getElementById('classDetails').style.display = 'block';
        document.getElementById('question-list').style.display = 'block';
        document.getElementById('question-choose').style.display = 'block';
        document.getElementById('list-point').style.display = 'block';
        document.getElementById('back').style.display = 'block';
    })

    //List Quiz
    document.getElementById('list-question-btn').addEventListener('click', function() {
        const currentRoomId = localStorage.getItem('currentRoomId');
    if (!currentRoomId) {
        console.error('Room ID is not defined.');
        return; 
    }
    refreshQuestions(currentRoomId);
        document.getElementById('questions-list').style.display = 'block';
        document.getElementById('question-choose').style.display = 'none';
        document.getElementById('classDetails').style.display = 'none';
        document.getElementById('question-list').style.display = 'none';
        document.getElementById('list-point').style.display = 'none';
    })
    

    //List POINT 
    document.getElementById('list-point').addEventListener('click', function() {
        const currentRoomId = localStorage.getItem('currentRoomId');
        if (!currentRoomId) {
            console.error('Room ID is not defined.');
            return; 
        }
    
        fetch(`http://localhost:8000/score/getScoreAllStudent?roomId=${currentRoomId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Kiểm tra dữ liệu trả về
            if (data.success && Array.isArray(data.data)) { 
                displayScores(data.data);
                document.getElementById('question-list').style.display = 'none';
                document.getElementById('question-choose').style.display = 'none';
                document.getElementById('classDetails').style.display = 'none';
                document.getElementById('list-point').style.display = 'none';
                document.getElementById('score-section').style.display = 'block';
            } else {
                console.error('Failed to fetch scores:', data.message);
            }
        })
        .catch(error => console.error('Error fetching scores:', error));
    });
    
    function displayScores(scores) {
        const scoreList = document.getElementById('score-list');
        scoreList.innerHTML = '';
    
        if (!scores || scores.length === 0) {
            scoreList.innerHTML = '<li>Không có điểm nào được ghi nhận.</li>';
            return;
        }
    
        // Tạo danh sách điểm
        scores.forEach(score => {
            const listItem = document.createElement('li');
            listItem.className = 'score-item';
    
            // Truy cập lastName từ đối tượng student
            const student = score.studentId;
    
            listItem.innerHTML = `
                <strong>${student.lastName}</strong>: ${score.score} điểm
            `;
            scoreList.appendChild(listItem); // Thêm vào danh sách
        });
    }

    document.getElementById('back-button').addEventListener('click', function() {
        document.getElementById('score-section').style.display = 'none';
        document.getElementById('question-list').style.display = 'block';
        document.getElementById('question-choose').style.display = 'block';
        document.getElementById('classDetails').style.display = 'block';
        document.getElementById('list-point').style.display = 'block';
    });

    //XÓA CÂU HỎI
    function deleteQuestion(questionId) {
        console.log("Question Id:", questionId);
        if(!questionId) {
            console.error('Question ID is not defined.');
            return;
        }
        fetch(`http://localhost:8000/question/deletequestion/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Delete respone:', data);
            
        })
        .catch(error => console.error('Error deleting question:', error));
    }

    //PROFILE TEACHER
    const teacherId = localStorage.getItem('teacherId');
    getProfile(teacherId);
    async function getProfile(teacherId) {
        try {
            const token = localStorage.getItem('userToken'); 
            const response = await fetch(`http://localhost:8000/teacher/getTeacherProfile?teacherId=${teacherId}`, {
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
   
    //EDIT Profile teacher
    document.getElementById("edit-profile-btn").addEventListener("click", function() {
        document.getElementById("edit-profile").style.display = "block";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("edit-profile-btn").style.display = "none";
        document.getElementById("user-info").style.display = "none";
    });

    

    document.getElementById('submit-edit-profile').addEventListener("click", async function() {
        const teacherId = localStorage.getItem('teacherId');
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
            const response = await fetch(`http://localhost:8000/teacher/editTeacherProfile/${teacherId}`, {
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
            <div class="card">
                <p>Total Students</p>
                <h3>0</h3>
            </div>
        `;
        // Add more logic here if stats are dynamically fetched
    }

    // Initial load for home stats
    loadHomeStats();
})