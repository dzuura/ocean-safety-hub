const { db } = require("../config/firebase");
const Community = require("../models/Community");
const Discussion = require("../models/Discussion");

class CommunityService {
  constructor() {
    this.collection = db.collection("communities");
    this.discussionsCollection = db.collection("discussions");
    this.membershipsCollection = db.collection("community_memberships");
  }

  /**
   * Create a new community
   */
  async createCommunity(communityData) {
    try {
      const community = new Community(communityData);
      const validation = community.validate();

      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      // Add creator as first member and admin
      community.addMember(community.admin_id);

      const docRef = await this.collection.add(community.toFirestore());
      community.id = docRef.id;

      // Create membership record
      await this.createMembership(community.id, community.admin_id, "admin");

      console.log(`Community created: ${community.id}`);
      return community;
    } catch (error) {
      console.error("Error creating community:", error);
      throw error;
    }
  }

  /**
   * Get community by ID
   */
  async getCommunityById(communityId) {
    try {
      const doc = await this.collection.doc(communityId).get();

      if (!doc.exists) {
        return null;
      }

      return Community.fromFirestore(doc);
    } catch (error) {
      console.error("Error getting community:", error);
      throw error;
    }
  }

  /**
   * Update community
   */
  async updateCommunity(communityId, updateData, userId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (!community.isAdmin(userId) && !community.isModerator(userId)) {
        throw new Error("Unauthorized to update community");
      }

      const updatedCommunity = new Community({ ...community, ...updateData });
      const validation = updatedCommunity.validate();

      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      await this.collection
        .doc(communityId)
        .update(updatedCommunity.toFirestore());

      console.log(`Community updated: ${communityId}`);
      return updatedCommunity;
    } catch (error) {
      console.error("Error updating community:", error);
      throw error;
    }
  }

  /**
   * Delete community
   */
  async deleteCommunity(communityId, userId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (!community.isAdmin(userId)) {
        throw new Error("Only admin can delete community");
      }

      // Soft delete - update status instead of actual deletion
      await this.collection.doc(communityId).update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      });

      console.log(`Community deleted: ${communityId}`);
      return true;
    } catch (error) {
      console.error("Error deleting community:", error);
      throw error;
    }
  }

  /**
   * Search communities
   */
  async searchCommunities(filters = {}) {
    try {
      let query = this.collection.where("status", "==", "active");

      // Apply filters
      if (filters.is_public !== undefined) {
        query = query.where("is_public", "==", filters.is_public);
      }

      if (filters.region) {
        query = query.where("location.region", "==", filters.region);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.where("tags", "array-contains-any", filters.tags);
      }

      // Apply ordering
      if (filters.sort_by === "members") {
        query = query.orderBy("member_count", "desc");
      } else if (filters.sort_by === "activity") {
        query = query.orderBy("statistics.last_activity", "desc");
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
      const communities = [];

      snapshot.forEach((doc) => {
        communities.push(Community.fromFirestore(doc));
      });

      return communities;
    } catch (error) {
      console.error("Error searching communities:", error);
      throw error;
    }
  }

  /**
   * Join community
   */
  async joinCommunity(communityId, userId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (community.isMember(userId)) {
        throw new Error("User is already a member");
      }

      if (!community.is_public && community.join_approval_required) {
        // Create join request instead of direct join
        return await this.createJoinRequest(communityId, userId);
      }

      // Direct join for public communities
      community.addMember(userId);
      await this.collection.doc(communityId).update(community.toFirestore());

      // Create membership record
      await this.createMembership(communityId, userId, "member");

      console.log(`User ${userId} joined community ${communityId}`);
      return community;
    } catch (error) {
      console.error("Error joining community:", error);
      throw error;
    }
  }

  /**
   * Leave community
   */
  async leaveCommunity(communityId, userId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (community.isAdmin(userId)) {
        throw new Error(
          "Admin cannot leave community. Transfer ownership first."
        );
      }

      if (!community.isMember(userId)) {
        throw new Error("User is not a member");
      }

      community.removeMember(userId);
      community.removeModerator(userId); // Remove from moderators if applicable

      await this.collection.doc(communityId).update(community.toFirestore());

      // Remove membership record
      await this.removeMembership(communityId, userId);

      console.log(`User ${userId} left community ${communityId}`);
      return community;
    } catch (error) {
      console.error("Error leaving community:", error);
      throw error;
    }
  }

  /**
   * Get user's communities
   */
  async getUserCommunities(userId) {
    try {
      const membershipSnapshot = await this.membershipsCollection
        .where("user_id", "==", userId)
        .where("status", "==", "active")
        .get();

      const communityIds = [];
      membershipSnapshot.forEach((doc) => {
        communityIds.push(doc.data().community_id);
      });

      if (communityIds.length === 0) {
        return [];
      }

      // Get communities in batches (Firestore 'in' query limit is 10)
      const communities = [];
      for (let i = 0; i < communityIds.length; i += 10) {
        const batch = communityIds.slice(i, i + 10);
        const snapshot = await this.collection
          .where("__name__", "in", batch)
          .where("status", "==", "active")
          .get();

        snapshot.forEach((doc) => {
          communities.push(Community.fromFirestore(doc));
        });
      }

      return communities;
    } catch (error) {
      console.error("Error getting user communities:", error);
      throw error;
    }
  }

  /**
   * Create membership record
   */
  async createMembership(communityId, userId, role = "member") {
    try {
      const membershipData = {
        community_id: communityId,
        user_id: userId,
        role: role, // member, moderator, admin
        joined_at: new Date().toISOString(),
        status: "active",
      };

      await this.membershipsCollection.add(membershipData);
      console.log(`Membership created: ${userId} -> ${communityId} as ${role}`);
    } catch (error) {
      console.error("Error creating membership:", error);
      throw error;
    }
  }

  /**
   * Remove membership record
   */
  async removeMembership(communityId, userId) {
    try {
      const snapshot = await this.membershipsCollection
        .where("community_id", "==", communityId)
        .where("user_id", "==", userId)
        .get();

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          status: "inactive",
          left_at: new Date().toISOString(),
        });
      });

      await batch.commit();
      console.log(`Membership removed: ${userId} -> ${communityId}`);
    } catch (error) {
      console.error("Error removing membership:", error);
      throw error;
    }
  }

  /**
   * Get community members with their roles
   */
  async getCommunityMembers(communityId, limit = 50) {
    try {
      const snapshot = await this.membershipsCollection
        .where("community_id", "==", communityId)
        .where("status", "==", "active")
        .limit(limit)
        .get();

      const members = [];
      snapshot.forEach((doc) => {
        members.push(doc.data());
      });

      return members;
    } catch (error) {
      console.error("Error getting community members:", error);
      throw error;
    }
  }

  /**
   * Add moderator to community
   */
  async addModerator(communityId, userId, adminId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (!community.isAdmin(adminId)) {
        throw new Error("Only admin can add moderators");
      }

      if (!community.isMember(userId)) {
        throw new Error("User must be a member first");
      }

      community.addModerator(userId);
      await this.collection.doc(communityId).update(community.toFirestore());

      // Update membership role
      const membershipSnapshot = await this.membershipsCollection
        .where("community_id", "==", communityId)
        .where("user_id", "==", userId)
        .get();

      if (!membershipSnapshot.empty) {
        const membershipDoc = membershipSnapshot.docs[0];
        await membershipDoc.ref.update({ role: "moderator" });
      }

      console.log(
        `User ${userId} promoted to moderator in community ${communityId}`
      );
      return community;
    } catch (error) {
      console.error("Error adding moderator:", error);
      throw error;
    }
  }

  /**
   * Remove moderator from community
   */
  async removeModerator(communityId, userId, adminId) {
    try {
      const community = await this.getCommunityById(communityId);

      if (!community) {
        throw new Error("Community not found");
      }

      if (!community.isAdmin(adminId)) {
        throw new Error("Only admin can remove moderators");
      }

      community.removeModerator(userId);
      await this.collection.doc(communityId).update(community.toFirestore());

      // Update membership role
      const membershipSnapshot = await this.membershipsCollection
        .where("community_id", "==", communityId)
        .where("user_id", "==", userId)
        .get();

      if (!membershipSnapshot.empty) {
        const membershipDoc = membershipSnapshot.docs[0];
        await membershipDoc.ref.update({ role: "member" });
      }

      console.log(
        `User ${userId} demoted from moderator in community ${communityId}`
      );
      return community;
    } catch (error) {
      console.error("Error removing moderator:", error);
      throw error;
    }
  }
}

module.exports = new CommunityService();
