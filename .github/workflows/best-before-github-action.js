import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bestBeforeDocComment = process.env.BEST_BEFORE_COMMENT || 'best-before-doc';

function isMarkdownFile(filePath) {
    return fs.statSync(filePath).isFile() && filePath.endsWith('.md');
}

async function raiseIssue(filePath) {
    // check issues exist
    return await fetch('https://api.github.com/repos/reyrodrigez/.github/issues', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({ title: `Document review needed: ${filePath}`, body: `Review needed for ${filePath}` }),
    });
}

function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`<!-- ${bestBeforeDocComment} -->`)) {
        const startTag = RegExp.escape(`<!-- ${bestBeforeDocComment} -->`);
        const endTag = RegExp.escape(`<!-- ${bestBeforeDocComment} end -->`);
        const regex = new RegExp(`${startTag}([\\s\\S]+?)${endTag}`, 'g');
        const match = regex.exec(content);
        const captured = match ? match[1] : null;
        console.log(`File: ${filePath} has BBE comment, ${captured ? 'captured content' : 'no content captured' }`);
        if (captured) {
            raiseIssue(filePath)
                .then(response => console.log(`Issue raised for ${filePath}:`, response))
                .catch(err => {
                console.error(`Failed to raise issue for ${filePath}:`, err);
            });
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