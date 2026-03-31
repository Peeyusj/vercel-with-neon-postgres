async function setupFreshAdmin() {
  try {
    console.log("🔄 Setting up fresh admin account...\n");
    console.log("Step 1️⃣  : Deleting broken admin account...\n");

    // Delete old broken admin
    const deleteResponse = await fetch(
      "http://localhost:3000/api/setup/reset-admin",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const deleteData = await deleteResponse.json();
    console.log("Delete Status:", deleteResponse.status);
    console.log("Delete Response:", JSON.stringify(deleteData, null, 2));

    if (deleteResponse.status !== 200 && deleteResponse.status !== 404) {
      console.log("\n❌ Failed to delete old admin");
      return;
    }

    console.log("\n✅ Old admin deleted successfully!");
    console.log("\nStep 2️⃣  : Creating fresh admin via signup...\n");

    // Now signup with admin credentials
    const signupResponse = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "admin@gmail.com",
          password: "Admin@123",
          name: "Admin",
        }),
      },
    );

    console.log("Signup Status:", signupResponse.status);

    if (signupResponse.status === 200 || signupResponse.status === 201) {
      const signupData = await signupResponse.json();
      console.log("✅ Signup successful!");
      console.log("Admin User ID:", signupData.user?.id);

      const adminUserId = signupData.user?.id;

      console.log("\nStep 3️⃣  : Testing login...\n");

      // Test login
      const loginResponse = await fetch(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({
            email: "admin@gmail.com",
            password: "Admin@123",
          }),
        },
      );

      console.log("Login Status:", loginResponse.status);

      if (loginResponse.status === 200) {
        console.log("✅ Login successful!");
        console.log("\n✅✅✅ ADMIN AUTHENTICATION COMPLETE!");

        console.log("\n╔════════════════════════════════════╗");
        console.log("║  ADMIN ACCOUNT SET UP SUCCESSFULLY!  ║");
        console.log("╚════════════════════════════════════╝\n");
        console.log("📧 Email: admin@gmail.com");
        console.log("🔑 Password: Admin@123");
        console.log("🎯 User ID:", adminUserId);

        console.log("\n⚠️  IMPORTANT: Update admin role in database:");
        console.log(
          "   UPDATE profile SET role = 'ADMIN' WHERE user_id = '" +
            adminUserId +
            "'",
        );
        console.log("\n✅ Then admin can access the admin dashboard!");
      } else {
        const loginText = await loginResponse.text();
        console.log("❌ Login failed");
        console.log("Response:", loginText.substring(0, 200));
      }
    } else {
      const signupText = await signupResponse.text();
      console.log("❌ Signup failed");
      console.log("Status:", signupResponse.status);
      console.log("Response:", signupText.substring(0, 200));
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

setupFreshAdmin();
