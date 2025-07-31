const Visit = require('../models/Visit');
const User = require('../models/User');
const Office = require('../models/Office');

// @desc Create a new visit
// @route POST /api/visits
// @access Private
const createVisit = async (req, res) => {
  try {
    const { visitor, employee, expectedClockIn, reason, comment, office } = req.body;

    // Verify visitor exists
    const visitorExists = await User.findById(visitor);
    if (!visitorExists) {
      return res.status(404).json({
        message: 'Visitor not found'
      });
    }

    // Verify employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Verify office exists if provided
    if (office) {
      const officeExists = await Office.findById(office);
      if (!officeExists) {
        return res.status(404).json({
          message: 'Office not found'
        });
      }
    }

    const visit = new Visit({
      visitor,
      employee,
      expectedClockIn: new Date(expectedClockIn),
      reason,
      comment,
      office
    });

    await visit.save();

    // Add visit to visitor's visits array
    await User.findByIdAndUpdate(visitor, { $push: { visits: visit._id } });

    res.status(201).json({
      message: 'Visit created successfully',
      visit: await Visit.findById(visit._id)
        .populate('visitor', 'firstName lastName email phone')
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address city')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create visit',
      error: error.message
    });
  }
};

// @desc Get all visits
// @route GET /api/visits
// @access Private
const getAllVisits = async (req, res) => {
  try {
    const { page = 1, limit = 10, visitor, employee, status, office } = req.query;
    
    const query = {};
    
    // Filter by visitor if provided
    if (visitor) {
      query.visitor = visitor;
    }
    
    // Filter by employee if provided
    if (employee) {
      query.employee = employee;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by office if provided
    if (office) {
      query.office = office;
    }

    const visits = await Visit.find(query)
      .populate('visitor', 'firstName lastName email phone')
      .populate('employee', 'firstName lastName email employer')
      .populate('office', 'name address city company')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ expectedClockIn: -1 });

    const total = await Visit.countDocuments(query);

    res.json({
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVisits: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch visits',
      error: error.message
    });
  }
};

// @desc Get visit by ID
// @route GET /api/visits/:id
// @access Private
const getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('visitor', 'firstName lastName email phone civility')
      .populate('employee', 'firstName lastName email phone employer')
      .populate('office', 'name address city company capacity');

    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch visit',
      error: error.message
    });
  }
};

// @desc Update visit (PATCH)
// @route PATCH /api/visits/:id
// @access Private
const updateVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    // Handle date fields
    if (updates.expectedClockIn) {
      updates.expectedClockIn = new Date(updates.expectedClockIn);
    }
    if (updates.clockIn) {
      updates.clockIn = new Date(updates.clockIn);
    }
    if (updates.clockOut) {
      updates.clockOut = new Date(updates.clockOut);
    }

    const visit = await Visit.findByIdAndUpdate(
      visitId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('visitor', 'firstName lastName email')
     .populate('employee', 'firstName lastName email')
     .populate('office', 'name address city');

    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    res.json({
      message: 'Visit updated successfully',
      visit
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update visit',
      error: error.message
    });
  }
};

// @desc Delete visit
// @route DELETE /api/visits/:id
// @access Private
const deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);

    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    // Remove visit from visitor's visits array
    await User.findByIdAndUpdate(visit.visitor, { $pull: { visits: visit._id } });

    res.json({
      message: 'Visit deleted successfully',
      visit
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete visit',
      error: error.message
    });
  }
};

// @desc Accept visit
// @route PATCH /api/visits/:id/accept
// @access Private
const acceptVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    if (visit.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending visits can be accepted'
      });
    }

    visit.status = 'accepted';
    await visit.save();

    res.json({
      message: 'Visit accepted successfully',
      visit: await Visit.findById(visit._id)
        .populate('visitor', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to accept visit',
      error: error.message
    });
  }
};

// @desc Cancel visit
// @route PATCH /api/visits/:id/cancel
// @access Private
const cancelVisit = async (req, res) => {
  try {
    const { reason } = req.body;
    const visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    if (visit.status === 'completed') {
      return res.status(400).json({
        message: 'Completed visits cannot be cancelled'
      });
    }

    visit.status = 'cancelled';
    if (reason) {
      visit.comment = visit.comment ? `${visit.comment}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    }
    await visit.save();

    res.json({
      message: 'Visit cancelled successfully',
      visit: await Visit.findById(visit._id)
        .populate('visitor', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to cancel visit',
      error: error.message
    });
  }
};

// @desc Clock in visitor
// @route PATCH /api/visits/:id/clock-in
// @access Private
const clockInVisitor = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    if (visit.status !== 'accepted') {
      return res.status(400).json({
        message: 'Only accepted visits can be clocked in'
      });
    }

    if (visit.clockIn) {
      return res.status(400).json({
        message: 'Visitor is already clocked in'
      });
    }

    visit.clockIn = new Date();
    visit.status = 'in_progress';
    await visit.save();

    res.json({
      message: 'Visitor clocked in successfully',
      visit: await Visit.findById(visit._id)
        .populate('visitor', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to clock in visitor',
      error: error.message
    });
  }
};

// @desc Clock out visitor
// @route PATCH /api/visits/:id/clock-out
// @access Private
const clockOutVisitor = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    
    if (!visit) {
      return res.status(404).json({
        message: 'Visit not found'
      });
    }

    if (!visit.clockIn) {
      return res.status(400).json({
        message: 'Visitor must be clocked in before clocking out'
      });
    }

    if (visit.clockOut) {
      return res.status(400).json({
        message: 'Visitor is already clocked out'
      });
    }

    visit.clockOut = new Date();
    await visit.save();

    res.json({
      message: 'Visitor clocked out successfully',
      visit: await Visit.findById(visit._id)
        .populate('visitor', 'firstName lastName email')
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address'),
      duration: visit.duration
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to clock out visitor',
      error: error.message
    });
  }
};

// @desc Get visits by status
// @route GET /api/visits/status/:status
// @access Private
const getVisitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const visits = await Visit.find({ status })
      .populate('visitor', 'firstName lastName email phone')
      .populate('employee', 'firstName lastName email')
      .populate('office', 'name address city')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ expectedClockIn: -1 });

    const total = await Visit.countDocuments({ status });

    res.json({
      visits,
      status,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVisits: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch visits by status',
      error: error.message
    });
  }
};

module.exports = {
  createVisit,
  getAllVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
  acceptVisit,
  cancelVisit,
  clockInVisitor,
  clockOutVisitor,
  getVisitsByStatus
};