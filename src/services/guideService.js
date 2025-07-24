/**
 * Guide Service
 * Service untuk mengelola panduan keselamatan berlayar
 */

const { db } = require("../config/firebase");
const Guide = require("../models/Guide");
const GuideSession = require("../models/GuideSession");

class GuideService {
  constructor() {
    // Lazy initialization untuk collections
    this._guidesCollection = null;
    this._sessionsCollection = null;
  }

  get guidesCollection() {
    if (!this._guidesCollection) {
      this._guidesCollection = db.collection("guides");
    }
    return this._guidesCollection;
  }

  get sessionsCollection() {
    if (!this._sessionsCollection) {
      this._sessionsCollection = db.collection("guide_sessions");
    }
    return this._sessionsCollection;
  }

  /**
   * CRUD Operations untuk Guides
   */

  // Create guide
  async createGuide(guideData, createdBy = null) {
    try {
      const guide = new Guide({
        ...guideData,
        created_by: createdBy,
      });

      const validation = guide.validate();
      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      const docRef = await this.guidesCollection.add(guide.toFirestore());
      guide.id = docRef.id;

      return guide;
    } catch (error) {
      throw new Error(`Failed to create guide: ${error.message}`);
    }
  }

  // Get all guides dengan filter
  async getAllGuides(filters = {}) {
    try {
      let query = this.guidesCollection;

      // Apply filters
      if (filters.category) {
        query = query.where("category", "==", filters.category);
      }

      if (filters.is_active !== undefined) {
        query = query.where("is_active", "==", filters.is_active);
      }

      if (filters.is_mandatory !== undefined) {
        query = query.where("is_mandatory", "==", filters.is_mandatory);
      }

      // Sorting
      const sortBy = filters.sort_by || "priority";
      const sortOrder = filters.sort_order || "asc";
      query = query.orderBy(sortBy, sortOrder);

      // Pagination
      if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
      }

      if (filters.start_after) {
        const startAfterDoc = await this.guidesCollection
          .doc(filters.start_after)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      const snapshot = await query.get();
      const guides = snapshot.docs.map((doc) => Guide.fromFirestore(doc));

      return {
        guides,
        total: guides.length,
        filters: {
          category: filters.category,
          is_active: filters.is_active,
          is_mandatory: filters.is_mandatory,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get guides: ${error.message}`);
    }
  }

  // Get guide by ID
  async getGuideById(guideId) {
    try {
      const doc = await this.guidesCollection.doc(guideId).get();

      if (!doc.exists) {
        throw new Error("Guide not found");
      }

      return Guide.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Failed to get guide: ${error.message}`);
    }
  }

  // Update guide
  async updateGuide(guideId, updateData) {
    try {
      const existingGuide = await this.getGuideById(guideId);

      const updatedGuide = new Guide({
        ...existingGuide,
        ...updateData,
        id: guideId,
      });

      const validation = updatedGuide.validate();
      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      await this.guidesCollection
        .doc(guideId)
        .update(updatedGuide.toFirestore());

      return updatedGuide;
    } catch (error) {
      throw new Error(`Failed to update guide: ${error.message}`);
    }
  }

  // Delete guide
  async deleteGuide(guideId) {
    try {
      const guide = await this.getGuideById(guideId);
      await this.guidesCollection.doc(guideId).delete();

      return {
        success: true,
        message: "Guide deleted successfully",
        deleted_guide: guide.toJSON(),
      };
    } catch (error) {
      throw new Error(`Failed to delete guide: ${error.message}`);
    }
  }

  /**
   * Guide Session Operations
   */

  // Create atau update session
  async createOrUpdateSession(userId, tripInfo) {
    try {
      // Cek apakah ada session aktif
      const existingSession = await this.getActiveSession(userId);

      if (existingSession && !existingSession.isExpired()) {
        // Update existing session
        existingSession.trip_info = tripInfo;
        existingSession.status = "form_filling";
        existingSession.updated_at = new Date().toISOString();

        await this.sessionsCollection
          .doc(existingSession.id)
          .update(existingSession.toFirestore());
        return existingSession;
      } else {
        // Create new session
        const session = new GuideSession({
          user_id: userId,
          trip_info: tripInfo,
        });

        const validation = session.validateTripInfo();
        if (!validation.isValid) {
          throw new Error(
            `Validation failed: ${JSON.stringify(validation.errors)}`
          );
        }

        const docRef = await this.sessionsCollection.add(session.toFirestore());
        session.id = docRef.id;

        return session;
      }
    } catch (error) {
      throw new Error(`Failed to create/update session: ${error.message}`);
    }
  }

  // Get active session untuk user
  async getActiveSession(userId) {
    try {
      const snapshot = await this.sessionsCollection
        .where("user_id", "==", userId)
        .where("is_active", "==", true)
        .orderBy("created_at", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return GuideSession.fromFirestore(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Failed to get active session: ${error.message}`);
    }
  }

  // Get session by ID
  async getSessionById(sessionId) {
    try {
      const doc = await this.sessionsCollection.doc(sessionId).get();

      if (!doc.exists) {
        throw new Error("Session not found");
      }

      return GuideSession.fromFirestore(doc);
    } catch (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }
  }

  // Generate checklist berdasarkan kondisi perjalanan
  async generateChecklist(sessionId) {
    try {
      const session = await this.getSessionById(sessionId);

      if (session.isExpired()) {
        throw new Error("Session has expired");
      }

      // Get all active guides
      const allGuides = await this.getAllGuides({ is_active: true });

      // Filter guides berdasarkan kondisi perjalanan
      const matchingGuides = allGuides.guides.filter((guide) =>
        guide.matchesConditions(session.trip_info)
      );

      // Sort by priority dan mandatory status
      matchingGuides.sort((a, b) => {
        if (a.is_mandatory && !b.is_mandatory) return -1;
        if (!a.is_mandatory && b.is_mandatory) return 1;
        return a.priority - b.priority;
      });

      // Update session dengan checklist items
      session.setChecklistItems(matchingGuides);
      await this.sessionsCollection
        .doc(sessionId)
        .update(session.toFirestore());

      // Return checklist format
      const checklist = matchingGuides.map((guide) => guide.toChecklistItem());

      return {
        session_id: sessionId,
        trip_info: session.trip_info,
        checklist: checklist,
        summary: {
          total_items: checklist.length,
          mandatory_items: checklist.filter((item) => item.is_mandatory).length,
          estimated_total_time: checklist.reduce(
            (sum, item) => sum + item.estimated_time_minutes,
            0
          ),
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate checklist: ${error.message}`);
    }
  }

  // Update checklist progress
  async updateChecklistProgress(sessionId, guideId, isCompleted) {
    try {
      const session = await this.getSessionById(sessionId);

      if (session.isExpired()) {
        throw new Error("Session has expired");
      }

      session.updateChecklistProgress(guideId, isCompleted);
      await this.sessionsCollection
        .doc(sessionId)
        .update(session.toFirestore());

      return {
        session_id: sessionId,
        guide_id: guideId,
        is_completed: isCompleted,
        progress: session.checklist_progress,
        status: session.status,
      };
    } catch (error) {
      throw new Error(`Failed to update checklist progress: ${error.message}`);
    }
  }

  // Get summary dengan video URLs
  async getSummary(sessionId) {
    try {
      const session = await this.getSessionById(sessionId);

      if (
        session.status !== "summary_ready" &&
        session.status !== "completed"
      ) {
        throw new Error("Checklist not completed yet");
      }

      // Get all guides yang ada di checklist
      const guideIds = session.checklist_progress.items.map(
        (item) => item.guide_id
      );
      const guides = await Promise.all(
        guideIds.map((id) => this.getGuideById(id))
      );

      // Create summary items dengan video URLs
      const summaryItems = guides.map((guide) => {
        const progressItem = session.checklist_progress.items.find(
          (item) => item.guide_id === guide.id
        );
        return {
          ...guide.toSummaryItem(),
          is_completed: progressItem?.is_completed || false,
          completed_at: progressItem?.completed_at || null,
        };
      });

      // Sort by completion status dan priority
      summaryItems.sort((a, b) => {
        if (a.is_completed && !b.is_completed) return -1;
        if (!a.is_completed && b.is_completed) return 1;
        if (a.is_mandatory && !b.is_mandatory) return -1;
        if (!a.is_mandatory && b.is_mandatory) return 1;
        return a.priority - b.priority;
      });

      return {
        session_id: sessionId,
        trip_info: session.trip_info,
        summary: session.getSummary(),
        items: summaryItems,
      };
    } catch (error) {
      throw new Error(`Failed to get summary: ${error.message}`);
    }
  }

  // Complete session
  async completeSession(sessionId) {
    try {
      const session = await this.getSessionById(sessionId);
      session.markAsCompleted();

      await this.sessionsCollection
        .doc(sessionId)
        .update(session.toFirestore());

      return {
        session_id: sessionId,
        status: session.status,
        completed_at: session.completed_at,
        summary: session.getSummary(),
      };
    } catch (error) {
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }

  // Get user sessions history
  async getUserSessions(userId, filters = {}) {
    try {
      let query = this.sessionsCollection.where("user_id", "==", userId);

      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }

      query = query.orderBy("created_at", "desc");

      if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
      }

      const snapshot = await query.get();
      const sessions = snapshot.docs.map((doc) =>
        GuideSession.fromFirestore(doc)
      );

      return {
        sessions: sessions.map((session) => session.toJSON()),
        total: sessions.length,
      };
    } catch (error) {
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }

  /**
   * Utility Methods
   */

  // Get statistics
  async getStatistics() {
    try {
      const [guidesSnapshot, sessionsSnapshot] = await Promise.all([
        this.guidesCollection.get(),
        this.sessionsCollection.get(),
      ]);

      const guides = guidesSnapshot.docs.map((doc) => Guide.fromFirestore(doc));
      const sessions = sessionsSnapshot.docs.map((doc) =>
        GuideSession.fromFirestore(doc)
      );

      return {
        guides: {
          total: guides.length,
          active: guides.filter((g) => g.is_active).length,
          by_category: this.groupByCategory(guides),
          mandatory: guides.filter((g) => g.is_mandatory).length,
        },
        sessions: {
          total: sessions.length,
          active: sessions.filter((s) => s.is_active).length,
          completed: sessions.filter((s) => s.status === "completed").length,
          by_status: this.groupByStatus(sessions),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  groupByCategory(guides) {
    return guides.reduce((acc, guide) => {
      acc[guide.category] = (acc[guide.category] || 0) + 1;
      return acc;
    }, {});
  }

  groupByStatus(sessions) {
    return sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = new GuideService();
