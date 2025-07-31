const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  clockOut,
  clockOutByEmployee,
  getActiveAttendance,
  getEmployeeAttendanceSummary
} = require('../controllers/attendanceController');

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create attendance (Clock in)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee
 *               - workingFrom
 *             properties:
 *               employee:
 *                 type: string
 *                 description: Employee user ID
 *               workingFrom:
 *                 type: string
 *                 enum: [office, home]
 *                 description: Where the employee is working from
 *               office:
 *                 type: string
 *                 description: Office ID (required if workingFrom is 'office')
 *     responses:
 *       201:
 *         description: Clock in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Clock in failed
 */
router.post('/', auth, createAttendance);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: workingFrom
 *         schema:
 *           type: string
 *           enum: [office, home]
 *       - in: query
 *         name: office
 *         schema:
 *           type: string
 *         description: Filter by office ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalRecords:
 *                   type: integer
 */
router.get('/', auth, getAllAttendance);

/**
 * @swagger
 * /api/attendance/active:
 *   get:
 *     summary: Get active attendance sessions
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: office
 *         schema:
 *           type: string
 *         description: Filter by office ID
 *       - in: query
 *         name: workingFrom
 *         schema:
 *           type: string
 *           enum: [office, home]
 *     responses:
 *       200:
 *         description: Active attendance sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeAttendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 *                 totalActive:
 *                   type: integer
 */
router.get('/active', auth, getActiveAttendance);

/**
 * @swagger
 * /api/attendance/employee/{employeeId}/summary:
 *   get:
 *     summary: Get attendance summary for employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for summary range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for summary range
 *     responses:
 *       200:
 *         description: Employee attendance summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employee:
 *                   type: string
 *                 dateRange:
 *                   type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     completedSessions:
 *                       type: integer
 *                     activeSessions:
 *                       type: integer
 *                     totalWorkHours:
 *                       type: number
 *                     averageWorkHours:
 *                       type: number
 *                     officeWorkDays:
 *                       type: integer
 *                     homeWorkDays:
 *                       type: integer
 *                     workPattern:
 *                       type: object
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attendance'
 */
router.get('/employee/:employeeId/summary', auth, getEmployeeAttendanceSummary);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get attendance by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance record not found
 */
router.get('/:id', auth, getAttendanceById);

/**
 * @swagger
 * /api/attendance/{id}:
 *   patch:
 *     summary: Update attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workingFrom:
 *                 type: string
 *                 enum: [office, home]
 *               office:
 *                 type: string
 *               clockIn:
 *                 type: string
 *                 format: date-time
 *               clockOut:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 */
router.patch('/:id', auth, updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}/clock-out:
 *   patch:
 *     summary: Clock out employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clock out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *                 workHours:
 *                   type: number
 *                 duration:
 *                   type: string
 */
router.patch('/:id/clock-out', auth, clockOut);

/**
 * @swagger
 * /api/attendance/employee/{employeeId}/clock-out:
 *   patch:
 *     summary: Clock out by employee ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clock out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *                 workHours:
 *                   type: number
 *                 duration:
 *                   type: string
 */
router.patch('/employee/:employeeId/clock-out', auth, clockOutByEmployee);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 */
router.delete('/:id', auth, deleteAttendance);

module.exports = router;