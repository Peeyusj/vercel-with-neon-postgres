async function createFreshAdmin() {
  try {
    console.log("📝 Creating fresh admin account via signup...\n");

    // First, delete the old admin from database via direct SQL since we can't use ORM
    // (The old admin has an invalid password hash)

    // Actually, let's just try to sign up - this will create a brand new user
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
          image: "",
        }),
      },
    );

    const signupText = await signupResponse.text();
    console.log("Signup Status:", signupResponse.status);
    console.log("Signup Response:", signupText.substring(0, 300));

    if (signupResponse.status === 200 || signupResponse.status === 201) {
      try {
        const signupData = JSON.parse(signupText);
        console.log("\n✅ Signup successful!");
        console.log("User ID:", signupData.user?.id);

        // Now test login with the new password
        console.log("\n🔐 Testing login with new credentials...\n");

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
        console.log("Login Response:", loginText.substring(0, 300));

        if (loginResponse.status === 200) {
          console.log("\n✅✅✅ LOGIN SUCCESSFUL!");
          console.log("📧 Email: admin@gmail.com");
          console.log("🔑 Password: Admin@123");
          console.log("✅ Admin account is now fully functional!");

          // Now we need to update the role to ADMIN in the profile
          console.log(
            "\n⚠️  Important: Update admin role in database profile table",
          );
          console.log(
            '   UPDATE profile SET role = "ADMIN" WHERE user_id = (SELECT id FROM "user" WHERE email = "admin@gmail.com")',
          );
        } else {
          console.log("\n❌ Login still failing after signup");
        }
      } catch (e) {
        console.log("Could not parse response");
      }
    } else {
      console.log("\n❌ Signup failed");
      if (signupText.includes("already exists")) {
        console.log(
          "    → Admin email already exists, need to delete old account first",
        );
      }
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message || error);
  }
}

createFreshAdmin();
