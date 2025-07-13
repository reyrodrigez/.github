const fs = require('fs');
const path = require('path');

function logMarkdownFiles(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            logMarkdownFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            console.log(fullPath);
        }
    });
}

logMarkdownFiles(path.resolve(__dirname, '../../..'));