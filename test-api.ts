async function testAPI() {
  try {
    // Test if existing check-admin endpoint works
    const response = await fetch(
      "http://localhost:3000/api/setup/check-admin",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log("Check Admin Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testAPI();
