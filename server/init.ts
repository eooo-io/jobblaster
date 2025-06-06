import { initializeAdminUser } from "./admin-init";

// Run the initialization
initializeAdminUser()
  .then(() => {
    console.log("Admin initialization complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to initialize admin:", error);
    process.exit(1);
  });
