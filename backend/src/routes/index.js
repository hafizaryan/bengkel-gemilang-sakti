const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const sparepartController = require('../controllers/sparepartController');
const supplierController = require('../controllers/supplierController');
const customerController = require('../controllers/customerController');
const employeeController = require('../controllers/employeeController');
const purchaseController = require('../controllers/purchaseController');
const saleController = require('../controllers/saleController');
const payrollController = require('../controllers/payrollController');
const reportController = require('../controllers/reportController');
const crudController = require('../controllers/crudController');
const { verifyToken } = require('../middlewares/auth');

// Auth
router.post('/auth/login', authController.login);

// Spareparts
router.get('/spareparts', verifyToken, sparepartController.getAll);
router.get('/spareparts/:id', verifyToken, sparepartController.getById);
router.post('/spareparts', verifyToken, sparepartController.create);
router.put('/spareparts/:id', verifyToken, sparepartController.update);
router.delete('/spareparts/:id', verifyToken, sparepartController.remove);

// Suppliers
router.get('/suppliers', verifyToken, supplierController.getAll);
router.get('/suppliers/:id', verifyToken, supplierController.getById);
router.post('/suppliers', verifyToken, supplierController.create);
router.put('/suppliers/:id', verifyToken, supplierController.update);
router.delete('/suppliers/:id', verifyToken, supplierController.remove);

// Customers
router.get('/customers', verifyToken, customerController.getAll);
router.get('/customers/:id', verifyToken, customerController.getById);
router.post('/customers', verifyToken, customerController.create);
router.put('/customers/:id', verifyToken, customerController.update);
router.delete('/customers/:id', verifyToken, customerController.remove);

// Employees
router.get('/employees', verifyToken, employeeController.getAll);
router.get('/employees/:id', verifyToken, employeeController.getById);
router.post('/employees', verifyToken, employeeController.create);
router.put('/employees/:id', verifyToken, employeeController.update);
router.delete('/employees/:id', verifyToken, employeeController.remove);

// Purchases
router.get('/purchases', verifyToken, purchaseController.getAll);
router.get('/purchases/:id', verifyToken, purchaseController.getById);
router.post('/purchases', verifyToken, purchaseController.create);
router.delete('/purchases/:id', verifyToken, purchaseController.remove);

// Sales
router.get('/sales', verifyToken, saleController.getAll);
router.get('/sales/:id', verifyToken, saleController.getById);
router.post('/sales', verifyToken, saleController.create);
router.delete('/sales/:id', verifyToken, saleController.remove);

// Payrolls
router.get('/payrolls', verifyToken, payrollController.getAll);
router.get('/payrolls/:id', verifyToken, payrollController.getById);
router.post('/payrolls', verifyToken, payrollController.create);
router.delete('/payrolls/:id', verifyToken, payrollController.remove);
router.get('/payroll-employees', verifyToken, payrollController.getEmployeesForPayroll);

// Reports
router.get('/reports/summary', verifyToken, reportController.getSummary);
router.get('/reports/services', verifyToken, reportController.getServiceReport);
router.get('/reports/purchases', verifyToken, reportController.getPurchaseReport);
router.get('/reports/stock', verifyToken, reportController.getStockReport);

// Generic CRUD (services, motorcycles)
const genericTables = ['services', 'motorcycles'];
genericTables.forEach(table => {
  router.get(`/${table}`, verifyToken, crudController.getAll(table));
  router.get(`/${table}/:id`, verifyToken, crudController.getById(table));
  router.post(`/${table}`, verifyToken, crudController.create(table));
  router.put(`/${table}/:id`, verifyToken, crudController.update(table));
  router.delete(`/${table}/:id`, verifyToken, crudController.remove(table));
});

module.exports = router;
