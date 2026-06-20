import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

const parseCategory = (cat: any) => {
  if (!cat) return null;
  return {
    ...cat,
    benefits: cat.benefits ? JSON.parse(cat.benefits) : [],
    whoShouldBuy: cat.whoShouldBuy ? JSON.parse(cat.whoShouldBuy) : '',
    eligibility: cat.eligibility ? JSON.parse(cat.eligibility) : {},
    myths: cat.myths ? JSON.parse(cat.myths) : [],
    faqs: cat.faqs ? JSON.parse(cat.faqs) : [],
    documentsRequired: cat.documentsRequired ? JSON.parse(cat.documentsRequired) : [],
    thingsToConsider: cat.thingsToConsider ? JSON.parse(cat.thingsToConsider) : [],
  };
};

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const list = await db.insuranceCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(list.map(parseCategory));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const cat = await db.insuranceCategory.findUnique({
      where: { slug: req.params.slug },
    });
    if (!cat) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.json(parseCategory(cat));
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/categories (Admin only)
router.post('/', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      overview,
      benefits,
      whoShouldBuy,
      eligibility,
      myths,
      faqs,
      documentsRequired,
      claimProcess,
      thingsToConsider,
    } = req.body;

    if (!name || !slug || !overview) {
      return res.status(400).json({ message: 'Name, slug and overview are required' });
    }

    const exists = await db.insuranceCategory.findUnique({ where: { slug } });
    if (exists) {
      return res.status(400).json({ message: 'Category slug already exists' });
    }

    const cat = await db.insuranceCategory.create({
      data: {
        name,
        slug,
        overview,
        benefits: JSON.stringify(benefits || []),
        whoShouldBuy: JSON.stringify(whoShouldBuy || ''),
        eligibility: JSON.stringify(eligibility || {}),
        myths: JSON.stringify(myths || []),
        faqs: JSON.stringify(faqs || []),
        documentsRequired: JSON.stringify(documentsRequired || []),
        claimProcess: claimProcess || '',
        thingsToConsider: JSON.stringify(thingsToConsider || []),
      },
    });

    return res.status(201).json(parseCategory(cat));
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/categories/:id (Admin only)
router.put('/:id', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      overview,
      benefits,
      whoShouldBuy,
      eligibility,
      myths,
      faqs,
      documentsRequired,
      claimProcess,
      thingsToConsider,
    } = req.body;

    const exists = await db.insuranceCategory.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const cat = await db.insuranceCategory.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        overview,
        benefits: benefits ? JSON.stringify(benefits) : undefined,
        whoShouldBuy: whoShouldBuy ? JSON.stringify(whoShouldBuy) : undefined,
        eligibility: eligibility ? JSON.stringify(eligibility) : undefined,
        myths: myths ? JSON.stringify(myths) : undefined,
        faqs: faqs ? JSON.stringify(faqs) : undefined,
        documentsRequired: documentsRequired ? JSON.stringify(documentsRequired) : undefined,
        claimProcess,
        thingsToConsider: thingsToConsider ? JSON.stringify(thingsToConsider) : undefined,
      },
    });

    return res.json(parseCategory(cat));
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/categories/:id (Admin only)
router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const exists = await db.insuranceCategory.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await db.insuranceCategory.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
