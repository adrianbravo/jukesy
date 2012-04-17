
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


## MIT License

Copyright (c) 2012 by Adrian Bravo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
