#!/bin/sh

if ! [ -d './node_modules' ]; then
  echo 'Installing required NPM modules...'
  npm install || exit 1
  echo 'Done!'
  echo
fi

openPage=1
hot='--hot'

while (( $# > 0 )); do
  case "$1" in
    "-O" ) openPage=0 ;;
    "-H" ) hot='' ;;
    "-OH") openPage=0 hot='' ;;
    *    ) echo "Unexpected option: $1" && exit 1 ;;
  esac
  shift
done

if [ "$openPage" == "1" ]; then
  ( sleep 2 && open 'http://localhost:5783/' ) &
fi

set -x; LIVERELOAD=1;DST_DIR=./public exec ./node_modules/.bin/webpack-dev-server \
  --config webpack.config.js \
  --port 5783 \
  --host 0.0.0.0 \
  --content-base ./public \
  --colors \
  ${hot}
