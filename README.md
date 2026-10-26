# HormoCare AI - Early PCOS Detection System

![HormoCare AI Logo](https://img.shields.io/badge/HormoCare-AI-FF6B9D?style=for-the-badge&logo=heart)

## 🌸 Project Overview

**HormoCare AI** is an innovative web application designed to address the critical healthcare gap in PCOS (Polycystic Ovary Syndrome) detection among Indian women. With 1 in 5 Indian women suffering from PCOS and 70% of cases going undiagnosed, our AI-powered solution provides early risk assessment and personalized care recommendations.

## 🎯 Problem Statement

- **20%** of Indian women suffer from PCOS
- **70%** of cases go undiagnosed for years
- **2-3 years** average diagnosis delay
- Irregular periods are often ignored
- No systematic symptom tracking
- Lack of early risk screening tools designed for Indian women
- Delayed diagnosis leads to infertility, obesity, and diabetes risk

## 🚀 Our Solution

HormoCare AI is a comprehensive web application that combines intelligent symptom tracking with AI-powered risk assessment to provide:

### 🔍 Smart Tracking
- **Menstrual Cycle Patterns** - Advanced cycle analysis and irregularity detection
- **Weight & BMI Monitoring** - Trend analysis and weight change alerts
- **Acne Severity Assessment** - Visual scale tracking (1-5 levels)
- **Hair Fall Patterns** - Androgenic alopecia detection
- **Mood & Sleep Analysis** - Hormonal impact on mental health
- **Family History Integration** - Genetic predisposition evaluation

### 🧠 AI Risk Assessment
Our rule-based AI algorithm analyzes multiple parameters:

```
Risk Score = (Cycle Analysis × 40%) + (Weight Analysis × 20%) + 
             (Hormonal Symptoms × 30%) + (Lifestyle Factors × 10%)
```

**Risk Factors Analyzed:**
- Cycle irregularity (>35 days or <21 days)
- BMI and rapid weight gain patterns
- Hyperandrogenism symptoms (acne, hirsutism, hair loss)
- Family history and genetic predisposition
- Lifestyle factors (diet, exercise, stress)

### 💡 Personalized Recommendations

**Medical Actions:**
- Gynecologist consultation timing
- Recommended blood tests and ultrasounds
- Risk-based urgency levels

**Lifestyle Interventions:**
- PCOS-friendly diet plans (low GI, anti-inflammatory)
- Customized exercise routines (cardio + strength training)
- Supplement recommendations (Myo-inositol, Vitamin D, Omega-3)
- Stress management techniques

## 🎨 Features

### 🏠 Landing Page
- Compelling problem statement with statistics
- Feature showcase and benefits
- Interactive demo preview
- Modern, responsive design

### 📊 Assessment Flow
1. **Profile Setup** - Age, weight, height, family history
2. **Symptom Tracking** - Daily logging with intuitive interfaces  
3. **AI Analysis** - Real-time risk calculation and visualization
4. **Recommendations** - Personalized action plan

### 📱 User Experience
- Mobile-first responsive design
- Intuitive symptom logging interfaces
- Visual risk indicators and trend graphs
- Progress tracking and insights
- Educational content and tips

## 🛠️ Technical Implementation

### Frontend Stack
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - Interactive functionality and AI logic
- **Progressive Web App** features for mobile experience

### AI Algorithm
```javascript
class HormoCareAI {
  calculatePCOSRisk(symptoms) {
    // Menstrual cycle analysis (40% weight)
    // Weight and BMI analysis (20% weight)  
    // Hormonal symptoms (30% weight)
    // Lifestyle factors (10% weight)
    
    return {
      score: 0-100,
      level: 'low' | 'moderate' | 'high',
      factors: [...riskFactors],
      recommendations: {...personalizedCare}
    }
  }
}
```

### Data Management
- **Local Storage** - Client-side data persistence
- **Privacy-First** - No data transmitted without consent
- **Export Capability** - User can download their health data

## 📈 Business Model

### Revenue Streams
1. **Freemium Subscriptions** - ₹199/month for advanced features
2. **Healthcare Partnerships** - Commission from consultations and tests
3. **Pharmacy Integration** - Supplement and medication recommendations
4. **Corporate Wellness** - Enterprise health screening programs

### Market Opportunity
- **TAM:** $2.1B (Global women's health apps)
- **SAM:** $340M (Indian women's health market)
- **SOM:** $34M (PCOS-specific solutions)

## 🎯 Impact Goals

### Health Impact
- **50%** reduction in diagnosis delay
- **30%** fewer diabetes cases through early intervention
- **40%** improved fertility outcomes
- Better quality of life for millions of women

### Scalability
- **Phase 1:** MVP with 10K users (3-6 months)
- **Phase 2:** Healthcare integration with 100K users (6-12 months)  
- **Phase 3:** Telemedicine platform with 500K users (12-24 months)
- **International:** Southeast Asia and Middle East expansion

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher recommended; v24 supported)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start (Recommended)

1. **Start the Local Server**:
   ```bash
   # Option A: With npm
   npm start

   # Option B: With Node directly (zero external dependencies required)
   node server.js

   # Option C: On Windows, double-click run.bat or start.bat
   run.bat
   ```

2. **Open in Browser**:
   Open **[http://localhost:3000](http://localhost:3000)** (or `start.html` for the project hub).

3. **Explore Features & Sample Data**:
   - Click the **"Local Disk DB Active"** badge in the navbar to open the **Data Management Hub**.
   - Click **"Load Sample PCOS Patient Data"** to instantly populate 14 days of realistic cycle logs, symptoms, diet entries, doctor appointments, and orders to test the AI risk analysis right away!

4. **Standalone Mode (Optional)**:
   - If Node.js is not running, you can also double-click `index.html` or `start.html` directly in your browser. The application will smoothly fall back to browser `localStorage` mode.

### Project Structure
```
hormocare-ai/
├── package.json              # Project configuration and npm scripts
├── server.js                 # Native Node.js local HTTP & REST API server
├── run.bat                   # 1-click Windows launcher
├── start.bat                 # Shortcut launcher
├── index.html                # Main landing page & 5-step AI assessment
├── start.html                # Project hub with links to all modules
├── diet-tracker.html         # Daily meals, nutrition macros & water tracking
├── meal-plan.html            # 7-day PCOS-friendly meal plans (Veg/Non-Veg/Mixed)
├── doctor-consultation.html  # Book gynecologist consultations & upload reports
├── medicine-store.html       # Supplements store, cart & order history
├── reviews.html              # Verified reviews, ratings & feedback
├── presentation.html         # Investor pitch deck
├── data/                     # Persistent local storage directory
│   ├── hormocare_db.json     # Main JSON database file (local data storing)
│   └── uploads/              # Local disk storage for uploaded medical reports
├── js/
│   ├── storage.js            # Unified local storage manager & Data Hub modal
│   ├── app.js                # AI risk algorithm & food database
│   └── main.js               # Interactive UI & assessment workflow
└── styles/
    ├── main.css              # Main application styling
    └── presentation.css      # Presentation styling
```

## 💾 Local Data Storing & Persistence

HormoCare AI features a **dual-layer local persistence architecture**:

1. **Local Disk Database (`data/hormocare_db.json`)**:
   - All profile data, symptom logs, diet history, checklist states, consultation bookings, store orders, and reviews are saved directly to disk.
   - Uploaded medical reports (PDF, JPG, PNG) are stored physically in `data/uploads/` on your machine.
   - Data persists across system restarts, browser clears, and multiple browser tabs.

2. **Client-Side Storage Adapter (`js/storage.js`)**:
   - Automatically probes the local server at startup.
   - If connected, synchronizes read/writes directly with the local database.
   - If offline or opened via `file://`, falls back to `localStorage` with zero errors.

3. **Data Management Hub (Built-in GUI Modal)**:
   - Click the green **"Local Disk DB Active"** pill in the navigation bar on any page.
   - **Export Backup (JSON)**: Download a complete backup of all health data.
   - **Import Backup (JSON)**: Restore your saved data anytime.
   - **Load Sample Data**: Test the full AI assessment workflow with 14 days of realistic PCOS symptoms in 1 click.
   - **Reset Stored Data**: Clear data back to initial defaults.

## 📡 REST API Reference (Local Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | Server health, database path, and summary counts |
| `GET` | `/api/data` | Get profile, symptoms, diet logs & risk assessment |
| `POST` | `/api/data` | Save profile, symptoms, or diet entries |
| `GET` | `/api/bookings` | List doctor consultation bookings |
| `POST` | `/api/bookings` | Create new doctor consultation booking |
| `DELETE` | `/api/bookings/:id` | Cancel doctor consultation booking |
| `GET` | `/api/orders` | List medicine store orders |
| `POST` | `/api/orders` | Place new medicine store order |
| `GET` | `/api/reports` | List uploaded medical reports |
| `POST` | `/api/reports` | Upload report file (saved to `data/uploads/`) |
| `GET` | `/api/reports/download/:file` | Download/view uploaded medical report |
| `DELETE` | `/api/reports/:id` | Delete report file from disk and database |
| `GET` | `/api/reviews` | Get user-submitted reviews |
| `POST` | `/api/reviews` | Submit a new user review |
| `GET` | `/api/export` | Download complete database as JSON backup file |
| `POST` | `/api/import` | Restore database from JSON backup file |
| `POST` | `/api/sample-data` | Populate 14-day sample PCOS patient dataset |
| `POST` | `/api/reset` | Reset all local data to clean defaults |

## 🧪 Testing the AI Algorithm

```javascript
// Test the PCOS risk assessment
function testRiskAssessment() {
    const testSymptoms = {
        cycle: { averageLength: 42, irregularity: 'high', missedPeriods: 3 },
        weight: 75, height: 165, weightHistory: { recentGain: 8 },
        acne: 4, hairFall: 'high', hirsutism: 'medium',
        moodSwings: 'severe', sleepQuality: 'poor',
        familyHistory: 'mother', age: 26,
        exercise: 'sedentary', diet: 'poor'
    };
    
    const assessment = hormoCareApp.calculatePCOSRisk(testSymptoms);
    console.log('PCOS Risk Assessment:', assessment);
}
```

## 🎨 Design Principles

### Visual Design
- **Color Scheme:** Pink/coral primary (#FF6B9D) with complementary colors
- **Typography:** Inter font family for modern, readable text
- **Layout:** Mobile-first responsive grid system
- **Components:** Card-based design with soft shadows and rounded corners

### User Experience
- **Progressive Disclosure:** Information revealed step by step
- **Visual Feedback:** Immediate response to user actions
- **Accessibility:** Semantic HTML and proper contrast ratios
- **Performance:** Optimized for fast loading and smooth interactions

## 🎤 Pitch Presentation

The presentation covers:

1. **Problem Statement** - PCOS statistics and current gaps
2. **Market Analysis** - Why existing solutions fail
3. **Our Innovation** - AI-powered risk assessment
4. **Live Demo** - Interactive product showcase  
5. **Impact & Market** - Health outcomes and business potential
6. **Business Model** - Revenue streams and expansion plans
7. **Call to Action** - Investment and partnership opportunities

### Presentation Features
- Professional slide transitions
- Interactive navigation (keyboard arrows or click controls)
- Mobile-responsive design
- Print-ready layouts

## 🤝 Contributing

We welcome contributions from:
- **Healthcare Professionals** - Medical guidance and validation
- **Developers** - Feature development and optimization
- **Designers** - UI/UX improvements
- **Data Scientists** - AI algorithm enhancement
- **Community** - Feedback and user testing

## 🏆 Competitive Advantages

1. **India-Specific Focus** - Designed for Indian women's health patterns
2. **AI-Powered Insights** - Beyond simple period tracking
3. **Comprehensive Approach** - Multiple symptom analysis
4. **Early Detection** - Preventive rather than reactive care
5. **Personalized Recommendations** - Tailored to individual risk profiles
6. **Privacy-First** - Local data storage and user control

## 📞 Contact & Support

- **Email:** founder@hormocare.ai
- **Phone:** +91-9876-543-210
- **LinkedIn:** linkedin.com/company/hormocare-ai
- **Demo:** hormocare.ai/demo

## 📁 Project Structure

```
hormocare-ai/
├── index.html              # Main landing page & interactive demo
├── start.html              # Project hub / navigation page
├── presentation.html       # Investor pitch deck
├── diet-tracker.html       # Daily diet & nutrition tracking
├── meal-plan.html          # Weekly meal plans (veg/non-veg/mixed)
├── doctor-consultation.html # Book consultations & upload reports
├── medicine-store.html     # Supplements & medicines store
├── reviews.html            # Customer reviews & testimonials
├── js/
│   ├── app.js             # Core data layer, risk algorithm, food DB
│   └── main.js            # Interactive UI, step handlers, events
├── styles/
│   ├── main.css           # Comprehensive styling for all pages
│   └── presentation.css   # Pitch deck styles
└── README.md              # This file
```

## 🆕 New Features (March 2026)

### 📊 Enhanced Symptom Tracking
- **Fully editable daily symptom tracker** with date navigation
- Track menstrual cycle, weight, acne, hair fall, mood, sleep quality
- View symptom history with trends and delete capability
- All data persists in localStorage

### 🥗 Complete Diet & Nutrition System
- **Diet Tracker** (`diet-tracker.html`) - Track daily meals, calories, protein, carbs, fats
- **Food Database** - 60+ common Indian foods with complete nutrition data
- **Water Intake Tracker** - Visual glass counter (up to 10 glasses)
- **7-Day Diet History** - Overview of weekly nutrition
- Custom food entry with manual macro input

### 📅 Weekly Meal Planner (`meal-plan.html`)
- **3 Plan Types:** Vegetarian, Non-Vegetarian, Mixed/Flexitarian
- **7-Day Meal Plans** with breakfast, lunch, snacks, dinner
- Complete calorie and macro breakdown per day
- PCOS-friendly low GI, anti-inflammatory meals

### 👩‍⚕️ Doctor Consultation (`doctor-consultation.html`)
- **3 Consultation Types:** Voice Call (₹499), Video Call (₹699), In-Person (₹1,200)
- Browse 4+ experienced PCOS specialists
- Book appointments with time slot selection
- **Medical Report Upload** - Upload blood tests, ultrasounds, prescriptions
- View doctor ratings, experience, languages, specializations

### 💊 Medicine & Supplements Store (`medicine-store.html`)
- **12+ Products:** Myo-inositol, Vitamin D, Omega-3, and more
- Filter by category: All, Doctor Recommended, Supplements, Medicines, Wellness
- Product ratings and reviews
- Shopping cart with home delivery
- Free delivery on orders above ₹999

### ⭐ Customer Reviews System (`reviews.html`)
- **User Statistics Dashboard** - Total users, average rating, review count
- **Write Reviews** - 5-star rating system with text feedback
- **View Testimonials** - Verified user reviews with helpful voting
- Real-time stats: 12,458+ active users, 4.8/5 rating

### 🔄 Fully Functional Care Plan
- Real personalized recommendations based on actual tracked data
- Expandable sections for diet, exercise, supplements, monitoring
- Priority-based medical actions (urgent/high/medium)
- Daily monitoring checklist with persistent checkboxes
- Quick action buttons linking to all features

## 🎯 Next Steps

### Development Roadmap
- [ ] Mobile app development
- [ ] Backend API and user authentication
- [ ] Payment gateway integration
- [ ] Real-time doctor availability
- [ ] Push notifications for reminders
- [ ] Machine learning model enhancement
- [ ] Clinical validation studies
- [ ] Regulatory approvals

### Partnership Opportunities
- Healthcare providers and gynecologists
- Diagnostic laboratories  
- Pharmacy chains
- Insurance companies
- Corporate wellness programs
- Government health initiatives


## 🙏 Acknowledgments

- Medical advisors for clinical guidance
- Women's health advocacy groups
- Open source community for development tools
- Beta testers and early users

---

**HormoCare** - Empowering women with early PCOS detection through AI-powered health insights.

*Making preventive healthcare accessible, one woman at a time.* 🌸
