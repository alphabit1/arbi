# Node.js TypeScript Boilerplate

Basic boilerplate for Node.js development with TypeScript, ESLint, Prettier, Airbnb styleguide, Mocha, Chai, istanbul, travis, coveralls pino, tsc-watch, 

[<img alt="npm" src="https://img.shields.io/david/alphabit1/nodejs-typescript-boilerplate.svg?style=flat-square">](https://david-dm.org/alphabit1/nodejs-typescript-boilerplate)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2d619cf29d4b45a18774ae1ca0d77303)](https://www.codacy.com/gh/alphabit1/nodejs-typescript-boilerplate/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=alphabit1/nodejs-typescript-boilerplate&amp;utm_campaign=Badge_Grade)

[![Build Status](https://travis-ci.com/alphabit1/nodejs-typescript-boilerplate.svg?branch=main)](https://travis-ci.com/alphabit1/nodejs-typescript-boilerplate)

[![Coverage Status](https://coveralls.io/repos/github/alphabit1/nodejs-typescript-boilerplate/badge.svg?branch=main)](https://coveralls.io/github/alphabit1/nodejs-typescript-boilerplate?branch=main)

[<img alt="MIT Licence" src="https://badges.frapsoft.com/os/mit/mit.svg?v=103">](https://opensource.org/licenses/mit-license.php)

This boilerplate includes the following features:

-   Logging with [pino](https://github.com/pinojs/pino)
-   Easy development with [tsc-watch](https://github.com/gilamran/tsc-watch#readme) and [pino-pretty](https://github.com/pinojs/pino-pretty)
-   Linting with [ESLint](https://eslint.org/).
-   Formatting with [Prettier](https://prettier.io/) and [Airbnb styleguide](https://github.com/airbnb/javascript).
-   Testing with Test Coverage using [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/) and [istanbul](https://istanbul.js.org/)

## install

```zsh
git clone https://github.com/alphabit1/nodejs-typescript-boilerplate <project-name>
cd <project-name>
rm -rf .git && git init     # remove git and initialize new git
npm i                       # install dependencies
```

## Commands

> Run

```zsh
npm run clean       # remove all generated
npm run build       # clean and build dist
npm run start       # start node
npm run dev         # tsc-watch and start with debugger
```

> Test

```zsh
# Test
npm run test                           # Run all test
# Test Coverage
npm run coverage                       # Calculate the coverage of all
# Test consistent coding style (Lint)
npm run lint                           # Lint all sourcecode
```
