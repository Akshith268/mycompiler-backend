const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const executePy = async (filepath, input = "") => {
    const jobID = path.basename(filepath).split('.')[0];
    const inputFile = path.join(__dirname, 'outputs', `${jobID}_input.txt`);

    // Write input to a file if input is provided
    if (input) {
        fs.writeFileSync(inputFile, input);
    }

    return new Promise((resolve, reject) => {
        // Construct the command
        const command = input
            ? `python ${filepath} < ${inputFile}`
            : `python ${filepath}`;

        exec(command, (error, stdout, stderr) => {
            // Clean up input file if it was created
            if (input) {
                fs.unlinkSync(inputFile);
            }
            if (error) {
                console.log("Error:", error);
                return reject({ error: error.message, stderr });
            }
            if (stderr) {
                console.log("stderr:", stderr);
                return reject({ stderr });
            }
            return resolve({ stdout });
        });
    });
}

module.exports = { executePy };
