const { handleError } = require("./error");
const number = require("./number");
const string = require("./string");

const validatorMap = {
  number: number.validate,
  string: string.validate
};

function validate(name, args, value, opts = {}) {
  return new ListValidator(name, args, value, opts).validate();
}

class ListValidator {
  constructor(name, args, values, opts = {}) {
    const validationError = opts.validationError || handleError;
    this.validationError = validationError;
    this.opts = opts;
    this.name = name;
    this.args = args;
    this.values = values;
  }

  get excludes() {
    return this.args.exclude;
  }

  validate() {
    this.sizeRange();
    this.includesOnly();
    this.excludesAll();
    this.matchesOnly();
    return true;
  }

  sizeRange() {
    const minSize = this.args.minSize || 0;
    const maxSize = this.args.maxSize || 99999;
    const { length } = this.values;
    return length <= maxSize && length >= minSize;
  }

  // test if each list value passes any matchDefinition using StringValidator or NumberValidator
  matchesOnly() {
    if (!this.matches) return;
    let hasMatchDef = false;
    const invalidItem = this.values.find(value => {
      const found = this.matches.find(matchDef => {
        if (typeof matchDef !== "object") return false;
        hasMatchDef = true;
        try {
          const validator = validatorMap[typeof value];
          validator &&
            validator(this.name, matchDef, value, this.opts).validate();
          return true;
        } catch (err) {
          return false;
        }
      });
      return !found;
    });
    if (!hasMatchDef) return;
    if (invalidItem) {
      this.validationError.list("includesFormat", { invalidItem, value });
    }
  }

  includesOnly() {
    if (!this.excludes) return;
    const invalidItem = this.values.find(val => !this.includes.indexOf(val));
    if (invalidItem) {
      this.validationError.list("includes", { invalidItem, value });
    }
  }

  excludesAll() {
    if (!this.excludes) return;
    const invalidItem = this.values.find(val => this.excludes.indexOf(val));
    if (invalidItem) {
      this.validationError.list("excludes", { invalidItem, value });
    }
  }
}

module.exports = {
  validate,
  ListValidator
};
