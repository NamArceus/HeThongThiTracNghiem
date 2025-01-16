const express = require('express');
const app = express();
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

//swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const swaggerDocument = YAML.load(path.join(__dirname,'swagger.yaml'));


//Router
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const questionRouter = require("./routes/questionRouter");
const classRouter = require("./routes/classRouter");
const answerRouter = require("./routes/answerRouter");
const studentRouter = require("./routes/studentRouter");
const teacherRouter = require("./routes/teacherRouter");
const testRoomRouter = require("./routes/testRoomRouter");
const scoreRouter = require("./routes/scoreRouter");


app.use(express.json());
app.use(morgan("common"));
app.use(cors());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST','PUT','DELETE','PATCH']
}));
app.use(bodyParser.json({limit:"100mb"}));

//swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//Route 
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/upload', express.static("upload"),userRouter);
app.use('/question', questionRouter);
app.use('/class', classRouter);
app.use('/answer', answerRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/testroom', testRoomRouter);
app.use('/score', scoreRouter);

dotenv.config();


//Connect mongoose
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch(() => {
    console.log('Connected to MongoDB failed');
})


app.listen(8000, () => {
    console.log('The server runs successfully');
})