const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isAscii } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };

  return isAscii(value, opts.locale) || validationError.format("ascii", value);
};
