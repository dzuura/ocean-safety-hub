const reportService = require("../services/reportService");
const communityService = require("../services/communityService");

class ReportController {
  
  // Membuat laporan baru
  createReport = async (req, res) => {
    try {
      const {
        community_id,
        title,
        description,
        location,
        conditions,
        safety_assessment,
        media = { photos: [], videos: [] },
        tags = [],
        urgency_level = "normal",
        valid_until,
      } = req.body;

      const userId = req.user.uid;
      const userName = req.user.name || req.user.email;

      // Verifikasi pengguna adalah anggota komunitas
      const community = await communityService.getCommunityById(community_id);
      if (!community) {
        return res.status(404).json({
          success: false,
          error: "Komunitas tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      if (!community.isMember(userId)) {
        return res.status(403).json({
          success: false,
          error: "Anda harus menjadi anggota komunitas untuk membuat laporan",
          timestamp: new Date().toISOString(),
        });
      }

      const reportData = {
        community_id,
        author_id: userId,
        author_name: userName,
        title,
        description,
        location,
        conditions,
        safety_assessment,
        media,
        tags,
        urgency_level,
        valid_until,
      };

      const report = await reportService.createReport(reportData);

      res.status(201).json({
        success: true,
        message: "Laporan berhasil dibuat",
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in createReport:", error);
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan detail laporan
  getReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user?.uid;

      const report = await reportService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Laporan tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user has access to this report
      if (userId) {
        const community = await communityService.getCommunityById(
          report.community_id
        );
        if (community && !community.is_public && !community.isMember(userId)) {
          return res.status(403).json({
            success: false,
            error: "Akses ditolak",
            timestamp: new Date().toISOString(),
          });
        }
      }

      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getReport:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil laporan",
        timestamp: new Date().toISOString(),
      });
    }
  };

  
  // Update laporan
  updateReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user.uid;
      const updateData = req.body;

      const report = await reportService.updateReport(
        reportId,
        updateData,
        userId
      );

      res.json({
        success: true,
        message: "Laporan berhasil diperbarui",
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in updateReport:", error);
      const statusCode = error.message.includes("Unauthorized")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Hapus laporan
  deleteReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const userId = req.user.uid;

      const report = await reportService.getReportById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Laporan tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      const community = await communityService.getCommunityById(
        report.community_id
      );
      const userRole = community
        ? this.getUserRole(community, userId)
        : "member";

      await reportService.deleteReport(reportId, userId, userRole);

      res.json({
        success: true,
        message: "Laporan berhasil dihapus",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in deleteReport:", error);
      const statusCode = error.message.includes("Unauthorized")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Cari laporan
  searchReports = async (req, res) => {
    try {
      const {
        community_id,
        author_id,
        urgency_level,
        verification_status,
        tags,
        near_lat,
        near_lng,
        radius_km = 10,
        sort_by = "created_at",
        limit = 20,
        start_after,
        include_expired = false,
      } = req.query;

      const filters = {
        sort_by,
        limit: parseInt(limit),
        start_after,
        include_expired: include_expired === "true",
      };

      if (community_id) filters.community_id = community_id;
      if (author_id) filters.author_id = author_id;
      if (urgency_level) filters.urgency_level = urgency_level;
      if (verification_status)
        filters.verification_status = verification_status;
      if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

      if (near_lat && near_lng) {
        filters.near_location = {
          latitude: parseFloat(near_lat),
          longitude: parseFloat(near_lng),
        };
        filters.radius_km = parseFloat(radius_km);
      }

      const reports = await reportService.searchReports(filters);

      res.json({
        success: true,
        data: {
          reports,
          total: reports.length,
          filters: filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in searchReports:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mencari laporan",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Vote laporan
  voteOnReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { vote_type, accuracy_rating } = req.body;
      const userId = req.user.uid;

      // Validate vote_type
      if (vote_type && !["up", "down"].includes(vote_type)) {
        return res.status(400).json({
          success: false,
          error: 'Jenis vote tidak valid. Gunakan "up" atau "down"',
          timestamp: new Date().toISOString(),
        });
      }

      // Validate accuracy_rating
      if (accuracy_rating && (accuracy_rating < 1 || accuracy_rating > 5)) {
        return res.status(400).json({
          success: false,
          error: "Rating akurasi harus antara 1-5",
          timestamp: new Date().toISOString(),
        });
      }

      const report = await reportService.voteOnReport(
        reportId,
        userId,
        vote_type,
        accuracy_rating
      );

      res.json({
        success: true,
        message: vote_type
          ? `Vote ${vote_type} berhasil`
          : "Vote berhasil dihapus",
        data: {
          report_id: reportId,
          voting: report.voting,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in voteOnReport:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Cannot vote")
        ? 403
        : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Verifikasi laporan
  verifyReport = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status, notes = "" } = req.body;
      const userId = req.user.uid;

      // Validate status
      const validStatuses = ["verified", "disputed", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status verifikasi tidak valid",
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user has permission to verify (moderator or admin)
      const report = await reportService.getReportById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: "Laporan tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      const community = await communityService.getCommunityById(
        report.community_id
      );
      if (
        !community ||
        (!community.isModerator(userId) && !community.isAdmin(userId))
      ) {
        return res.status(403).json({
          success: false,
          error: "Hanya moderator atau admin yang dapat memverifikasi laporan",
          timestamp: new Date().toISOString(),
        });
      }

      const verifiedReport = await reportService.verifyReport(
        reportId,
        userId,
        status,
        notes
      );

      res.json({
        success: true,
        message: `Laporan berhasil ${
          status === "verified"
            ? "diverifikasi"
            : status === "disputed"
            ? "disengketakan"
            : "ditolak"
        }`,
        data: verifiedReport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in verifyReport:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat memverifikasi laporan",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Tambah komentar
  addComment = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { content } = req.body;
      const userId = req.user.uid;
      const userName = req.user.name || req.user.email;

      if (!content || content.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: "Komentar minimal 5 karakter",
          timestamp: new Date().toISOString(),
        });
      }

      const commentData = {
        author_id: userId,
        author_name: userName,
        content: content.trim(),
      };

      const report = await reportService.addComment(reportId, commentData);

      res.status(201).json({
        success: true,
        message: "Komentar berhasil ditambahkan",
        data: {
          report_id: reportId,
          comments: report.comments,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in addComment:", error);
      const statusCode = error.message.includes("not found") ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan laporan berdasarkan lokasi
  getReportsByLocation = async (req, res) => {
    try {
      const { latitude, longitude, radius_km = 10, limit = 20 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: "Latitude dan longitude diperlukan",
          timestamp: new Date().toISOString(),
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radius = parseFloat(radius_km);
      const maxLimit = parseInt(limit);

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: "Koordinat tidak valid",
          timestamp: new Date().toISOString(),
        });
      }

      const reports = await reportService.getReportsByLocation(
        lat,
        lng,
        radius,
        maxLimit
      );

      res.json({
        success: true,
        data: {
          reports,
          total: reports.length,
          location: { latitude: lat, longitude: lng },
          radius_km: radius,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getReportsByLocation:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil laporan berdasarkan lokasi",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan statistik laporan komunitas
  getCommunityReportStats = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user?.uid;

      // Check if user has access to community stats
      if (userId) {
        const community = await communityService.getCommunityById(communityId);
        if (!community) {
          return res.status(404).json({
            success: false,
            error: "Komunitas tidak ditemukan",
            timestamp: new Date().toISOString(),
          });
        }

        if (!community.is_public && !community.isMember(userId)) {
          return res.status(403).json({
            success: false,
            error: "Akses ditolak",
            timestamp: new Date().toISOString(),
          });
        }
      }

      const stats = await reportService.getCommunityReportStats(communityId);

      res.json({
        success: true,
        data: {
          community_id: communityId,
          statistics: stats,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getCommunityReportStats:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil statistik laporan",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan role pengguna
  getUserRole(community, userId) {
    if (community.isAdmin(userId)) return "admin";
    if (community.isModerator(userId)) return "moderator";
    if (community.isMember(userId)) return "member";
    return null;
  }
}

module.exports = new ReportController();
