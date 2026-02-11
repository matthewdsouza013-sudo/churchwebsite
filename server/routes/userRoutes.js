import express from "express";
import userAuth from "../middleWare/userAuth.js";
import { getUserData } from "../controllers/userController.js";
//import { getUserData } from "../controllers/authController.js";

const router = express.Router();

router.get("/data", userAuth, getUserData);   

export default router;
