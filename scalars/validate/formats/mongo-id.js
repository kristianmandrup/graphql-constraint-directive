const formatError = require("./_format-error");

module.exports = (value, opts = {}) => {
  const { isMongoId } = opts.validator;
  const validationError = {
    ...formatError,
    ...opts.validationError
  };
  return isMongoId(value) || validationError.format("mongoId", value);
};
