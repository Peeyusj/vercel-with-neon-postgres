async function testSignIn() {
  try {
    console.log("Testing sign in via HTTP...\n");

    const response = await fetch(
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

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text.substring(0, 500));

    if (response.status === 200) {
      console.log("\n✅ Sign in successful!");
    } else {
      console.log("\n❌ Sign in failed");
    }
  } catch (error: any) {
    console.log("❌ Error:", error.message || error);
  }
}

testSignIn();
