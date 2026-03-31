async function directAdminSignup() {
  try {
    console.log("📝 Attempting direct admin signup...\n");

    // Try to signup - if email exists, will get error message
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
    const signupText = await signupResponse.text();

    if (signupResponse.status === 200 || signupResponse.status === 201) {
      try {
        const signupData = JSON.parse(signupText);
        console.log("✅ Signup successful!");
        console.log("Admin User ID:", signupData.user?.id);
        console.log("\nNow testing login...\n");

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
          console.log("\n✅✅✅ ADMIN AUTHENTICATION WORKING!");
          console.log("\n📧 Email: admin@gmail.com");
          console.log("🔑 Password: Admin@123");
          console.log("\n⚠️  Remember to set admin role in database:");
          console.log(
            "   UPDATE profile SET role = 'ADMIN' WHERE user_id = '" +
              signupData.user?.id +
              "'",
          );
        } else {
          console.log("❌ Login failed after signup - unexpected!");
        }
      } catch (e) {
        console.log("Signup response:", signupText.substring(0, 200));
      }
    } else if (signupResponse.status === 422) {
      const signupData = JSON.parse(signupText);
      console.log("❌ Email already exists:", signupData.message);
      console.log("\n⚠️  Need to delete the old admin account first.");
      console.log(
        "   The old account has an invalid password hash (Better Auth incompatible).",
      );
      console.log("   Cannot fix it directly, must delete and recreate.");
    } else {
      console.log("❌ Signup failed");
      console.log("Response:", signupText.substring(0, 200));
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

directAdminSignup();
