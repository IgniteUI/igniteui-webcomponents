export default {
  error: (s) => console.error('\x1b[31m%s\x1b[0m', s),
  success: (s) => console.info('\x1b[32m%s\x1b[0m', s),
  warn: (s) => console.warn('\x1b[33m%s\x1b[0m', s),
  info: (s) => console.info('\x1b[36m%s\x1b[0m', s),
};
