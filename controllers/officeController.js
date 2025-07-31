const Office = require('../models/Office');
const Company = require('../models/Company');

// @desc Create a new office
// @route POST /api/offices
// @access Private
const createOffice = async (req, res) => {
  try {
    const { name, address, city, country, zipCode, phone, email, capacity, company } = req.body;

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    const office = new Office({
      name,
      address,
      city,
      country,
      zipCode,
      phone,
      email,
      capacity,
      company
    });

    await office.save();

    // Add office to company's office array
    await Company.findByIdAndUpdate(
      company,
      { $push: { office: office._id } }
    );

    res.status(201).json({
      message: 'Office created successfully',
      office: await Office.findById(office._id).populate('company', 'fullName acronym')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create office',
      error: error.message
    });
  }
};

// @desc Get all offices
// @route GET /api/offices
// @access Private
const getAllOffices = async (req, res) => {
  try {
    const { page = 1, limit = 10, company, city, active } = req.query;
    
    const query = {};
    
    // Filter by company if provided
    if (company) {
      query.company = company;
    }
    
    // Filter by city if provided
    if (city) {
      query.city = new RegExp(city, 'i'); // Case insensitive search
    }
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const offices = await Office.find(query)
      .populate('company', 'fullName acronym logoUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Office.countDocuments(query);

    res.json({
      offices,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOffices: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch offices',
      error: error.message
    });
  }
};

// @desc Get office by ID
// @route GET /api/offices/:id
// @access Private
const getOfficeById = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id)
      .populate('company', 'fullName acronym logoUrl admin employee');

    if (!office) {
      return res.status(404).json({
        message: 'Office not found'
      });
    }

    res.json(office);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch office',
      error: error.message
    });
  }
};

// @desc Update office (PATCH)
// @route PATCH /api/offices/:id
// @access Private
const updateOffice = async (req, res) => {
  try {
    const officeId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    const office = await Office.findByIdAndUpdate(
      officeId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('company', 'fullName acronym');

    if (!office) {
      return res.status(404).json({
        message: 'Office not found'
      });
    }

    res.json({
      message: 'Office updated successfully',
      office
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update office',
      error: error.message
    });
  }
};

// @desc Delete office (soft delete)
// @route DELETE /api/offices/:id
// @access Private
const deleteOffice = async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!office) {
      return res.status(404).json({
        message: 'Office not found'
      });
    }

    // Remove office from company's office array
    await Company.findByIdAndUpdate(
      office.company,
      { $pull: { office: office._id } }
    );

    res.json({
      message: 'Office deleted successfully',
      office
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete office',
      error: error.message
    });
  }
};

// @desc Update office occupancy
// @route PATCH /api/offices/:id/occupancy
// @access Private
const updateOccupancy = async (req, res) => {
  try {
    const { currentOccupancy } = req.body;
    const officeId = req.params.id;

    const office = await Office.findById(officeId);
    if (!office) {
      return res.status(404).json({
        message: 'Office not found'
      });
    }

    // Validate occupancy doesn't exceed capacity
    if (currentOccupancy > office.capacity) {
      return res.status(400).json({
        message: 'Current occupancy cannot exceed office capacity',
        capacity: office.capacity,
        requested: currentOccupancy
      });
    }

    office.currentOccupancy = currentOccupancy;
    await office.save();

    res.json({
      message: 'Office occupancy updated successfully',
      office: await Office.findById(officeId).populate('company', 'fullName acronym')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update office occupancy',
      error: error.message
    });
  }
};

// @desc Get office statistics
// @route GET /api/offices/:id/stats
// @access Private
const getOfficeStats = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({
        message: 'Office not found'
      });
    }

    const stats = {
      capacity: office.capacity,
      currentOccupancy: office.currentOccupancy,
      availableSpace: office.availableSpace,
      occupancyPercentage: office.occupancyPercentage,
      isAtCapacity: office.currentOccupancy >= office.capacity,
      status: office.active ? 'active' : 'inactive'
    };

    res.json({
      office: {
        id: office._id,
        name: office.name,
        city: office.city
      },
      stats
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch office statistics',
      error: error.message
    });
  }
};

// @desc Get offices by company
// @route GET /api/offices/company/:companyId
// @access Private
const getOfficesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { active = true } = req.query;

    const query = { company: companyId };
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const offices = await Office.find(query)
      .populate('company', 'fullName acronym')
      .sort({ name: 1 });

    res.json({
      offices,
      totalOffices: offices.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch company offices',
      error: error.message
    });
  }
};

module.exports = {
  createOffice,
  getAllOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  updateOccupancy,
  getOfficeStats,
  getOfficesByCompany
};