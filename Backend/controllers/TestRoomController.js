const TestRoom = require("../models/TestRoom");
const Class = require("../models/Class");
const Students = require("../models/Students");


const TestRoomController = {
    //Create Test Room
    createTestRoom: async (req, res) => {
        try {
            const { nameRoom, classId, duration } = req.body; // Lấy dữ liệu từ yêu cầu
            const teacherId = req.user.userId;
            console.log("Class ID received:", classId);
            const newTestRoom = new TestRoom({
                nameRoom,
                classId,
                duration,
                teacherId,
                completed: false
            });
            await newTestRoom.save(); 
    
            res.status(201).json({ 
                success: true, 
                roomId: newTestRoom._id 
            });
        } catch (err) {
            res.status(400).json({ message: err.message }); 
        }
    },

    getTestRoom: async (req, res) => {
        try {
            const roomId = await TestRoom.find().populate('classId', 'nameClass');
            if (roomId.length === 0) {
                return res.status(404).json({ success: false, message: "No test rooms found" });
            }
            res.status(200).json({ success: true, message: "Get Test Room successfully", roomId });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    //GEt
    getRoomForClass: async (req, res) => {
        try {
            console.log("Query parameters:", req.query); // In tất cả tham số truy vấn
            const { classId, teacherId } = req.query;
    
            if (!classId || !teacherId) {
                return res.status(400).json({ success: false, message: "Missing classId or teacherId" });
            }
    
            const rooms = await TestRoom.find({ classId: classId, teacherId: teacherId }).populate('classId');
            console.log("Rooms found:", rooms); // In kết quả tìm thấy
    
            return res.status(200).json({ success: true, rooms });
        } catch (error) {
            console.error("Error:", error.message); // Ghi lại lỗi
            res.status(500).json({ success: false, message: error.message });
        }
    },

    //GET
    getRoomInClass: async (req, res) => {
        const { classId } = req.query;
        const studentId = req.user.userId;
        console.log("Class ID:", classId);
        console.log("Student ID:", studentId);
    
        try {
            const rooms = await TestRoom.find({ classId: classId, 'students.studentId': studentId }).populate('classId');
            
            if (rooms.length > 0) {
                const updatedRooms = rooms.map(room => {
                    const student = room.students.find(s => s.studentId.toString() === studentId);
                    return {
                        ...room._doc,
                        completed: student ? student.completed : false // Lấy trạng thái `completed` của học sinh
                    };
                });
    
                return res.status(200).json({ success: true, rooms: updatedRooms });
            } else {
                return res.status(404).json({ success: false, message: "No room found for this class" });
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    

    //ADD STUDENT TO ROOM
    addStudentToRoom: async (req, res) => {
        try {
            const { roomId, studentId } = req.body;
    
            // Tìm phòng theo roomId
            const room = await TestRoom.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
    
            // Tìm học sinh theo studentId
            const student = await Students.findById(studentId);
            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }
    
            // Tìm dữ liệu lớp từ room
            const classData = await Class.findById(room.classId);
            if (!classData) {
                return res.status(404).json({ message: "Class not found" });
            }
    
            // Kiểm tra xem học sinh có trong lớp không
            const studentExistsInClass = classData.students.some(s => s.toString() === studentId);
            if (!studentExistsInClass) {
                return res.status(404).json({ message: "Student not found in this class" });
            }
    
            // Kiểm tra xem học sinh đã có trong phòng chưa
            const studentExists = room.students.some(s => s.studentId.toString() === studentId);
            if (studentExists) {
                return res.status(400).json({ message: "Student is already in the room" });
            }
    
            // Thêm học sinh vào phòng
            room.students.push({ studentId: studentId, completed: false });
            await room.save();
    
            res.status(200).json({ success: true, message: "Student added to room successfully" });
        } catch (error) {
            console.error("Add student to room error:", error);
            res.status(500).json({ success: false, message: "Add student to room error", error: error.message });
        }
    },
    
    //KICK STUDENT
    kickStudentFromRoom: async (req, res) => {
        try {
            const { roomId, studentId } = req.query;
    
            // Tìm phòng theo roomId
            const room = await TestRoom.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
    
            // Kiểm tra xem học sinh có trong phòng không
            const studentIndex = room.students.findIndex(s => s.studentId.toString() === studentId);
            if (studentIndex === -1) {
                return res.status(404).json({ message: "Student not found in this room" });
            }
    
            // Xóa học sinh khỏi phòng
            room.students.splice(studentIndex, 1);
            await room.save();
    
            res.status(200).json({ message: "Student kicked from room successfully" });
        } catch (error) {
            res.status(500).json({ message: "Kick student from room error", error: error.message });
        }
    },
    
    //DELETE
    deleteTestRoom: async (req, res) => {
        try {
            const roomId = await TestRoom.findByIdAndDelete(req.params.roomId);
            if(!roomId){
                return res.status(404).json({success: false, message: "Test Room not found"});
            }
            res.status(200).json({success: true, message: "Test Room deleted successfully"});
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    },

    //UPDATE STATUS
    updateTestRoomStatus: async (req, res) => {
        const { roomId, studentId, completed } = req.body;
        console.log(req.body);
        try {
            const room = await TestRoom.findById(roomId);
            if (!room) {
                return res.status(404).json({ success: false, message: "Room not found" });
            }
    
            const student = room.students.find(s => s.studentId.toString() === studentId);
            if (student) {
                student.completed = completed;
                await room.save();
                console.log("Updated Room:", room);
                return res.status(200).json({ success: true, message: "Student status updated successfully" });
            } else {
                return res.status(404).json({ success: false, message: "Student not found in this room" });
            }
        } catch (error) {
            console.error("Error updating student status:", error);
            res.status(500).json({ success: false, message: "Error updating student status", error: error.message });
        }
    },
    
    // GET Status room
    getRoomStatus: async (req, res) => {
        try {
            const { roomId, studentId } = req.query;
    
            // Tìm phòng thi theo roomId
            const room = await TestRoom.findById(roomId);
            if (!room) {
                return res.status(404).json({ success: false, message: "Test Room not found" });
            }
    
            // Tìm học sinh trong danh sách học sinh của phòng
            const student = room.students.find(s => s.studentId.toString() === studentId);
    
            if (student) {
                res.status(200).json({
                    success: true,
                    message: "Get Test Room status successfully",
                    roomStatus: student.completed 
                });
            } else {
                return res.status(404).json({ success: false, message: "Student not found in this room" });
            }
        } catch (error) {
            console.error("Error getting room status:", error);
            res.status(500).json({ success: false, message: "Error getting room status", error: error.message });
        }
    }
}

module.exports = TestRoomController;