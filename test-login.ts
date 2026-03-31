import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
const EMAIL = "admin@gmail.com";
const PASSWORD = "Admin@123";

async function testLogin() {
  try {
    console.log("🔐 Testing admin login...");
    console.log(`📧 Email: ${EMAIL}`);
    console.log(`🔑 Password: ${PASSWORD}\n`);

    const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    const text = await response.text();
    console.log("📨 Response Status:", response.status);
    console.log("📦 Response Text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("⚠️  Could not parse response as JSON");
      data = { raw: text };
    }

    if (response.status === 200) {
      console.log("\n✅ LOGIN SUCCESSFUL! ✅");
      if (data.user) {
        console.log("👤 User Role:", data.user.role || "N/A");
        console.log("🎯 User ID:", data.user.id);
      }
    } else {
      console.log("\n❌ Login failed");
      console.log("Error:", data.message || data.code || "Unknown error");
    }
  } catch (error) {
    console.error("❌ Error during test:", error);
  }
}

testLogin();
