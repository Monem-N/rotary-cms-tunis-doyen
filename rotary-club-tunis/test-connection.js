// MongoDB Atlas Connection Test for Rotary Club Tunis Doyen CMS
// This script tests the database connection and basic operations
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection for Rotary Club Tunis Doyen CMS...')
  console.log('📍 Connection URI:', process.env.MONGODB_URI ? 'Present ✅' : 'Missing ❌')
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development')
  console.log('⏰ Test started at:', new Date().toISOString())

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    console.log('\n💡 To fix this:')
    console.log('   1. Copy .env.example to .env')
    console.log('   2. Replace MONGODB_URI with your actual MongoDB Atlas connection string')
    console.log('   3. Ensure the connection string includes database name and credentials')
    process.exit(1)
  }

  const startTime = Date.now()

  try {
    // Connect to MongoDB Atlas with Tunisia-specific optimizations
    console.log('🔌 Connecting to MongoDB Atlas...')
    console.log('   ⏱️  Connection timeout: 30 seconds')
    console.log('   🔄 Max pool size: 10 connections')
    console.log('   🔒 TLS encryption: Enabled')

    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      tls: true,
      tlsInsecure: false,
    })

    const connectionTime = Date.now() - startTime
    console.log(`✅ Successfully connected to MongoDB Atlas in ${connectionTime}ms`)

    // Test basic database operations
    const db = mongoose.connection.db
    const collections = await db.collections()
    console.log(`📊 Found ${collections.length} collections in database`)

    // List collection names
    const collectionNames = collections.map(col => col.collectionName)
    console.log('📋 Collections:', collectionNames.join(', '))

    // Test creating a sample login attempt record
    const testCollection = db.collection('loginattempts')

    const testRecord = {
      email: 'test@example.com',
      ipAddress: '127.0.0.1',
      userAgent: 'Test User Agent',
      attemptTime: new Date(),
      success: true,
      failureReason: null,
      attemptCount: 1,
      isBlocked: false,
      riskLevel: 'low',
      dataRetentionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      gdprConsent: true
    }

    const result = await testCollection.insertOne(testRecord)
    console.log('✅ Successfully inserted test login attempt record')
    console.log('📝 Record ID:', result.insertedId)

    // Clean up test record
    await testCollection.deleteOne({ _id: result.insertedId })
    console.log('🧹 Cleaned up test record')

    // Close connection
    await mongoose.connection.close()
    console.log('🔌 Connection closed successfully')

    console.log('\n🎉 All tests passed! MongoDB Atlas connection is working correctly.')
    console.log('📈 Ready for production use with Rotary Club Tunis Doyen CMS.')

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    console.error('🔍 Error details:', error)

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication failed. Please check:')
      console.log('   - MongoDB Atlas username and password')
      console.log('   - Database user permissions')
      console.log('   - IP whitelist settings')
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 DNS resolution failed. Please check:')
      console.log('   - MongoDB Atlas cluster URL')
      console.log('   - Network connectivity')
      console.log('   - DNS settings')
    } else if (error.message.includes('connection timed out')) {
      console.log('\n💡 Connection timed out. Please check:')
      console.log('   - Network connectivity to MongoDB Atlas')
      console.log('   - Firewall settings')
      console.log('   - MongoDB Atlas cluster status')
    }

    process.exit(1)
  }
}

// Run the test
testConnection()