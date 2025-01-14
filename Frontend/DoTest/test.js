document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');

    let correctAnswers = [];
    
    if (roomId) {
        startExam(roomId); // Gọi hàm để bắt đầu bài thi
    }

    async function startExam(roomId) {
        try {
            const userToken = localStorage.getItem('userToken');
    
            // Lấy câu hỏi từ API
            const response = await fetch(`http://localhost:8000/question/getquestion/${roomId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + userToken,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Error fetching questions: ' + response.status);
            }
    
            const data = await response.json();
            console.log(data); 
            if (data.success) {
                const questions = data.data; 
                correctAnswers = questions.map(q => 
                    q.options.findIndex(option => option.isCorrect) // Lấy chỉ số của đáp án đúng
                ); // Gán đáp án đúng
                console.log('Correct Answers:', correctAnswers);
                console.log(questions); 
                displayQuestions(questions);
    
                
                const duration = localStorage.getItem('duration'); 
                if (duration) {
                    console.log('Duration:', duration); 
                    startTimer(duration); 
                } else {
                    console.error('Duration not found');
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
    
    let intervalId; // Biến toàn cục để lưu trữ intervalId

// Hàm bắt đầu đồng hồ
function startTimer(duration) {
    let timer = duration * 60; // Thời gian tính từ phút sang giây
    const countdownElement = document.getElementById('timer'); 
    document.getElementById('back-btn').style.display = 'none';

    intervalId = setInterval(() => { // Gán intervalId
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        countdownElement.innerHTML = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (--timer < 0) {
            clearInterval(intervalId); // Dừng đồng hồ khi hết thời gian
            countdownElement.innerHTML = "Hết thời gian!";
            alert('Thời gian đã hết!'); // Hoặc gọi hàm nộp bài
            submitAnswers(); 
        }
    }, 1000);
}

// Lắng nghe sự kiện click trên nút
document.getElementById('submit-btn').addEventListener('click', submitAnswers);

async function submitAnswers() {
    clearInterval(intervalId); 

    const answers = [];
    const questions = document.querySelectorAll('.question');
    let score = 0;

    questions.forEach((question, index) => {
        const selectOption = question.querySelector(`input[name="question${index}"]:checked`);
        const correctAnswer = correctAnswers[index];
        if (selectOption) {
            answers.push({
                questionId: question.dataset.questionId,
                selectOption: parseInt(selectOption.value)
            });

            console.log('Selected Value:', parseInt(selectOption.value));

            if (parseInt(selectOption.value) === correctAnswer) {
                score += 1; // Cộng điểm nếu đúng
                selectOption.parentElement.style.backgroundColor = '#06D001';
            } else {
                selectOption.parentElement.style.backgroundColor ='#FF0000';
                const correctOption = question.querySelector(`input[value="${correctAnswer}"]`);

                if (correctOption) {
                    correctOption.parentElement.style.backgroundColor = '#06D001';
                }
            }
        }
    });

    console.log('Answers to submit:', answers);
    console.log('Score:', score);
    const roomId = new URLSearchParams(window.location.search).get('roomId');
    const studentId = localStorage.getItem('studentId'); 
    const userToken = localStorage.getItem('userToken');

    try {
        const response = await fetch('http://localhost:8000/answer/submitanswer', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + userToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: roomId,
                answers: answers,
                score: score
            })
        });

        const result = await response.json();
        if (result.success) {
            // Hiển thị điểm số trong modal
            document.getElementById('score-value').innerText = score;
            document.getElementById('score-modal').style.display = 'block';
            await updateRoomStatus(roomId);  // Cập nhật trạng thái phòng thi
            await saveScore(studentId, roomId, score);
            
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error submitting answers:', error);
        alert('Có lỗi xảy ra khi nộp bài: ' + error.message);
    }
}

// Đóng modal khi nhấn nút đóng
document.querySelector('.close-btn').addEventListener('click', function() {
    document.getElementById('score-modal').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('back-btn').style.display = 'block';

});

document.getElementById("back-btn").addEventListener('click', function() {
    window.location.href = 'http://127.0.0.1:5501/Frontend/StudentDashboard/studentDashboard.html';
});


//STATUS ROOM
async function updateRoomStatus(roomId) {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
        console.error('Student ID not found in localStorage!');
        return;
    }
    try {
        const response = await fetch('http://localhost:8000/testroom/updateStatus', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({
                roomId: roomId,
                studentId: studentId,
                completed: true
            })
        });

        const result = await response.json();
        console.log('Update Room Status Response:', result);
        if (result.success) {
            console.log(result.message);
        } else {
            console.error(result.message);
        }
    } catch (error) {
        console.error('Error updating room status:', error);
    }
}


//SAVE SCORE
async function saveScore(studentId, roomId, score) {
    const userToken = localStorage.getItem('userToken');
    
    try {
        const response = await fetch('http://localhost:8000/score/savescore', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + userToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                roomId: roomId,
                score: score
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('Score saved successfully:', result.message);
        } else {
            console.error('Error saving score:', result.message);
        }
    } catch (error) {
        console.error('Error while saving score:', error);
    }
}

// Hàm hiển thị câu hỏi
function displayQuestions(questions) {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = ''; // Xóa nội dung cũ

    if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((item, index) => {
            console.log('Options:', item.options);
            const questionElement = document.createElement('div');
            questionElement.className = 'question';
            questionElement.dataset.questionId = item._id;
            questionElement.innerHTML = `
                <h2>Câu hỏi ${index + 1}: ${item.questionText}</h2>
                <ul>
                    ${Array.isArray(item.options) ? item.options.map((answer, i) => `
                        <li>
                            <input type="radio" name="question${index}" value="${i}" /> ${answer.text}
                        </li>`).join('') : ''}
                </ul>
            `;
            questionsContainer.appendChild(questionElement);
        });
    } else {
        questionsContainer.innerHTML = '<p>Không có câu hỏi nào để hiển thị.</p>'; 
    }

    questionsContainer.style.display = 'block'; 
    document.getElementById('submit-btn').style.display = 'block'; 
}
});