class ApiResponse {
  
  // Response sukses
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error
  static error(
    res,
    message = "Internal Server Error",
    statusCode = 500,
    errors = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error validasi
  static validationError(res, errors, message = "Validation Error") {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error not found
  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error unauthorized
  static unauthorized(res, message = "Unauthorized access") {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error forbidden
  static forbidden(res, message = "Access forbidden") {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Response error bad request
  static badRequest(res, message = "Bad request") {
    return res.status(400).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
