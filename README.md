# Fragments Microservice

A cloud-based solution that provides a REST API for creating, retrieving, updating, and deleting text and image fragments, with robust authorization, format conversion, and scalability features.

## Scripts

### Run Lint

```
npm run lint
```

Run this script to identify errors and potential issues in the source code via [ESLint](https://eslint.org/).

ESLint documentation can be found [here](https://eslint.org/docs/latest).

### Run Server

```
npm start
```

This will run the server normally on http://localhost:8080.

### Run Dev Server

```
npm run dev
```

The dev script will run the server on http://localhost:8080 via [Nodemon](https://nodemon.io/). It will monitor for any changes in the source code and automatically restart the server.

### Run Debugger

```
npm run debug
```

The debugging script is similar to the dev script, but connects a debugger to the process currently running on http://localhost:8080.

For instructions on using the VSCode debugger:

- https://code.visualstudio.com/docs/editor/debugging
- https://code.visualstudio.com/docs/nodejs/nodejs-debugging
