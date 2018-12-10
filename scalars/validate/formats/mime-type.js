const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isMimeType } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isMimeType(value) || validationError.format("mimeType", value);
};
