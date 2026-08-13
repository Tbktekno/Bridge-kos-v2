import pretty from 'pino-pretty';

const METHOD_COLORS = {
  GET: 'green',
  POST: 'blue',
  PUT: 'yellow',
  PATCH: 'magenta',
  DELETE: 'red',
  OPTIONS: 'cyan',
  HEAD: 'gray',
};

function statusColor(statusCode, colors) {
  if (statusCode >= 500) return colors.red;
  if (statusCode >= 400) return colors.yellow;
  if (statusCode >= 300) return colors.cyan;
  return colors.green;
}

function responseTimeColor(responseTime, colors) {
  if (responseTime >= 1000) return colors.red;
  if (responseTime >= 500) return colors.yellow;
  return colors.green;
}

export default function (opts) {
  return pretty({
    ...opts,
    messageFormat: (log, messageKey, _levelLabel, { colors }) => {
      const { req, res } = log;

      if (!req || !res) {
        return log[messageKey];
      }

      const method = String(req.method ?? '');
      const url = String(req.url ?? '');
      const statusCode = Number(res.statusCode);
      const responseTime = Number(log.responseTime ?? 0);

      const methodColor = colors[METHOD_COLORS[method]] ?? colors.white;
      const status = statusColor(statusCode, colors);
      const response = responseTimeColor(responseTime, colors);

      return `${methodColor(method)} ${colors.bold(url)} ${status(statusCode)} ${response(String(responseTime))}ms`;
    },
  });
}
