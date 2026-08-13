const express = require('express');
const router = express.Router();
const { 
  createSubscription, 
  getMySubscriptions, 
  updateSubscriptionStatus, 
  addSubscriptionItem, 
  removeSubscriptionItem 
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSubscription)
  .get(protect, getMySubscriptions);

router.route('/:id/status')
  .patch(protect, updateSubscriptionStatus);

router.route('/:id/items')
  .post(protect, addSubscriptionItem);

router.route('/:id/items/:itemId')
  .delete(protect, removeSubscriptionItem);

module.exports = router;

