export default {
  success: (s) => console.log('\x1b[32m%s\x1b[0m', s),
  warn: (s) => console.warn('\x1b[33m%s\x1b[0m', s),
  error: (s) => console.error('\x1b[31m%s\x1b[0m', s),
};
