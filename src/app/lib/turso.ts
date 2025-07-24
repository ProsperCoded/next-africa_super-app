import { createClient } from "@libsql/client";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    "Missing required Turso environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN"
  );
}

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Database schema initialization
export async function initializeDatabase() {
  try {
    console.log("Initializing Turso database...");

    // Create users table if it doesn't exist
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid)
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// User management functions
export interface User {
  id: number;
  uid: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(userData: {
  uid: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<User> {
  try {
    console.log("Creating user in Turso:", {
      uid: userData.uid,
      email: userData.email,
    });

    const result = await turso.execute({
      sql: `
        INSERT INTO users (uid, email, password_hash, first_name, last_name, phone)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        userData.uid,
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
        userData.phone || null,
      ],
    });

    if (result.rows.length === 0) {
      throw new Error("Failed to create user");
    }

    const user = result.rows[0] as any;
    console.log("User created successfully in Turso:", user.uid);
    return user as User;
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.message?.includes("UNIQUE constraint failed")) {
      if (error.message.includes("email")) {
        throw new Error("User with this email already exists");
      }
      if (error.message.includes("uid")) {
        throw new Error("User with this UID already exists");
      }
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("Getting user by email:", email);

    const result = await turso.execute({
      sql: "SELECT * FROM users WHERE email = ? LIMIT 1",
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      console.log("User not found:", email);
      return null;
    }

    const user = result.rows[0] as any;
    console.log("User found:", { uid: user.uid, email: user.email });
    return user as User;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

export async function getUserByUID(uid: string): Promise<User | null> {
  try {
    const result = await turso.execute({
      sql: "SELECT * FROM users WHERE uid = ? LIMIT 1",
      args: [uid],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as any;
  } catch (error) {
    console.error("Error getting user by UID:", error);
    throw error;
  }
}

export async function updateUserLastLogin(uid: string): Promise<void> {
  try {
    await turso.execute({
      sql: "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE uid = ?",
      args: [uid],
    });
  } catch (error) {
    console.error("Error updating user last login:", error);
    // Don't throw here as it's not critical
  }
}
