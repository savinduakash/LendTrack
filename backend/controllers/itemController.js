const Item = require('../models/Item');
const QRCode = require('qrcode');

// Get all items with optional search & category filter
exports.getItems = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { borrowerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new loan item
exports.createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update item status (e.g., Mark as Returned)
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate QR Code Data URL for an item ID
exports.generateItemQR = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const qrData = JSON.stringify({ id: item._id, name: item.itemName });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    res.json({ qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item record
exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};