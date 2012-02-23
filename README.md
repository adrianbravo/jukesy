
# Set up

Make sure to install all npm packages.

    npm install

Copy config/mongodb.example.js to config/mongodb.js and fill in options particular to your database.

In config/index.js, app.pepper can be changed. It is used for hashing via bcrypt.

## Starting the server

Run the index.js file from the root project folder, for example:

    node .

# Testing

Tests are located in /test. They use mocha, chai (with expect-style assertions), and superagent. All tests may be invoked from the project's root directory like this:

    mocha

