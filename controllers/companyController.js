const Company = require('../models/Company');
const User = require('../models/User');

// @desc Create a new company
// @route POST /api/companies
// @access Private
const createCompany = async (req, res) => {
  try {
    const { acronym, fullName, logoUrl } = req.body;

    // Check if company with same acronym already exists
    const existingCompany = await Company.findOne({ acronym });
    if (existingCompany) {
      return res.status(400).json({
        message: 'Company with this acronym already exists',
        field: 'acronym'
      });
    }

    const company = new Company({
      acronym,
      fullName,
      logoUrl
    });

    await company.save();

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create company',
      error: error.message
    });
  }
};

// @desc Get all companies
// @route GET /api/companies
// @access Private
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    
    const query = {};
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    }

    const companies = await Company.find(query)
      .populate('office', 'name address city country')
      .populate('admin', 'firstName lastName email')
      .populate('employee', 'firstName lastName email status')
      .populate('inOffice', 'firstName lastName')
      .populate('outOfService', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCompanies: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// @desc Get company by ID
// @route GET /api/companies/:id
// @access Private
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('office', 'name address city country capacity currentOccupancy')
      .populate('admin', 'firstName lastName email phone')
      .populate('employee', 'firstName lastName email status serviceCard')
      .populate('inOffice', 'firstName lastName email')
      .populate('outOfService', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch company',
      error: error.message
    });
  }
};

// @desc Update company (PATCH)
// @route PATCH /api/companies/:id
// @access Private
const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('office', 'name address city')
     .populate('admin', 'firstName lastName email')
     .populate('employee', 'firstName lastName email status');

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update company',
      error: error.message
    });
  }
};

// @desc Delete company (soft delete)
// @route DELETE /api/companies/:id
// @access Private
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    res.json({
      message: 'Company deleted successfully',
      company
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete company',
      error: error.message
    });
  }
};

// @desc Add employee to company
// @route PATCH /api/companies/:id/add-employee
// @access Private
const addEmployee = async (req, res) => {
  try {
    const { employeeId, isAdmin = false } = req.body;
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Add to appropriate arrays
    if (isAdmin && !company.admin.includes(employeeId)) {
      company.admin.push(employeeId);
    }
    
    if (!company.employee.includes(employeeId)) {
      company.employee.push(employeeId);
    }

    // Update user's employer
    user.employer = companyId;
    
    await company.save();
    await user.save();

    res.json({
      message: 'Employee added successfully',
      company: await Company.findById(companyId)
        .populate('admin', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to add employee',
      error: error.message
    });
  }
};

// @desc Remove employee from company
// @route PATCH /api/companies/:id/remove-employee
// @access Private
const removeEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Remove from all arrays
    company.admin = company.admin.filter(id => id.toString() !== employeeId);
    company.employee = company.employee.filter(id => id.toString() !== employeeId);
    company.inOffice = company.inOffice.filter(id => id.toString() !== employeeId);
    company.outOfService = company.outOfService.filter(id => id.toString() !== employeeId);

    // Update user's employer
    await User.findByIdAndUpdate(employeeId, { employer: null });
    
    await company.save();

    res.json({
      message: 'Employee removed successfully',
      company: await Company.findById(companyId)
        .populate('admin', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to remove employee',
      error: error.message
    });
  }
};

// @desc Update employee status in company
// @route PATCH /api/companies/:id/employee-status
// @access Private
const updateEmployeeStatus = async (req, res) => {
  try {
    const { employeeId, status } = req.body; // status: 'inOffice' or 'outOfService'
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Remove from both arrays first
    company.inOffice = company.inOffice.filter(id => id.toString() !== employeeId);
    company.outOfService = company.outOfService.filter(id => id.toString() !== employeeId);

    // Add to appropriate array
    if (status === 'inOffice') {
      company.inOffice.push(employeeId);
    } else if (status === 'outOfService') {
      company.outOfService.push(employeeId);
    }

    await company.save();

    res.json({
      message: 'Employee status updated successfully',
      company: await Company.findById(companyId)
        .populate('inOffice', 'firstName lastName')
        .populate('outOfService', 'firstName lastName')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update employee status',
      error: error.message
    });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addEmployee,
  removeEmployee,
  updateEmployeeStatus
};