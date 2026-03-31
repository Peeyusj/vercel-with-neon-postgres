async function deleteAdminViaAPI() {
  try {
    console.log("🗑️  Deleting old admin via API...\n");

    const response = await fetch(
      "http://localhost:3000/api/setup/delete-admin",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log("\n✅ Admin deleted! Now attempting signup...\n");

      // Now signup
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

      const signupText = await signupResponse.text();
      console.log("Signup Status:", signupResponse.status);

      if (signupResponse.status === 200 || signupResponse.status === 201) {
        console.log("✅ Signup successful!\n");

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
          console.log("✅✅✅ LOGIN SUCCESSFUL!");
          console.log("\n📧 Email: admin@gmail.com");
          console.log("🔑 Password: Admin@123");
          console.log("\n✅ Admin account is now fully functional!");
          console.log("🔐 Now update the role to ADMIN in the database");
        } else {
          const loginText = await loginResponse.text();
          console.log("Login response:", loginText.substring(0, 200));
        }
      } else {
        console.log("Signup failed:", signupText.substring(0, 200));
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

deleteAdminViaAPI();
