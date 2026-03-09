const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // We want to replace "http://localhost:3001(.*)" with `${process.env.NEXT_PUBLIC_API_URL}$1`
    // Match "http://localhost:3001..." where ... is anything until the next double quote.
    const doubleRegex = /"http:\/\/localhost:3001([^"]*)"/g;
    if (doubleRegex.test(content)) {
        content = content.replace(doubleRegex, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
        hasChanges = true;
    }

    // Match 'http://localhost:3001...' where ... is anything until the next single quote.
    const singleRegex = /'http:\/\/localhost:3001([^']*)'/g;
    if (singleRegex.test(content)) {
        content = content.replace(singleRegex, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
        hasChanges = true;
    }

    // Match directly http://localhost:3001 (already inside backticks most likely)
    const exactRegex = /http:\/\/localhost:3001/g;
    if (exactRegex.test(content)) {
        content = content.replace(exactRegex, '${process.env.NEXT_PUBLIC_API_URL}');
        hasChanges = true;
    }

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
            processFile(fullPath);
        }
    }
}

const targetDir = path.join(__dirname, 'src');
console.log(`Starting replacement in: ${targetDir}`);
traverse(targetDir);
console.log('Replacement complete.');
