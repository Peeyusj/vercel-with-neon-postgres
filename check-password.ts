import { db } from "@/lib/db/client";
import { account } from "@/lib/auth/schema";
import { eq, sql } from "drizzle-orm";

async function checkPassword() {
  try {
    const result = await db.execute(sql`
      SELECT id, password FROM "account" 
      WHERE "provider_id" = 'credential' 
      LIMIT 1
    `);

    console.log("Query Result:", JSON.stringify(result.rows[0], null, 2));
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

checkPassword();
