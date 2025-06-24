const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const {verifyJWT}=require('../middlewares/auth.js')

router.post('/orders',verifyJWT, createOrder);
router.put('/orders/:orderId/status',updateOrderStatus);
router.get('/orders/user/:userId',verifyJWT, getOrdersByUser);


module.exports = router;
