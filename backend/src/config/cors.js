const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost']);

function parseOriginUrl(origin) {
  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

function sharesLoopbackProtocol(origin, allowedOrigin) {
  const parsedOrigin = parseOriginUrl(origin);
  const parsedAllowedOrigin = parseOriginUrl(allowedOrigin);

  if (parsedOrigin === null || parsedAllowedOrigin === null) {
    return false;
  }

  return (
    LOOPBACK_HOSTS.has(parsedOrigin.hostname) &&
    LOOPBACK_HOSTS.has(parsedAllowedOrigin.hostname) &&
    parsedOrigin.protocol === parsedAllowedOrigin.protocol
  );
}

export function parseAllowedOrigins(clientOrigin) {
  return clientOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createCorsOriginChecker(clientOrigin) {
  const allowedOrigins = parseAllowedOrigins(clientOrigin);

  return (requestOrigin, callback) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }

    const isAllowed =
      allowedOrigins.includes(requestOrigin) ||
      allowedOrigins.some((allowedOrigin) => sharesLoopbackProtocol(requestOrigin, allowedOrigin));

    callback(null, isAllowed);
  };
}
