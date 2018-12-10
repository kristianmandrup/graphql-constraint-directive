const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isIsbn } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isIsbn(value) || validationError.format("isbn", value);
};
