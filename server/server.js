import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import authRouter from './routes/authRoutes.js';
import connectDB from "./config/mongodb.js";
import certificateRoute from "./routes/certificateRoute.js"
import massRoute from "./routes/massRoutes.js"
import router from "./routes/userRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
const app =express();
const port=process.env.PORT || 4000;
connectDB();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins=['http://localhost:5173'];
app.use(cors({origin: allowedOrigins,credentials: true}));


app.get('/',(req,res)=>{
    res.send("api wsdforking");
})

app.use('/api/auth',authRouter);
app.use('/api/user',router);
app.use('/api/book',massRoute);
app.use('/api/certificate',certificateRoute);
app.use('/api/events', eventRouter);
app.use('/api/announcements', announcementRouter);


app.use('/uploads',express.static("uploads"));

app.listen(port,()=>{
    console.log("server started on ",port);
});

/*
{
  "certificateType": "BAPTISM",
  "dob": "2002-03-21",
  "requestPurpose": "Passport application",
  "requesterName": "Nithesh Poojary",
  "requesterRelation": "Self",
  "churchName": "St. Anthony Church",

  "dateOfBaptism": "2002-04-15",
  "fatherName": "Joseph Poojary",
  "motherName": "Maria Poojary"
}

*/