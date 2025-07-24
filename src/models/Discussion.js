/**
 * Discussion Model
 * Represents a discussion thread in a community
 */

class Discussion {
  constructor(data = {}) {
    this.id = data.id || null;
    this.community_id = data.community_id || '';
    this.author_id = data.author_id || '';
    this.author_name = data.author_name || '';
    this.title = data.title || '';
    this.content = data.content || '';
    this.category = data.category || 'general'; // general, tips, equipment, weather, safety
    this.tags = data.tags || [];
    this.is_pinned = data.is_pinned || false;
    this.is_locked = data.is_locked || false;
    this.is_announcement = data.is_announcement || false;
    this.replies = data.replies || [];
    this.reply_count = data.reply_count || 0;
    this.view_count = data.view_count || 0;
    this.like_count = data.like_count || 0;
    this.liked_by = data.liked_by || []; // Array of user IDs
    this.last_reply_at = data.last_reply_at || null;
    this.last_reply_by = data.last_reply_by || null;
    this.media = data.media || {
      photos: [],
      videos: [],
      documents: []
    };
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.status = data.status || 'active'; // active, archived, deleted
  }

  /**
   * Validate discussion data
   */
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length < 5) {
      errors.title = 'Judul diskusi minimal 5 karakter';
    }

    if (!this.content || this.content.trim().length < 10) {
      errors.content = 'Konten diskusi minimal 10 karakter';
    }

    if (!this.community_id) {
      errors.community_id = 'Community ID diperlukan';
    }

    if (!this.author_id) {
      errors.author_id = 'Author ID diperlukan';
    }

    const validCategories = ['general', 'tips', 'equipment', 'weather', 'safety'];
    if (!validCategories.includes(this.category)) {
      errors.category = 'Kategori tidak valid';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Convert to Firestore document
   */
  toFirestore() {
    const { id, ...data } = this;
    return {
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Create from Firestore document
   */
  static fromFirestore(doc) {
    return new Discussion({
      id: doc.id,
      ...doc.data()
    });
  }

  /**
   * Check if user can edit this discussion
   */
  canEdit(userId, userRole = 'member') {
    return this.author_id === userId || userRole === 'moderator' || userRole === 'admin';
  }

  /**
   * Check if user can reply to this discussion
   */
  canReply(userRole = 'member') {
    return !this.is_locked || userRole === 'moderator' || userRole === 'admin';
  }

  /**
   * Add reply to discussion
   */
  addReply(reply) {
    const newReply = {
      id: Date.now().toString(),
      ...reply,
      created_at: new Date().toISOString(),
      like_count: 0,
      liked_by: []
    };

    this.replies.push(newReply);
    this.reply_count = this.replies.length;
    this.last_reply_at = newReply.created_at;
    this.last_reply_by = reply.author_id;
    this.updated_at = new Date().toISOString();

    return newReply;
  }

  /**
   * Remove reply from discussion
   */
  removeReply(replyId, userId, userRole = 'member') {
    const replyIndex = this.replies.findIndex(r => r.id === replyId);
    if (replyIndex === -1) return false;

    const reply = this.replies[replyIndex];
    
    // Check permissions
    if (reply.author_id !== userId && userRole !== 'moderator' && userRole !== 'admin') {
      return false;
    }

    this.replies.splice(replyIndex, 1);
    this.reply_count = this.replies.length;
    
    // Update last reply info
    if (this.replies.length > 0) {
      const lastReply = this.replies[this.replies.length - 1];
      this.last_reply_at = lastReply.created_at;
      this.last_reply_by = lastReply.author_id;
    } else {
      this.last_reply_at = null;
      this.last_reply_by = null;
    }
    
    this.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Toggle like on discussion
   */
  toggleLike(userId) {
    const likedIndex = this.liked_by.indexOf(userId);
    
    if (likedIndex > -1) {
      // Unlike
      this.liked_by.splice(likedIndex, 1);
      this.like_count--;
    } else {
      // Like
      this.liked_by.push(userId);
      this.like_count++;
    }
    
    this.updated_at = new Date().toISOString();
    return likedIndex === -1; // Return true if liked, false if unliked
  }

  /**
   * Toggle like on reply
   */
  toggleReplyLike(replyId, userId) {
    const reply = this.replies.find(r => r.id === replyId);
    if (!reply) return false;

    const likedIndex = reply.liked_by.indexOf(userId);
    
    if (likedIndex > -1) {
      // Unlike
      reply.liked_by.splice(likedIndex, 1);
      reply.like_count--;
    } else {
      // Like
      reply.liked_by.push(userId);
      reply.like_count++;
    }
    
    this.updated_at = new Date().toISOString();
    return likedIndex === -1; // Return true if liked, false if unliked
  }

  /**
   * Increment view count
   */
  incrementViewCount() {
    this.view_count++;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Pin/unpin discussion
   */
  togglePin(userRole) {
    if (userRole !== 'moderator' && userRole !== 'admin') {
      return false;
    }
    
    this.is_pinned = !this.is_pinned;
    this.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Lock/unlock discussion
   */
  toggleLock(userRole) {
    if (userRole !== 'moderator' && userRole !== 'admin') {
      return false;
    }
    
    this.is_locked = !this.is_locked;
    this.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Mark as announcement
   */
  toggleAnnouncement(userRole) {
    if (userRole !== 'admin') {
      return false;
    }
    
    this.is_announcement = !this.is_announcement;
    this.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Get discussion summary for list view
   */
  getSummary() {
    return {
      id: this.id,
      community_id: this.community_id,
      author_id: this.author_id,
      author_name: this.author_name,
      title: this.title,
      category: this.category,
      tags: this.tags,
      is_pinned: this.is_pinned,
      is_locked: this.is_locked,
      is_announcement: this.is_announcement,
      reply_count: this.reply_count,
      view_count: this.view_count,
      like_count: this.like_count,
      last_reply_at: this.last_reply_at,
      last_reply_by: this.last_reply_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Discussion;
