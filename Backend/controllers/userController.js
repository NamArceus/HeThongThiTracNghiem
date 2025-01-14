const User = require("../models/User");
const bcrypt = require("bcrypt");


const userController = {
    //GET ALL USER
    getAllUser: async (req, res) => {
        try {
            const query = {};
            const {username , role} = req.query;

            if(username) {
                query.username = username;
            }

            if(role) {
                query.role = role;
            }

            const users = await User.find(query);
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },


    //get user
    // Get user profile
    getProfile: async (req, res) => {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).send({ message: "User ID is required" });
            }
            const user = await User.findById(userId); 
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send({
                message: "User profile retrieved successfully",
                data: user
            });
        } catch (error) {
            res.status(500).send({
                message: "Server error",
                error: error.message
            });
        }
    },


    //DELETE
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (err) {
            res.status(500).json(err);
        }
    },


    //UPDATE
    updateUser: async (req, res) => {
        try {
            const { newUsername, newPassword} = req.body;
            const hashedPassword = await bcrypt.hashedPassword(newPassword, 12);
            const updateUser = await User.findByIdAndUpdate(req.params.id,
                {
                    username: newUsername,
                    password: hashedPassword,
                });

            if(!updateUser) {
                return res.status(404).json({ message: "User not found" });
            }    

        } catch (err) {
        res.status(500).json(err);
        }
    },

    //EDIT PROFILE
    editProfile: async (req, res) => {
        try {
            const { firstName, lastName, username } = req.body;
            const userId = req.params.userId;
            
            const user = await User.findByIdAndUpdate(userId, { firstName, lastName, username }, { new: true });
            
            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ message: "Profile updated successfully" });

        } catch (error) {
            res.status(500).json({ message: "Error updating profile", error: error.message });
        }  
    },


    //UPDATE ROLE
    updateRoleUser: async (req, res) => {
        try {
            const {newRole} = req.body;
            if(!['admin','guest','teacher','student'].includes(newRole)){
                return res.status(400).json({ message: "Invalid role" });
            }

            const user = await User.findByIdAndUpdate(req.params.id, {role: newRole}, {new: true});

            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({message: "Roles updated successfully"});
        }catch (error) {
            res.status(500).json({message: "Error updating role", error: error.message});
        }
    },

    //UPLOAD
    uploadAvatar: (req, res) => {
        console.log(req.files);
        if(!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        res.status(200).json({message: "Uploaded file successfully" });
    }
}

module.exports = userController;