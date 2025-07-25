// Model untuk laporan
class Report {
  constructor(data = {}) {
    this.id = data.id || null;
    this.community_id = data.community_id || '';
    this.author_id = data.author_id || '';
    this.author_name = data.author_name || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.location = data.location || {
      latitude: null,
      longitude: null,
      address: '',
      area_name: ''
    };
    this.conditions = data.conditions || {
      wave_height: null, // meter
      wind_speed: null, // km/h
      wind_direction: null, // degrees
      visibility: null, // km
      weather_description: '',
      sea_temperature: null, // celsius
      current_strength: null, // knots
      tide_level: null // high/medium/low
    };
    this.safety_assessment = data.safety_assessment || {
      overall_safety: '', // safe/caution/dangerous
      boat_recommendations: {
        perahu_kecil: '', // safe/caution/avoid
        kapal_nelayan: '', // safe/caution/avoid
        kapal_besar: '' // safe/caution/avoid
      },
      recommended_actions: []
    };
    this.media = data.media || {
      photos: [], // Array of photo URLs
      videos: [] // Array of video URLs
    };
    this.verification = data.verification || {
      status: 'pending', // pending/verified/disputed/rejected
      verified_by: null,
      verified_at: null,
      verification_notes: '',
      confidence_score: 0 // 0-100
    };
    this.voting = data.voting || {
      upvotes: 0,
      downvotes: 0,
      total_votes: 0,
      voters: [], // Array of user IDs who voted
      accuracy_rating: 0 // Average accuracy rating 1-5
    };
    this.tags = data.tags || []; // e.g., ['gelombang_tinggi', 'angin_kencang', 'kabut']
    this.urgency_level = data.urgency_level || 'normal'; // low/normal/high/critical
    this.valid_until = data.valid_until || null; // ISO string
    this.source_type = data.source_type || 'field_report'; // field_report/sensor_data/official
    this.comments = data.comments || [];
    this.view_count = data.view_count || 0;
    this.share_count = data.share_count || 0;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.status = data.status || 'active'; // active/archived/deleted
  }

  // Validasi laporan sebelum disimpan
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length < 5) {
      errors.title = 'Judul laporan minimal 5 karakter';
    }

    if (!this.description || this.description.trim().length < 20) {
      errors.description = 'Deskripsi laporan minimal 20 karakter';
    }

    if (!this.community_id) {
      errors.community_id = 'Community ID diperlukan';
    }

    if (!this.author_id) {
      errors.author_id = 'Author ID diperlukan';
    }

    if (!this.location.latitude || !this.location.longitude) {
      errors.location = 'Koordinat lokasi diperlukan';
    }

    if (this.location.latitude < -90 || this.location.latitude > 90) {
      errors.latitude = 'Latitude harus antara -90 dan 90';
    }

    if (this.location.longitude < -180 || this.location.longitude > 180) {
      errors.longitude = 'Longitude harus antara -180 dan 180';
    }

    // Validasi kondisi cuaca
    if (this.conditions.wave_height !== null && (this.conditions.wave_height < 0 || this.conditions.wave_height > 30)) {
      errors.wave_height = 'Tinggi gelombang harus antara 0-30 meter';
    }

    if (this.conditions.wind_speed !== null && (this.conditions.wind_speed < 0 || this.conditions.wind_speed > 300)) {
      errors.wind_speed = 'Kecepatan angin harus antara 0-300 km/h';
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

  // Konversi dari Firestore document
  static fromFirestore(doc) {
    return new Report({
      id: doc.id,
      ...doc.data()
    });
  }

  // Cek apakah laporan masih berlaku
  isValid() {
    if (!this.valid_until) return true;
    return new Date(this.valid_until) > new Date();
  }

  // Cek apakah pengguna dapat mengedit laporan
  canEdit(userId, userRole = 'member') {
    return this.author_id === userId || userRole === 'moderator' || userRole === 'admin';
  }

  // Cek apakah laporan dapat diverifikasi
  addVote(userId, voteType, accuracyRating = null) {
    // Menghapus vote yang ada jika tersedia
    this.removeVote(userId);

    // Add new vote
    if (voteType === 'up') {
      this.voting.upvotes++;
    } else if (voteType === 'down') {
      this.voting.downvotes++;
    }

    this.voting.voters.push({
      user_id: userId,
      vote_type: voteType,
      accuracy_rating: accuracyRating,
      voted_at: new Date().toISOString()
    });

    this.voting.total_votes = this.voting.upvotes + this.voting.downvotes;

    // Update akurasi rating
    if (accuracyRating) {
      this.updateAccuracyRating();
    }

    this.updated_at = new Date().toISOString();
  }

  // Hapus vote pengguna
  removeVote(userId) {
    const existingVoteIndex = this.voting.voters.findIndex(v => v.user_id === userId);
    if (existingVoteIndex > -1) {
      const existingVote = this.voting.voters[existingVoteIndex];
      if (existingVote.vote_type === 'up') {
        this.voting.upvotes--;
      } else if (existingVote.vote_type === 'down') {
        this.voting.downvotes--;
      }
      this.voting.voters.splice(existingVoteIndex, 1);
      this.voting.total_votes = this.voting.upvotes + this.voting.downvotes;
      this.updateAccuracyRating();
    }
  }

  // Update akurasi rating berdasarkan voting
  updateAccuracyRating() {
    const ratingsWithValues = this.voting.voters.filter(v => v.accuracy_rating);
    if (ratingsWithValues.length > 0) {
      const sum = ratingsWithValues.reduce((acc, v) => acc + v.accuracy_rating, 0);
      this.voting.accuracy_rating = Math.round((sum / ratingsWithValues.length) * 10) / 10;
    }
  }

  // Tambah komentar pada laporan
  addComment(comment) {
    this.comments.push({
      id: Date.now().toString(),
      ...comment,
      created_at: new Date().toISOString()
    });
    this.updated_at = new Date().toISOString();
  }

  // Update status verifikasi laporan
  verify(verifierId, status, notes = '') {
    this.verification = {
      status,
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
      verification_notes: notes,
      confidence_score: this.calculateConfidenceScore()
    };
    this.updated_at = new Date().toISOString();
  }

  // Hitung skor kepercayaan berdasarkan voting dan media
  calculateConfidenceScore() {
    let score = 50; // Base score

    // Factor in voting
    if (this.voting.total_votes > 0) {
      const upvoteRatio = this.voting.upvotes / this.voting.total_votes;
      score += (upvoteRatio - 0.5) * 40; // +/- 20 points based on vote ratio
    }

    // Factor in accuracy rating
    if (this.voting.accuracy_rating > 0) {
      score += (this.voting.accuracy_rating - 3) * 10; // +/- 20 points based on rating
    }

    // Factor in media presence
    if (this.media.photos.length > 0 || this.media.videos.length > 0) {
      score += 10;
    }

    // Factor in author reputation (would need user reputation system)
    // score += authorReputation * 0.2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Tambah jumlah view laporan
  incrementViewCount() {
    this.view_count++;
    this.updated_at = new Date().toISOString();
  }

  // Tambah jumlah share laporan
  incrementShareCount() {
    this.share_count++;
    this.updated_at = new Date().toISOString();
  }
}

module.exports = Report;
