const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createServiceCard,
  getAllServiceCards,
  getServiceCardById,
  updateServiceCard,
  deleteServiceCard,
  toggleServiceCardStatus,
  checkServiceCardValidity,
  getServiceCardsByUser,
  getServiceCardsByCompany
} = require('../controllers/serviceCardController');

/**
 * @swagger
 * /api/service-cards:
 *   post:
 *     summary: Create a new service card
 *     tags: [Service Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - company
 *               - position
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *               company:
 *                 type: string
 *                 description: Company ID
 *               position:
 *                 type: string
 *                 description: Employee position/title
 *               expireAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date (optional, defaults to 1 year from issue date)
 *     responses:
 *       201:
 *         description: Service card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 serviceCard:
 *                   $ref: '#/components/schemas/ServiceCard'
 *       400:
 *         description: Service card creation failed
 */
router.post('/', auth, createServiceCard);

/**
 * @swagger
 * /api/service-cards:
 *   get:
 *     summary: Get all service cards
 *     tags: [Service Cards]
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
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position
 *     responses:
 *       200:
 *         description: Service cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceCards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceCard'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalServiceCards:
 *                   type: integer
 */
router.get('/', auth, getAllServiceCards);

/**
 * @swagger
 * /api/service-cards/user/{userId}:
 *   get:
 *     summary: Get service cards by user
 *     tags: [Service Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: User service cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceCards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceCard'
 *                 totalCards:
 *                   type: integer
 */
router.get('/user/:userId', auth, getServiceCardsByUser);

/**
 * @swagger
 * /api/service-cards/company/{companyId}:
 *   get:
 *     summary: Get service cards by company
 *     tags: [Service Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company service cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceCards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ServiceCard'
 *                 totalCards:
 *                   type: integer
 */
router.get('/company/:companyId', auth, getServiceCardsByCompany);

/**
 * @swagger
 * /api/service-cards/{id}:
 *   get:
 *     summary: Get service card by ID
 *     tags: [Service Cards]
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
 *         description: Service card retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceCard'
 *       404:
 *         description: Service card not found
 */
router.get('/:id', auth, getServiceCardById);

/**
 * @swagger
 * /api/service-cards/{id}/validity:
 *   get:
 *     summary: Check service card validity
 *     tags: [Service Cards]
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
 *         description: Service card validity checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceCard:
 *                   type: object
 *                 validity:
 *                   type: object
 *                   properties:
 *                     isActive:
 *                       type: boolean
 *                     isExpired:
 *                       type: boolean
 *                     isValid:
 *                       type: boolean
 *                     daysUntilExpiration:
 *                       type: integer
 *                     expireAt:
 *                       type: string
 *                       format: date-time
 *                     cardNumber:
 *                       type: string
 */
router.get('/:id/validity', auth, checkServiceCardValidity);

/**
 * @swagger
 * /api/service-cards/{id}:
 *   patch:
 *     summary: Update service card
 *     tags: [Service Cards]
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
 *               position:
 *                 type: string
 *               expireAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 serviceCard:
 *                   $ref: '#/components/schemas/ServiceCard'
 */
router.patch('/:id', auth, updateServiceCard);

/**
 * @swagger
 * /api/service-cards/{id}/toggle-status:
 *   patch:
 *     summary: Activate/Deactivate service card
 *     tags: [Service Cards]
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
 *         description: Service card status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 serviceCard:
 *                   $ref: '#/components/schemas/ServiceCard'
 */
router.patch('/:id/toggle-status', auth, toggleServiceCardStatus);

/**
 * @swagger
 * /api/service-cards/{id}:
 *   delete:
 *     summary: Delete service card
 *     tags: [Service Cards]
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
 *         description: Service card deleted successfully
 */
router.delete('/:id', auth, deleteServiceCard);

module.exports = router;