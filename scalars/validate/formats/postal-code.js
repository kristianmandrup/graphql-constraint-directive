const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isPostalCode } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return (
    isPostalCode(value, opts.locale) ||
    validationError.format("postalCode", value)
  );
};
