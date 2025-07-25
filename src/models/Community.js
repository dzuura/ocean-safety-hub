// Model untuk komunitas
class Community {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.location = data.location || {
      latitude: null,
      longitude: null,
      address: '',
      region: '' // WIB/WITA/WIT
    };
    this.admin_id = data.admin_id || '';
    this.moderators = data.moderators || []; // Array user ID
    this.members = data.members || []; // Array user ID
    this.member_count = data.member_count || 0;
    this.is_public = data.is_public !== undefined ? data.is_public : true;
    this.join_approval_required = data.join_approval_required !== undefined ? data.join_approval_required : false;
    this.tags = data.tags || [];
    this.avatar_url = data.avatar_url || '';
    this.banner_url = data.banner_url || '';
    this.rules = data.rules || [];
    this.statistics = data.statistics || {
      total_posts: 0,
      total_reports: 0,
      active_members: 0,
      last_activity: null
    };
    this.settings = data.settings || {
      allow_reports: true,
      allow_discussions: true,
      auto_approve_reports: false,
      notification_settings: {
        new_members: true,
        new_reports: true,
        new_discussions: true
      }
    };
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.status = data.status || 'active'; // active, suspended, archived
  }

  // Validasi data komunitas
  validate() {
    const errors = {};

    if (!this.name || this.name.trim().length < 3) {
      errors.name = 'Nama komunitas minimal 3 karakter';
    }

    if (!this.description || this.description.trim().length < 10) {
      errors.description = 'Deskripsi komunitas minimal 10 karakter';
    }

    if (!this.admin_id) {
      errors.admin_id = 'Admin ID diperlukan';
    }

    if (!this.location.latitude || !this.location.longitude) {
      errors.location = 'Koordinat lokasi diperlukan';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Konversi ke format Firestore
  toFirestore() {
    const { id, ...data } = this;
    return {
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  // Membuat objek Community dari data Firestore
  static fromFirestore(doc) {
    return new Community({
      id: doc.id,
      ...doc.data()
    });
  }

  // Cek apakah user adalah admin
  isAdmin(userId) {
    return this.admin_id === userId;
  }

  // Cek apakah user adalah moderator
  isModerator(userId) {
    return this.moderators.includes(userId) || this.isAdmin(userId);
  }

  // Cek apakah user adalah anggota
  isMember(userId) {
    return this.members.includes(userId) || this.isModerator(userId);
  }

  // Menambahkan anggota
  addMember(userId) {
    if (!this.members.includes(userId)) {
      this.members.push(userId);
      this.member_count = this.members.length;
      this.updated_at = new Date().toISOString();
    }
  }

  // Menghapus anggota
  removeMember(userId) {
    const index = this.members.indexOf(userId);
    if (index > -1) {
      this.members.splice(index, 1);
      this.member_count = this.members.length;
      this.updated_at = new Date().toISOString();
    }
  }

  // Menambahkan moderator
  addModerator(userId) {
    if (!this.moderators.includes(userId) && userId !== this.admin_id) {
      this.moderators.push(userId);
      this.updated_at = new Date().toISOString();
    }
  }

  // Menghapus moderator
  removeModerator(userId) {
    const index = this.moderators.indexOf(userId);
    if (index > -1) {
      this.moderators.splice(index, 1);
      this.updated_at = new Date().toISOString();
    }
  }

  // Memperbarui statistik
  updateStatistics(stats) {
    this.statistics = {
      ...this.statistics,
      ...stats,
      last_activity: new Date().toISOString()
    };
    this.updated_at = new Date().toISOString();
  }
}

module.exports = Community;
