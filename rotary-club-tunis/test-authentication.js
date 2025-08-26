// Authentication and Rate Limiting Test Suite for Rotary Club Tunis Doyen CMS
// Tests login API, rate limiting, security logging, and account protection features
import fetch from 'node-fetch'
import { performance } from 'perf_hooks'

const API_BASE_URL = 'http://localhost:3000'
const TEST_USERS = {
  admin: {
    email: 'admin@rotary-tunis.tn',
    password: 'password123',
    role: 'admin'
  },
  volunteer: {
    email: 'volunteer@rotary-tunis.tn',
    password: 'password123',
    role: 'volunteer'
  }
}

class AuthenticationTester {
  constructor() {
    this.testResults = []
    this.rateLimitStore = new Map()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`

    switch (type) {
      case 'success':
        console.log(`✅ ${formattedMessage}`)
        break
      case 'error':
        console.error(`❌ ${formattedMessage}`)
        break
      case 'warning':
        console.warn(`⚠️ ${formattedMessage}`)
        break
      default:
        console.log(`ℹ️ ${formattedMessage}`)
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const startTime = performance.now()

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Rotary-CMS-Test-Suite/1.0',
          ...options.headers
        },
        ...options
      })

      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        data: response.headers.get('content-type')?.includes('application/json')
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null)
      }
    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      return {
        ok: false,
        status: 0,
        statusText: error.message,
        responseTime,
        error: error.message
      }
    }
  }

  async testSuccessfulLogin(userType = 'admin') {
    this.log(`Testing successful login for ${userType} user`, 'info')

    const user = TEST_USERS[userType]
    const result = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    })

    if (result.ok && result.status === 200 && result.data?.success) {
      this.log(`✅ Successful login for ${userType} user (${result.responseTime}ms)`, 'success')
      this.testResults.push({
        test: `Successful Login - ${userType}`,
        status: 'PASS',
        responseTime: result.responseTime,
        details: result.data
      })
      return result.data
    } else {
      this.log(`❌ Failed login for ${userType} user: ${result.data?.error || result.statusText}`, 'error')
      this.testResults.push({
        test: `Successful Login - ${userType}`,
        status: 'FAIL',
        responseTime: result.responseTime,
        error: result.data?.error || result.statusText
      })
      return null
    }
  }

  async testFailedLogin(email, password, expectedError = 'Invalid credentials') {
    this.log(`Testing failed login attempt: ${email}`, 'info')

    const result = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    })

    if (!result.ok && result.data?.error === expectedError) {
      this.log(`✅ Expected failure: ${expectedError} (${result.responseTime}ms)`, 'success')
      this.testResults.push({
        test: `Failed Login - ${expectedError}`,
        status: 'PASS',
        responseTime: result.responseTime,
        details: result.data
      })
      return true
    } else {
      this.log(`❌ Unexpected result: ${result.data?.error || result.statusText}`, 'error')
      this.testResults.push({
        test: `Failed Login - ${expectedError}`,
        status: 'FAIL',
        responseTime: result.responseTime,
        error: result.data?.error || result.statusText
      })
      return false
    }
  }

  async testRateLimiting() {
    this.log('Testing rate limiting functionality', 'info')

    const testEmail = 'test@example.com'
    const testPassword = 'wrongpassword'
    let consecutiveFailures = 0

    // Attempt multiple failed logins to trigger rate limiting
    for (let i = 1; i <= 6; i++) {
      this.log(`Rate limit test attempt ${i}/6`, 'info')

      const result = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      })

      if (result.status === 401) {
        this.log(`Attempt ${i}: Invalid credentials (${result.responseTime}ms)`, 'info')
      } else if (result.status === 429) {
        this.log(`✅ Rate limiting triggered after ${i} attempts (${result.responseTime}ms)`, 'success')
        this.testResults.push({
          test: 'Rate Limiting',
          status: 'PASS',
          attempts: i,
          responseTime: result.responseTime,
          details: result.data
        })
        return true
      } else {
        this.log(`❌ Unexpected status: ${result.status} (${result.responseTime}ms)`, 'error')
      }

      // Wait 1 second between attempts
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    this.log('❌ Rate limiting not triggered after 6 attempts', 'error')
    this.testResults.push({
      test: 'Rate Limiting',
      status: 'FAIL',
      attempts: 6,
      error: 'Rate limiting not triggered'
    })
    return false
  }

  async testInputValidation() {
    this.log('Testing input validation', 'info')

    const testCases = [
      {
        name: 'Missing email',
        data: { password: 'test123' },
        expectedStatus: 400,
        expectedError: 'Email and password are required'
      },
      {
        name: 'Missing password',
        data: { email: 'test@example.com' },
        expectedStatus: 400,
        expectedError: 'Email and password are required'
      },
      {
        name: 'Empty request body',
        data: {},
        expectedStatus: 400,
        expectedError: 'Email and password are required'
      },
      {
        name: 'Invalid email format',
        data: { email: 'invalid-email', password: 'test123' },
        expectedStatus: 401,
        expectedError: 'Invalid credentials'
      }
    ]

    let passedTests = 0

    for (const testCase of testCases) {
      const result = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(testCase.data)
      })

      if (result.status === testCase.expectedStatus &&
          result.data?.error === testCase.expectedError) {
        this.log(`✅ ${testCase.name}: Correct validation (${result.responseTime}ms)`, 'success')
        passedTests++
      } else {
        this.log(`❌ ${testCase.name}: Expected ${testCase.expectedError}, got ${result.data?.error}`, 'error')
      }
    }

    const validationPassed = passedTests === testCases.length
    this.testResults.push({
      test: 'Input Validation',
      status: validationPassed ? 'PASS' : 'FAIL',
      passedTests,
      totalTests: testCases.length
    })

    return validationPassed
  }

  async testSecurityHeaders() {
    this.log('Testing security headers', 'info')

    const result = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    })

    const headers = result.headers
    const securityHeaders = {
      'x-frame-options': headers['x-frame-options'],
      'x-content-type-options': headers['x-content-type-options'],
      'x-xss-protection': headers['x-xss-protection']
    }

    let securityScore = 0
    const maxScore = 3

    if (securityHeaders['x-frame-options']) {
      this.log('✅ X-Frame-Options header present', 'success')
      securityScore++
    } else {
      this.log('❌ X-Frame-Options header missing', 'warning')
    }

    if (securityHeaders['x-content-type-options']) {
      this.log('✅ X-Content-Type-Options header present', 'success')
      securityScore++
    } else {
      this.log('❌ X-Content-Type-Options header missing', 'warning')
    }

    if (securityHeaders['x-xss-protection']) {
      this.log('✅ X-XSS-Protection header present', 'success')
      securityScore++
    } else {
      this.log('❌ X-XSS-Protection header missing', 'warning')
    }

    const securityPassed = securityScore >= 2 // At least 2/3 security headers
    this.testResults.push({
      test: 'Security Headers',
      status: securityPassed ? 'PASS' : 'FAIL',
      score: securityScore,
      maxScore,
      headers: securityHeaders
    })

    return securityPassed
  }

  async runAllTests() {
    this.log('🚀 Starting Rotary Club Tunis Doyen CMS Authentication Test Suite', 'info')
    this.log('=' .repeat(70), 'info')

    // Test 1: Successful logins
    await this.testSuccessfulLogin('admin')
    await this.testSuccessfulLogin('volunteer')

    // Test 2: Failed login attempts
    await this.testFailedLogin('nonexistent@example.com', 'password123')
    await this.testFailedLogin('admin@rotary-tunis.tn', 'wrongpassword')

    // Test 3: Rate limiting
    await this.testRateLimiting()

    // Test 4: Input validation
    await this.testInputValidation()

    // Test 5: Security headers
    await this.testSecurityHeaders()

    // Summary
    this.printSummary()
  }

  printSummary() {
    this.log('=' .repeat(70), 'info')
    this.log('📊 TEST SUMMARY', 'info')
    this.log('=' .repeat(70), 'info')

    const passedTests = this.testResults.filter(t => t.status === 'PASS').length
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length
    const totalTests = this.testResults.length

    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌'
      this.log(`${status} ${result.test}`, result.status === 'PASS' ? 'success' : 'error')

      if (result.responseTime) {
        this.log(`   Response time: ${result.responseTime}ms`, 'info')
      }

      if (result.error) {
        this.log(`   Error: ${result.error}`, 'error')
      }

      if (result.details) {
        this.log(`   Details: ${JSON.stringify(result.details, null, 2)}`, 'info')
      }
    })

    this.log('=' .repeat(70), 'info')
    this.log(`📈 Results: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'success' : 'error')

    if (passedTests === totalTests) {
      this.log('🎉 All authentication tests passed! Security features are working correctly.', 'success')
    } else {
      this.log(`⚠️ ${failedTests} test(s) failed. Please review the security implementation.`, 'warning')
    }
  }
}

// Run the test suite
async function main() {
  try {
    const tester = new AuthenticationTester()
    await tester.runAllTests()
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default AuthenticationTester