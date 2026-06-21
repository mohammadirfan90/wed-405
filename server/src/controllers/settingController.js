const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');

// Public: Get all settings
const listSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({});
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  res.json(result);
});

// Admin: Update setting
const updateSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });

  const setting = await Setting.findOneAndUpdate(
    { key },
    { value: String(value || '').trim() },
    { new: true, upsert: true }
  );
  res.json(setting);
});

module.exports = {
  listSettings,
  updateSetting,
};
