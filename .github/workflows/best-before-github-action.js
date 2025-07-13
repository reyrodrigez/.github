import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bestBeforeDocComment = process.env.BEST_BEFORE_COMMENT || 'best-before-doc';

function isMarkdownFile(filePath) {
    return fs.statSync(filePath).isFile() && filePath.endsWith('.md');
}

function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`<!-- ${bestBeforeDocComment} -->`)) {
        const startTag = `<!-- ${bestBeforeDocComment} -->`;
        const endTag = `<!-- ${bestBeforeDocComment} end -->`;
        const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
        const match = content.match(regex);
        if (match) {
            console.log(`Found content between tags in ${filePath}: ${match[0]}`);
            return;
        }
    }
    console.log(`File: ${filePath} does not have BBE comment`);
}


function logMarkdownFiles(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            logMarkdownFiles(fullPath);
        } else if (isMarkdownFile(fullPath)) {
            parseMarkdownFile(fullPath);
        }
    });
}

logMarkdownFiles(path.resolve(__dirname, '../../..'));