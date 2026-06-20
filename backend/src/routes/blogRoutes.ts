import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { blogCreateSchema } from 'shared';

const router = Router();

const parseBlog = (blog: any) => {
  if (!blog) return null;
  return {
    ...blog,
    tags: blog.tags ? JSON.parse(blog.tags) : []
  };
};

// GET /api/blogs (Public)
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;

    const whereClause: any = {};
    
    // Public users can only see PUBLISHED blogs
    whereClause.status = (status as string) || 'PUBLISHED';

    if (category) {
      whereClause.category = category as string;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { summary: { contains: search as string } },
        { content: { contains: search as string } }
      ];
    }

    const list = await db.blog.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    return res.json(list.map(parseBlog));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/:slug (Public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await db.blog.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    return res.json(parseBlog(blog));
  } catch (error) {
    console.error('Error fetching blog details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/blogs (Advisor/Admin only)
router.post('/', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = blogCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.errors });
    }

    const { title, content, summary, category, tags, status, publishedAt, seoTitle, seoDescription, seoKeywords } = parsed.data;

    // Generate unique slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await db.blog.findUnique({ where: { slug } });
    if (exists) {
      return res.status(400).json({ message: 'A blog with a similar title already exists' });
    }

    const blog = await db.blog.create({
      data: {
        slug,
        title,
        content,
        summary,
        category,
        tags: JSON.stringify(tags || []),
        status,
        authorId: req.user!.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : publishedAt ? new Date(publishedAt) : null,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary,
        seoKeywords
      }
    });

    return res.status(201).json(parseBlog(blog));
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/blogs/:id (Advisor/Admin only)
router.put('/:id', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, summary, category, tags, status, publishedAt, seoTitle, seoDescription, seoKeywords } = req.body;

    const exists = await db.blog.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updated = await db.blog.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        summary,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        status,
        publishedAt: status === 'PUBLISHED' && exists.status !== 'PUBLISHED' ? new Date() : publishedAt ? new Date(publishedAt) : undefined,
        seoTitle,
        seoDescription,
        seoKeywords
      }
    });

    return res.json(parseBlog(updated));
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/blogs/:id (Advisor/Admin only)
router.delete('/:id', authenticateJWT, requireRole(['ADVISOR', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const exists = await db.blog.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await db.blog.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
