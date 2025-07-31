const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Office = require('../models/Office');

// @desc Create attendance (Clock in)
// @route POST /api/attendance
// @access Private
const createAttendance = async (req, res) => {
  try {
    const { employee, workingFrom, office } = req.body;

    // Verify employee exists
    const employeeExists = await User.findById(employee);
    if (!employeeExists) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Verify office exists if working from office
    if (workingFrom === 'office') {
      if (!office) {
        return res.status(400).json({
          message: 'Office is required when working from office'
        });
      }
      
      const officeExists = await Office.findById(office);
      if (!officeExists) {
        return res.status(404).json({
          message: 'Office not found'
        });
      }
    }

    // Check if employee already has an active attendance
    const existingActive = await Attendance.findOne({
      employee,
      isActive: true
    });

    if (existingActive) {
      return res.status(400).json({
        message: 'Employee already has an active attendance session',
        activeAttendance: existingActive
      });
    }

    const attendance = new Attendance({
      employee,
      workingFrom,
      office: workingFrom === 'office' ? office : null
    });

    await attendance.save();

    res.status(201).json({
      message: 'Clock in successful',
      attendance: await Attendance.findById(attendance._id)
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address city')
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to clock in',
      error: error.message
    });
  }
};

// @desc Get all attendance records
// @route GET /api/attendance
// @access Private
const getAllAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, employee, workingFrom, office, isActive, date } = req.query;
    
    const query = {};
    
    // Filter by employee if provided
    if (employee) {
      query.employee = employee;
    }
    
    // Filter by workingFrom if provided
    if (workingFrom) {
      query.workingFrom = workingFrom;
    }
    
    // Filter by office if provided
    if (office) {
      query.office = office;
    }
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.clockIn = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email employer')
      .populate('office', 'name address city company')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ clockIn: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// @desc Get attendance by ID
// @route GET /api/attendance/:id
// @access Private
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employee', 'firstName lastName email phone employer')
      .populate('office', 'name address city company capacity');

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch attendance record',
      error: error.message
    });
  }
};

// @desc Update attendance (PATCH)
// @route PATCH /api/attendance/:id
// @access Private
const updateAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;

    // Handle date fields
    if (updates.clockIn) {
      updates.clockIn = new Date(updates.clockIn);
    }
    if (updates.clockOut) {
      updates.clockOut = new Date(updates.clockOut);
    }

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('employee', 'firstName lastName email')
     .populate('office', 'name address city');

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    res.json({
      message: 'Attendance record updated successfully',
      attendance
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

// @desc Delete attendance record
// @route DELETE /api/attendance/:id
// @access Private
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    res.json({
      message: 'Attendance record deleted successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

// @desc Clock out employee
// @route PATCH /api/attendance/:id/clock-out
// @access Private
const clockOut = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    if (!attendance.isActive) {
      return res.status(400).json({
        message: 'Attendance session is not active'
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        message: 'Employee is already clocked out'
      });
    }

    attendance.clockOut = new Date();
    await attendance.save();

    res.json({
      message: 'Clock out successful',
      attendance: await Attendance.findById(attendance._id)
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address'),
      workHours: attendance.workHours,
      duration: attendance.duration
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to clock out',
      error: error.message
    });
  }
};

// @desc Clock out by employee ID
// @route PATCH /api/attendance/employee/:employeeId/clock-out
// @access Private
const clockOutByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const attendance = await Attendance.findOne({
      employee: employeeId,
      isActive: true
    });
    
    if (!attendance) {
      return res.status(404).json({
        message: 'No active attendance session found for this employee'
      });
    }

    attendance.clockOut = new Date();
    await attendance.save();

    res.json({
      message: 'Clock out successful',
      attendance: await Attendance.findById(attendance._id)
        .populate('employee', 'firstName lastName email')
        .populate('office', 'name address'),
      workHours: attendance.workHours,
      duration: attendance.duration
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to clock out',
      error: error.message
    });
  }
};

// @desc Get active attendance sessions
// @route GET /api/attendance/active
// @access Private
const getActiveAttendance = async (req, res) => {
  try {
    const { office, workingFrom } = req.query;
    
    const query = { isActive: true };
    
    if (office) {
      query.office = office;
    }
    
    if (workingFrom) {
      query.workingFrom = workingFrom;
    }

    const activeAttendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email employer')
      .populate('office', 'name address city')
      .sort({ clockIn: -1 });

    res.json({
      activeAttendance,
      totalActive: activeAttendance.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch active attendance sessions',
      error: error.message
    });
  }
};

// @desc Get attendance summary for employee
// @route GET /api/attendance/employee/:employeeId/summary
// @access Private
const getEmployeeAttendanceSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { employee: employeeId };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.clockIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('office', 'name address city')
      .sort({ clockIn: -1 });

    // Calculate summary statistics
    const totalSessions = attendanceRecords.length;
    const completedSessions = attendanceRecords.filter(record => record.clockOut).length;
    const activeSessions = attendanceRecords.filter(record => record.isActive).length;
    
    const totalWorkHours = attendanceRecords
      .filter(record => record.clockOut)
      .reduce((total, record) => total + record.workHours, 0);

    const officeWorkDays = attendanceRecords.filter(record => record.workingFrom === 'office').length;
    const homeWorkDays = attendanceRecords.filter(record => record.workingFrom === 'home').length;

    const summary = {
      totalSessions,
      completedSessions,
      activeSessions,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      averageWorkHours: completedSessions > 0 ? Math.round((totalWorkHours / completedSessions) * 100) / 100 : 0,
      officeWorkDays,
      homeWorkDays,
      workPattern: {
        office: Math.round((officeWorkDays / totalSessions) * 100) || 0,
        home: Math.round((homeWorkDays / totalSessions) * 100) || 0
      }
    };

    res.json({
      employee: employeeId,
      dateRange: { startDate, endDate },
      summary,
      records: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
};

module.exports = {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  clockOut,
  clockOutByEmployee,
  getActiveAttendance,
  getEmployeeAttendanceSummary
};