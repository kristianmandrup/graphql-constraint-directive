const formats = [
  "byte",
  "date-time",
  "date",
  "data-uri",
  "magnet-uri",
  "email",
  "ascii",
  "alpha",
  "alpha-numeric",
  "currency-amount",
  "credit-card",
  "domain-name",
  "hash",
  "hex-color",
  "mongo-id",
  "mobile-phone",
  "mime-type",
  "postal-code",
  "isbn",
  "ipv4",
  "ipv6",
  "uri",
  "uuid"
];
const fns = {};

formats.forEach(format => {
  fns[format] = require("./" + format);
});

fns["url"] = fns["uri"];

module.exports = fns;
