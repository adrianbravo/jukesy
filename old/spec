#!/bin/bash

# preparation
rm -rf ./test/coverage
jscoverage -v --no-instrument=app/views --exclude=.git --exclude=public --exclude=node_modules --exclude=test --exclude=locales . ../jukesy-cov
mv ../jukesy-cov ./test/coverage

# test
NODE_ENV=test vows --spec test/unit/* --cover-html

# cleanup
rm -rf ./test/coverage
mv coverage.html test/
