import express from 'express'
import { adminMassStatus, createMassBooking, createMassPaymentIntent, markMassPaid, massStatus, updateMassStatus } from '../controllers/massController.js'
import userAuth from '../middleWare/userAuth.js';
const router= express.Router();
router.post('/massForm',userAuth,createMassBooking);
router.get('/status',userAuth,massStatus);
router.get("/admin/status", userAuth, adminMassStatus);
router.patch('/admin/update-status',userAuth,updateMassStatus);
router.post("/mass-mark-paid", userAuth, markMassPaid);

router.post('/create-mass-payment',userAuth,createMassPaymentIntent)
export default router;