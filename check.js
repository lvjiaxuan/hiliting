
import { exec } from 'child_process';
import { writeFileSync } from 'fs';

exec('shopify theme check -o json', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${JSON.stringify({ error, stdout, stderr }, null, 2)}`);
        writeFileSync('check.json', stdout);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        writeFileSync('check.json', `Stderr: ${stderr}\n${stdout}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    writeFileSync('check.json', stdout);
});
