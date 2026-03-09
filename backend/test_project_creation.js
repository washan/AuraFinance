// Native fetch in Node v18+
const path = require('path');
const fs = require('fs');

async function testCreateProject() {
    try {
        const tokenPath = path.join(__dirname, '..', 'frontend', 'test_token.txt');
        const token = fs.readFileSync(tokenPath, 'utf-8').trim();

        console.log("Token Loaded, starting request...");

        const res = await fetch("http://localhost:3001/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: "Negocio de Miel", description: "Venta de productos apícolas" })
        });

        console.log("Status:", res.status);
        const data = await res.text();
        console.log("Response Body:", data);

    } catch (e) {
        console.error("Script Error:", e);
    }
}

testCreateProject();
