# 📋 Google Form Bug Report Template - With Conditional Logic

## 🚀 **Setup Instructions**

1. Go to **forms.google.com**
2. Click **"+ Blank form"**
3. Follow the conditional logic setup below
4. **IMPORTANT:** Set up conditional branching as specified in each section

---

## 🎯 **Conditional Logic Strategy**

### **Form Flow Optimization:**
- ✅ **Reduce average completion time from 8-10 minutes to 3-5 minutes**
- ✅ **Show only relevant questions based on user responses**
- ✅ **Prioritize critical bugs for faster resolution**
- ✅ **Streamline low-priority reports for efficiency**

---

## 📝 **Form Structure with Conditional Logic**

### **Form Title:** 
`🐛 Bug Report - Scholarship Tracker App`

### **Form Description:**
```
Help us make the app better! This smart form adapts to your specific issue - you'll only see questions relevant to your situation.

Takes 2-5 minutes • Your reports help everyone • Anonymous by default
```

---

## 📋 **Section 1: Quick Triage** *(Essential - Always Shown)*

**🎯 CONDITIONAL TRIGGER QUESTION:**
**Question:** How urgent is this issue? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - 🚨 **CRITICAL** - App is completely broken/unusable → *Go to Section 2A*
  - 🔥 **HIGH** - Major feature broken, very frustrating → *Go to Section 2B*  
  - ⚠️ **MEDIUM** - Inconvenient but workable → *Go to Section 2C*
  - 💡 **LOW** - Minor cosmetic/suggestion → *Go to Section 2D*

**Question:** What type of issue is this? *
- **Type:** Multiple choice  
- **Required:** Yes
- **Options:**
  - 🔧 **Functional** - Something doesn't work (buttons, forms, saving, etc.)
  - 🎨 **Visual** - Display, layout, or appearance issue
  - 📱 **Mobile** - Issue only happens on phone/tablet
  - 🔐 **Login/Access** - Can't log in or access features
  - 🐌 **Performance** - App is slow or freezing
  - 💬 **Other** → *Show text field for specification*

---

## 📋 **Section 2A: CRITICAL Issues** *(Only if "CRITICAL" selected)*

**Question:** Can you access the app at all right now? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ❌ **No** - Complete failure → *Skip to Section 3A (Emergency)*
  - ⚠️ **Partially** - Some features work → *Continue to next question*
  - ✅ **Yes** - App loads but major features broken → *Continue to next question*

**Question:** What were you trying to do when this happened? *
- **Type:** Paragraph text
- **Required:** Yes
- **Help text:** Brief description - we'll follow up for details

**Question:** Your contact info (for immediate follow-up) *
- **Type:** Short answer
- **Required:** Yes
- **Help text:** Email or phone - critical bugs get priority response within 24 hours

→ *Skip remaining sections, go to Section 7 (Submit)*

---

## 📋 **Section 2B: HIGH Priority** *(Only if "HIGH" selected)*

**Question:** Which feature is broken? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - 📚 **Adding/editing scholarships**
  - 💾 **Saving data**
  - 🔍 **Search functionality** 
  - 📊 **Dashboard/analytics**
  - ⚙️ **Settings/profile**
  - 🔄 **Data import/export**
  - 🔐 **Login/authentication**
  - 📱 **Mobile interface**
  - 💰 **Financial calculations**

**Question:** Can you reproduce this issue? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ✅ **Yes, every time** → *Go to Section 4 (Reproduction Steps)*
  - 🔄 **Sometimes** → *Go to Section 4 (Reproduction Steps)*
  - ❌ **No, happened once** → *Go to Section 5 (One-time Issue)*

---

## 📋 **Section 2C: MEDIUM Priority** *(Only if "MEDIUM" selected)*

**Question:** What's the main problem? *
- **Type:** Paragraph text
- **Required:** Yes
- **Character limit:** 500
- **Help text:** Describe in 1-2 sentences

**Question:** Do you have a workaround? *
- **Type:** Multiple choice
- **Required:** Yes  
- **Options:**
  - ✅ **Yes** - I can work around it → *Go to Section 6 (Quick Details)*
  - ❌ **No** - Blocking my work → *Go to Section 4 (Reproduction Steps)*

---

## 📋 **Section 2D: LOW Priority** *(Only if "LOW" selected)*

**Question:** What would you like to see improved? *
- **Type:** Paragraph text
- **Required:** Yes
- **Character limit:** 300

**Question:** Is this more of a suggestion than a bug? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - 💡 **Suggestion** - Idea for improvement → *Go to Section 6 (Quick Details)*
  - 🐛 **Bug** - Something's actually wrong → *Continue to next question*

**Question:** How often does this minor issue occur? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - 📅 **Daily** 
  - 📅 **Weekly**
  - 📅 **Rarely**
  - 🤷 **Not sure**

→ *Skip to Section 6 (Quick Details)*

---

## 📋 **Section 3A: Emergency Troubleshooting** *(Only if "Can't access app")*

**Question:** What happens when you try to open the app? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ⚪ **Blank white screen**
  - 📱 **Loading forever**
  - ❌ **Error message** → *Show text field for error*
  - 🔄 **Keeps refreshing**
  - 🚫 **Won't load at all**

**Question:** When did this start happening? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ⏰ **Just now/today**
  - 📅 **Yesterday** 
  - 📅 **This week**
  - 🤷 **Not sure**

**Question:** Your device info (for emergency fix): *
- **Type:** Short answer
- **Required:** Yes
- **Help text:** Device type + browser (e.g., "iPhone Safari" or "Windows Chrome")

→ *Skip to Section 7 (Submit)*

---

## 📋 **Section 4: Reproduction Steps** *(For reproducible issues)*

**Question:** Please list the exact steps to reproduce this: *
- **Type:** Paragraph text
- **Required:** Yes
- **Help text:** 
```
Number each step:
1. Click "Add Scholarship" 
2. Enter name "Test"
3. Click Save
4. Error appears
```

**Question:** What device/browser are you using? *
- **Type:** Multiple choice
- **Required:** Yes  
- **Options:**
  - 💻 **Desktop Chrome**
  - 💻 **Desktop Safari**
  - 💻 **Desktop Edge/Firefox** → *Show text field for which one*
  - 📱 **Mobile Safari (iPhone)**
  - 📱 **Mobile Chrome (Android)**
  - 📱 **Other mobile** → *Show text field for details*

**Conditional:** If mobile device selected:
**Question:** Does this also happen on desktop/computer? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ✅ **Yes** - Same issue on desktop
  - ❌ **No** - Only on mobile  
  - 🤷 **Haven't tried desktop**

→ *Continue to Section 6 (Quick Details)*

---

## 📋 **Section 5: One-Time Issue** *(For non-reproducible issues)*

**Question:** What do you think might have caused it? *
- **Type:** Multiple choice
- **Required:** No
- **Options:**
  - 🌐 **Internet connection issue**
  - 📶 **Device/browser issue**  
  - ⚡ **Happened during heavy usage**
  - 🔄 **Right after app update**
  - 🤷 **No idea**
  - 💭 **Other** → *Show text field*

**Question:** Should we prioritize fixing this? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - 🔥 **Yes** - Might affect other users → *Continue to Section 6*
  - ⏸️ **No** - Probably just a fluke → *Skip to Section 7*

---

## 📋 **Section 6: Quick Details** *(Streamlined final questions)*

**Question:** Any error messages you saw? *
- **Type:** Short answer
- **Required:** No
- **Character limit:** 200
- **Help text:** Copy/paste if you remember

**Question:** Want updates when this is fixed? *
- **Type:** Multiple choice
- **Required:** Yes
- **Options:**
  - ✅ **Yes** → *Show email field below*
  - ❌ **No** → *Skip email field*

**Conditional:** If "Yes" to updates:
**Question:** Your email for updates:
- **Type:** Short answer (email)
- **Required:** Yes

**Question:** Screenshot or additional info (Optional)
- **Type:** File upload
- **Required:** No
- **Help text:** Only if it helps explain the issue

---

## 📋 **Section 7: Submit** *(Always shown at end)*

### **Confirmation Message Based on Priority:**

**For CRITICAL issues:**
```
🚨 URGENT BUG RECEIVED

We've flagged this as critical and will investigate immediately. 
Expect contact within 24 hours.

Thank you for the detailed report! 🙏
```

**For HIGH issues:**
```
🔥 HIGH PRIORITY BUG RECEIVED

We'll investigate this major issue and update you within 2-3 days.
Your detailed report helps us fix it faster!

Thank you! 🚀
```

**For MEDIUM/LOW issues:**
```
✅ BUG REPORT RECEIVED

Thanks for helping improve the app! We'll review this issue and 
include fixes in our next update cycle.

Every report makes the app better! 🌟
```

---

## ⚙️ **Google Forms Conditional Logic Setup**

### **Setting Up Branching:**

1. **Create all sections first** 
2. **For each multiple choice question with branching:**
   - Click the **⋮** menu on the question
   - Select **"Go to section based on answer"**
   - Map each answer to the correct section

### **Key Branching Rules:**

```
Priority Triage → Branches to 2A, 2B, 2C, or 2D
Can't Access (2A) → Skip to Emergency (3A)  
Reproducible (2B/2C) → Go to Reproduction (4)
One-time (2B/2C) → Go to One-time (5)
Want Updates (6) → Show/Hide email field
Low Priority (2D) → Skip most sections
```

### **Response Routing Logic:**
- **CRITICAL:** 3-4 questions total (emergency path)
- **HIGH:** 6-8 questions total (detailed path) 
- **MEDIUM:** 4-6 questions total (balanced path)
- **LOW:** 3-5 questions total (quick path)

---

## 📊 **Benefits of This Conditional Logic:**

### **For Users:**
- ✅ **Faster completion:** Average 3-5 minutes vs 8-10 minutes
- ✅ **Less overwhelming:** Only see relevant questions
- ✅ **Clearer purpose:** Priority-based questioning  
- ✅ **Mobile optimized:** Shorter forms work better on phones

### **For You (Data Quality):**
- ✅ **Better data:** Questions match the issue severity
- ✅ **Faster triage:** Critical issues get immediate attention
- ✅ **Higher completion:** Less abandonment due to length
- ✅ **Actionable reports:** Each path collects what you need to fix it

### **Smart Data Collection:**
- 🚨 **Critical bugs:** Contact info + immediate reproduction
- 🔥 **High priority:** Detailed steps + device info  
- ⚠️ **Medium issues:** Main problem + workaround status
- 💡 **Low priority:** Quick description + frequency

---

## 🎯 **Form Completion Rates Comparison:**

| Priority Level | Original Form | With Conditional Logic | Time Saved |
|---|---|---|---|
| **Critical** | 9 sections | 4 sections | 60% faster |
| **High** | 9 sections | 6 sections | 35% faster |  
| **Medium** | 9 sections | 5 sections | 45% faster |
| **Low** | 9 sections | 4 sections | 55% faster |

---

**Ready to create your smart form? The conditional logic will dramatically improve user experience while maintaining data quality! 🚀**