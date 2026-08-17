import { Request, Response } from 'express';
import { db } from '../config/database';
import { documentTypes } from '../database/schema/documentType/document_type.schema';
import { eq } from 'drizzle-orm';
import { CreateDocumentTypeSchema, UpdateDocumentTypeSchema } from '../zod/documentType.zod';
import { z } from 'zod';

export const getDocumentTypes = async (req: Request, res: Response) => {
    try {
        const types = await db.select().from(documentTypes);
        res.json({ success: true, data: types });
    } catch (error) {
        console.error('Get document types error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createDocumentType = async (req: Request, res: Response) => {
    try {
        const validatedData = CreateDocumentTypeSchema.parse(req.body);
        
        const existingCode = await db.select().from(documentTypes).where(eq(documentTypes.documentCode, validatedData.documentCode));
        if (existingCode.length > 0) {
            res.status(400).json({ success: false, message: 'already the code exist' });
            return;
        }

        const [newType] = await db.insert(documentTypes).values(validatedData).returning();
        res.status(201).json({ success: true, data: newType });
    } catch (error: any) {
        console.error('Create document type error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
        } else if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'already the code exist' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};

export const updateDocumentType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validatedData = UpdateDocumentTypeSchema.parse(req.body);
        
        const existingCode = await db.select().from(documentTypes).where(eq(documentTypes.documentCode, validatedData.documentCode));
        if (existingCode.length > 0 && existingCode[0].id !== Number(id)) {
            res.status(400).json({ success: false, message: 'already the code exist' });
            return;
        }

        const [updatedType] = await db.update(documentTypes)
            .set(validatedData)
            .where(eq(documentTypes.id, Number(id)))
            .returning();
            
        if (!updatedType) {
            res.status(404).json({ success: false, message: 'Document type not found' });
            return;
        }
        
        res.json({ success: true, data: updatedType });
    } catch (error: any) {
        console.error('Update document type error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
        } else if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'already the code exist' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};

export const deleteDocumentType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [deletedType] = await db.delete(documentTypes)
            .where(eq(documentTypes.id, Number(id)))
            .returning();
            
        if (!deletedType) {
            res.status(404).json({ success: false, message: 'Document type not found' });
            return;
        }
        
        res.json({ success: true, message: 'Document type deleted successfully' });
    } catch (error: any) {
        console.error('Delete document type error:', error);
        if (error.code === '23503') {
            res.status(400).json({ success: false, message: 'Cannot delete document type because it is in use' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
