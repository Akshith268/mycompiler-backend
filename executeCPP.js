const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const outputpath = path.join(__dirname, 'outputs');

if (outputpath && !fs.existsSync(outputpath)) {
    fs.mkdirSync(outputpath, { recursive: true });
}

const executeCPP = async (filepath, input = "") => {
    const jobID = path.basename(filepath).split('.')[0];
    const outputfile = path.join(outputpath, `${jobID}.exe`);
    const inputFile = path.join(outputpath, `${jobID}_input.txt`);

    // Write input to a file if input is provided
    if (input) {
        fs.writeFileSync(inputFile, input);
    }

    return new Promise((resolve, reject) => {
        // Construct the command
        const command = input
            ? `g++ ${filepath} -o ${outputfile} && ${outputfile} < ${inputFile}`
            : `g++ ${filepath} -o ${outputfile} && ${outputfile}`;

        exec(command, (error, stdout, stderr) => {
            // Clean up input file if it was created
            if (input) {
                fs.unlinkSync(inputFile);
            }
            if (error) {
                return reject({ error: error.message, stderr });
            }
            if (stderr) {
                return reject({ stderr });
            }
            return resolve({ stdout });
        });
    });
}

module.exports = { executeCPP };
