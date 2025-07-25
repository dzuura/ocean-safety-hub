// Validasi parameter untuk mendapatkan data cuaca
const validateWeatherParams = (req, res, next) => {
  const { latitude, longitude } = req.query;
  const errors = {};

  if (!latitude) {
    errors.latitude = "Latitude diperlukan";
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Latitude harus berupa angka antara -90 dan 90";
    }
  }

  if (!longitude) {
    errors.longitude = "Longitude diperlukan";
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Longitude harus berupa angka antara -180 dan 180";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Parameter tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi parameter untuk AI
const validateAIParams = (req, res, next) => {
  const { latitude, longitude } = req.body;
  const errors = {};

  if (!latitude) {
    errors.latitude = "Latitude diperlukan";
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Latitude harus berupa angka antara -90 dan 90";
    }
  }

  if (!longitude) {
    errors.longitude = "Longitude diperlukan";
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Longitude harus berupa angka antara -180 dan 180";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Parameter tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi parameter untuk analisis keamanan
const validateSafetyParams = (req, res, next) => {
  const { latitude, longitude, boat_type } = req.query;
  const errors = {};

  if (!latitude) {
    errors.latitude = "Latitude diperlukan";
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Latitude harus berupa angka antara -90 dan 90";
    }
  }

  if (!longitude) {
    errors.longitude = "Longitude diperlukan";
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Longitude harus berupa angka antara -180 dan 180";
    }
  }

  if (boat_type) {
    const validBoatTypes = ["perahu_kecil", "kapal_nelayan", "kapal_besar"];
    if (!validBoatTypes.includes(boat_type)) {
      errors.boat_type = "Jenis perahu tidak valid";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Parameter tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data komunitas
const validateCommunityData = (req, res, next) => {
  const { name, description, location } = req.body;
  const errors = {};

  // Validasi nama
  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.name = "Nama komunitas minimal 3 karakter";
  }

  // Validasi deskripsi
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 10
  ) {
    errors.description = "Deskripsi komunitas minimal 10 karakter";
  }

  // Validasi lokasi
  if (!location || typeof location !== "object") {
    errors.location = "Data lokasi diperlukan";
  } else {
    if (!location.latitude || !location.longitude) {
      errors.location = "Koordinat latitude dan longitude diperlukan";
    } else {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "Latitude harus berupa angka antara -90 dan 90";
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "Longitude harus berupa angka antara -180 dan 180";
      }
    }
  }

  // Validasi tag jika disediakan
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.tags = "Tags harus berupa array";
  }

  // Validasi aturan jika disediakan
  if (req.body.rules && !Array.isArray(req.body.rules)) {
    errors.rules = "Rules harus berupa array";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data anggota komunitas
const validateMembershipData = (req, res, next) => {
  const { userId } = req.body;
  const errors = {};

  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    errors.userId = "User ID diperlukan";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data laporan
const validateReportData = (req, res, next) => {
  const { title, description, location, community_id } = req.body;
  const errors = {};

  // Validasi judul
  if (!title || typeof title !== "string" || title.trim().length < 5) {
    errors.title = "Judul laporan minimal 5 karakter";
  }

  // Validasi deskripsi
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 20
  ) {
    errors.description = "Deskripsi laporan minimal 20 karakter";
  }

  // Validasi id komunitas
  if (!community_id || typeof community_id !== "string") {
    errors.community_id = "Community ID diperlukan";
  }

  // Validasi lokasi
  if (!location || typeof location !== "object") {
    errors.location = "Data lokasi diperlukan";
  } else {
    if (!location.latitude || !location.longitude) {
      errors.location = "Koordinat latitude dan longitude diperlukan";
    } else {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "Latitude harus berupa angka antara -90 dan 90";
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "Longitude harus berupa angka antara -180 dan 180";
      }
    }
  }

  // Validasi level urgensi jika disediakan
  if (req.body.urgency_level) {
    const validLevels = ["low", "normal", "high", "critical"];
    if (!validLevels.includes(req.body.urgency_level)) {
      errors.urgency_level = "Level urgensi tidak valid";
    }
  }

  // Validasi kondisi cuaca jika disediakan
  if (req.body.conditions) {
    const { wave_height, wind_speed, visibility } = req.body.conditions;

    if (
      wave_height !== undefined &&
      (isNaN(wave_height) || wave_height < 0 || wave_height > 30)
    ) {
      errors.wave_height = "Tinggi gelombang harus antara 0-30 meter";
    }

    if (
      wind_speed !== undefined &&
      (isNaN(wind_speed) || wind_speed < 0 || wind_speed > 300)
    ) {
      errors.wind_speed = "Kecepatan angin harus antara 0-300 km/h";
    }

    if (
      visibility !== undefined &&
      (isNaN(visibility) || visibility < 0 || visibility > 50)
    ) {
      errors.visibility = "Visibilitas harus antara 0-50 km";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data vote
const validateVoteData = (req, res, next) => {
  const { vote_type, accuracy_rating } = req.body;
  const errors = {};

  // Validate vote_type if provided
  if (vote_type && !["up", "down"].includes(vote_type)) {
    errors.vote_type = 'Jenis vote harus "up" atau "down"';
  }

  // Validate accuracy_rating if provided
  if (accuracy_rating !== undefined) {
    const rating = parseFloat(accuracy_rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.accuracy_rating = "Rating akurasi harus antara 1-5";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data komentar
const validateCommentData = (req, res, next) => {
  const { content } = req.body;
  const errors = {};

  if (!content || typeof content !== "string" || content.trim().length < 5) {
    errors.content = "Komentar minimal 5 karakter";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi data panduan
const validateGuideData = (req, res, next) => {
  const {
    title,
    description,
    image_url,
    video_url,
    category,
    priority,
    estimated_time_minutes,
  } = req.body;
  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = "Judul panduan minimal 3 karakter";
  }

  if (!description || description.trim().length < 10) {
    errors.description = "Deskripsi panduan minimal 10 karakter";
  }

  if (!image_url || !isValidUrl(image_url)) {
    errors.image_url = "URL gambar tidak valid";
  }

  if (video_url && !isValidUrl(video_url)) {
    errors.video_url = "URL video tidak valid";
  }

  if (
    category &&
    !["general", "safety", "navigation", "emergency"].includes(category)
  ) {
    errors.category =
      "Kategori harus salah satu dari: general, safety, navigation, emergency";
  }

  if (priority !== undefined) {
    const priorityNum = parseInt(priority);
    if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
      errors.priority = "Prioritas harus berupa angka antara 1-5";
    }
  }

  if (estimated_time_minutes !== undefined) {
    const timeNum = parseInt(estimated_time_minutes);
    if (isNaN(timeNum) || timeNum < 1 || timeNum > 120) {
      errors.estimated_time_minutes =
        "Estimasi waktu harus berupa angka antara 1-120 menit";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data panduan tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi informasi perjalanan
const validateTripInfo = (req, res, next) => {
  const { trip_purpose, duration_minutes, passenger_count, boat_type } =
    req.body;
  const errors = {};

  if (!trip_purpose) {
    errors.trip_purpose = "Tujuan perjalanan harus dipilih";
  } else if (
    !["fishing", "transport", "recreation", "emergency"].includes(trip_purpose)
  ) {
    errors.trip_purpose = "Tujuan perjalanan tidak valid";
  }

  if (!duration_minutes) {
    errors.duration_minutes = "Durasi perjalanan diperlukan";
  } else {
    const duration = parseInt(duration_minutes);
    if (isNaN(duration) || duration < 15) {
      errors.duration_minutes = "Durasi perjalanan minimal 15 menit";
    } else if (duration > 1440) {
      errors.duration_minutes = "Durasi perjalanan maksimal 24 jam";
    }
  }

  if (!passenger_count) {
    errors.passenger_count = "Jumlah penumpang diperlukan";
  } else {
    const count = parseInt(passenger_count);
    if (isNaN(count) || count < 1) {
      errors.passenger_count = "Jumlah penumpang minimal 1 orang";
    } else if (count > 100) {
      errors.passenger_count = "Jumlah penumpang maksimal 100 orang";
    }
  }

  if (!boat_type) {
    errors.boat_type = "Jenis perahu harus dipilih";
  } else if (
    !["perahu_kecil", "kapal_nelayan", "kapal_besar"].includes(boat_type)
  ) {
    errors.boat_type = "Jenis perahu tidak valid";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Informasi perjalanan tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Validasi update checklist
const validateChecklistUpdate = (req, res, next) => {
  const { is_completed } = req.body;
  const errors = {};

  if (is_completed === undefined || is_completed === null) {
    errors.is_completed = "Status completion diperlukan";
  } else if (typeof is_completed !== "boolean") {
    errors.is_completed = "Status completion harus berupa boolean";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: "Data update checklist tidak valid",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

module.exports = {
  validateWeatherParams,
  validateAIParams,
  validateSafetyParams,
  validateCommunityData,
  validateMembershipData,
  validateReportData,
  validateVoteData,
  validateCommentData,
  validateGuideData,
  validateTripInfo,
  validateChecklistUpdate,
};
