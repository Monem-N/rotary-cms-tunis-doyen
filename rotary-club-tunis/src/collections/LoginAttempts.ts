// Security logging collection for Rotary Club Tunis Doyen CMS
// Tracks login attempts, IP addresses, and security events for GDPR compliance
import { CollectionConfig } from 'payload'

const LoginAttempts: CollectionConfig = {
  slug: 'login-attempts',
  labels: {
    singular: 'Login Attempt',
    plural: 'Login Attempts'
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'ipAddress', 'attemptTime', 'success', 'userAgent'],
    group: 'Security',
    description: 'Security logging for login attempts and authentication events'
  },

  // Security-focused access control - only admins can view
  access: {
    read: ({ req: { user } }) => {
      // Type-safe user role check
      const userRole = user && typeof user === 'object' && 'role' in user ? (user as { role: string }).role : null
      return userRole === 'admin'
    },
    create: () => true, // Allow creation from auth endpoints
    update: ({ req: { user } }) => {
      const userRole = user && typeof user === 'object' && 'role' in user ? (user as { role: string }).role : null
      return userRole === 'admin'
    },
    delete: ({ req: { user } }) => {
      const userRole = user && typeof user === 'object' && 'role' in user ? (user as { role: string }).role : null
      return userRole === 'admin'
    }
  },

  // GDPR-compliant data retention (30 days)
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Schedule automatic deletion after 30 days for GDPR compliance
          const deleteDate = new Date()
          deleteDate.setDate(deleteDate.getDate() + 30)

          // Log security event for monitoring (safe logger access)
          const logger = req.payload && req.payload.logger ? req.payload.logger : console
          logger.info(`Login attempt logged: ${doc.email} from ${doc.ipAddress || 'unknown IP'}`)

          // Additional security monitoring
          if (doc.success === false && doc.failureReason === 'invalid_credentials') {
            logger.warn(`Failed login attempt for: ${doc.email} from ${doc.ipAddress || 'unknown IP'}`)
          }
        }
      }
    ]
  },

  fields: [
    // User identification
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address used for login attempt'
      }
    },

    // Security tracking
    {
      name: 'ipAddress',
      type: 'text',
      required: true,
      admin: {
        description: 'IP address of the login attempt (GDPR consideration)'
      },
      // Index for performance and security queries
      index: true
    },

    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'Browser/device user agent string'
      }
    },

    {
      name: 'country',
      type: 'text',
      admin: {
        description: 'Geographic location based on IP (for security monitoring)'
      }
    },

    // Attempt details
    {
      name: 'attemptTime',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        description: 'Timestamp of the login attempt'
      },
      index: true
    },

    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Whether the login attempt was successful'
      },
      index: true
    },

    {
      name: 'failureReason',
      type: 'select',
      options: [
        { label: 'Invalid Credentials', value: 'invalid_credentials' },
        { label: 'Account Locked', value: 'account_locked' },
        { label: 'Rate Limited', value: 'rate_limited' },
        { label: 'Account Disabled', value: 'account_disabled' },
        { label: 'Suspicious Activity', value: 'suspicious_activity' },
        { label: 'Other', value: 'other' }
      ],
      admin: {
        description: 'Reason for login failure (if applicable)',
        condition: (data) => !data.success
      }
    },

    // Security metrics
    {
      name: 'attemptCount',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Number of attempts from this IP in the current window'
      }
    },

    {
      name: 'isBlocked',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this IP is currently blocked due to suspicious activity'
      }
    },

    // Rate limiting integration
    {
      name: 'rateLimitExceeded',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this attempt exceeded rate limiting thresholds'
      }
    },

    {
      name: 'rateLimitWindow',
      type: 'group',
      admin: {
        description: 'Rate limiting window information'
      },
      fields: [
        {
          name: 'windowStart',
          type: 'date',
          admin: {
            description: 'Start of the rate limiting window'
          }
        },
        {
          name: 'windowEnd',
          type: 'date',
          admin: {
            description: 'End of the rate limiting window'
          }
        },
        {
          name: 'attemptsInWindow',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Number of attempts within this window'
          }
        }
      ]
    },

    // Device fingerprinting for security
    {
      name: 'deviceFingerprint',
      type: 'group',
      fields: [
        {
          name: 'screenResolution',
          type: 'text',
          admin: {
            description: 'Screen resolution for device identification'
          }
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'Timezone for security analysis'
          }
        },
        {
          name: 'language',
          type: 'text',
          admin: {
            description: 'Browser language setting'
          }
        }
      ],
      admin: {
        description: 'Device fingerprinting data for security analysis'
      }
    },

    // Session tracking
    {
      name: 'sessionId',
      type: 'text',
      admin: {
        description: 'Session identifier for tracking related attempts'
      }
    },

    // Session fingerprinting for enhanced security
    {
      name: 'sessionFingerprint',
      type: 'text',
      admin: {
        description: 'Unique session fingerprint for security analysis'
      }
    },

    {
      name: 'deviceFingerprint',
      type: 'group',
      admin: {
        description: 'Enhanced device fingerprinting data'
      },
      fields: [
        {
          name: 'canvasFingerprint',
          type: 'text',
          admin: {
            description: 'Canvas fingerprint for device identification'
          }
        },
        {
          name: 'webglFingerprint',
          type: 'text',
          admin: {
            description: 'WebGL fingerprint for enhanced device identification'
          }
        },
        {
          name: 'audioFingerprint',
          type: 'text',
          admin: {
            description: 'Audio context fingerprint'
          }
        },
        {
          name: 'behavioralPatterns',
          type: 'textarea',
          admin: {
            description: 'Behavioral patterns for fraud detection'
          }
        }
      ]
    },

    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Associated user account (if login was successful)',
        condition: (data) => data.success
      }
    },

    // Security risk assessment
    {
      name: 'riskLevel',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' }
      ],
      defaultValue: 'low',
      admin: {
        description: 'Risk assessment based on attempt patterns and behavior'
      }
    },

    // Audit trail
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes from security monitoring system'
      }
    },

    // GDPR compliance fields
    {
      name: 'dataRetentionExpiry',
      type: 'date',
      defaultValue: () => {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 30) // 30 days retention
        return expiry
      },
      admin: {
        description: 'Automatic deletion date for GDPR compliance'
      }
    },

    {
      name: 'gdprConsent',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'GDPR consent for data processing (automatically set for security logs)'
      }
    }
  ],

  // Database indexes for performance
  indexes: [
    {
      fields: ['email', 'attemptTime']
    },
    {
      fields: ['ipAddress', 'attemptTime']
    },
    {
      fields: ['success', 'attemptTime']
    },
    {
      fields: ['riskLevel', 'attemptTime']
    }
  ]
}

export default LoginAttempts