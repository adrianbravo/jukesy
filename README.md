
# Set up

Make sure to install all npm packages.

    npm install

Files with protected keys, passwords and other sensitive data are only saved as examples. To finish installation, copy them over and replace any necessary data:

    cp config/mongodb.example.js config/mongodb.js
    cp config/pepper.example.js config/pepper.js

## Starting the server

Run the index.js file from the root project folder, for example:

    node .

# Testing

Tests are located in /test. They use mocha, chai (with expect-style assertions), and superagent. All tests may be invoked from the project's root directory like this:

    mocha

