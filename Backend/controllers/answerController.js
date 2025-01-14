const Answer = require("../models/Answer");

const answerController = {
    submitAnswer: async (req, res) => {
        const { roomId, answers, score } = req.body; // Thêm score vào yêu cầu
        const studentId = req.user.userId; 

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (!roomId || !answers || !Array.isArray(answers) || typeof score !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid data input.' });
        }

        try {
            const newAnswer = new Answer({ roomId, studentId, answers, score }); // Lưu trữ điểm số
            await newAnswer.save();
            res.status(201).json({ success: true, message: 'Answers submitted successfully!' });
        } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ success: false, message: 'Error saving answers.' });
        }   
    },

    getStudentResult: async (req, res) => {
        const { roomId } = req.query; 
        const studentId = req.user.userId; 

        if (!roomId) {
            return res.status(400).json({ success: false, message: 'Room ID is required.' });
        }

        try {

            const answer = await Answer.findOne({ roomId, studentId }).populate('roomId'); 

            if (!answer) {
                return res.status(404).json({ success: false, message: 'No result found for this student.' });
            }

            // Trả về thông tin kết quả
            res.status(200).json({
                success: true,
                message: 'Result fetched successfully!',
                data: {
                    answers: answer.answers, 
                    score: answer.score, 
                    roomId: answer.roomId, 
                    studentId: answer.studentId 
                }
            });
        } catch (error) {
            console.error('Error fetching student result:', error);
            res.status(500).json({ success: false, message: 'Error fetching student result.' });
        }
    }
    
}; 

module.exports = answerController;