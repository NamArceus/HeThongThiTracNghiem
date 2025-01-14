const Quiz = require("../models/Question");

const questionController = {

    //CREATE
    createQuiz: async (req, res) => {
        try {
            const { questionText, options, classId, roomId } = req.body;
    
            // Kiểm tra xem các tùy chọn có được cung cấp không
            if (!options || options.length === 0) {
                return res.status(400).json({ message: "Options are required for multiple-choice questions" });
            }
    
            // Tạo đối tượng Quiz cho câu hỏi trắc nghiệm
            const quiz = new Quiz({
                questionText,
                questionType: "multiple-choice", 
                options,
                classId,
                roomId
            });
    
            // Lưu câu hỏi vào cơ sở dữ liệu
            const savedQuestion = await quiz.save();
            res.status(200).json({ message: "Quiz created successfully", quiz, questionId: savedQuestion._id });
            
        } catch (error) {
            console.error("Create quiz error:", error);
            res.status(500).json({ message: "Create quiz error", error: error.message });
        }
    },

    //GET QUESTION
    getQuestion: async (req, res) => {
        try { 
            const roomId = req.params.roomId;
            if(!roomId) {
                return res.status(400).json({ message: "Missing classId" });
            }
            const questions = await Quiz.find({roomId: roomId});
            if(!questions || !questions.length === 0) {
                return res.status(404).json({ message: "No questions found for this class" });
            }
            res.status(200).json({success: true, message:"get question", data: questions});
        } catch(error) {
            return res.status(500).json({ message: "Error getting questions", error: error.message });
        }
    },


    //EDIT
    editQuiz: async (req, res) => {
        try {
            const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.status(200).json(updatedQuiz);
        } catch (error) {
            res.status(500).json({ message: "Edit quiz error" });
        }
    },


    //DELETE
    deleteQuiz: async (req,res) => {
        try {
            console.log("Request Params:", req.params);
            const deletedQuiz = await Quiz.findByIdAndDelete(req.params.questionId);
            if (!deletedQuiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            res.status(200).json({ message: "Quiz deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Delete quiz error" });
        }
    }
}

module.exports = questionController;