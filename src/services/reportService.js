const { db } = require("../config/firebase");
const Report = require("../models/Report");

class ReportService {
  constructor() {
    // Lazy initialization untuk collections
    this._collection = null;
    this._votesCollection = null;
  }

  get collection() {
    if (!this._collection) {
      this._collection = db.collection("reports");
    }
    return this._collection;
  }

  get votesCollection() {
    if (!this._votesCollection) {
      this._votesCollection = db.collection("report_votes");
    }
    return this._votesCollection;
  }

  /**
   * Create a new report
   */
  async createReport(reportData) {
    try {
      const report = new Report(reportData);
      const validation = report.validate();

      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      // Set expiration time if not provided (default 24 hours)
      if (!report.valid_until) {
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 24);
        report.valid_until = expirationTime.toISOString();
      }

      const docRef = await this.collection.add(report.toFirestore());
      report.id = docRef.id;

      console.log(`Report created: ${report.id}`);
      return report;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId) {
    try {
      const doc = await this.collection.doc(reportId).get();

      if (!doc.exists) {
        return null;
      }

      const report = Report.fromFirestore(doc);

      // Increment view count
      report.incrementViewCount();
      await this.collection.doc(reportId).update({
        view_count: report.view_count,
        updated_at: report.updated_at,
      });

      return report;
    } catch (error) {
      console.error("Error getting report:", error);
      throw error;
    }
  }

  /**
   * Update report
   */
  async updateReport(reportId, updateData, userId) {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      if (!report.canEdit(userId)) {
        throw new Error("Unauthorized to update report");
      }

      const updatedReport = new Report({ ...report, ...updateData });
      const validation = updatedReport.validate();

      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      await this.collection.doc(reportId).update(updatedReport.toFirestore());

      console.log(`Report updated: ${reportId}`);
      return updatedReport;
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(reportId, userId, userRole = "member") {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      if (!report.canEdit(userId, userRole)) {
        throw new Error("Unauthorized to delete report");
      }

      // Soft delete
      await this.collection.doc(reportId).update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      });

      console.log(`Report deleted: ${reportId}`);
      return true;
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }

  /**
   * Search reports
   */
  async searchReports(filters = {}) {
    try {
      let query = this.collection.where("status", "==", "active");

      // Apply filters
      if (filters.community_id) {
        query = query.where("community_id", "==", filters.community_id);
      }

      if (filters.author_id) {
        query = query.where("author_id", "==", filters.author_id);
      }

      if (filters.urgency_level) {
        query = query.where("urgency_level", "==", filters.urgency_level);
      }

      if (filters.verification_status) {
        query = query.where(
          "verification.status",
          "==",
          filters.verification_status
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.where("tags", "array-contains-any", filters.tags);
      }

      // Location-based filtering (requires geo queries - simplified version)
      if (filters.near_location && filters.radius_km) {
        // This is a simplified version. For production, use GeoFirestore or similar
        const { latitude, longitude } = filters.near_location;
        const radiusDegrees = filters.radius_km / 111; // Rough conversion

        query = query
          .where("location.latitude", ">=", latitude - radiusDegrees)
          .where("location.latitude", "<=", latitude + radiusDegrees);
      }

      // Apply ordering
      if (filters.sort_by === "votes") {
        query = query.orderBy("voting.total_votes", "desc");
      } else if (filters.sort_by === "urgency") {
        query = query.orderBy("urgency_level", "desc");
      } else if (filters.sort_by === "verification") {
        query = query.orderBy("verification.confidence_score", "desc");
      } else {
        query = query.orderBy("created_at", "desc");
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.start_after) {
        const startAfterDoc = await this.collection
          .doc(filters.start_after)
          .get();
        query = query.startAfter(startAfterDoc);
      }

      const snapshot = await query.get();
      const reports = [];

      snapshot.forEach((doc) => {
        const report = Report.fromFirestore(doc);
        // Only include valid (non-expired) reports unless specifically requested
        if (filters.include_expired || report.isValid()) {
          reports.push(report);
        }
      });

      return reports;
    } catch (error) {
      console.error("Error searching reports:", error);
      throw error;
    }
  }

  /**
   * Vote on report
   */
  async voteOnReport(reportId, userId, voteType, accuracyRating = null) {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      if (report.author_id === userId) {
        throw new Error("Cannot vote on your own report");
      }

      // Check if user already voted
      const existingVoteSnapshot = await this.votesCollection
        .where("report_id", "==", reportId)
        .where("user_id", "==", userId)
        .get();

      // Remove existing vote if any
      if (!existingVoteSnapshot.empty) {
        const batch = db.batch();
        existingVoteSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // Remove vote from report
        report.removeVote(userId);
      }

      // Add new vote if not removing
      if (voteType) {
        report.addVote(userId, voteType, accuracyRating);

        // Create vote record
        await this.votesCollection.add({
          report_id: reportId,
          user_id: userId,
          vote_type: voteType,
          accuracy_rating: accuracyRating,
          created_at: new Date().toISOString(),
        });
      }

      // Update report
      await this.collection.doc(reportId).update(report.toFirestore());

      console.log(
        `Vote ${voteType || "removed"} on report ${reportId} by user ${userId}`
      );
      return report;
    } catch (error) {
      console.error("Error voting on report:", error);
      throw error;
    }
  }

  /**
   * Verify report
   */
  async verifyReport(reportId, verifierId, status, notes = "") {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      report.verify(verifierId, status, notes);
      await this.collection.doc(reportId).update(report.toFirestore());

      console.log(`Report ${reportId} verified as ${status} by ${verifierId}`);
      return report;
    } catch (error) {
      console.error("Error verifying report:", error);
      throw error;
    }
  }

  /**
   * Add comment to report
   */
  async addComment(reportId, commentData) {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      const comment = {
        author_id: commentData.author_id,
        author_name: commentData.author_name,
        content: commentData.content,
        created_at: new Date().toISOString(),
      };

      report.addComment(comment);
      await this.collection.doc(reportId).update(report.toFirestore());

      console.log(`Comment added to report ${reportId}`);
      return report;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  /**
   * Get reports by location
   */
  async getReportsByLocation(latitude, longitude, radiusKm = 10, limit = 20) {
    try {
      // Simplified location query - for production use GeoFirestore
      const radiusDegrees = radiusKm / 111;

      const snapshot = await this.collection
        .where("status", "==", "active")
        .where("location.latitude", ">=", latitude - radiusDegrees)
        .where("location.latitude", "<=", latitude + radiusDegrees)
        .orderBy("created_at", "desc")
        .limit(limit)
        .get();

      const reports = [];
      snapshot.forEach((doc) => {
        const report = Report.fromFirestore(doc);

        // Additional longitude filtering and distance calculation
        const lonDiff = Math.abs(report.location.longitude - longitude);
        if (lonDiff <= radiusDegrees && report.isValid()) {
          reports.push(report);
        }
      });

      return reports;
    } catch (error) {
      console.error("Error getting reports by location:", error);
      throw error;
    }
  }

  /**
   * Get report statistics for community
   */
  async getCommunityReportStats(communityId) {
    try {
      const snapshot = await this.collection
        .where("community_id", "==", communityId)
        .where("status", "==", "active")
        .get();

      const stats = {
        total_reports: 0,
        verified_reports: 0,
        pending_reports: 0,
        high_urgency_reports: 0,
        reports_last_24h: 0,
        average_accuracy_rating: 0,
      };

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      let totalRating = 0;
      let ratedReports = 0;

      snapshot.forEach((doc) => {
        const report = Report.fromFirestore(doc);
        stats.total_reports++;

        if (report.verification.status === "verified") {
          stats.verified_reports++;
        } else if (report.verification.status === "pending") {
          stats.pending_reports++;
        }

        if (
          report.urgency_level === "high" ||
          report.urgency_level === "critical"
        ) {
          stats.high_urgency_reports++;
        }

        if (new Date(report.created_at) > yesterday) {
          stats.reports_last_24h++;
        }

        if (report.voting.accuracy_rating > 0) {
          totalRating += report.voting.accuracy_rating;
          ratedReports++;
        }
      });

      if (ratedReports > 0) {
        stats.average_accuracy_rating =
          Math.round((totalRating / ratedReports) * 10) / 10;
      }

      return stats;
    } catch (error) {
      console.error("Error getting community report stats:", error);
      throw error;
    }
  }
}

module.exports = new ReportService();
