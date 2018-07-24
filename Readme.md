# BrewDocs

My open-source homebrewing software.

## Setup

```
/> git clone git@github.com:matt-whitaker/brewdocs.git
/> cd brewdocs
/> npm install
/> npm start
```

### .env

```
FULLSCREEN=true
MYSQL_PORT=3307
MYSQL_ROOT_PASSWORD=your_pass
MYSQL_DATABASE=brewdocs
MYSQL_USER=demo
MYSQL_PASS=
NODE_ENV=development
```

### MySQL

`npm run mysql:start` will setup a Docker MySQL container
`npm run mysql:stop` will tear it down

You will need to provide `MYSQL_ROOT_PASSWORD=your_pass`
