const timeoutMiddleware = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Configurar timeout
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error('⏰ Request timeout:', req.method, req.path);
        res.status(408).json({
          success: false,
          message: 'La petición tardó demasiado tiempo en procesarse',
          error: 'REQUEST_TIMEOUT'
        });
      }
    }, timeoutMs);

    // Limpiar timeout cuando la response termine
    const originalEnd = res.end;
    res.end = function(...args) {
      clearTimeout(timeout);
      originalEnd.apply(this, args);
    };

    next();
  };
};

module.exports = {
  timeoutMiddleware
}; 