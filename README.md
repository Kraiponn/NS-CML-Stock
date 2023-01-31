<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">
  <h1 style="">Product Stock API</h1>
</p>

## Description

<span style="font-weight: 800; color:yellow">Rest API</span> for product stock, authentication, authorization, caching and more.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Prisma official document

<p style="text-indent:50px"><a href="https://www.prisma.io/docs/concepts">Prisma</a> is an open-source ORM for Node.js and TypeScript. It is used as an alternative to writing plain SQL, or using another database access tool such as SQL query builders (like knex.js) or ORMs (like TypeORM and Sequelize). Prisma currently supports PostgreSQL, MySQL, SQL Server, SQLite, MongoDB and CockroachDB (Preview).</p>

## Prisma packages in use

- [Prisma Cli](https://www.npmjs.com/package/prisma)
- [Prisma Client](https://www.npmjs.com/package/@prisma/client)

## Prisma command

```bash
  # Create initial prisma
  $ npx prisma init

  # Generate your SQL migration files and run them against the database
  $ npx prisma migrate dev
  $ npx prisma migrate dev --name <Migration Name>
  $ npx prisma migrate dev --create-only

  # Production and testing environments
  $ npx prisma migrate deploy

  # Prototype your schema
  $ npx prisma db push
  $ npx prisma db pull

  # Reset the development database
  $ npx prisma migrate reset
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Contact Me

- Author - [Kraipon Najaroon](https://www.github.com/kraiponn)
- Website - [https://nestjs.com](https://nestjs.com/)
