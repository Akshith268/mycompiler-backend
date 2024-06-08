const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    filepath:{
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum:["cpp","python"]
    },

    status: {
        type: String,
        default: "PENDING",
        enum:["PENDING","SUCCESS","ERROR"]
    },
    output: {
        type: String,
        default: ""
    },
    submittedAt:{
        type: Date,
        default: Date.now
    },
    startedAt:{
        type: Date,
        default: null
    },
    completedAt:{
        type: Date,
        default: null
    }


}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;