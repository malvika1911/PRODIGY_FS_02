const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const cors = require("cors");

const app = express();

const templatepath = path.join(__dirname, '../templates');

// Setting up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.set("view engine", "ejs");
app.set("views", templatepath);

const startServer = async () => {
  try {
    // Connect to the database
    const client = await MongoClient.connect("mongodb://localhost:27017");
    console.log("Connected to DB");

    // Define the DB name and collection name
    const db = client.db("Employee");
    const employeeCollection = db.collection("employeeInfo");
    const authCollection = db.collection("authenticationInfo");

    // Define routes
    app.get("/home", async (req, res) => {
      try {
        const employees = await employeeCollection.find({}).toArray();
        res.render("home", { employees });
      } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).send("Error fetching employees");
      }
    });

    app.get("/", (req, res) => {
      res.render("login", { error: null });
    });

    app.get("/signup", (req, res) => {
      res.render("signup", { error: null });
    });

    // Event handling part
    app.post("/addEmployees", async (req, res) => {
      const { newEmployeeID, newEmployeeName, newEmployeeNumber, dateOfJoining } = req.body;
      try {
        const data = {
          newEmployeeID,
          newEmployeeName,
          newEmployeeNumber,
          dateOfJoining
        };
        await employeeCollection.insertOne(data);
        const employees = await employeeCollection.find({}).toArray();
        res.render("home", { message: "Entry created successfully!", employees });
      } catch (error) {
        console.error("Cannot add employee due to some issues", error);
        res.status(500).send("Cannot add employee due to some issues");
      }
    });

    app.post("/deleteRecords", async (req, res) => {
      const { employeeID } = req.body;
      try {
        await employeeCollection.deleteOne({ newEmployeeID: employeeID });
        const employees = await employeeCollection.find({}).toArray();
        res.render("home", { message: "Employee deleted successfully!", employees });
      } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).send("Error deleting employee");
      }
    });

    app.post("/updateRecords", async (req, res) => {
      const { newEmployeeID, newEmployeeName, newEmployeeNumber, dateOfJoining } = req.body;
      try {
        await employeeCollection.updateOne(
          { newEmployeeID },
          { $set: { newEmployeeName, newEmployeeNumber, dateOfJoining } }
        );
        const employees = await employeeCollection.find({}).toArray();
        res.render("home", { message: "Employee updated successfully!", employees });
      } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).send("Error updating employee");
      }
    });

    app.post("/signup", async (req, res) => {
      const { name, password } = req.body;
      try {
        const existUsername = await authCollection.findOne({ name });
        if (existUsername) {
          res.render("signup", { error: "Username already exists" });
        } else {
          const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
          const data = {
            name,
            password: hashedPassword,
          };
          await authCollection.insertOne(data);
          const employees = await employeeCollection.find({}).toArray();
          res.render("home", { message: "Account created successfully!", employees });
        }
      } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Error during signup");
      }
    });

    app.post("/login", async (req, res) => {
      const { name, password } = req.body;
      try {
        const user = await authCollection.findOne({ name });
        if (user && await bcrypt.compare(password, user.password)) { // Compare the hashed password
          const employees = await employeeCollection.find({}).toArray();
          res.render("home", { employees });
        } else {
          res.render("login", { error: "Invalid username or password" });
        }
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Error during login");
      }
    });

    app.get("/api/data", async (req, res) => {
      try {
        const employees = await employeeCollection.find({}).toArray();
        res.json(employees);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
      }
    });

    // Defining the port which the app will listen
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error("An error occurred while connecting to the server", error);
  }
};

startServer();
