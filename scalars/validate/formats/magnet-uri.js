const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isMagnetUri } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isMagnetUri(value) || validationError.format("magnetUri", value);
};
