const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isDomainName } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return (
    isDomainName(value, opts.domainName) ||
    validationError.format("domainName", value)
  );
};
