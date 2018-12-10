const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isPostalCode } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  console.log({ opts });
  return (
    isPostalCode(value, opts.countryCode) ||
    validationError.format("postalCode", value)
  );
};
