const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isHexColor } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isHexColor(value) || validationError.format("hexColor", value);
};
