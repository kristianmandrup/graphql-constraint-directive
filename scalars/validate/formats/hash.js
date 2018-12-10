const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isHash } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isHash(value, opts.hashAlgo) || validationError.format("hash", value);
};
