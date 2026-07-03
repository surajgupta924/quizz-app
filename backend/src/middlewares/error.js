export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') { status = 422; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (['JsonWebTokenError', 'TokenExpiredError'].includes(err.name)) { status = 401; message = 'Invalid or expired session'; }
  res.status(status).json({ success: false, message, ...(err.details && { errors: err.details }), ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
};
