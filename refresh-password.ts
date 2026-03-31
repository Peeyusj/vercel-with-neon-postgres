async function refreshPassword() {
  try {
    console.log("🔄 Refreshing admin password...\n");

    const response = await fetch(
      "http://localhost:3000/api/setup/refresh-password",
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
      console.log("\n✅ Password refreshed!\n");

      // Now test login
      console.log("🔐 Testing sign in...\n");

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

      const loginText = await loginResponse.text();
      console.log("Login Status:", loginResponse.status);

      if (loginResponse.status === 200) {
        console.log("✅✅✅ LOGIN SUCCESSFUL!");
        console.log("\n📧 Email: admin@gmail.com");
        console.log("🔑 Password: Admin@123");
        console.log("\n✅ Admin authentication is now working!");
      } else {
        console.log("❌ Login failed");
        console.log("Response:", loginText.substring(0, 500));
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

refreshPassword();
