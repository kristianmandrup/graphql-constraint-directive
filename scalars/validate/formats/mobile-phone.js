const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isMobilePhone } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return (
    isMobilePhone(value, opts.phone) ||
    validationError.format("mobilePhone", value)
  );
};
