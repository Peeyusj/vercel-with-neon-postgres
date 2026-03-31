async function compareHashes() {
  try {
    console.log("🔍 Comparing password hashes...\n");

    const response = await fetch(
      "http://localhost:3000/api/setup/compare-hashes",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

compareHashes();
