import { Router } from 'express';
import CustomerController from '../controllers/CustomerController';
import verify from '../middleware/verify';

const router = Router();
router.post('/', CustomerController.createCustomer);
router.post('/login', CustomerController.customerLogin);
router.get('/', verify, CustomerController.getAllCustomers);
router.get('/:id', verify, CustomerController.getOneCustomer);
router.put('/:id', CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);

export default router;
