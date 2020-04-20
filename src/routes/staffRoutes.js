import { Router } from 'express';
import StaffController from '../controllers/StaffController';
import verify from '../middleware/verify';

const router = Router();
router.post('/', StaffController.createStaff);
router.post('/login', StaffController.staffLogin);
router.get('/', verify, StaffController.getAllStaff);
router.get('/me', verify, StaffController.getOneStaff);
router.put('/:id', verify, StaffController.updateStaff);
router.delete('/:id', verify, StaffController.deleteStaff);

export default router;
