// Model untuk sesi panduan
class GuideSession {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;

    // Informasi perjalanan dari form
    this.trip_info = {
      trip_purpose: data.trip_info?.trip_purpose || "", // fishing, transport, recreation, emergency
      duration_minutes: data.trip_info?.duration_minutes || 0, // durasi pulang pergi
      passenger_count: data.trip_info?.passenger_count || 1,
      boat_type: data.trip_info?.boat_type || "", // perahu_kecil, kapal_nelayan, kapal_besar
      weather_condition: data.trip_info?.weather_condition || "calm", // calm, moderate, rough
      distance_km: data.trip_info?.distance_km || 0, // jarak tempuh dalam km
    };

    // Progress checklist
    this.checklist_progress = {
      total_items: data.checklist_progress?.total_items || 0,
      completed_items: data.checklist_progress?.completed_items || 0,
      mandatory_items: data.checklist_progress?.mandatory_items || 0,
      completed_mandatory: data.checklist_progress?.completed_mandatory || 0,
      items: data.checklist_progress?.items || [], // Array of guide IDs with completion status
      completion_percentage:
        data.checklist_progress?.completion_percentage || 0,
    };

    // Status session
    this.status = data.status || "form_filling"; // form_filling, checklist_active, summary_ready, completed
    this.is_active = data.is_active !== undefined ? data.is_active : true;

    // Metadata
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.completed_at = data.completed_at || null;
    this.expires_at = data.expires_at || this.calculateExpiryTime();
  }

  // Hitung waktu kedaluwarsa session (24 jam dari dibuat)
  calculateExpiryTime() {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    return now.toISOString();
  }

  // Validasi informasi perjalanan
  validateTripInfo() {
    const errors = {};
    const { trip_info } = this;

    if (!trip_info.trip_purpose) {
      errors.trip_purpose = "Tujuan perjalanan harus dipilih";
    } else if (
      !["fishing", "transport", "recreation", "emergency"].includes(
        trip_info.trip_purpose
      )
    ) {
      errors.trip_purpose = "Tujuan perjalanan tidak valid";
    }

    if (!trip_info.duration_minutes || trip_info.duration_minutes < 30) {
      errors.duration_minutes =
        "Durasi perjalanan pulang pergi minimal 30 menit";
    } else if (trip_info.duration_minutes > 1440) {
      // 24 jam
      errors.duration_minutes =
        "Durasi perjalanan pulang pergi maksimal 24 jam";
    }

    if (!trip_info.passenger_count || trip_info.passenger_count < 1) {
      errors.passenger_count = "Jumlah penumpang minimal 1 orang";
    } else if (trip_info.passenger_count > 100) {
      errors.passenger_count = "Jumlah penumpang maksimal 100 orang";
    }

    if (!trip_info.boat_type) {
      errors.boat_type = "Jenis perahu harus dipilih";
    } else if (
      !["perahu_kecil", "kapal_nelayan", "kapal_besar"].includes(
        trip_info.boat_type
      )
    ) {
      errors.boat_type = "Jenis perahu tidak valid";
    }

    if (!trip_info.weather_condition) {
      errors.weather_condition = "Kondisi cuaca harus dipilih";
    } else if (
      !["calm", "moderate", "rough"].includes(trip_info.weather_condition)
    ) {
      errors.weather_condition = "Kondisi cuaca tidak valid";
    }

    if (!trip_info.distance_km || trip_info.distance_km < 0.1) {
      errors.distance_km = "Jarak tempuh minimal 0.1 km";
    } else if (trip_info.distance_km > 1000) {
      errors.distance_km = "Jarak tempuh maksimal 1000 km";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Update progress checklist
  updateChecklistProgress(guideId, isCompleted) {
    const existingIndex = this.checklist_progress.items.findIndex(
      (item) => item.guide_id === guideId
    );

    if (existingIndex >= 0) {
      this.checklist_progress.items[existingIndex].is_completed = isCompleted;
      this.checklist_progress.items[existingIndex].completed_at = isCompleted
        ? new Date().toISOString()
        : null;
    } else {
      this.checklist_progress.items.push({
        guide_id: guideId,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
    }

    this.recalculateProgress();
    this.updated_at = new Date().toISOString();
  }

  // Menghitung ulang progress checklist
  recalculateProgress() {
    const completedItems = this.checklist_progress.items.filter(
      (item) => item.is_completed
    ).length;
    this.checklist_progress.completed_items = completedItems;

    if (this.checklist_progress.total_items > 0) {
      this.checklist_progress.completion_percentage = Math.round(
        (completedItems / this.checklist_progress.total_items) * 100
      );
    }

    // Update status berdasarkan progress
    if (this.checklist_progress.completion_percentage === 100) {
      this.status = "summary_ready";
    } else if (this.checklist_progress.completion_percentage > 0) {
      this.status = "checklist_active";
    }
  }

  // Set checklist items untuk session ini
  setChecklistItems(guides) {
    this.checklist_progress.total_items = guides.length;
    this.checklist_progress.mandatory_items = guides.filter(
      (guide) => guide.is_mandatory
    ).length;

    // Reset items jika belum ada
    if (this.checklist_progress.items.length === 0) {
      this.checklist_progress.items = guides.map((guide) => ({
        guide_id: guide.id,
        is_completed: false,
        completed_at: null,
      }));
    }

    this.recalculateProgress();
    this.status = "checklist_active";
    this.updated_at = new Date().toISOString();
  }

  // Menandai session sebagai selesai
  markAsCompleted() {
    this.status = "completed";
    this.completed_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.is_active = false;
  }

  // Cek apakah session sudah expired
  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  // Cek apakah semua item mandatory sudah selesai
  isMandatoryCompleted() {
    if (this.checklist_progress.mandatory_items === 0) return true;
    return (
      this.checklist_progress.completed_mandatory >=
      this.checklist_progress.mandatory_items
    );
  }

  // Mendapatkan rangkuman
  getSummary() {
    return {
      trip_info: this.trip_info,
      progress: {
        total_items: this.checklist_progress.total_items,
        completed_items: this.checklist_progress.completed_items,
        completion_percentage: this.checklist_progress.completion_percentage,
        mandatory_completed: this.isMandatoryCompleted(),
      },
      status: this.status,
      duration_spent: this.getDurationSpent(),
      created_at: this.created_at,
      completed_at: this.completed_at,
    };
  }

  // Menghitung durasi yang habis
  getDurationSpent() {
    const start = new Date(this.created_at);
    const end = this.completed_at ? new Date(this.completed_at) : new Date();
    return Math.round((end - start) / (1000 * 60)); // dalam menit
  }

  // Konversi ke format Firestore
  toFirestore() {
    const data = { ...this };
    delete data.id;
    data.updated_at = new Date().toISOString();
    return data;
  }

  // Konversi dari format Firestore
  static fromFirestore(doc) {
    const data = doc.data();
    return new GuideSession({
      id: doc.id,
      ...data,
    });
  }

  // Konversi ke format JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      trip_info: this.trip_info,
      checklist_progress: this.checklist_progress,
      status: this.status,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      completed_at: this.completed_at,
      expires_at: this.expires_at,
      is_expired: this.isExpired(),
      summary: this.getSummary(),
    };
  }
}

module.exports = GuideSession;
