const { deepStrictEqual, strictEqual } = require("assert");
const setup = require("./setup");
const formatError = error => {
  const { message, code, fieldName, context } = error.originalError;

  return { message, code, fieldName, context };
};

describe("@constraint String", function() {
  const query = `mutation createBook($input: BookInput) {
    createBook(input: $input) {
      title
    }
  }`;

  const accountQuery = `mutation createAccount($input: AccountInput) {
    createAccount(input: $input) {
      ccCard
    }
  }`;

  describe("#minLength", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(minLength: 3)
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "he💩" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "a💩" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"a💩"}; Expected type ConstraintString at value.title; Must be at least 3 characters in length'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "a💩" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must be at least 3 characters in length",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "minLength", value: 3 }]
      });
    });
  });

  describe("#maxLength", function() {
    before(function() {
      this.typeDefs = `
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
        title: String @constraint(maxLength: 3)
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "a💩" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "fob💩" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"fob💩"}; Expected type ConstraintString at value.title; Must be no more than 3 characters in length'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "fob💩" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must be no more than 3 characters in length",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "maxLength", value: 3 }]
      });
    });
  });

  describe("#startsWith", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(startsWith: "💩")
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩foo" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "bar💩" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"bar💩"}; Expected type ConstraintString at value.title; Must start with 💩'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "bar💩" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must start with 💩",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "startsWith", value: "💩" }]
      });
    });
  });

  describe("#endsWith", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(endsWith: "💩")
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "a💩" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩bar" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"💩bar"}; Expected type ConstraintString at value.title; Must end with 💩'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩bar" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must end with 💩",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "endsWith", value: "💩" }]
      });
    });
  });

  describe("#contains", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(contains: "💩")
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "a💩o" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "fobar" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"fobar"}; Expected type ConstraintString at value.title; Must contain 💩'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "foobar" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must contain 💩",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "contains", value: "💩" }]
      });
    });
  });

  describe("#notContains", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(notContains: "foo")
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩foobar" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"💩foobar"}; Expected type ConstraintString at value.title; Must not contain foo'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩foobar" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must not contain foo",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "notContains", value: "foo" }]
      });
    });
  });

  describe("#pattern", function() {
    before(function() {
      this.typeDefs = `
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
        title: String! @constraint(pattern: "^[0-9a-zA-Z]*$")
      }`;

      this.request = setup(this.typeDefs);
    });

    it("should pass", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "afoo" } } });

      strictEqual(statusCode, 200);
      deepStrictEqual(body, { data: { createBook: null } });
    });

    it("should fail", async function() {
      const { body, statusCode } = await this.request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "£££" } } });

      strictEqual(statusCode, 400);
      strictEqual(
        body.errors[0].message,
        'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.title; Must match ^[0-9a-zA-Z]*$'
      );
    });

    it("should throw custom error", async function() {
      const request = setup(this.typeDefs, formatError);
      const { body, statusCode } = await request
        .post("/graphql")
        .set("Accept", "application/json")
        .send({ query, variables: { input: { title: "💩bar" } } });

      strictEqual(statusCode, 400);
      deepStrictEqual(body.errors[0], {
        message: "Must match ^[0-9a-zA-Z]*$",
        code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
        fieldName: "title",
        context: [{ arg: "pattern", value: "^[0-9a-zA-Z]*$" }]
      });
    });
  });

  describe("#format", function() {
    describe("#alphanumeric", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "alpha-numeric")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "afoo" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "£££" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.title; Must be in alphaNumeric format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "£££" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in alphaNumeric format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "alphaNumeric" }]
        });
      });
    });

    describe("#alpha", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "alpha")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "afoo" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "abc1" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"abc1"}; Expected type ConstraintString at value.title; Must be in alpha format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "abc1" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in alpha format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "alpha" }]
        });
      });
    });

    describe("#ascii", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "ascii")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "afoo" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "naughty😈" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"naughty😈"}; Expected type ConstraintString at value.title; Must be in ascii format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "naughty😈" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in ascii format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "ascii" }]
        });
      });
    });

    describe("#byte", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "byte")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "afoo" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "£££" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.title; Must be in byte format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "£££" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in byte format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "byte" }]
        });
      });
    });

    describe("#credit-card", function() {
      before(function() {
        this.typeDefs = `
        type Query {
          accounts: [Account]
        }
        type Book {
          ccNumber: String
        }
        type Mutation {
          createAccount(input: AccountInput): Account
        }
        input AccountInput {
          ccNumber: String! @constraint(format: "credit-card")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            accountQuery,
            variables: { input: { ccNumber: "5555555555554444" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createAccount: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            accountQuery,
            variables: { input: { ccNumber: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"ccNumber":"a"}; Expected type ConstraintString at value.ccNumber; Must be a valid credit-card number'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ accountQuery, variables: { input: { ccNumber: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid credit-card number",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "ccNumber",
          context: [{ arg: "format", value: "credit-card" }]
        });
      });
    });

    describe("#currency", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "byte")
          currencyCode: String! @constraint(format: "currency")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { currencyCode: "USD" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { currencyCode: "£££" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.currencyCode; Must be a valid currency code'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { currency: "xyz" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid currency code",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "currencyCode",
          context: [{ arg: "format", value: "currency-code" }]
        });
      });
    });

    describe("#data-uri", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "byte")
          uri: String! @constraint(format: "data-uri")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                uri: "data:text/vnd-example+xyz;foo=bar;base64,R0lGODdh"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { uri: "£££" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"£££"}; Expected type ConstraintString at value.currencyCode; Must be a valid data uri'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { uri: "xyz" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid data uri",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "uri",
          context: [{ arg: "format", value: "data-uri" }]
        });
      });
    });

    describe("#domain-name", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "byte")
          domain: String! @constraint(format: "domain-name")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                domain: "www.abc.com"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { domain: { uri: "£££" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"domain":"£££"}; Expected type ConstraintString at value.currencyCode; Must be a valid domain name'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { domain: "xyz" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid domain name",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "domain",
          context: [{ arg: "format", value: "domain-name" }]
        });
      });
    });

    describe("#date-time", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "date-time")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "2018-05-16 12:57:00Z" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be a date-time in RFC 3339 format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a date-time in RFC 3339 format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "date-time" }]
        });
      });
    });

    describe("#date", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "date")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "2018-05-16" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be a date in ISO 8601 format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a date in ISO 8601 format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "date" }]
        });
      });
    });

    describe("#email", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "email")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "test@test.com" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in email format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in email format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "email" }]
        });
      });
    });

    describe("#hash", function() {
      before(function() {
        this.typeDefs = `
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
          hashCode: String! @constraint(format: "hash")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: { hashCode: "e4bfb280c702635cf71d46a0c8c33b96" }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { hashCode: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"hashCode":"a"}; Expected type ConstraintString at value.title; Must be a valid hash'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { hashCode: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in hash format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "hashCode",
          context: [{ arg: "format", value: "hash" }]
        });
      });
    });

    describe("#hex-color", function() {
      before(function() {
        this.typeDefs = `
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
          color: String! @constraint(format: "hex-color")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: { color: "#008000" }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { color: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"color":"a"}; Expected type ConstraintString at value.title; Must be a valid hex color'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { hashCode: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid hex color",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "color",
          context: [{ arg: "format", value: "hex-color" }]
        });
      });
    });

    describe("#ipv4", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "ipv4")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "127.0.0.1" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in IP v4 format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in IP v4 format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "ipv4" }]
        });
      });
    });

    describe("#ipv6", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "ipv6")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "2001:db8:0000:1:1:1:1:1" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in IP v6 format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in IP v6 format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "ipv6" }]
        });
      });
    });

    describe("#isbn", function() {
      before(function() {
        this.typeDefs = `
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
          isbn: String! @constraint(format: "isbn")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { isbn: "978-3-16-148410-0" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { isbn: "978-3-16999-1" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"isbn":"978-3-16999-1"}; Expected type ConstraintString at value.title; Must be a valid ISBN'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { isbn: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid ISBN",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "isbn",
          context: [{ arg: "format", value: "isbn" }]
        });
      });
    });

    describe("#magnet-uri", function() {
      before(function() {
        this.typeDefs = `
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
          uri: String! @constraint(format: "magnet-uri")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                uri:
                  "magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { uri: "magnet:x.y/z" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"uri":"magnet:x.y/z"}; Expected type ConstraintString at value.title; Must be a valid magnet uri'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { uri: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid magnet uri",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "uri",
          context: [{ arg: "format", value: "magnet-uri" }]
        });
      });
    });

    describe("#mime-type", function() {
      before(function() {
        this.typeDefs = `
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
          mime: String! @constraint(format: "mime-type")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                mime: "text/html"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { mime: "xy" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"mime":"xy"}; Expected type ConstraintString at value.title; Must be a valid MIME type'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { mime: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid MIME type",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "mime",
          context: [{ arg: "format", value: "mime-type" }]
        });
      });
    });

    describe("#mobile-phone", function() {
      before(function() {
        this.typeDefs = `
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
          phone: String! @constraint(format: "mobile-phone")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                phone: "1-541-754-3010"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { phone: "1-6660-999-301" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"phone":"1-6660-999-301"}; Expected type ConstraintString at value.title; Must be a valid US mobile phone number'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { phone: "123" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid US mobile phone number",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "phone",
          context: [{ arg: "format", value: "mobile-phone" }]
        });
      });
    });

    describe("#mongo-id", function() {
      before(function() {
        this.typeDefs = `
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
          id: String! @constraint(format: "mongo-id"")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                id: "507f1f77bcf86cd799439011"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { id: "16660999301" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"phone":"1-6660-999-301"}; Expected type ConstraintString at value.title; Must be a valid Mongo id'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { id: "123" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid Mongo id",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "id",
          context: [{ arg: "format", value: "mongo-id" }]
        });
      });
    });

    describe("#postal-code", function() {
      before(function() {
        this.typeDefs = `
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
          postal: String! @constraint(format: "postal-code"")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: {
                postal: "85055"
              }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { postal: "0999301" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"phone":"1-6660-999-301"}; Expected type ConstraintString at value.title; Must be a valid postal code'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { postal: "123" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be a valid postal code",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "postal",
          context: [{ arg: "format", value: "postal-code" }]
        });
      });
    });

    describe("#uri", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "uri")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "foobar.com" } }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in URI format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in URI format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "uri" }]
        });
      });
    });

    describe("#uuid", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "uuid")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should pass", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: {
              input: { title: "A987FBC9-4BED-3078-CF07-9141BA07C9F3" }
            }
          });

        strictEqual(statusCode, 200);
        deepStrictEqual(body, { data: { createBook: null } });
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Must be in UUID format'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Must be in UUID format",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "uuid" }]
        });
      });
    });

    describe("#unknown", function() {
      before(function() {
        this.typeDefs = `
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
          title: String! @constraint(format: "test")
        }`;

        this.request = setup(this.typeDefs);
      });

      it("should fail", async function() {
        const { body, statusCode } = await this.request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({
            query,
            variables: { input: { title: "a" } }
          });

        strictEqual(statusCode, 400);
        strictEqual(
          body.errors[0].message,
          'Variable "$input" got invalid value {"title":"a"}; Expected type ConstraintString at value.title; Invalid format type test'
        );
      });

      it("should throw custom error", async function() {
        const request = setup(this.typeDefs, formatError);
        const { body, statusCode } = await request
          .post("/graphql")
          .set("Accept", "application/json")
          .send({ query, variables: { input: { title: "a" } } });

        strictEqual(statusCode, 400);
        deepStrictEqual(body.errors[0], {
          message: "Invalid format type test",
          code: "ERR_GRAPHQL_CONSTRAINT_VALIDATION",
          fieldName: "title",
          context: [{ arg: "format", value: "test" }]
        });
      });
    });
  });
});
