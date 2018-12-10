const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isEmail } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isEmail(value, opts.email) || validationError.format("email", value);
};
