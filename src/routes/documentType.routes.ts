import { Router } from 'express';
import { getDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } from '../controllers/documentType.controller';
import { isAuth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin.middleware';

const router = Router();

router.use(isAuth);

router.get('/', getDocumentTypes);
router.post('/', isAdmin, createDocumentType);
router.put('/:id', isAdmin, updateDocumentType);
router.delete('/:id', isAdmin, deleteDocumentType);

export default router;
