const communityService = require("../services/communityService");

class CommunityController {
  
  // Membuat komunitas baru
  createCommunity = async (req, res) => {
    try {
      const {
        name,
        description,
        location,
        is_public = true,
        join_approval_required = false,
        tags = [],
        rules = [],
      } = req.body;

      const userId = req.user.uid;
      const userName = req.user.name || req.user.email;

      const communityData = {
        name,
        description,
        location,
        admin_id: userId,
        is_public,
        join_approval_required,
        tags,
        rules,
      };

      const community = await communityService.createCommunity(communityData);

      res.status(201).json({
        success: true,
        message: "Komunitas berhasil dibuat",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in createCommunity:", error);
      res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Mendapatkan detail komunitas
  getCommunity = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user?.uid;

      const community = await communityService.getCommunityById(communityId);

      if (!community) {
        return res.status(404).json({
          success: false,
          error: "Komunitas tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      // Cek apakah komunitas privat dan pengguna bukan anggota
      if (!community.is_public && userId && !community.isMember(userId)) {
        return res.status(403).json({
          success: false,
          error: "Akses ditolak. Komunitas ini bersifat privat.",
          timestamp: new Date().toISOString(),
        });
      }

      // Ambil anggota jika komunitas publik atau pengguna adalah anggota
      let members = [];
      if (community.is_public || (userId && community.isMember(userId))) {
        members = await communityService.getCommunityMembers(communityId);
      }

      res.json({
        success: true,
        data: {
          ...community,
          members: members,
          user_role: userId ? this.getUserRole(community, userId) : null,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getCommunity:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil data komunitas",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Update komunitas
  updateCommunity = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user.uid;
      const updateData = req.body;

      const community = await communityService.updateCommunity(
        communityId,
        updateData,
        userId
      );

      res.json({
        success: true,
        message: "Komunitas berhasil diperbarui",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in updateCommunity:", error);
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

  // Hapus komunitas
  deleteCommunity = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user.uid;

      await communityService.deleteCommunity(communityId, userId);

      res.json({
        success: true,
        message: "Komunitas berhasil dihapus",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in deleteCommunity:", error);
      const statusCode = error.message.includes("Only admin")
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

  // Cari komunitas
  searchCommunities = async (req, res) => {
    try {
      const {
        q: searchQuery,
        region,
        tags,
        is_public,
        sort_by = "created_at",
        limit = 20,
        start_after,
      } = req.query;

      const filters = {
        sort_by,
        limit: parseInt(limit),
        start_after,
      };

      if (region) filters.region = region;
      if (is_public !== undefined) filters.is_public = is_public === "true";
      if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

      const communities = await communityService.searchCommunities(filters);

      // Filter by search query if provided (simple text search)
      let filteredCommunities = communities;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredCommunities = communities.filter(
          (community) =>
            community.name.toLowerCase().includes(query) ||
            community.description.toLowerCase().includes(query) ||
            community.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      res.json({
        success: true,
        data: {
          communities: filteredCommunities,
          total: filteredCommunities.length,
          filters: filters,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in searchCommunities:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mencari komunitas",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Bergabung dengan komunitas
  joinCommunity = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user.uid;

      const community = await communityService.joinCommunity(
        communityId,
        userId
      );

      res.json({
        success: true,
        message: "Berhasil bergabung dengan komunitas",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in joinCommunity:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("already a member")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Keluar dari komunitas
  leaveCommunity = async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user.uid;

      const community = await communityService.leaveCommunity(
        communityId,
        userId
      );

      res.json({
        success: true,
        message: "Berhasil keluar dari komunitas",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in leaveCommunity:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Admin cannot leave")
        ? 403
        : 400;

      res.status(statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Daftar komunitas yang diikuti pengguna
  getUserCommunities = async (req, res) => {
    try {
      const userId = req.user.uid;

      const communities = await communityService.getUserCommunities(userId);

      res.json({
        success: true,
        data: {
          communities,
          total: communities.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getUserCommunities:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil komunitas pengguna",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Daftar anggota komunitas
  getCommunityMembers = async (req, res) => {
    try {
      const { communityId } = req.params;
      const { limit = 50 } = req.query;
      const userId = req.user?.uid;

      const community = await communityService.getCommunityById(communityId);

      if (!community) {
        return res.status(404).json({
          success: false,
          error: "Komunitas tidak ditemukan",
          timestamp: new Date().toISOString(),
        });
      }

      // Cek apakah komunitas privat dan pengguna bukan anggota
      if (!community.is_public && (!userId || !community.isMember(userId))) {
        return res.status(403).json({
          success: false,
          error: "Akses ditolak",
          timestamp: new Date().toISOString(),
        });
      }

      const members = await communityService.getCommunityMembers(
        communityId,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          members,
          total: members.length,
          community_id: communityId,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in getCommunityMembers:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengambil anggota komunitas",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Menambahkan moderator ke komunitas
  addModerator = async (req, res) => {
    try {
      const { communityId } = req.params;
      const { userId: targetUserId } = req.body;
      const adminId = req.user.uid;

      const community = await communityService.addModerator(
        communityId,
        targetUserId,
        adminId
      );

      res.json({
        success: true,
        message: "Moderator berhasil ditambahkan",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in addModerator:", error);
      const statusCode = error.message.includes("Only admin")
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

  // Menghapus moderator dari komunitas
  removeModerator = async (req, res) => {
    try {
      const { communityId } = req.params;
      const { userId: targetUserId } = req.body;
      const adminId = req.user.uid;

      const community = await communityService.removeModerator(
        communityId,
        targetUserId,
        adminId
      );

      res.json({
        success: true,
        message: "Moderator berhasil dihapus",
        data: community,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in removeModerator:", error);
      const statusCode = error.message.includes("Only admin")
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

  // Mendapatkan peran pengguna dalam komunitas
  getUserRole(community, userId) {
    if (community.isAdmin(userId)) return "admin";
    if (community.isModerator(userId)) return "moderator";
    if (community.isMember(userId)) return "member";
    return null;
  }
}

module.exports = new CommunityController();
