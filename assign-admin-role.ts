async function assignAdminRole() {
  try {
    console.log("👑 Assigning admin role...\n");

    const response = await fetch(
      "http://localhost:3000/api/setup/assign-admin-role",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log("\n✅✅✅ ADMIN SETUP COMPLETE!");
      console.log("\n📧 Email: admin@gmail.com");
      console.log("🔑 Password: Admin@123");
      console.log("👑 Role: ADMIN");
      console.log("\n✅ Admin can now access the admin dashboard!");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

assignAdminRole();
