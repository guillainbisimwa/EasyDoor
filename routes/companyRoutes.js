const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addEmployee,
  removeEmployee,
  updateEmployeeStatus
} = require('../controllers/companyController');

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - acronym
 *               - fullName
 *             properties:
 *               acronym:
 *                 type: string
 *                 description: Company acronym/short name
 *               fullName:
 *                 type: string
 *                 description: Company full name
 *               logoUrl:
 *                 type: string
 *                 description: URL to company logo
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Company creation failed
 */
router.post('/', auth, createCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
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
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalCompanies:
 *                   type: integer
 */
router.get('/', auth, getAllCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
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
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 */
router.get('/:id', auth, getCompanyById);

/**
 * @swagger
 * /api/companies/{id}:
 *   patch:
 *     summary: Update company
 *     tags: [Companies]
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
 *               acronym:
 *                 type: string
 *               fullName:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               visitorCount:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 */
router.patch('/:id', auth, updateCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete company (soft delete)
 *     tags: [Companies]
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
 *         description: Company deleted successfully
 */
router.delete('/:id', auth, deleteCompany);

/**
 * @swagger
 * /api/companies/{id}/add-employee:
 *   patch:
 *     summary: Add employee to company
 *     tags: [Companies]
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
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the user to add as employee
 *               isAdmin:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to add user as admin
 *     responses:
 *       200:
 *         description: Employee added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 */
router.patch('/:id/add-employee', auth, addEmployee);

/**
 * @swagger
 * /api/companies/{id}/remove-employee:
 *   patch:
 *     summary: Remove employee from company
 *     tags: [Companies]
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
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee to remove
 *     responses:
 *       200:
 *         description: Employee removed successfully
 */
router.patch('/:id/remove-employee', auth, removeEmployee);

/**
 * @swagger
 * /api/companies/{id}/employee-status:
 *   patch:
 *     summary: Update employee status in company
 *     tags: [Companies]
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
 *               - employeeId
 *               - status
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               status:
 *                 type: string
 *                 enum: [inOffice, outOfService]
 *                 description: Employee status
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 */
router.patch('/:id/employee-status', auth, updateEmployeeStatus);

module.exports = router;