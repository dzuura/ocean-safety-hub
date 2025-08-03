// Model untuk panduan keselamatan
class Guide {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.image_url = data.image_url || "";
    this.video_url = data.video_url || "";
    this.category = data.category || "general"; // general, safety, navigation, emergency
    this.priority = data.priority || 1; // 1-5, 1 = highest priority
    this.estimated_time_minutes = data.estimated_time_minutes || 5;

    // Kondisi kapan panduan ini ditampilkan
    this.conditions = {
      trip_purposes: data.conditions?.trip_purposes || [], // ['fishing', 'transport', 'recreation', 'emergency']
      boat_types: data.conditions?.boat_types || [], // ['perahu_kecil', 'kapal_nelayan', 'kapal_besar']
      duration_ranges: data.conditions?.duration_ranges || [], // ['short', 'medium', 'long'] (< 2h, 2-8h, > 8h)
      passenger_ranges: data.conditions?.passenger_ranges || [], // ['solo', 'small', 'medium', 'large'] (1, 2-5, 6-15, 16+)
      weather_conditions: data.conditions?.weather_conditions || [], // ['calm', 'moderate', 'rough']
      distance_ranges: data.conditions?.distance_ranges || [], // ['near', 'medium', 'far'] (< 5km, 5-50km, > 50km)
    };

    // Metadata
    this.is_mandatory = data.is_mandatory || false; // Wajib atau opsional
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.tags = data.tags || [];
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.created_by = data.created_by || null;
  }

  // Validasi data panduan
  validate() {
    const errors = {};

    if (!this.title || this.title.trim().length < 3) {
      errors.title = "Judul panduan minimal 3 karakter";
    }

    if (!this.description || this.description.trim().length < 10) {
      errors.description = "Deskripsi panduan minimal 10 karakter";
    }

    if (!this.image_url || !this.isValidUrl(this.image_url)) {
      errors.image_url = "URL gambar tidak valid";
    }

    if (this.video_url && !this.isValidUrl(this.video_url)) {
      errors.video_url = "URL video tidak valid";
    }

    if (
      !["general", "safety", "navigation", "emergency"].includes(this.category)
    ) {
      errors.category = "Kategori tidak valid";
    }

    if (this.priority < 1 || this.priority > 5) {
      errors.priority = "Prioritas harus antara 1-5";
    }

    if (this.estimated_time_minutes < 1 || this.estimated_time_minutes > 120) {
      errors.estimated_time_minutes = "Estimasi waktu harus antara 1-120 menit";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validasi URL
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Cek apakah panduan ini cocok untuk kondisi perjalanan
  matchesConditions(tripConditions) {
    const {
      trip_purpose,
      boat_type,
      duration_minutes,
      passenger_count,
      weather_condition,
      distance_km,
    } = tripConditions;

    // Konversi duration ke range
    let duration_range = "short";
    if (duration_minutes > 480) duration_range = "long"; // > 8 jam
    else if (duration_minutes > 120) duration_range = "medium"; // 2-8 jam

    // Konversi passenger count ke range
    let passenger_range = "solo";
    if (passenger_count > 15) passenger_range = "large";
    else if (passenger_count > 5) passenger_range = "medium";
    else if (passenger_count > 1) passenger_range = "small";

    // Konversi distance ke range
    let distance_range = "near";
    if (distance_km > 50) distance_range = "far"; // > 50 km
    else if (distance_km > 5) distance_range = "medium"; // 5-50 km

    // Cek setiap kondisi
    const checks = [
      this.conditions.trip_purposes.length === 0 ||
        this.conditions.trip_purposes.includes(trip_purpose),
      this.conditions.boat_types.length === 0 ||
        this.conditions.boat_types.includes(boat_type),
      this.conditions.duration_ranges.length === 0 ||
        this.conditions.duration_ranges.includes(duration_range),
      this.conditions.passenger_ranges.length === 0 ||
        this.conditions.passenger_ranges.includes(passenger_range),
      this.conditions.weather_conditions.length === 0 ||
        this.conditions.weather_conditions.includes(weather_condition),
      this.conditions.distance_ranges.length === 0 ||
        this.conditions.distance_ranges.includes(distance_range),
    ];

    return checks.every((check) => check);
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
    return new Guide({
      id: doc.id,
      ...data,
    });
  }

  // Konversi ke format JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      image_url: this.image_url,
      video_url: this.video_url,
      category: this.category,
      priority: this.priority,
      estimated_time_minutes: this.estimated_time_minutes,
      conditions: this.conditions,
      is_mandatory: this.is_mandatory,
      is_active: this.is_active,
      tags: this.tags,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  // Konversi ke format untuk checklist
  toChecklistItem() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      image_url: this.image_url,
      video_url: this.video_url,
      category: this.category,
      priority: this.priority,
      estimated_time_minutes: this.estimated_time_minutes,
      is_mandatory: this.is_mandatory,
      is_completed: false, // Default untuk checklist baru
    };
  }

  // Konversi ke format untuk rangkuman
  toSummaryItem() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      image_url: this.image_url,
      video_url: this.video_url,
      category: this.category,
      priority: this.priority,
      estimated_time_minutes: this.estimated_time_minutes,
      is_mandatory: this.is_mandatory,
    };
  }
}

module.exports = Guide;
