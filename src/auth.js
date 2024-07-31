const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Employee')
    } catch (error) {
        console.log(error)
    }
};

connectDB();

const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const authModel = mongoose.model("Employee", authSchema);

module.exports = authModel;