async function testSignupHashFormat() {
  try {
    console.log("👤 Creating test user...\n");

    // Signup with a test email
    const signupResponse = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "testuser123@example.com",
          password: "TestPassword123",
          name: "Test User",
        }),
      },
    );

    console.log("Signup Status:", signupResponse.status);

    if (signupResponse.status === 200 || signupResponse.status === 201) {
      console.log("✅ Test user created!\n");
      console.log("Now immediately testing login with same credentials...\n");

      // Try to login immediately
      const loginResponse = await fetch(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({
            email: "testuser123@example.com",
            password: "TestPassword123",
          }),
        },
      );

      console.log("Login Status:", loginResponse.status);
      const loginText = await loginResponse.text();

      if (loginResponse.status === 200) {
        console.log("✅ Login successful!");
        console.log("This means Better Auth CAN verify passwords correctly.");
        console.log(
          "So the issue is specifically with our admin user's password hash.\n",
        );

        console.log(
          "Next step: Check what hash format Better Auth created for testuser123...",
        );
      } else {
        console.log("❌ Even new signup login failed!");
        console.log("Response:", loginText.substring(0, 200));
      }
    } else {
      const signupText = await signupResponse.text();
      console.log("Signup failed:", signupText.substring(0, 200));
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

testSignupHashFormat();
