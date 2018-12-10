const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isCurrency } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return (
    isCurrency(value, opts.currency) ||
    validationError.format("currency", value)
  );
};
