/**
 * Guide Controller
 * Controller untuk mengelola panduan keselamatan berlayar
 */

const guideService = require("../services/guideService");

class GuideController {
  /**
   * CRUD Operations untuk Guides (Admin only)
   */

  // Create guide
  async createGuide(req, res) {
    try {
      const guideData = req.body;
      const createdBy = req.user?.uid || null;

      const guide = await guideService.createGuide(guideData, createdBy);

      res.status(201).json({
        success: true,
        message: "Guide created successfully",
        data: guide.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get all guides
  async getAllGuides(req, res) {
    try {
      const filters = {
        category: req.query.category,
        is_active:
          req.query.is_active !== undefined
            ? req.query.is_active === "true"
            : undefined,
        is_mandatory:
          req.query.is_mandatory !== undefined
            ? req.query.is_mandatory === "true"
            : undefined,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order,
        limit: req.query.limit,
        start_after: req.query.start_after,
      };

      const result = await guideService.getAllGuides(filters);

      res.json({
        success: true,
        data: {
          guides: result.guides.map((guide) => guide.toJSON()),
          total: result.total,
          filters: result.filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get guide by ID
  async getGuideById(req, res) {
    try {
      const { guideId } = req.params;
      const guide = await guideService.getGuideById(guideId);

      res.json({
        success: true,
        data: guide.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update guide
  async updateGuide(req, res) {
    try {
      const { guideId } = req.params;
      const updateData = req.body;

      const guide = await guideService.updateGuide(guideId, updateData);

      res.json({
        success: true,
        message: "Guide updated successfully",
        data: guide.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Delete guide
  async deleteGuide(req, res) {
    try {
      const { guideId } = req.params;
      const result = await guideService.deleteGuide(guideId);

      res.json({
        success: true,
        message: result.message,
        data: result.deleted_guide,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Guide Session Operations (User)
   */

  // Start new session dengan trip info
  async startSession(req, res) {
    try {
      const userId = req.user.uid;
      const tripInfo = req.body;

      const session = await guideService.createOrUpdateSession(
        userId,
        tripInfo
      );

      res.status(201).json({
        success: true,
        message: "Guide session started successfully",
        data: session.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get active session
  async getActiveSession(req, res) {
    try {
      const userId = req.user.uid;
      const session = await guideService.getActiveSession(userId);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: "No active session found",
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data: session.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Generate checklist berdasarkan trip info
  async generateChecklist(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.uid;

      // Verify session belongs to user
      const session = await guideService.getSessionById(sessionId);
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied to this session",
          timestamp: new Date().toISOString(),
        });
      }

      const checklist = await guideService.generateChecklist(sessionId);

      res.json({
        success: true,
        message: "Checklist generated successfully",
        data: checklist,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("expired")
        ? 410
        : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update checklist item progress
  async updateChecklistProgress(req, res) {
    try {
      const { sessionId, guideId } = req.params;
      const { is_completed } = req.body;
      const userId = req.user.uid;

      // Verify session belongs to user
      const session = await guideService.getSessionById(sessionId);
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied to this session",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await guideService.updateChecklistProgress(
        sessionId,
        guideId,
        is_completed
      );

      res.json({
        success: true,
        message: `Checklist item ${is_completed ? "completed" : "unchecked"}`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("expired")
        ? 410
        : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get summary dengan video URLs
  async getSummary(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.uid;

      // Verify session belongs to user
      const session = await guideService.getSessionById(sessionId);
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied to this session",
          timestamp: new Date().toISOString(),
        });
      }

      const summary = await guideService.getSummary(sessionId);

      res.json({
        success: true,
        message: "Summary retrieved successfully",
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("not completed")
        ? 400
        : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Complete session
  async completeSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.uid;

      // Verify session belongs to user
      const session = await guideService.getSessionById(sessionId);
      if (session.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied to this session",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await guideService.completeSession(sessionId);

      res.json({
        success: true,
        message: "Session completed successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get user sessions history
  async getUserSessions(req, res) {
    try {
      const userId = req.user.uid;
      const filters = {
        status: req.query.status,
        limit: req.query.limit,
      };

      const result = await guideService.getUserSessions(userId, filters);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Statistics & Utility
   */

  // Get statistics (Admin only)
  async getStatistics(req, res) {
    try {
      const stats = await guideService.getStatistics();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get session by ID (untuk debugging/admin)
  async getSessionById(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await guideService.getSessionById(sessionId);

      res.json({
        success: true,
        data: session.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new GuideController();
