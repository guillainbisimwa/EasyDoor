const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
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
} = require('../controllers/visitController');

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Create a new visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitor
 *               - employee
 *               - expectedClockIn
 *               - reason
 *             properties:
 *               visitor:
 *                 type: string
 *                 description: Visitor user ID
 *               employee:
 *                 type: string
 *                 description: Employee user ID
 *               expectedClockIn:
 *                 type: string
 *                 format: date-time
 *                 description: Expected arrival time
 *               reason:
 *                 type: string
 *                 description: Purpose of the visit
 *               comment:
 *                 type: string
 *                 description: Additional comments
 *               office:
 *                 type: string
 *                 description: Office ID (optional)
 *     responses:
 *       201:
 *         description: Visit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 *       400:
 *         description: Visit creation failed
 */
router.post('/', auth, createVisit);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Get all visits
 *     tags: [Visits]
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
 *         name: visitor
 *         schema:
 *           type: string
 *         description: Filter by visitor ID
 *       - in: query
 *         name: employee
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, cancelled, in_progress, completed]
 *       - in: query
 *         name: office
 *         schema:
 *           type: string
 *         description: Filter by office ID
 *     responses:
 *       200:
 *         description: Visits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 visits:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Visit'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalVisits:
 *                   type: integer
 */
router.get('/', auth, getAllVisits);

/**
 * @swagger
 * /api/visits/status/{status}:
 *   get:
 *     summary: Get visits by status
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, accepted, cancelled, in_progress, completed]
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
 *     responses:
 *       200:
 *         description: Visits by status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 visits:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Visit'
 *                 status:
 *                   type: string
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalVisits:
 *                   type: integer
 */
router.get('/status/:status', auth, getVisitsByStatus);

/**
 * @swagger
 * /api/visits/{id}:
 *   get:
 *     summary: Get visit by ID
 *     tags: [Visits]
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
 *         description: Visit retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Visit'
 *       404:
 *         description: Visit not found
 */
router.get('/:id', auth, getVisitById);

/**
 * @swagger
 * /api/visits/{id}:
 *   patch:
 *     summary: Update visit
 *     tags: [Visits]
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
 *               expectedClockIn:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *               comment:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, cancelled, in_progress, completed]
 *               office:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 */
router.patch('/:id', auth, updateVisit);

/**
 * @swagger
 * /api/visits/{id}/accept:
 *   patch:
 *     summary: Accept visit
 *     tags: [Visits]
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
 *         description: Visit accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 */
router.patch('/:id/accept', auth, acceptVisit);

/**
 * @swagger
 * /api/visits/{id}/cancel:
 *   patch:
 *     summary: Cancel visit
 *     tags: [Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Cancellation reason
 *     responses:
 *       200:
 *         description: Visit cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 */
router.patch('/:id/cancel', auth, cancelVisit);

/**
 * @swagger
 * /api/visits/{id}/clock-in:
 *   patch:
 *     summary: Clock in visitor
 *     tags: [Visits]
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
 *         description: Visitor clocked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 */
router.patch('/:id/clock-in', auth, clockInVisitor);

/**
 * @swagger
 * /api/visits/{id}/clock-out:
 *   patch:
 *     summary: Clock out visitor
 *     tags: [Visits]
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
 *         description: Visitor clocked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visit:
 *                   $ref: '#/components/schemas/Visit'
 *                 duration:
 *                   type: string
 */
router.patch('/:id/clock-out', auth, clockOutVisitor);

/**
 * @swagger
 * /api/visits/{id}:
 *   delete:
 *     summary: Delete visit
 *     tags: [Visits]
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
 *         description: Visit deleted successfully
 */
router.delete('/:id', auth, deleteVisit);

module.exports = router;