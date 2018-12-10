const validator = require("validator");

const wrappedValidator = {
  // wrap your own validator using the same API
  isLength: validator.isLength,
  contains: validator.contains,
  isAlpha: validator.isAlpha,
  isAlphanumeric: validator.isAlphanumeric,
  isCreditCard: validator.isCreditCard,
  isCurrency: validator.isCurrency,
  isDateTime: validator.isRFC3339,
  isDate: validator.isISO8601,
  isDomainName: validator.isFQDN,
  isHash: validator.isHash,
  isHexColor: validator.isHexColor,
  isMobilePhone: validator.isMobilePhone,
  isMongoId: validator.isMongoId,
  isMimeType: validator.isMimeType,
  isPostalCode: validator.isPostalCode,
  isIPv6: value => validator.isIP(value, 6),
  isIPv4: value => validator.isIP(value, 4),
  isEmail: validator.isEmail,
  isByte: validator.isBase64,
  isAscii: validator.isAscii,
  isUri: validator.isURL,
  isUUID: validator.isUUID,
  isIsbn: validator.isISBN
};

module.exports = wrappedValidator;
