module.exports = (err, req, res, next) => {
  console.error("❌ Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
