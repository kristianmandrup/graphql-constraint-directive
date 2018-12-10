const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDataUri } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isDataUri(value) || validationError.format("dataUri", value);
};
