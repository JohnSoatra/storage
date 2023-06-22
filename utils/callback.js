const fs = require('fs');

function callback() {
    setInterval(() => {
        listener();
    }, 500);
}

function listener() {
    // working
}

module.exports = callback;