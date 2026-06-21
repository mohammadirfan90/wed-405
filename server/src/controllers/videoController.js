const VideoItem = require('../models/VideoItem');
const asyncHandler = require('../utils/asyncHandler');

// Public: List videos sorted by order
const listVideos = asyncHandler(async (req, res) => {
  const videos = await VideoItem.find({}).sort('order');
  res.json(videos);
});

// Admin: List all
const adminListVideos = asyncHandler(async (req, res) => {
  const videos = await VideoItem.find({}).sort('-createdAt');
  res.json(videos);
});

// Admin: Create
const createVideo = asyncHandler(async (req, res) => {
  const { youtubeUrl, title, order } = req.body;
  if (!youtubeUrl) return res.status(400).json({ message: 'YouTube URL is required' });

  const video = await VideoItem.create({
    youtubeUrl: String(youtubeUrl).trim(),
    title: String(title || '').trim(),
    order: Number(order) || 0,
  });
  res.status(201).json(video);
});

// Admin: Update
const updateVideo = asyncHandler(async (req, res) => {
  const { youtubeUrl, title, order } = req.body;
  const video = await VideoItem.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });

  if (youtubeUrl !== undefined) video.youtubeUrl = String(youtubeUrl).trim();
  if (title !== undefined) video.title = String(title || '').trim();
  if (order !== undefined) video.order = Number(order) || 0;

  await video.save();
  res.json(video);
});

// Admin: Delete
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await VideoItem.findByIdAndDelete(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  res.json({ message: 'Video deleted' });
});

module.exports = {
  listVideos,
  adminListVideos,
  createVideo,
  updateVideo,
  deleteVideo,
};
