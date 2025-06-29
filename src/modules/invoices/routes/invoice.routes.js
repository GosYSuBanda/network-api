const express = require('express');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Gestión de facturas y documentos financieros
 */

/**
 * @swagger
 * /api/invoices/stats:
 *   get:
 *     summary: Obtener estadísticas de facturas
 *     description: Obtiene estadísticas sobre el estado financiero de las facturas
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: Estadísticas de facturas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalInvoices:
 *                           type: number
 *                           example: 250
 *                         totalAmount:
 *                           type: number
 *                           example: 125000.50
 *                         pendingAmount:
 *                           type: number
 *                           example: 45000.25
 *                         overdueCount:
 *                           type: number
 *                           example: 15
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * @swagger
 * /api/invoices/overdue:
 *   get:
 *     summary: Obtener facturas vencidas
 *     description: Lista todas las facturas que han superado su fecha de vencimiento
 *     tags: [Invoices]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de facturas vencidas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 */
router.get('/overdue', invoiceController.getOverdueInvoices);

/**
 * @swagger
 * /api/invoices/code/{code}:
 *   get:
 *     summary: Buscar factura por código
 *     description: Busca una factura específica usando su código único
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único de la factura
 *         example: "INV-2024-001"
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/code/:code', invoiceController.getInvoiceByCode);

/**
 * @swagger
 * /api/invoices/company/{ruc}:
 *   get:
 *     summary: Obtener facturas por empresa
 *     description: Lista todas las facturas de una empresa específica usando su RUC
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: ruc
 *         required: true
 *         schema:
 *           type: string
 *         description: RUC de la empresa
 *         example: "20123456789"
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Lista de facturas de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 */
router.get('/company/:ruc', invoiceController.getInvoicesByCompany);

/**
 * @swagger
 * /api/invoices/{id}/pay:
 *   patch:
 *     summary: Marcar factura como pagada
 *     description: Actualiza el estado de una factura a "pagada" y registra la fecha de pago
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura marcada como pagada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/pay', invoiceController.markAsPaid);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Obtener todas las facturas
 *     description: Lista todas las facturas con paginación y filtros
 *     tags: [Invoices]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue]
 *         description: Filtrar por estado de la factura
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 *   post:
 *     summary: Crear nueva factura
 *     description: Crea una nueva factura en el sistema
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - total
 *               - netAmount
 *               - igvAmount
 *               - company
 *             properties:
 *               code:
 *                 type: string
 *                 example: "INV-2024-002"
 *               total:
 *                 type: number
 *                 example: 1180.00
 *               netAmount:
 *                 type: number
 *                 example: 1000.00
 *               igvAmount:
 *                 type: number
 *                 example: 180.00
 *               file:
 *                 type: string
 *                 example: "invoice_002.pdf"
 *               installments:
 *                 type: number
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [pending, paid, overdue]
 *                 example: "pending"
 *               company:
 *                 type: object
 *                 required:
 *                   - name
 *                   - ruc
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Empresa S.A.C."
 *                   ruc:
 *                     type: string
 *                     example: "20123456789"
 *                   address:
 *                     type: string
 *                     example: "Av. Principal 123"
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 */
router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     description: Obtiene una factura específica por su ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Actualizar factura
 *     description: Actualiza una factura existente
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               total:
 *                 type: number
 *               netAmount:
 *                 type: number
 *               igvAmount:
 *                 type: number
 *               file:
 *                 type: string
 *               installments:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, paid, overdue]
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   ruc:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Invoice'
 *   delete:
 *     summary: Eliminar factura
 *     description: Elimina una factura del sistema
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router; 