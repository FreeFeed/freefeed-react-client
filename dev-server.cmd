@echo off

set PORT=5783

if not exist .\node_modules\*.* (
  echo Installing required NPM modules...
  npm install
  echo Done!
  echo
) 

set DEV=1
set LIVERELOAD=1

./node_modules/.bin/webpack-dev-server ^
  --config webpack.config.js ^
  --port %PORT% ^
  --host 0.0.0.0 ^
  --output-public-path "http://localhost:%PORT%/" ^
  --colors ^
  --hot
