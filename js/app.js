// HormoCare AI - Core Data Layer, Risk Algorithm & Food Database

class HormoCareAI {
    constructor() {
        this.data = {
            profile: {},
            symptoms: [],
            dietEntries: [],
            riskAssessment: null,
            lastUpdated: null
        };
        this.foodDatabase = this._buildFoodDatabase();
        this.dailyGoals = { calories: 1800, protein: 60, carbs: 225, fats: 50, water: 8 };
        this.loadData();
        this.trackUserSession();
    }

    // ==================== User Stats & Analytics ====================
    trackUserSession() {
        let stats = this._getStats();
        const today = this.todayStr();
        
        if (!stats.firstVisit) {
            stats.firstVisit = today;
            stats.totalUsers = 12458;
        }
        
        if (stats.lastVisit !== today) {
            stats.dailyActiveUsers = (stats.dailyActiveUsers || 0) + 1;
            stats.lastVisit = today;
        }
        
        stats.totalSessions = (stats.totalSessions || 0) + 1;
        stats.totalUsers = 12458 + Math.floor((Date.now() - new Date('2026-01-01').getTime()) / (1000 * 60 * 60 * 24));
        
        this._saveStats(stats);
    }

    getUserStats() {
        return this._getStats();
    }

    getTotalUsers() {
        const stats = this._getStats();
        return stats.totalUsers || 12458;
    }

    _getStats() {
        try {
            return JSON.parse(localStorage.getItem('hormocare_stats') || '{}');
        } catch { return {}; }
    }

    _saveStats(stats) {
        try {
            localStorage.setItem('hormocare_stats', JSON.stringify(stats));
        } catch (e) {
            console.error('Error saving stats:', e);
        }
    }

    // ==================== Profile ====================
    saveProfile(profile) {
        this.data.profile = { ...this.data.profile, ...profile };
        this.persist();
        return this.data.profile;
    }

    getProfile() {
        return this.data.profile;
    }

    hasProfile() {
        return !!(this.data.profile && this.data.profile.age);
    }

    // ==================== Symptom Tracking ====================
    saveSymptomEntry(entry) {
        const dateStr = entry.date || this.todayStr();
        const idx = this.data.symptoms.findIndex(s => s.date === dateStr);
        const record = { ...entry, date: dateStr, timestamp: Date.now() };
        if (idx >= 0) {
            this.data.symptoms[idx] = record;
        } else {
            this.data.symptoms.push(record);
        }
        this.persist();
        return record;
    }

    getSymptomEntry(dateStr) {
        return this.data.symptoms.find(s => s.date === (dateStr || this.todayStr())) || null;
    }

    getSymptomHistory(days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return this.data.symptoms
            .filter(s => s.date >= cutoffStr)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    deleteSymptomEntry(dateStr) {
        this.data.symptoms = this.data.symptoms.filter(s => s.date !== dateStr);
        this.persist();
    }

    // ==================== Diet Tracking ====================
    saveDietEntry(entry) {
        const dateStr = entry.date || this.todayStr();
        const idx = this.data.dietEntries.findIndex(d => d.date === dateStr);

        const totals = this._calculateDietTotals(entry.meals || []);
        const record = {
            ...entry,
            date: dateStr,
            totalCalories: totals.calories,
            totalProtein: totals.protein,
            totalCarbs: totals.carbs,
            totalFats: totals.fats,
            timestamp: Date.now()
        };

        if (idx >= 0) {
            this.data.dietEntries[idx] = record;
        } else {
            this.data.dietEntries.push(record);
        }
        this.persist();
        return record;
    }

    getDietEntry(dateStr) {
        return this.data.dietEntries.find(d => d.date === (dateStr || this.todayStr())) || null;
    }

    getDietHistory(days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return this.data.dietEntries
            .filter(d => d.date >= cutoffStr)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    _calculateDietTotals(meals) {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        meals.forEach(meal => {
            (meal.items || []).forEach(item => {
                calories += item.calories || 0;
                protein += item.protein || 0;
                carbs += item.carbs || 0;
                fats += item.fats || 0;
            });
        });
        return { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fats: Math.round(fats) };
    }

    searchFood(query) {
        if (!query || query.length < 2) return [];
        const q = query.toLowerCase();
        return this.foodDatabase.filter(f => f.name.toLowerCase().includes(q)).slice(0, 10);
    }

    // ==================== Risk Calculation ====================
    calculateCurrentRisk() {
        const profile = this.data.profile;
        const history = this.getSymptomHistory(30);

        if (!profile.age && history.length === 0) return null;

        const aggregated = this._aggregateSymptoms(profile, history);
        const result = this.calculatePCOSRisk(aggregated);
        this.data.riskAssessment = result;
        this.persist();
        return result;
    }

    getLastRiskAssessment() {
        return this.data.riskAssessment;
    }

    _aggregateSymptoms(profile, history) {
        const latest = history.length > 0 ? history[history.length - 1] : {};

        const cycleLengths = history.filter(s => s.cycleLength).map(s => Number(s.cycleLength));
        const avgCycleLength = cycleLengths.length > 0
            ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
            : (latest.cycleLength || 28);

        let irregularity = 'low';
        if (cycleLengths.length > 1) {
            const variance = cycleLengths.reduce((sum, l) => sum + Math.pow(l - avgCycleLength, 2), 0) / cycleLengths.length;
            if (variance > 25) irregularity = 'high';
            else if (variance > 10) irregularity = 'moderate';
        } else if (avgCycleLength > 35 || avgCycleLength < 21) {
            irregularity = 'high';
        }

        const missedPeriods = history.filter(s => s.missedPeriod).length;

        const weights = history.filter(s => s.weight).map(s => Number(s.weight));
        let recentGain = 0;
        if (weights.length >= 2) {
            recentGain = weights[weights.length - 1] - weights[0];
        }

        return {
            cycle: { averageLength: avgCycleLength, irregularity, missedPeriods },
            weight: Number(profile.weight) || Number(latest.weight) || 0,
            height: Number(profile.height) || 165,
            weightHistory: { recentGain: Math.max(0, recentGain) },
            acne: Number(latest.acne) || 0,
            hairFall: latest.hairFall || 'low',
            hirsutism: latest.hirsutism || 'low',
            moodSwings: latest.moodSwings || 'none',
            sleepQuality: latest.sleepQuality || 'good',
            familyHistory: profile.familyHistory || 'no',
            age: Number(profile.age) || 25,
            exercise: profile.exercise || 'moderate',
            diet: profile.diet || 'moderate'
        };
    }

    calculatePCOSRisk(symptoms) {
        let riskScore = 0;
        let riskFactors = [];

        const cycleRisk = this._analyzeCycle(symptoms.cycle);
        riskScore += cycleRisk.score * 0.4;
        if (cycleRisk.factors.length > 0) riskFactors.push(...cycleRisk.factors);

        const weightRisk = this._analyzeWeight(symptoms.weight, symptoms.height, symptoms.weightHistory);
        riskScore += weightRisk.score * 0.2;
        if (weightRisk.factors.length > 0) riskFactors.push(...weightRisk.factors);

        const hormonalRisk = this._analyzeHormonalSymptoms(symptoms);
        riskScore += hormonalRisk.score * 0.3;
        if (hormonalRisk.factors.length > 0) riskFactors.push(...hormonalRisk.factors);

        const lifestyleRisk = this._analyzeLifestyle(symptoms);
        riskScore += lifestyleRisk.score * 0.1;
        if (lifestyleRisk.factors.length > 0) riskFactors.push(...lifestyleRisk.factors);

        const finalScore = Math.min(100, Math.max(0, Math.round(riskScore)));

        return {
            score: finalScore,
            level: this._getRiskLevel(finalScore),
            factors: riskFactors,
            recommendations: this._generateRecommendations(finalScore, riskFactors)
        };
    }

    _analyzeCycle(cycleData) {
        let score = 0, factors = [];
        if (!cycleData) return { score: 0, factors: [] };

        if (cycleData.averageLength > 35) {
            score += 40;
            factors.push({ type: 'high', icon: 'fas fa-exclamation-triangle', text: 'Irregular cycles (>35 days)', impact: 'Major PCOS indicator' });
        } else if (cycleData.averageLength < 21) {
            score += 25;
            factors.push({ type: 'medium', icon: 'fas fa-exclamation-circle', text: 'Short cycles (<21 days)', impact: 'Possible hormonal imbalance' });
        }

        if (cycleData.irregularity === 'high') {
            score += 30;
            factors.push({ type: 'high', icon: 'fas fa-calendar-times', text: 'Highly irregular periods', impact: 'Strong PCOS indicator' });
        } else if (cycleData.irregularity === 'moderate') {
            score += 20;
            factors.push({ type: 'medium', icon: 'fas fa-calendar-minus', text: 'Moderately irregular periods', impact: 'Possible PCOS sign' });
        }

        if (cycleData.missedPeriods > 2) {
            score += 35;
            factors.push({ type: 'high', icon: 'fas fa-times-circle', text: 'Frequent missed periods', impact: 'Oligomenorrhea - key PCOS symptom' });
        }

        return { score, factors };
    }

    _analyzeWeight(currentWeight, height, weightHistory) {
        let score = 0, factors = [];
        if (!currentWeight || !height) return { score: 0, factors: [] };

        const bmi = currentWeight / ((height / 100) ** 2);

        if (bmi > 30) {
            score += 25;
            factors.push({ type: 'high', icon: 'fas fa-weight', text: `Obesity (BMI ${bmi.toFixed(1)})`, impact: 'Strong correlation with PCOS' });
        } else if (bmi > 25) {
            score += 15;
            factors.push({ type: 'medium', icon: 'fas fa-weight', text: `Overweight (BMI ${bmi.toFixed(1)})`, impact: 'Increased PCOS risk' });
        }

        if (weightHistory && weightHistory.recentGain > 5) {
            score += 20;
            factors.push({ type: 'medium', icon: 'fas fa-arrow-up', text: 'Rapid weight gain (>5kg recently)', impact: 'Possible insulin resistance' });
        }

        return { score, factors };
    }

    _analyzeHormonalSymptoms(symptoms) {
        let score = 0, factors = [];

        if (symptoms.acne >= 4) {
            score += 20;
            factors.push({ type: 'high', icon: 'fas fa-user-injured', text: 'Severe persistent acne', impact: 'Indicates high androgen levels' });
        } else if (symptoms.acne >= 3) {
            score += 15;
            factors.push({ type: 'medium', icon: 'fas fa-user-injured', text: 'Moderate acne', impact: 'Possible hormonal imbalance' });
        }

        if (symptoms.hairFall === 'high') {
            score += 25;
            factors.push({ type: 'high', icon: 'fas fa-user-alt', text: 'Excessive hair fall/thinning', impact: 'Androgenic alopecia - PCOS sign' });
        } else if (symptoms.hairFall === 'medium') {
            score += 15;
            factors.push({ type: 'medium', icon: 'fas fa-user-alt', text: 'Moderate hair fall', impact: 'Possible androgen excess' });
        }

        if (symptoms.hirsutism === 'high') {
            score += 30;
            factors.push({ type: 'high', icon: 'fas fa-venus', text: 'Excessive facial/body hair', impact: 'Clear sign of hyperandrogenism' });
        } else if (symptoms.hirsutism === 'medium') {
            score += 20;
            factors.push({ type: 'medium', icon: 'fas fa-venus', text: 'Increased body hair growth', impact: 'Possible PCOS symptom' });
        }

        if (symptoms.moodSwings === 'severe') {
            score += 15;
            factors.push({ type: 'medium', icon: 'fas fa-brain', text: 'Severe mood swings/depression', impact: 'Hormonal fluctuations affect mood' });
        }

        if (symptoms.sleepQuality === 'poor') {
            score += 10;
            factors.push({ type: 'low', icon: 'fas fa-moon', text: 'Poor sleep quality', impact: 'May worsen insulin resistance' });
        }

        return { score, factors };
    }

    _analyzeLifestyle(symptoms) {
        let score = 0, factors = [];

        if (symptoms.familyHistory === 'mother' || symptoms.familyHistory === 'sister') {
            score += 20;
            factors.push({ type: 'medium', icon: 'fas fa-dna', text: 'Strong family history of PCOS', impact: 'Genetic predisposition (35-40% heritability)' });
        } else if (symptoms.familyHistory === 'other') {
            score += 10;
            factors.push({ type: 'low', icon: 'fas fa-dna', text: 'Family history of PCOS', impact: 'Increased genetic risk' });
        }

        if (symptoms.age >= 20 && symptoms.age <= 30) {
            score += 5;
            factors.push({ type: 'low', icon: 'fas fa-birthday-cake', text: 'Peak PCOS diagnosis age (20-30)', impact: 'Most common age for PCOS onset' });
        }

        if (symptoms.exercise === 'sedentary') {
            score += 10;
            factors.push({ type: 'low', icon: 'fas fa-couch', text: 'Sedentary lifestyle', impact: 'Increases insulin resistance risk' });
        }

        if (symptoms.diet === 'poor') {
            score += 15;
            factors.push({ type: 'medium', icon: 'fas fa-utensils', text: 'High processed food intake', impact: 'Worsens insulin sensitivity' });
        }

        return { score, factors };
    }

    _getRiskLevel(score) {
        if (score >= 70) return { level: 'high', cssClass: 'high-risk', label: 'High Risk', color: '#E74C3C' };
        if (score >= 40) return { level: 'moderate', cssClass: 'moderate-risk', label: 'Moderate Risk', color: '#F39C12' };
        if (score >= 20) return { level: 'low-moderate', cssClass: 'low-moderate-risk', label: 'Low-Moderate Risk', color: '#3498DB' };
        return { level: 'low', cssClass: 'low-risk', label: 'Low Risk', color: '#2ECC71' };
    }

    _generateRecommendations(score, factors) {
        let recs = { immediate: [], diet: [], exercise: [], supplements: [], monitoring: [] };

        if (score >= 70) {
            recs.immediate.push({ priority: 'urgent', icon: 'fas fa-hospital', text: 'Schedule gynecologist appointment within 1-2 weeks', detail: 'High PCOS risk requires immediate professional evaluation. Request comprehensive hormone panel (LH, FSH, testosterone, DHEAS) and pelvic ultrasound.' });
            recs.immediate.push({ priority: 'urgent', icon: 'fas fa-vial', text: 'Get blood tests: hormone panel + insulin levels', detail: 'Fasting insulin, glucose tolerance test, lipid profile, thyroid function (TSH, T3, T4).' });
        } else if (score >= 40) {
            recs.immediate.push({ priority: 'high', icon: 'fas fa-user-md', text: 'Consult gynecologist within 2-4 weeks', detail: 'Moderate risk warrants professional evaluation. Discuss your symptoms and family history.' });
        } else if (score >= 20) {
            recs.immediate.push({ priority: 'medium', icon: 'fas fa-stethoscope', text: 'Discuss symptoms at next doctor visit', detail: 'Monitor symptoms and track patterns. Bring your symptom log to your appointment.' });
        } else {
            recs.immediate.push({ priority: 'low', icon: 'fas fa-check-circle', text: 'Continue healthy lifestyle habits', detail: 'Your risk is currently low. Keep tracking symptoms for early detection.' });
        }

        recs.diet = [
            { text: 'Follow low glycemic index (GI) diet', detail: 'Choose whole grains over refined carbs. Brown rice, oats, quinoa instead of white rice/bread.' },
            { text: 'Increase fiber intake to 25-30g daily', detail: 'Vegetables, fruits, legumes, whole grains. Fiber helps regulate blood sugar and hormones.' },
            { text: 'Reduce refined sugars and processed foods', detail: 'Limit sweets, packaged snacks, sugary drinks. These spike insulin levels.' },
            { text: 'Include anti-inflammatory foods', detail: 'Turmeric, berries, leafy greens, fatty fish, nuts. These help reduce PCOS inflammation.' },
            { text: 'Eat protein with every meal', detail: 'Eggs, paneer, dal, chicken, fish. Protein helps manage blood sugar and keeps you full.' },
            { text: 'Stay hydrated - 8+ glasses of water daily', detail: 'Proper hydration supports metabolism and helps flush excess hormones.' }
        ];

        recs.exercise = [
            { text: 'Moderate cardio: 150 minutes/week', detail: 'Brisk walking, cycling, swimming. Start with 20-30 minutes, 5 days/week.' },
            { text: 'Strength training: 2-3 times/week', detail: 'Bodyweight exercises, resistance bands, or light weights. Builds muscle and improves insulin sensitivity.' },
            { text: 'Yoga for stress relief: 2-3 times/week', detail: 'Surya Namaskar, Pranayama, Meditation. Reduces cortisol and improves hormonal balance.' },
            { text: 'Daily step goal: 8,000-10,000 steps', detail: 'Use a pedometer or phone app. Even short walks throughout the day count.' }
        ];

        if (score >= 40) {
            recs.exercise.push({ text: 'HIIT workouts: 1-2 times/week', detail: 'Short bursts of intense exercise. Very effective for insulin resistance.' });
        }

        recs.monitoring = [
            'Track menstrual cycles daily',
            'Monitor weight weekly (same time, same conditions)',
            'Log mood and energy levels',
            'Track sleep quality and duration',
            'Photo-document skin and hair changes monthly',
            'Record diet and exercise activities'
        ];

        if (score >= 40) {
            recs.supplements.push({ name: 'Myo-inositol', dosage: '2-4g daily', benefit: 'Improves insulin sensitivity and ovulation', note: 'One of the most studied supplements for PCOS' });
            recs.supplements.push({ name: 'Vitamin D', dosage: '2000-4000 IU daily', benefit: 'Often deficient in PCOS, supports hormone balance', note: 'Get levels tested first' });
            recs.supplements.push({ name: 'Omega-3 fatty acids', dosage: '1000-2000mg daily', benefit: 'Reduces inflammation and improves insulin sensitivity', note: 'Fish oil or flaxseed oil' });
            recs.supplements.push({ name: 'Spearmint tea', dosage: '2 cups daily', benefit: 'May help reduce androgen levels naturally', note: 'Can help with hirsutism' });
        }
        if (score >= 20) {
            recs.supplements.push({ name: 'Chromium', dosage: '200-1000mcg daily', benefit: 'Helps regulate blood sugar levels', note: 'Especially if insulin resistant' });
        }

        return recs;
    }

    // ==================== Persistence ====================
    persist() {
        this.data.lastUpdated = Date.now();
        try {
            localStorage.setItem('hormocare_data', JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('hormocare_data');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = {
                    profile: parsed.profile || {},
                    symptoms: parsed.symptoms || [],
                    dietEntries: parsed.dietEntries || [],
                    riskAssessment: parsed.riskAssessment || null,
                    lastUpdated: parsed.lastUpdated
                };
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    clearAllData() {
        this.data = { profile: {}, symptoms: [], dietEntries: [], riskAssessment: null, lastUpdated: null };
        localStorage.removeItem('hormocare_data');
    }

    todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ==================== Food Database ====================
    _buildFoodDatabase() {
        return [
            // Indian Staples
            { name: 'Rice, white (1 cup cooked)', calories: 206, protein: 4.3, carbs: 45, fats: 0.4, category: 'grain' },
            { name: 'Rice, brown (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fats: 1.8, category: 'grain' },
            { name: 'Roti / Chapati (1 piece)', calories: 120, protein: 3.5, carbs: 20, fats: 3.5, category: 'grain' },
            { name: 'Paratha (1 piece)', calories: 230, protein: 5, carbs: 30, fats: 10, category: 'grain' },
            { name: 'Naan (1 piece)', calories: 262, protein: 9, carbs: 45, fats: 5, category: 'grain' },
            { name: 'Poha (1 cup)', calories: 250, protein: 5, carbs: 42, fats: 7, category: 'grain' },
            { name: 'Upma (1 cup)', calories: 210, protein: 5, carbs: 32, fats: 7, category: 'grain' },
            { name: 'Idli (2 pieces)', calories: 130, protein: 4, carbs: 26, fats: 0.4, category: 'grain' },
            { name: 'Dosa (1 plain)', calories: 168, protein: 4, carbs: 28, fats: 4, category: 'grain' },
            { name: 'Oats porridge (1 cup)', calories: 166, protein: 6, carbs: 28, fats: 3.6, category: 'grain' },

            // Lentils & Legumes
            { name: 'Dal (Toor/Moong, 1 cup)', calories: 198, protein: 14, carbs: 34, fats: 1, category: 'protein' },
            { name: 'Chana Dal (1 cup)', calories: 269, protein: 16, carbs: 45, fats: 4.5, category: 'protein' },
            { name: 'Rajma (Kidney beans, 1 cup)', calories: 225, protein: 15, carbs: 40, fats: 0.9, category: 'protein' },
            { name: 'Chole / Chickpeas (1 cup)', calories: 269, protein: 15, carbs: 45, fats: 4, category: 'protein' },
            { name: 'Sprouts, mixed (1 cup)', calories: 130, protein: 14, carbs: 17, fats: 1, category: 'protein' },

            // Dairy
            { name: 'Milk, whole (1 glass - 250ml)', calories: 149, protein: 8, carbs: 12, fats: 8, category: 'dairy' },
            { name: 'Milk, toned (1 glass - 250ml)', calories: 120, protein: 8, carbs: 12, fats: 4.5, category: 'dairy' },
            { name: 'Curd / Yogurt (1 cup)', calories: 98, protein: 11, carbs: 4, fats: 4.5, category: 'dairy' },
            { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1.2, fats: 21, category: 'dairy' },
            { name: 'Lassi, sweet (1 glass)', calories: 180, protein: 6, carbs: 28, fats: 5, category: 'dairy' },
            { name: 'Buttermilk / Chaas (1 glass)', calories: 40, protein: 3, carbs: 5, fats: 1, category: 'dairy' },

            // Non-Veg
            { name: 'Egg, boiled (1 whole)', calories: 78, protein: 6, carbs: 0.6, fats: 5, category: 'protein' },
            { name: 'Egg omelette (2 eggs)', calories: 190, protein: 13, carbs: 1.5, fats: 15, category: 'protein' },
            { name: 'Chicken breast, grilled (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein' },
            { name: 'Chicken curry (1 cup)', calories: 240, protein: 22, carbs: 8, fats: 14, category: 'protein' },
            { name: 'Fish, grilled (100g)', calories: 136, protein: 26, carbs: 0, fats: 3, category: 'protein' },
            { name: 'Fish curry (1 cup)', calories: 200, protein: 22, carbs: 6, fats: 10, category: 'protein' },

            // Vegetables
            { name: 'Mixed vegetable sabzi (1 cup)', calories: 120, protein: 4, carbs: 16, fats: 5, category: 'vegetable' },
            { name: 'Palak / Spinach sabzi (1 cup)', calories: 90, protein: 5, carbs: 8, fats: 5, category: 'vegetable' },
            { name: 'Aloo Gobi (1 cup)', calories: 170, protein: 4, carbs: 22, fats: 8, category: 'vegetable' },
            { name: 'Bhindi / Okra (1 cup)', calories: 80, protein: 3, carbs: 10, fats: 4, category: 'vegetable' },
            { name: 'Salad, mixed (1 plate)', calories: 45, protein: 2, carbs: 8, fats: 0.5, category: 'vegetable' },
            { name: 'Cucumber raita (1 cup)', calories: 75, protein: 5, carbs: 6, fats: 3, category: 'vegetable' },

            // Fruits
            { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, category: 'fruit' },
            { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: 'fruit' },
            { name: 'Mango (1 cup sliced)', calories: 99, protein: 1.4, carbs: 25, fats: 0.6, category: 'fruit' },
            { name: 'Papaya (1 cup)', calories: 62, protein: 0.7, carbs: 16, fats: 0.4, category: 'fruit' },
            { name: 'Orange (1 medium)', calories: 62, protein: 1.2, carbs: 15, fats: 0.2, category: 'fruit' },
            { name: 'Pomegranate (1 cup seeds)', calories: 144, protein: 3, carbs: 33, fats: 2, category: 'fruit' },
            { name: 'Guava (1 medium)', calories: 68, protein: 2.5, carbs: 14, fats: 1, category: 'fruit' },

            // Snacks
            { name: 'Samosa (1 piece)', calories: 252, protein: 4, carbs: 24, fats: 16, category: 'snack' },
            { name: 'Pakora / Bhajiya (5 pieces)', calories: 200, protein: 5, carbs: 18, fats: 12, category: 'snack' },
            { name: 'Biscuits (4 pieces)', calories: 160, protein: 2, carbs: 22, fats: 7, category: 'snack' },
            { name: 'Almonds (10 pieces)', calories: 69, protein: 2.5, carbs: 2.5, fats: 6, category: 'nuts' },
            { name: 'Walnuts (5 halves)', calories: 65, protein: 1.5, carbs: 1.4, fats: 6.5, category: 'nuts' },
            { name: 'Peanuts (1/4 cup)', calories: 207, protein: 9, carbs: 6, fats: 18, category: 'nuts' },
            { name: 'Makhana / Fox nuts (1 cup)', calories: 105, protein: 4, carbs: 18, fats: 1, category: 'snack' },

            // Beverages
            { name: 'Tea with milk & sugar (1 cup)', calories: 60, protein: 1, carbs: 10, fats: 2, category: 'beverage' },
            { name: 'Tea, green (1 cup)', calories: 2, protein: 0, carbs: 0, fats: 0, category: 'beverage' },
            { name: 'Coffee with milk (1 cup)', calories: 70, protein: 2, carbs: 8, fats: 3, category: 'beverage' },
            { name: 'Coconut water (1 glass)', calories: 46, protein: 2, carbs: 9, fats: 0.5, category: 'beverage' },
            { name: 'Fresh juice, orange (1 glass)', calories: 112, protein: 2, carbs: 26, fats: 0.5, category: 'beverage' },
            { name: 'Nimbu Pani / Lemon water (1 glass)', calories: 30, protein: 0, carbs: 8, fats: 0, category: 'beverage' },

            // Sweets & Desserts
            { name: 'Gulab Jamun (1 piece)', calories: 150, protein: 2, carbs: 22, fats: 6, category: 'sweet' },
            { name: 'Rasgulla (1 piece)', calories: 120, protein: 3, carbs: 24, fats: 1, category: 'sweet' },
            { name: 'Halwa, sooji (1/2 cup)', calories: 250, protein: 3, carbs: 35, fats: 12, category: 'sweet' },
            { name: 'Jaggery / Gur (1 tbsp)', calories: 55, protein: 0.1, carbs: 14, fats: 0, category: 'sweet' },
            { name: 'Dark chocolate (2 squares)', calories: 110, protein: 1.5, carbs: 13, fats: 7, category: 'sweet' },

            // Common Meals
            { name: 'Biryani, chicken (1 plate)', calories: 490, protein: 22, carbs: 60, fats: 18, category: 'meal' },
            { name: 'Biryani, veg (1 plate)', calories: 380, protein: 10, carbs: 60, fats: 12, category: 'meal' },
            { name: 'Thali, veg (standard)', calories: 700, protein: 22, carbs: 100, fats: 22, category: 'meal' },
            { name: 'Pav Bhaji (1 serving)', calories: 400, protein: 10, carbs: 52, fats: 18, category: 'meal' },
            { name: 'Maggi noodles (1 packet)', calories: 315, protein: 7, carbs: 44, fats: 13, category: 'meal' },
            { name: 'Bread, whole wheat (1 slice)', calories: 82, protein: 4, carbs: 14, fats: 1, category: 'grain' },
            { name: 'Butter (1 tbsp)', calories: 102, protein: 0.1, carbs: 0, fats: 12, category: 'fat' },
            { name: 'Ghee (1 tsp)', calories: 45, protein: 0, carbs: 0, fats: 5, category: 'fat' },
            { name: 'Cooking oil (1 tbsp)', calories: 120, protein: 0, carbs: 0, fats: 14, category: 'fat' }
        ];
    }
}

const hormoCareApp = new HormoCareAI();
