# 🔀 Conditional Logic Flow Diagram

## 📊 **Visual Form Flow**

```
👤 USER STARTS FORM
        │
        ▼
┌─────────────────────────┐
│    QUICK TRIAGE         │
│  Priority + Issue Type  │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │ PRIORITY? │
    └─┬─┬─┬─┬──┘
      │ │ │ │
   🚨 │ │ │ │ 💡
 CRIT │ │ │ │ LOW
      ▼ │ │ ▼
┌───────┐│ │┌──────────┐
│ 2A    ││ ││    2D    │
│CRISIS ││ ││ MINOR/   │
│ MODE  ││ ││COSMETIC  │
└───┬───┘│ │└────┬─────┘
    │    │ │     │
    │    │ │  ┌──▼──┐
    │    │ │  │ 6   │
    │    │ │  │QUICK│
    │    │ │  │DONE │
    │    │ │  └─────┘
    │    │ │
    │  🔥│ │⚠️
    │ HIGH│ │MED
    │    ▼ ▼
    │ ┌─────────┐
    │ │   2B/2C │
    │ │ NORMAL  │
    │ │ TRIAGE  │
    │ └────┬────┘
    │      │
    │   ┌──▼───┐
    │   │REPRO?│
    │   └─┬─┬──┘
    │     │ │
    │  ✅ │ │ ❌
    │ YES │ │ NO
    │     ▼ ▼
    │ ┌────────┐ ┌────────┐
    │ │   4    │ │   5    │
    │ │ REPRO  │ │ONE-TIME│
    │ │ STEPS  │ │ ISSUE  │
    │ └───┬────┘ └───┬────┘
    │     │          │
    │     ▼          ▼
    │ ┌─────────────────┐
    │ │       6         │
    │ │ QUICK DETAILS   │
    │ └─────────────────┘
    │           │
    ▼           ▼
┌─────────────────┐
│       7         │
│ SMART SUBMIT    │
│ (Custom Messages│
│ Based on Priority)
└─────────────────┘
```

## 🎯 **Path Analysis:**

### **🚨 CRITICAL Path (Emergency):**
```
Start → Priority:Critical → 2A → Contact Info → SUBMIT
Total: ~3-4 questions | Time: 2-3 minutes
```

### **🔥 HIGH Path (Detailed):**
```  
Start → Priority:High → 2B → Reproducible? → 4 → 6 → SUBMIT
Total: ~6-8 questions | Time: 4-5 minutes
```

### **⚠️ MEDIUM Path (Balanced):**
```
Start → Priority:Medium → 2C → Workaround? → 4 or 6 → SUBMIT  
Total: ~4-6 questions | Time: 3-4 minutes
```

### **💡 LOW Path (Quick):**
```
Start → Priority:Low → 2D → Suggestion? → 6 → SUBMIT
Total: ~3-5 questions | Time: 2-3 minutes  
```

## 🔄 **Key Decision Points:**

1. **Priority Triage** (Always first)
   - Determines entire form path
   - Most important branching decision

2. **Reproducibility Check** (High/Medium only)  
   - Reproducible → Detailed reproduction steps
   - One-time → Lighter questioning

3. **Contact Preference** (All paths)
   - Want updates → Show email field
   - No updates → Skip email

4. **Device-Specific** (If reproducible)
   - Mobile → Ask about desktop comparison
   - Desktop → Standard questions

## 📱 **Mobile Optimization:**

The conditional logic especially helps mobile users:
- **Shorter forms** = Less scrolling
- **Fewer text fields** = Less typing
- **Priority-based** = Critical issues get fast-tracked
- **Smart branching** = Only relevant questions shown

## 🎯 **Quality vs Speed Balance:**

| Data Quality Need | Original Form | Conditional Form |
|---|---|---|
| **Critical Issues** | Overkill detail | Perfect emergency data |
| **Reproducible Bugs** | Good coverage | Excellent targeted data |
| **One-time Issues** | Too much detail | Right amount of context |
| **Minor Issues** | Overwhelming | Quick and actionable |

This conditional logic reduces the cognitive load while ensuring you get exactly the data you need for each type of issue! 🚀