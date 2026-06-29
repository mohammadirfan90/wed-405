const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');

const createService = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Name and price are required' });
  }
  const svc = await Service.create({ name, description, price });
  res.status(201).json(svc);
});

const listServices = asyncHandler(async (req, res) => {
  const svcs = await Service.find({});
  res.json(svcs);
});

const getService = asyncHandler(async (req, res) => {
  const svc = await Service.findById(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service not found' });
  res.json(svc);
});

const updateService = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;
  const svc = await Service.findByIdAndUpdate(
    req.params.id,
    { name, description, price },
    { new: true }
  );
  if (!svc) return res.status(404).json({ message: 'Service not found' });
  res.json(svc);
});

const deleteService = asyncHandler(async (req, res) => {
  const svc = await Service.findByIdAndDelete(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service not found' });
  res.json({ message: 'Service deleted successfully' });
});

module.exports = { createService, listServices, getService, updateService, deleteService };
