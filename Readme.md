# BrewDocs

My open-source homebrewing software.

## Setup

```
/> git clone git@github.com:matt-whitaker/brewdocs.git
/> cd brewdocs
/> npm install
```

### MySQL

Assuming Docker is installed,

`MYSQL_ROOT_PASSWORD=your_pass npm run mysql:start`

which will start up a docker container for mysql.

To tear it down run,

`npm run mysql:stop`




