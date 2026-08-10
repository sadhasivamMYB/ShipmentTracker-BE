import { Request, Response } from 'express';
import { db } from '../config/database';
import { documentTypes } from '../database/schema/documentType/document_type.schema';
import { eq } from 'drizzle-orm';

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
        const { name, documentCode, description, status } = req.body;
        const [newType] = await db.insert(documentTypes).values({
            name,
            documentCode,
            description,
            status: status || 'active'
        }).returning();
        res.status(201).json({ success: true, data: newType });
    } catch (error: any) {
        console.error('Create document type error:', error);
        if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'Name or Document Code already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};

export const updateDocumentType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, documentCode, description, status } = req.body;
        
        const [updatedType] = await db.update(documentTypes)
            .set({ name, documentCode, description, status })
            .where(eq(documentTypes.id, Number(id)))
            .returning();
            
        if (!updatedType) {
            res.status(404).json({ success: false, message: 'Document type not found' });
            return;
        }
        
        res.json({ success: true, data: updatedType });
    } catch (error: any) {
        console.error('Update document type error:', error);
        if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'Name or Document Code already exists' });
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
