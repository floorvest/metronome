#!/bin/sh
unset TURBOPACK
exec node node_modules/.bin/next build "$@"