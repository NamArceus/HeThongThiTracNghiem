const Score = require('../models/Score');

const scoreController = {
    saveScore: async (req, res) => {
        const { studentId, roomId, score } = req.body;
        try {
            const newScore = new Score({ studentId, roomId, score });
            await newScore.save();
            res.status(201).json({ success: true, message: 'Score saved successfully!' });
        } catch (error) {
            console.error('Error saving score:', error);
            res.status(500).json({ success: false, message: 'Error saving score.' });
        }
    },

    //Lấy điểm tất cả học sinh trong 1 phòng thi
    getScoreAllStudent: async (req, res) => {
        const {roomId} = req.query;
        try {
            const scores = await Score.find({ roomId }).populate('studentId');
            console.log(scores);
            res.status(200).json({ success: true, data: scores });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = scoreController;