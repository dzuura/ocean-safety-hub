/**
 * Validation middleware for various API endpoints
 */

/**
 * Validate weather parameters
 */
const validateWeatherParams = (req, res, next) => {
  const { latitude, longitude } = req.query;
  const errors = {};

  if (!latitude) {
    errors.latitude = 'Latitude diperlukan';
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude harus berupa angka antara -90 dan 90';
    }
  }

  if (!longitude) {
    errors.longitude = 'Longitude diperlukan';
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude harus berupa angka antara -180 dan 180';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Parameter tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate AI parameters
 */
const validateAIParams = (req, res, next) => {
  const { latitude, longitude } = req.body;
  const errors = {};

  if (!latitude) {
    errors.latitude = 'Latitude diperlukan';
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude harus berupa angka antara -90 dan 90';
    }
  }

  if (!longitude) {
    errors.longitude = 'Longitude diperlukan';
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude harus berupa angka antara -180 dan 180';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Parameter tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate safety parameters
 */
const validateSafetyParams = (req, res, next) => {
  const { latitude, longitude, boat_type } = req.query;
  const errors = {};

  if (!latitude) {
    errors.latitude = 'Latitude diperlukan';
  } else {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude harus berupa angka antara -90 dan 90';
    }
  }

  if (!longitude) {
    errors.longitude = 'Longitude diperlukan';
  } else {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude harus berupa angka antara -180 dan 180';
    }
  }

  if (boat_type) {
    const validBoatTypes = ['perahu_kecil', 'kapal_nelayan', 'kapal_besar'];
    if (!validBoatTypes.includes(boat_type)) {
      errors.boat_type = 'Jenis perahu tidak valid';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Parameter tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate community data
 */
const validateCommunityData = (req, res, next) => {
  const { name, description, location } = req.body;
  const errors = {};

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.name = 'Nama komunitas minimal 3 karakter';
  }

  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.description = 'Deskripsi komunitas minimal 10 karakter';
  }

  // Validate location
  if (!location || typeof location !== 'object') {
    errors.location = 'Data lokasi diperlukan';
  } else {
    if (!location.latitude || !location.longitude) {
      errors.location = 'Koordinat latitude dan longitude diperlukan';
    } else {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude harus berupa angka antara -90 dan 90';
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude harus berupa angka antara -180 dan 180';
      }
    }
  }

  // Validate tags if provided
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.tags = 'Tags harus berupa array';
  }

  // Validate rules if provided
  if (req.body.rules && !Array.isArray(req.body.rules)) {
    errors.rules = 'Rules harus berupa array';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Data tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate membership data
 */
const validateMembershipData = (req, res, next) => {
  const { userId } = req.body;
  const errors = {};

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    errors.userId = 'User ID diperlukan';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Data tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate report data
 */
const validateReportData = (req, res, next) => {
  const { title, description, location, community_id } = req.body;
  const errors = {};

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.title = 'Judul laporan minimal 5 karakter';
  }

  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    errors.description = 'Deskripsi laporan minimal 20 karakter';
  }

  // Validate community_id
  if (!community_id || typeof community_id !== 'string') {
    errors.community_id = 'Community ID diperlukan';
  }

  // Validate location
  if (!location || typeof location !== 'object') {
    errors.location = 'Data lokasi diperlukan';
  } else {
    if (!location.latitude || !location.longitude) {
      errors.location = 'Koordinat latitude dan longitude diperlukan';
    } else {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude harus berupa angka antara -90 dan 90';
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude harus berupa angka antara -180 dan 180';
      }
    }
  }

  // Validate urgency_level if provided
  if (req.body.urgency_level) {
    const validLevels = ['low', 'normal', 'high', 'critical'];
    if (!validLevels.includes(req.body.urgency_level)) {
      errors.urgency_level = 'Level urgensi tidak valid';
    }
  }

  // Validate conditions if provided
  if (req.body.conditions) {
    const { wave_height, wind_speed, visibility } = req.body.conditions;
    
    if (wave_height !== undefined && (isNaN(wave_height) || wave_height < 0 || wave_height > 30)) {
      errors.wave_height = 'Tinggi gelombang harus antara 0-30 meter';
    }
    
    if (wind_speed !== undefined && (isNaN(wind_speed) || wind_speed < 0 || wind_speed > 300)) {
      errors.wind_speed = 'Kecepatan angin harus antara 0-300 km/h';
    }
    
    if (visibility !== undefined && (isNaN(visibility) || visibility < 0 || visibility > 50)) {
      errors.visibility = 'Visibilitas harus antara 0-50 km';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Data tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate vote data
 */
const validateVoteData = (req, res, next) => {
  const { vote_type, accuracy_rating } = req.body;
  const errors = {};

  // Validate vote_type if provided
  if (vote_type && !['up', 'down'].includes(vote_type)) {
    errors.vote_type = 'Jenis vote harus "up" atau "down"';
  }

  // Validate accuracy_rating if provided
  if (accuracy_rating !== undefined) {
    const rating = parseFloat(accuracy_rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.accuracy_rating = 'Rating akurasi harus antara 1-5';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Data tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Validate comment data
 */
const validateCommentData = (req, res, next) => {
  const { content } = req.body;
  const errors = {};

  if (!content || typeof content !== 'string' || content.trim().length < 5) {
    errors.content = 'Komentar minimal 5 karakter';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Data tidak valid',
      details: errors,
      timestamp: new Date().toISOString()
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
};
