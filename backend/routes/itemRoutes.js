const express = require('express');
const router = express.Router();
const { 
  getItems, 
  createItem, 
  updateItemStatus, 
  generateItemQR, 
  deleteItem 
} = require('../controllers/itemController');

router.get('/', getItems);
router.post('/', createItem);
router.patch('/:id/status', updateItemStatus);
router.get('/:id/qr', generateItemQR);
router.delete('/:id', deleteItem);

module.exports = router;