const fs = require('fs');
const path = require('path');

// 10 xonali random raqamli ID
function generateRandomId() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Rekursiv papka nusxalash
function copyFolderSync(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            copyFolderSync(srcPath, destPath); // ichidagi papkalarni ham nusxalaydi
        } else {
            fs.copyFileSync(srcPath, destPath); // fayllarni nusxalaydi
        }
    }
}

module.exports = {
    generateRandomId,
    copyFolderSync
};
