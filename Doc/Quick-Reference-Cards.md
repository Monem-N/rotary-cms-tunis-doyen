# 🎯 **Quick Reference Cards**

## *Essential Information at a Glance for Rotary Club Tunis Doyen CMS*

---

## 📋 **For New Volunteers**

### **Getting Started (5 minutes)**
| Task | Steps | Contact |
|------|-------|---------|
| **First Login** | 1. Go to `https://rotary-tunis-doyen.vercel.app/admin`<br>2. Enter email & password<br>3. Click "Se connecter" | Ahmed: 06 12 34 56 78 |
| **Create Event** | 1. Click "+ Nouveau"<br>2. Fill in French first<br>3. Save → Arabic draft created automatically | |
| **Add Photo** | 1. Click camera icon in description<br>2. Upload image (< 5 Mo)<br>3. Add alt text in French & Arabic<br>4. ✅ Check consent obtained | |

### **Essential Rules**
- ✅ **Always get photo consent** before taking pictures
- ✅ **Fill French content first** - Arabic draft is created automatically
- ✅ **Save frequently** but click once only
- ✅ **Use simple passwords** you can remember
- ❌ **Never share your login** with others

---

## 🔧 **For Administrators**

### **System Health Check (Daily)**
```bash
# Check these every morning:
✅ Admin panel loads in < 30 seconds
✅ Database connection active
✅ File uploads working
✅ Arabic RTL displays correctly
✅ No error messages on login
```

### **Emergency Contacts**
| Situation | Contact | Response Time |
|-----------|---------|---------------|
| **Site Down** | Ahmed (06 12 34 56 78) | < 30 minutes |
| **Security Issue** | security@rotary-tunis.tn | < 1 hour |
| **Data Loss** | Support Team | < 4 hours |
| **GDPR Request** | gdpr@rotary-tunis.tn | < 24 hours |

### **Common Admin Tasks**
| Task | Commands/Steps | Frequency |
|------|----------------|-----------|
| **Backup Check** | Verify Backblaze B2 sync | Daily |
| **User Management** | Check active users, roles | Weekly |
| **Content Review** | Approve pending events | Daily |
| **Security Update** | Run dependency updates | Monthly |

---

## 🛠️ **For Developers**

### **Environment Variables**
```bash
# Critical - Never commit to Git:
MONGODB_URI=mongodb+srv://cms_admin:***@rotary-tunis-production.***.mongodb.net
PAYLOAD_SECRET=your-32-char-random-secret-here

# Optional but recommended:
BACKBLAZE_ACCESS_KEY=your-b2-key
BACKBLAZE_SECRET_KEY=your-b2-secret
```

### **Quick Commands**
```bash
# Development
npm run dev                    # Start local server
npm run build                  # Build for production
vercel --prod                  # Deploy to production

# Database
mongosh "MONGODB_URI"          # Connect to database
db.events.find({})             # Check events collection

# File Storage
b2 sync ./media b2://rotary-media  # Sync to Backblaze
```

### **Debug Checklist**
- [ ] Console errors in browser dev tools
- [ ] Network tab shows failed requests
- [ ] MongoDB Atlas dashboard accessible
- [ ] Vercel function logs clean
- [ ] Arabic content displays RTL correctly

---

## 🌍 **For Content Creators**

### **Language Workflow**
```mermaid
graph LR
    A[Create French Content] --> B[Save Event]
    B --> C[Auto-create Arabic Draft]
    C --> D[Translate to Arabic]
    D --> E[Publish Both Versions]
```

### **Content Quality Checklist**
| Element | French | Arabic | Notes |
|---------|--------|--------|-------|
| **Title** | ✅ Clear, descriptive | ✅ Accurate translation | Max 60 characters |
| **Description** | ✅ Complete details | ✅ Cultural adaptation | Include impact metrics |
| **Photos** | ✅ High quality | ✅ Same alt text | < 5MB, consent obtained |
| **Categories** | ✅ 1-3 areas of focus | ✅ Same categories | Use Rotary 7 areas |
| **Impact** | ✅ Quantifiable results | ✅ Local numbers | Meals, trees, hours |

### **SEO Best Practices**
- Use keywords: "Rotary Tunis", "bienfaisance", "Tunisie"
- Include location: "Tunis", "Tunisie"
- Add dates and times clearly
- Mention partner organizations
- Use descriptive photo alt texts

---

## 📱 **For Mobile Users**

### **Mobile Optimization Tips**
| Device | Browser | Tips |
|--------|---------|------|
| **Android** | Chrome | Use landscape mode for typing |
| **iPhone** | Safari | Enable desktop site for admin |
| **Tablets** | Any | Use split-screen with guide |

### **Mobile Troubleshooting**
| Problem | Solution |
|---------|----------|
| **Keyboard blocks content** | Turn phone sideways (landscape) |
| **Photos too large** | Use WhatsApp compress or gallery app |
| **Arabic doesn't show** | Check RTL toggle, refresh page |
| **Slow loading** | Close other apps, check WiFi signal |
| **Session expired** | Re-login, check "Remember me" |

---

## 🔐 **For Security Officers**

### **Security Checklist**
| Component | Check | Frequency |
|-----------|-------|-----------|
| **Passwords** | 32+ chars, randomly generated | On creation |
| **Database** | IP whitelist active | Monthly |
| **File Storage** | Client-side encryption | Quarterly |
| **Admin Access** | Role-based permissions | Monthly |
| **GDPR Compliance** | Consent mechanisms | Quarterly |

### **Incident Response**
1. **Identify** - Log the security event
2. **Contain** - Block suspicious access
3. **Assess** - Evaluate impact and scope
4. **Remediate** - Fix the vulnerability
5. **Report** - Document for compliance

### **GDPR Quick Reference**
- **Data Subject Rights**: Access, Rectification, Erasure, Portability
- **Retention Period**: 7 years for operational data
- **Consent**: Must be specific, informed, and revocable
- **Breach Notification**: Within 72 hours to authorities

---

## 📊 **For Project Managers**

### **Success Metrics**
| Metric | Target | Measurement |
|--------|--------|-------------|
| **User Adoption** | 100% in 2 weeks | Admin analytics |
| **Content Quality** | 80% in Arabic | Manual review |
| **Performance** | <8s load time | WebPageTest |
| **Accessibility** | WCAG AA | Automated tools |
| **Volunteer Satisfaction** | >4.5/5 | Quarterly survey |

### **Phase Completion Criteria**
| Phase | Must Complete | Nice to Have |
|-------|---------------|--------------|
| **Phase 0** | All security items | Risk mitigation |
| **Phase 1** | Infrastructure live | Cost optimization |
| **Phase 2** | CMS functional | Advanced features |
| **Phase 3** | Frontend deployed | Performance optimized |
| **Phase 4** | Security compliant | Monitoring alerts |
| **Phase 5** | Testing passed | Accessibility audit |
| **Phase 6** | Training complete | User feedback |

---

## 🚨 **Emergency Procedures**

### **Critical System Failure**
1. **Assess Impact**: How many users affected?
2. **Contact**: Ahmed (06 12 34 56 78) immediately
3. **Communication**: Use WhatsApp group for updates
4. **Recovery**: Follow rollback procedures in checklist
5. **Post-mortem**: Document causes and fixes

### **Data Breach Response**
1. **Contain**: Revoke compromised credentials
2. **Assess**: Determine what data was accessed
3. **Notify**: Affected individuals within 72 hours
4. **Report**: To Tunisian data protection authority
5. **Prevent**: Implement additional security measures

### **Backup Recovery**
```bash
# Emergency restore from Backblaze B2
b2 sync b2://rotary-backup ./emergency-restore
mongorestore --uri="MONGODB_URI" ./emergency-restore
```

---

## 📞 **Contact Directory**

### **Primary Contacts**
- **Ahmed Ben Salah** (Digital Steward): 06 12 34 56 78
- **Technical Support**: support@rotary-tunis.tn
- **Security Issues**: security@rotary-tunis.tn
- **GDPR Requests**: gdpr@rotary-tunis.tn

### **Emergency Numbers**
- **System Down**: Ahmed (24/7)
- **Data Breach**: Security Team (immediate)
- **Legal Issues**: Club President

### **Response Times**
- **Critical Issues**: < 1 hour
- **Technical Problems**: < 4 hours
- **General Questions**: < 24 hours
- **GDPR Requests**: < 72 hours

---

*Print this document and keep it handy. Last updated: August 2025*