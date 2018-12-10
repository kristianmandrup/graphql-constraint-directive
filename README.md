# GraphQL constraint directive ^+^

Allows using `@constraint` directive to validate GraphQL resolver input data.

Inspired by [Constraints Directives RFC](https://github.com/APIs-guru/graphql-constraints-spec) and OpenAPI

This library is an extension of [graphql-constraint-directive](https://github.com/confuser/graphql-constraint-directive)

This library by default uses [validator](https://www.npmjs.com/package/validator) for string validation.

We include a test suite that covers using all constraint directives (See [running tests](#Tests)), except for the [List](./ComplextTypes.md) constraint validator (WIP).

If you add support for validating additional string formats (or other validations), please make sure to add tests to cover success/failure cases before making a PR.

## Install

```
npm install graphql-constraint-directive-plus
```

## Usage

```js
const ConstraintDirective = require("graphql-constraint-directive-plus");
const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const typeDefs = `
  type Query {
    books: [Book]
  }
  type Book {
    title: String
  }
  type Mutation {
    createBook(input: BookInput): Book
  }
  input BookInput {
    title: String! @constraint(minLength: 5, format: "email")
  }`;
const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: { constraint: ConstraintDirective }
});
const app = express();

app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
```

## Integrations

Syncing validation for:

- entity models (on mutation save)
- forms (on field change or submit)

You can use the constraints of this library with [graphql-typeorm-validation](https://github.com/kristianmandrup/graphql-typeorm-validation) to generate decorators for [class-validator] that can be used on any entity model, such as a TypeOrm entity

```ts
@Entity
class Person extends BaseEntity {
  @MinLength(2)
  @MaxLength(60)
  name: string;
}
```

Use this with a typeorm `connection` to build an entity class map, where each map entry is a model class with matching [class-validator](https://github.com/typestack/class-validator) validation decorators applied.

The validation constraints are extracted via [graphGenTypeorm](https://github.com/jjwtay/graphGenTypeorm) from a GraphQL type definition

```js
import { buildEntityClassMap } from "graphql-typeorm-validation";

const entityClassMap = buildEntityClassMap(connection);
const { Post } = entityClassMap;
// ...
```

First your `createPost` mutation resolver applies directive constraints on input object.
It can then call `createPostModel` to create an in-memory `Post` model, `validate` it and then `save` it to the typeorm storage repository.

```js
const createPostModel = async ({title, text}) {
  try {
    let postRepository = connection.getRepository("Post");
    let post = new Post();
    post.title = title;
    post.text = text;
    await validate(post, {
      // ... optional validation options
    });
    await postRepository.save(post);
    return post
  } catch (err) {
    handleError(`createPostModel failure: ${err.message}`, err)
  }
}
```

### Mapping to general entity models

[graphGenTypeorm](https://github.com/jjwtay/graphGenTypeorm) uses [graphSchemaToJson](https://github.com/jjwtay/graphSchemaToJson) to first convert GraphQL type definitions (schema) to a Javascript object (JSON).

You could feed this schema object directly to the [mapper](https://github.com/kristianmandrup/graphql-typeorm-validation/blob/master/src/lib/class-validator/mapper.ts).

This can be done using the [decorate class API](https://github.com/kristianmandrup/graphql-typeorm-validation/blob/master/src/lib/decorate-class.ts) which lets you decorate any entity class with `class-validator` decorators.

### Syncing validations with forms

You can further use the schema object to generate [Yup](https://github.com/jquense/yup) form validations, using custom models in [json-schema-to-yup](https://www.npmjs.com/package/json-schema-to-yup#custom-models).

Yup goes hand-in-glove with [Formik](https://github.com/jaredpalmer/formik), the amazing form builder. Ideally you would then also generate the form, mapping model/type fields to form fields...

We then need to use [Yup addMethod](https://medium.com/@arkadyt/how-does-yup-addmethod-work-creating-custom-validation-functions-with-yup-8fddb71a5470) to create additional Yup validators to match those available for the `@constraint` directive

With a little trickery, you could sync your validations across:

- models
- mutation resolvers
- forms

Would love to see your contributions to make this dream into reality. Almost there!

## API

### String

#### minLength

`@constraint(minLength: 5)`
Restrict to a minimum length

#### maxLength

`@constraint(maxLength: 5)`
Restrict to a maximum length

#### startsWith

`@constraint(startsWith: "foo")`
Ensure value starts with foo

#### endsWith

`@constraint(endsWith: "foo")`
Ensure value ends with foo

#### contains

`@constraint(contains: "foo")`
Ensure value contains foo

#### notContains

`@constraint(notContains: "foo")`
Ensure value does not contain foo

#### pattern

`@constraint(pattern: "^[0-9a-zA-Z]*$")`
Ensure value matches regex, e.g. alphanumeric

#### format

`@constraint(format: "email")`
Ensure value is in a particular format

Supported formats:

- `alpha-numeric`
- `alpha`
- `ascii`
- `byte`
- `credit-card`
- `currency-amount`
- `data-uri`
- `date-time`
- `date`
- `domain-name`
- `email`
- `hash`
- `hex-color`
- `ipv4`
- `ipv6`
- `isbn`
- `magnet-uri`
- `mime-type`
- `mobile-phone`
- `mongo-id`
- `postal-code`
- `uri`
- `uuid`

Format validator options can be set as additional directive arguments:

```js
@constraint(format: 'alpha-numeric', locale: 'en-US')
```

Format options available (with default values):

```js
{
  locale: "en-US",
  hashAlgo: "md5",
  domainName: {
    require_tld: true,
    allow_underscores: false,
    allow_trailing_dot: false
  },
  email: {
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    domain_specific_validation: false
  },
  countryCode: "US", // country code such as US
  currency: {
    symbol: "$",
    require_symbol: false,
    allow_space_after_symbol: false,
    symbol_after_digits: false,
    allow_negatives: true,
    parens_for_negatives: false,
    negative_sign_before_digits: false,
    negative_sign_after_digits: false,
    allow_negative_sign_placeholder: false,
    thousands_separator: ",",
    decimal_separator: ".",
    allow_decimal: true,
    require_decimal: false,
    digits_after_decimal: [2],
    allow_space_after_digits: false
  }
}
```

### Int/Float

#### min

`@constraint(min: 3)`
Ensure value is greater than or equal to

#### max

`@constraint(max: 3)`
Ensure value is less than or equal to

#### exclusiveMin

`@constraint(exclusiveMin: 3)`
Ensure value is greater than

#### exclusiveMax

`@constraint(exclusiveMax: 3)`
Ensure value is less than

#### multipleOf

`@constraint(multipleOf: 10)`
Ensure value is a multiple

### ConstraintDirectiveError

Each validation error throws a `ConstraintDirectiveError`. Combined with a formatError function, this can be used to customise error messages.

```js
{
  code: 'ERR_GRAPHQL_CONSTRAINT_VALIDATION',
  fieldName: 'theFieldName',
  context: [ { arg: 'argument name which failed', value: 'value of argument' } ]
}
```

```js
const formatError = function(error) {
  if (
    error.originalError &&
    error.originalError.code === "ERR_GRAPHQL_CONSTRAINT_VALIDATION"
  ) {
    // return a custom object
  }

  return error;
};

app.use("/graphql", bodyParser.json(), graphqlExpress({ schema, formatError }));
```

## Customization

By default, the constraint directive uses [validator.js](https://www.npmjs.com/package/validator)

You can pass your own `validator` in the GraphQL context object, conforming to this API:

- `isLength(value)`
- `contains(value)`
- `isAlphanumeric(value, locale)`
- `isAlpha(value, locale)`
- `isAscii(value)`
- `isByte(value)`
- `isCreditCard(value)`
- `isCurrency(value)`
- `isDataUri(value)`
- `isDateTime(value)`
- `isDate(value)`
- `isDomainName(value)`
- `isEmail(value)`
- `isHash(value)`
- `isHexColor(value)`
- `isIPv6(value)`
- `isIPv4(value)`
- `isIsbn(value)`
- `isMagnetUri(value)`
- `isMimeType(value)`
- `isMobilePhone(value, locale)`
- `isMongoId(value)`
- `isPostalCode(value, countryCode)
- `isUri(value)`
- `isUUID(value)`

Note: All the above methods expect `value` to be a string.

The default [validator](https://www.npmjs.com/package/validator) is wrapped as follows:

```js
const wrappedValidator = {
  // wrap your own validator using the same API
  isLength: validator.isLength,
  contains: validator.contains,

  isAlpha: validator.isAlpha,
  isAlphanumeric: validator.isAlphanumeric,
  isAscii: validator.isAscii,

  isByte: validator.isBase64,

  isCreditCard: validator.isCreditCard,
  isCurrency: validator.isCurrency,

  isDataUri: validator.isDataURI,
  isDateTime: validator.isRFC3339,
  isDate: validator.isISO8601,
  isDomainName: validator.isFQDN,

  isEmail: validator.isEmail,

  isHash: validator.isHash,
  isHexColor: validator.isHexColor,

  isIPv6: value => validator.isIP(value, 6),
  isIPv4: value => validator.isIP(value, 4),
  isIsbn: validator.isISBN,

  isMagnetUri: validator.isMagnetURI,
  isMobilePhone: validator.isMobilePhone,
  isMongoId: validator.isMongoId,
  isMimeType: validator.isMimeType,

  isPostalCode: validator.isPostalCode,

  isUri: validator.isURL,
  isUUID: validator.isUUID
};
```

### Validation messages

You can set a `validationError` function map on the GraphQL context object to provide your own validator error handlers.

- `format(key, value)`
- `string(name, msg, args[])
- `number(name, msg, args[])

The format validators will call: `validationError.format('date', value)`

The `string` and `number` validators will call the error handler like this:

```js
validationError.string(name, `Must match ${args.pattern}`, [
  { arg: "pattern", value: args.pattern }
]);
```

Note that the third argument contains a list where each object has an `arg` entry that indicates the constraint that failed. You can use this as a key to lookup in your own validation error message map to return or output a localized error message as you see fit.

## Reusing validators

You can re-use the core validators as follows:

```js
import {
  string,
  number,
  list
} from "graphql-constraint-directive/scalars/validate";
import { validationError } from "graphql-constraint-directive/scalars/error";
import { validator } from "graphql-constraint-directive/validator";

const field = "name";
const args = { minLength: 4, maxLength: 40 };
value = "John Smith";

string.validate(name, args, value, { validator, validationError });
```

### Complex types

See [Complex types](./ComplexTypes.md)

## Development

### Tests

Run `npm run test:nolint` to run all tests without linting

## Resources

- [GraphQL List - How to use arrays in GraphQL schema (GraphQL Modifiers)](https://graphqlmastery.com/blog/graphql-list-how-to-use-arrays-in-graphql-schema)
- [Deep dive into GraphQL type system](https://github.com/mugli/learning-graphql/blob/master/7.%20Deep%20Dive%20into%20GraphQL%20Type%20System.md)
- [Life of a GraphQL Query — Validation](https://medium.com/@cjoudrey/life-of-a-graphql-query-validation-18a8fb52f189)
- [Graphql validated types](https://www.npmjs.com/package/graphql-validated-types)

## License

See [License](./LICENSE)
