const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOffice,
  getAllOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  updateOccupancy,
  getOfficeStats,
  getOfficesByCompany
} = require('../controllers/officeController');

/**
 * @swagger
 * /api/offices:
 *   post:
 *     summary: Create a new office
 *     tags: [Offices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *               - country
 *               - company
 *             properties:
 *               name:
 *                 type: string
 *                 description: Office name
 *               address:
 *                 type: string
 *                 description: Office address
 *               city:
 *                 type: string
 *                 description: Office city
 *               country:
 *                 type: string
 *                 description: Office country
 *               zipCode:
 *                 type: string
 *                 description: Office zip code
 *               phone:
 *                 type: string
 *                 description: Office phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Office email
 *               capacity:
 *                 type: integer
 *                 description: Maximum capacity of the office
 *               company:
 *                 type: string
 *                 description: Company ID that owns this office
 *     responses:
 *       201:
 *         description: Office created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 office:
 *                   $ref: '#/components/schemas/Office'
 *       400:
 *         description: Office creation failed
 */
router.post('/', auth, createOffice);

/**
 * @swagger
 * /api/offices:
 *   get:
 *     summary: Get all offices
 *     tags: [Offices]
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
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company ID
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Offices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Office'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalOffices:
 *                   type: integer
 */
router.get('/', auth, getAllOffices);

/**
 * @swagger
 * /api/offices/company/{companyId}:
 *   get:
 *     summary: Get offices by company
 *     tags: [Offices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Company offices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Office'
 *                 totalOffices:
 *                   type: integer
 */
router.get('/company/:companyId', auth, getOfficesByCompany);

/**
 * @swagger
 * /api/offices/{id}:
 *   get:
 *     summary: Get office by ID
 *     tags: [Offices]
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
 *         description: Office retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Office'
 *       404:
 *         description: Office not found
 */
router.get('/:id', auth, getOfficeById);

/**
 * @swagger
 * /api/offices/{id}/stats:
 *   get:
 *     summary: Get office statistics
 *     tags: [Offices]
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
 *         description: Office statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 office:
 *                   type: object
 *                 stats:
 *                   type: object
 *                   properties:
 *                     capacity:
 *                       type: integer
 *                     currentOccupancy:
 *                       type: integer
 *                     availableSpace:
 *                       type: integer
 *                     occupancyPercentage:
 *                       type: integer
 *                     isAtCapacity:
 *                       type: boolean
 *                     status:
 *                       type: string
 */
router.get('/:id/stats', auth, getOfficeStats);

/**
 * @swagger
 * /api/offices/{id}:
 *   patch:
 *     summary: Update office
 *     tags: [Offices]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               currentOccupancy:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Office updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 office:
 *                   $ref: '#/components/schemas/Office'
 */
router.patch('/:id', auth, updateOffice);

/**
 * @swagger
 * /api/offices/{id}/occupancy:
 *   patch:
 *     summary: Update office occupancy
 *     tags: [Offices]
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
 *             required:
 *               - currentOccupancy
 *             properties:
 *               currentOccupancy:
 *                 type: integer
 *                 description: Current number of people in office
 *     responses:
 *       200:
 *         description: Office occupancy updated successfully
 */
router.patch('/:id/occupancy', auth, updateOccupancy);

/**
 * @swagger
 * /api/offices/{id}:
 *   delete:
 *     summary: Delete office (soft delete)
 *     tags: [Offices]
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
 *         description: Office deleted successfully
 */
router.delete('/:id', auth, deleteOffice);

module.exports = router;