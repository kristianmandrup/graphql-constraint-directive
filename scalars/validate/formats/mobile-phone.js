const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isMobilePhone } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return (
    isMobilePhone(value, opts.locale) ||
    validationError.format("mobilePhone", value)
  );
};
