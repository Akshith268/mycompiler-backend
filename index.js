const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { generateFile } = require('./generateFile');
const { executeCPP } = require('./executeCPP');
const { executePy } = require('./executePy');
const Job = require('./models/Job');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.post('/compile', async (req, res) => {
    const { language = "cpp", code, input = "" } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Code is required" });
    }
    let job;
    try {
        const filepath = await generateFile(language, code);
        job = await new Job({ filepath, language }).save();
        const jobId = job["_id"];
        let output;
        job.startedAt = Date.now();
        await job.save();
        console.log("Job ID:", jobId);
        if (language === "python") {
            output = await executePy(filepath, input);
        } else {
            output = await executeCPP(filepath, input);
        }

        job.completedAt = Date.now();
        job.output = output.stdout;
        job.status = "SUCCESS";
        await job.save();
        console.log("Output:", output.stdout);

        return res.status(200).json({ jobId, filepath, output: output.stdout });
    } catch (error) {
        if (job) {
            job.completedAt = Date.now();
            job.output = JSON.stringify(error.stderr || error.error || "Execution Error");
            job.status = "ERROR";
            await job.save();
        }
        return res.status(500).json({ error: error.stderr || error.error || "Internal Server Error" });
    }
});

app.get('/status/:jobId', async (req, res) => {
    const jobId = req.params.jobId;
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }
        return res.status(200).json({ success: true, job });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
