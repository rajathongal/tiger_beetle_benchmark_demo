export const corsOptionsDelegate = function (request, callback) {
    let corsOptions;

    const whitelist = process.env.ALLOWED_ORIGINS.split(",");

    if (whitelist.indexOf(request?.header('Origin')) !== -1) {
      corsOptions = { credentials: true, origin: true, allowedHeaders: ['Origin', 'Accept', 'Content-Type', 'Authorization', 'X-Requested-With', 'Set-cookie', 'sentry-trace'] }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};