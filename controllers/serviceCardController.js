const ServiceCard = require('../models/ServiceCard');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc Create a new service card
// @route POST /api/service-cards
// @access Private
const createServiceCard = async (req, res) => {
  try {
    const { user, company, position, expireAt } = req.body;

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Check if user already has an active service card for this company
    const existingCard = await ServiceCard.findOne({
      user,
      company,
      isActive: true
    });

    if (existingCard) {
      return res.status(400).json({
        message: 'User already has an active service card for this company'
      });
    }

    const serviceCard = new ServiceCard({
      user,
      company,
      position,
      expireAt: expireAt ? new Date(expireAt) : undefined
    });

    await serviceCard.save();

    // Update user's serviceCard reference
    await User.findByIdAndUpdate(user, { serviceCard: serviceCard._id });

    res.status(201).json({
      message: 'Service card created successfully',
      serviceCard: await ServiceCard.findById(serviceCard._id)
        .populate('user', 'firstName lastName email')
        .populate('company', 'fullName acronym')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create service card',
      error: error.message
    });
  }
};

// @desc Get all service cards
// @route GET /api/service-cards
// @access Private
const getAllServiceCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, user, company, isActive, position } = req.query;
    
    const query = {};
    
    // Filter by user if provided
    if (user) {
      query.user = user;
    }
    
    // Filter by company if provided
    if (company) {
      query.company = company;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by position if provided
    if (position) {
      query.position = new RegExp(position, 'i'); // Case insensitive search
    }

    const serviceCards = await ServiceCard.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('company', 'fullName acronym logoUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await ServiceCard.countDocuments(query);

    res.json({
      serviceCards,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalServiceCards: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch service cards',
      error: error.message
    });
  }
};

// @desc Get service card by ID
// @route GET /api/service-cards/:id
// @access Private
const getServiceCardById = async (req, res) => {
  try {
    const serviceCard = await ServiceCard.findById(req.params.id)
      .populate('user', 'firstName lastName email phone civility')
      .populate('company', 'fullName acronym logoUrl office');

    if (!serviceCard) {
      return res.status(404).json({
        message: 'Service card not found'
      });
    }

    res.json(serviceCard);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch service card',
      error: error.message
    });
  }
};

// @desc Update service card (PATCH)
// @route PATCH /api/service-cards/:id
// @access Private
const updateServiceCard = async (req, res) => {
  try {
    const serviceCardId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    delete updates.cardNumber; // Card number should not be changed

    const serviceCard = await ServiceCard.findByIdAndUpdate(
      serviceCardId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email')
     .populate('company', 'fullName acronym');

    if (!serviceCard) {
      return res.status(404).json({
        message: 'Service card not found'
      });
    }

    res.json({
      message: 'Service card updated successfully',
      serviceCard
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update service card',
      error: error.message
    });
  }
};

// @desc Delete service card
// @route DELETE /api/service-cards/:id
// @access Private
const deleteServiceCard = async (req, res) => {
  try {
    const serviceCard = await ServiceCard.findByIdAndDelete(req.params.id);

    if (!serviceCard) {
      return res.status(404).json({
        message: 'Service card not found'
      });
    }

    // Remove serviceCard reference from user
    await User.findByIdAndUpdate(serviceCard.user, { serviceCard: null });

    res.json({
      message: 'Service card deleted successfully',
      serviceCard
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete service card',
      error: error.message
    });
  }
};

// @desc Activate/Deactivate service card
// @route PATCH /api/service-cards/:id/toggle-status
// @access Private
const toggleServiceCardStatus = async (req, res) => {
  try {
    const serviceCard = await ServiceCard.findById(req.params.id);
    
    if (!serviceCard) {
      return res.status(404).json({
        message: 'Service card not found'
      });
    }

    serviceCard.isActive = !serviceCard.isActive;
    await serviceCard.save();

    res.json({
      message: `Service card ${serviceCard.isActive ? 'activated' : 'deactivated'} successfully`,
      serviceCard: await ServiceCard.findById(serviceCard._id)
        .populate('user', 'firstName lastName email')
        .populate('company', 'fullName acronym')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to toggle service card status',
      error: error.message
    });
  }
};

// @desc Check service card validity
// @route GET /api/service-cards/:id/validity
// @access Private
const checkServiceCardValidity = async (req, res) => {
  try {
    const serviceCard = await ServiceCard.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('company', 'fullName acronym');

    if (!serviceCard) {
      return res.status(404).json({
        message: 'Service card not found'
      });
    }

    const validity = {
      isActive: serviceCard.isActive,
      isExpired: serviceCard.isExpired,
      isValid: serviceCard.isValid,
      daysUntilExpiration: serviceCard.daysUntilExpiration,
      expireAt: serviceCard.expireAt,
      cardNumber: serviceCard.cardNumber
    };

    res.json({
      serviceCard: {
        id: serviceCard._id,
        user: serviceCard.user,
        company: serviceCard.company,
        position: serviceCard.position
      },
      validity
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check service card validity',
      error: error.message
    });
  }
};

// @desc Get service cards by user
// @route GET /api/service-cards/user/:userId
// @access Private
const getServiceCardsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.query;

    const query = { user: userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const serviceCards = await ServiceCard.find(query)
      .populate('company', 'fullName acronym logoUrl')
      .sort({ createdAt: -1 });

    res.json({
      serviceCards,
      totalCards: serviceCards.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user service cards',
      error: error.message
    });
  }
};

// @desc Get service cards by company
// @route GET /api/service-cards/company/:companyId
// @access Private
const getServiceCardsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { isActive, position } = req.query;

    const query = { company: companyId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (position) {
      query.position = new RegExp(position, 'i');
    }

    const serviceCards = await ServiceCard.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      serviceCards,
      totalCards: serviceCards.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch company service cards',
      error: error.message
    });
  }
};

module.exports = {
  createServiceCard,
  getAllServiceCards,
  getServiceCardById,
  updateServiceCard,
  deleteServiceCard,
  toggleServiceCardStatus,
  checkServiceCardValidity,
  getServiceCardsByUser,
  getServiceCardsByCompany
};