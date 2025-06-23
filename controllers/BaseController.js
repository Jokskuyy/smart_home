class BaseController {
  handleSuccess(res, data, message = "Success") {
    res.json({
      success: true,
      message,
      data,
    });
  }

  handleError(res, error, statusCode = 500) {
    console.error("Controller Error:", error);
    res.status(statusCode).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }

  validateRequired(req, fields) {
    const missing = fields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }
}

module.exports = BaseController;
