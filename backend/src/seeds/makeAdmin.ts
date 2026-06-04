import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { User } from '../models'

async function makeAdmin() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: ts-node src/seeds/makeAdmin.ts <email>')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI as string)

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isAdmin: true },
    { new: true },
  )

  if (!user) {
    console.error(`❌ No user found with email: ${email}`)
  } else {
    console.log(`✅ ${user.name} (${user.email}) is now an admin`)
  }

  await mongoose.disconnect()
}

makeAdmin().catch(err => { console.error(err); process.exit(1) })
