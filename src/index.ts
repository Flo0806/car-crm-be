import app from "./server"; // Import the app

// Start server only when running the actual application
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
