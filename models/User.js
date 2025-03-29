import { ObjectId } from "mongodb"
import clientPromise from "../lib/mongodb"
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

export async function createUser(userData) {
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: userData.email.toLowerCase() })
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Hash the password
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(userData.password, salt)

    const newUser = {
      name: userData.name || "User",
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(newUser)

    return {
      ...result,
      _id: result.insertedId,
      user: { ...newUser, password: undefined }, // Return user without password
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function findUserByEmail(email) {
  if (!email) {
    throw new Error("Email is required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    return db.collection("users").findOne({ email: email.toLowerCase() })
  } catch (error) {
    console.error("Error finding user by email:", error)
    throw error
  }
}

export async function findUserById(id) {
  if (!id) {
    throw new Error("User ID is required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    return db.collection("users").findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error("Error finding user by ID:", error)
    throw error
  }
}

export async function validatePassword(user, inputPassword) {
  if (!user || !inputPassword) {
    return false
  }

  try {
    return await bcrypt.compare(inputPassword, user.password)
  } catch (error) {
    console.error("Error validating password:", error)
    return false
  }
}

export async function updateUser(userId, updateData) {
  if (!userId) {
    throw new Error("User ID is required")
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const updates = {
      ...updateData,
      updatedAt: new Date(),
    }

    // Don't allow updating email or password through this function
    delete updates.email
    delete updates.password

    const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updates })

    return result
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

