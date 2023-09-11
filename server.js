// At the top of your server.js file
require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Import the cors middleware
const uuid = require("uuid");
const multer = require("multer"); // Import multer for handling file uploads

const app = express();
// Use the cors middleware to enable CORS for all routes and specify the allowed origin
const server = http.createServer(app); // Create an HTTP server

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
    credentials: true, // Enable credentials (cookies, authorization headers, etc.) if needed
  })
);

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Existing routes...

// New endpoint to handle video uploads
app.post("/upload-video", upload.fields([{ name: 'currentVideo', maxCount: 1 }, { name: 'remoteVideo', maxCount: 1 }]), (req, res) => {
  try {
    // Access uploaded files through req.files
    const currentVideo = req.files['currentVideo'][0];
    const remoteVideo = req.files['remoteVideo'][0];

    // Process the uploaded videos as needed (e.g., save to disk, store in a database, etc.)

    // Respond with a success message
    res.status(200).json({ message: "Videos uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// Route for user sign-up
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the specified role (default to "user" if not provided)
    const id = uuid.v4(); // Use uuidv4 to generate a unique ID

    const newUser = {
      id,
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    };

    // Store the user in the in-memory database (for demonstration purposes)
    users.push(newUser);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// Route to get a list of users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// Route for user sign-in
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email in the in-memory database
    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Compare the password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Create a JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user.email, email: user.email },
      jwtSecretKey,
      { expiresIn: "1h" } // Token expiration time
    );

    res.status(200).json({ token, userId: user.email, role: user.role, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// Start the server on localhost:3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
