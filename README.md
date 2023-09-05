## Setup

* Install **Node.js**. See [Guide for NodeJs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)<br/>
  *Supported versions:*
```bash
"engines": {
    "node": "^20.0.0",
    "npm": "^6.14.15"
  }
```

* Install and Build<br/>
  *Install server dependencies:*
```bash
npm install
```
  *Install all modules with lerna:*    
```bash
npx lerna bootstrap
```  
*And build:*  
```bash
npx lerna run build
```

*Start the server*
```bash
npm run server:start
```

*Start ui*
```bash
cd ui/
npm start
```

*Running the Monitor - A service that periodically checks for new contracts on a single chain.*
```bash
npm run monitor:start
```