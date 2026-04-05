// HormoCare AI - Interactive UI Layer

let currentStep = 1;

document.addEventListener('DOMContentLoaded', function () {
    // Navigation smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
            document.querySelector('.nav-menu')?.classList.remove('active');
        });
    });

    // Mobile menu
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    // Step navigation
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', function () {
            setActiveStep(parseInt(this.getAttribute('data-step')));
        });
    });

    setActiveStep(1);
});

function setActiveStep(stepNumber) {
    currentStep = stepNumber;
    document.querySelectorAll('.step').forEach(step => {
        step.classList.toggle('active', step.getAttribute('data-step') == stepNumber);
    });
    const iface = document.getElementById('app-interface');
    if (iface) {
        iface.innerHTML = getStepContent(stepNumber);
        attachStepHandlers(stepNumber);
    }
}

function getStepContent(step) {
    switch (step) {
        case 1: return renderProfileSetup();
        case 2: return renderSymptomTracking();
        case 3: return renderAnalysis();
        case 4: return renderCarePlan();
        case 5: return renderDietTracker();
        default: return renderProfileSetup();
    }
}

function attachStepHandlers(step) {
    switch (step) {
        case 1: attachProfileHandlers(); break;
        case 2: attachTrackingHandlers(); break;
        case 3: attachAnalysisHandlers(); break;
        case 4: attachCarePlanHandlers(); break;
        case 5: attachDietHandlers(); break;
    }
}

// ==================== STEP 1: Profile Setup ====================
function renderProfileSetup() {
    const p = hormoCareApp.getProfile();
    return `
        <div class="demo-form">
            <h3><i class="fas fa-user-circle"></i> Create Your Health Profile</h3>
            <p class="form-subtitle">This information helps us personalize your PCOS risk assessment.</p>
            <form class="profile-form" id="profileForm">
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-birthday-cake"></i> Age</label>
                        <input type="number" id="prof-age" placeholder="e.g. 25" min="12" max="60" value="${p.age || ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-weight"></i> Weight (kg)</label>
                        <input type="number" id="prof-weight" placeholder="e.g. 60" min="30" max="200" step="0.1" value="${p.weight || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-ruler-vertical"></i> Height (cm)</label>
                        <input type="number" id="prof-height" placeholder="e.g. 165" min="100" max="220" value="${p.height || ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-dna"></i> Family History of PCOS</label>
                        <select id="prof-family">
                            <option value="">Select...</option>
                            <option value="mother" ${p.familyHistory === 'mother' ? 'selected' : ''}>Yes - Mother</option>
                            <option value="sister" ${p.familyHistory === 'sister' ? 'selected' : ''}>Yes - Sister</option>
                            <option value="other" ${p.familyHistory === 'other' ? 'selected' : ''}>Yes - Other relative</option>
                            <option value="no" ${p.familyHistory === 'no' ? 'selected' : ''}>No</option>
                            <option value="unknown" ${p.familyHistory === 'unknown' ? 'selected' : ''}>Unknown</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-running"></i> Exercise Level</label>
                        <select id="prof-exercise">
                            <option value="">Select...</option>
                            <option value="sedentary" ${p.exercise === 'sedentary' ? 'selected' : ''}>Sedentary (little/no exercise)</option>
                            <option value="light" ${p.exercise === 'light' ? 'selected' : ''}>Light (1-2 days/week)</option>
                            <option value="moderate" ${p.exercise === 'moderate' ? 'selected' : ''}>Moderate (3-4 days/week)</option>
                            <option value="active" ${p.exercise === 'active' ? 'selected' : ''}>Active (5+ days/week)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-utensils"></i> Diet Quality</label>
                        <select id="prof-diet">
                            <option value="">Select...</option>
                            <option value="poor" ${p.diet === 'poor' ? 'selected' : ''}>Poor (mostly processed/junk food)</option>
                            <option value="moderate" ${p.diet === 'moderate' ? 'selected' : ''}>Moderate (mixed diet)</option>
                            <option value="good" ${p.diet === 'good' ? 'selected' : ''}>Good (mostly home-cooked)</option>
                            <option value="excellent" ${p.diet === 'excellent' ? 'selected' : ''}>Excellent (balanced, whole foods)</option>
                        </select>
                    </div>
                </div>
                <div id="profile-msg" class="form-message"></div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Profile & Continue
                    </button>
                </div>
            </form>
        </div>
    `;
}

function attachProfileHandlers() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const age = document.getElementById('prof-age').value;
        const weight = document.getElementById('prof-weight').value;
        const height = document.getElementById('prof-height').value;

        if (!age || !weight || !height) {
            showFormMessage('profile-msg', 'Please fill in at least Age, Weight, and Height.', 'error');
            return;
        }

        hormoCareApp.saveProfile({
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseInt(height),
            familyHistory: document.getElementById('prof-family').value || 'unknown',
            exercise: document.getElementById('prof-exercise').value || 'moderate',
            diet: document.getElementById('prof-diet').value || 'moderate'
        });

        showFormMessage('profile-msg', 'Profile saved successfully!', 'success');
        setTimeout(() => setActiveStep(2), 800);
    });
}

// ==================== STEP 2: Symptom Tracking ====================
function renderSymptomTracking() {
    const today = hormoCareApp.todayStr();
    const entry = hormoCareApp.getSymptomEntry(today) || {};
    const history = hormoCareApp.getSymptomHistory(7);

    return `
        <div class="demo-tracking">
            <h3><i class="fas fa-chart-line"></i> Daily Symptom Tracking</h3>
            <p class="form-subtitle">Log your symptoms daily for accurate risk assessment. All changes auto-save.</p>
            <div class="tracking-date-picker">
                <button class="date-nav-btn" id="prevDay"><i class="fas fa-chevron-left"></i></button>
                <input type="date" id="trackingDate" value="${today}" max="${today}">
                <button class="date-nav-btn" id="nextDay"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="tracking-grid">
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-calendar"></i><h4>Menstrual Cycle</h4></div>
                    <div class="form-group">
                        <label>Cycle Length (days)</label>
                        <input type="number" id="track-cycleLength" min="15" max="90" placeholder="e.g. 28" value="${entry.cycleLength || ''}">
                    </div>
                    <div class="form-group">
                        <label>Last Period Start Date</label>
                        <input type="date" id="track-lastPeriod" value="${entry.lastPeriodDate || ''}" max="${today}">
                    </div>
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" id="track-missedPeriod" ${entry.missedPeriod ? 'checked' : ''}>
                            Missed period this month
                        </label>
                    </div>
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-weight"></i><h4>Weight Today</h4></div>
                    <div class="form-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="track-weight" min="30" max="200" step="0.1" placeholder="e.g. 62" value="${entry.weight || ''}">
                    </div>
                    ${renderWeightTrend(history)}
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-user-injured"></i><h4>Acne Severity</h4></div>
                    <div class="severity-scale-input" id="acneScale">
                        ${[1, 2, 3, 4, 5].map(n => `<button class="scale-btn ${(entry.acne || 0) === n ? 'active' : ''}" data-val="${n}">${n}</button>`).join('')}
                    </div>
                    <div class="scale-labels"><span>None</span><span>Mild</span><span>Moderate</span><span>Severe</span><span>Very Severe</span></div>
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-user-alt"></i><h4>Hair Fall</h4></div>
                    <div class="option-group" id="hairFallGroup">
                        ${['low', 'medium', 'high'].map(v => `<button class="option-btn ${entry.hairFall === v ? 'active' : ''}" data-val="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`).join('')}
                    </div>
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-venus"></i><h4>Excess Body Hair</h4></div>
                    <div class="option-group" id="hirsutismGroup">
                        ${['low', 'medium', 'high'].map(v => `<button class="option-btn ${entry.hirsutism === v ? 'active' : ''}" data-val="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`).join('')}
                    </div>
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-brain"></i><h4>Mood</h4></div>
                    <div class="option-group" id="moodGroup">
                        ${['none', 'mild', 'moderate', 'severe'].map(v => `<button class="option-btn ${entry.moodSwings === v ? 'active' : ''}" data-val="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`).join('')}
                    </div>
                </div>
                <div class="tracking-card">
                    <div class="card-header"><i class="fas fa-moon"></i><h4>Sleep Quality</h4></div>
                    <div class="option-group" id="sleepGroup">
                        ${['poor', 'fair', 'good', 'excellent'].map(v => `<button class="option-btn ${entry.sleepQuality === v ? 'active' : ''}" data-val="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`).join('')}
                    </div>
                </div>
                <div class="tracking-card full-width">
                    <div class="card-header"><i class="fas fa-sticky-note"></i><h4>Notes</h4></div>
                    <textarea id="track-notes" placeholder="Any additional notes about how you're feeling today..." rows="3">${entry.notes || ''}</textarea>
                </div>
            </div>
            <div id="tracking-msg" class="form-message"></div>
            <div class="form-actions">
                <button class="btn btn-primary" id="saveTrackingBtn">
                    <i class="fas fa-save"></i> Save Today's Entry
                </button>
                <button class="btn btn-secondary" onclick="setActiveStep(3)">
                    Analyze My Data <i class="fas fa-brain"></i>
                </button>
            </div>
            ${renderSymptomHistory(history)}
        </div>
    `;
}

function renderWeightTrend(history) {
    const weights = history.filter(s => s.weight).map(s => ({ date: s.date, w: s.weight }));
    if (weights.length < 2) return '<p class="trend-text">Log daily to see trends</p>';
    const diff = (weights[weights.length - 1].w - weights[0].w).toFixed(1);
    const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
    const sign = diff > 0 ? '+' : '';
    return `<p class="trend-text trend-${cls}">${sign}${diff}kg over last ${weights.length} entries</p>`;
}

function renderSymptomHistory(history) {
    if (history.length === 0) return '';
    return `
        <div class="history-section">
            <h4><i class="fas fa-history"></i> Recent Entries</h4>
            <div class="history-list">
                ${history.slice(-7).reverse().map(e => `
                    <div class="history-item">
                        <span class="history-date">${hormoCareApp.formatDate(e.date)}</span>
                        <span class="history-badges">
                            ${e.acne ? `<span class="badge">Acne: ${e.acne}/5</span>` : ''}
                            ${e.hairFall ? `<span class="badge">Hair: ${e.hairFall}</span>` : ''}
                            ${e.weight ? `<span class="badge">${e.weight}kg</span>` : ''}
                            ${e.cycleLength ? `<span class="badge">Cycle: ${e.cycleLength}d</span>` : ''}
                        </span>
                        <button class="delete-entry-btn" data-date="${e.date}" title="Delete entry"><i class="fas fa-trash"></i></button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function attachTrackingHandlers() {
    // Date navigation
    const dateInput = document.getElementById('trackingDate');
    if (dateInput) {
        dateInput.addEventListener('change', () => loadTrackingForDate(dateInput.value));
    }
    document.getElementById('prevDay')?.addEventListener('click', () => {
        const d = new Date(dateInput.value);
        d.setDate(d.getDate() - 1);
        dateInput.value = d.toISOString().split('T')[0];
        loadTrackingForDate(dateInput.value);
    });
    document.getElementById('nextDay')?.addEventListener('click', () => {
        const d = new Date(dateInput.value);
        d.setDate(d.getDate() + 1);
        const today = new Date().toISOString().split('T')[0];
        if (d.toISOString().split('T')[0] <= today) {
            dateInput.value = d.toISOString().split('T')[0];
            loadTrackingForDate(dateInput.value);
        }
    });

    // Scale buttons (acne)
    document.querySelectorAll('#acneScale .scale-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#acneScale .scale-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Option group buttons
    ['hairFallGroup', 'hirsutismGroup', 'moodGroup', 'sleepGroup'].forEach(gid => {
        document.querySelectorAll(`#${gid} .option-btn`).forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll(`#${gid} .option-btn`).forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });

    // Save button
    document.getElementById('saveTrackingBtn')?.addEventListener('click', saveTracking);

    // Delete buttons
    document.querySelectorAll('.delete-entry-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (confirm('Delete this entry?')) {
                hormoCareApp.deleteSymptomEntry(this.dataset.date);
                setActiveStep(2);
            }
        });
    });
}

function loadTrackingForDate(dateStr) {
    const entry = hormoCareApp.getSymptomEntry(dateStr) || {};

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('track-cycleLength', entry.cycleLength);
    setVal('track-lastPeriod', entry.lastPeriodDate);
    setVal('track-weight', entry.weight);
    setVal('track-notes', entry.notes);

    const cb = document.getElementById('track-missedPeriod');
    if (cb) cb.checked = !!entry.missedPeriod;

    // Acne scale
    document.querySelectorAll('#acneScale .scale-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.val) === (entry.acne || 0));
    });

    // Option groups
    const setGroup = (gid, val) => {
        document.querySelectorAll(`#${gid} .option-btn`).forEach(b => {
            b.classList.toggle('active', b.dataset.val === val);
        });
    };
    setGroup('hairFallGroup', entry.hairFall || '');
    setGroup('hirsutismGroup', entry.hirsutism || '');
    setGroup('moodGroup', entry.moodSwings || '');
    setGroup('sleepGroup', entry.sleepQuality || '');
}

function saveTracking() {
    const dateStr = document.getElementById('trackingDate')?.value || hormoCareApp.todayStr();
    const getActive = (gid) => document.querySelector(`#${gid} .option-btn.active`)?.dataset.val || '';
    const acneBtn = document.querySelector('#acneScale .scale-btn.active');

    const entry = {
        date: dateStr,
        cycleLength: document.getElementById('track-cycleLength')?.value ? parseInt(document.getElementById('track-cycleLength').value) : null,
        lastPeriodDate: document.getElementById('track-lastPeriod')?.value || null,
        missedPeriod: document.getElementById('track-missedPeriod')?.checked || false,
        weight: document.getElementById('track-weight')?.value ? parseFloat(document.getElementById('track-weight').value) : null,
        acne: acneBtn ? parseInt(acneBtn.dataset.val) : 0,
        hairFall: getActive('hairFallGroup'),
        hirsutism: getActive('hirsutismGroup'),
        moodSwings: getActive('moodGroup'),
        sleepQuality: getActive('sleepGroup'),
        notes: document.getElementById('track-notes')?.value || ''
    };

    hormoCareApp.saveSymptomEntry(entry);
    showFormMessage('tracking-msg', 'Symptoms saved successfully!', 'success');
    setTimeout(() => setActiveStep(2), 600);
}

// ==================== STEP 3: AI Analysis ====================
function renderAnalysis() {
    const risk = hormoCareApp.calculateCurrentRisk();

    if (!risk) {
        return `
            <div class="demo-analysis">
                <h3><i class="fas fa-brain"></i> AI Risk Assessment</h3>
                <div class="empty-state">
                    <i class="fas fa-clipboard-list empty-icon"></i>
                    <h4>Not Enough Data</h4>
                    <p>Please complete your profile and log at least one day of symptoms before running the analysis.</p>
                    <button class="btn btn-primary" onclick="setActiveStep(1)"><i class="fas fa-user-circle"></i> Complete Profile</button>
                </div>
            </div>
        `;
    }

    const { score, level, factors, recommendations } = risk;

    return `
        <div class="demo-analysis">
            <h3><i class="fas fa-brain"></i> AI Risk Assessment</h3>
            <div class="risk-dashboard">
                <div class="risk-score-main">
                    <div class="risk-circle-large ${level.cssClass}">
                        <div class="score-text">
                            <span class="score-number">${score}%</span>
                            <span class="score-label">${level.label}</span>
                        </div>
                    </div>
                    <p class="risk-description">${getRiskDescription(score)}</p>
                </div>

                ${factors.length > 0 ? `
                <div class="risk-factors">
                    <h4>Key Risk Factors</h4>
                    ${factors.map(f => `
                        <div class="factor-item ${f.type}">
                            <i class="${f.icon}"></i>
                            <div class="factor-details">
                                <strong>${f.text}</strong>
                                <span>${f.impact}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="ai-insights">
                    <h4><i class="fas fa-robot"></i> AI Insights</h4>
                    <p>${generateInsightText(score, factors)}</p>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="setActiveStep(4)">
                    <i class="fas fa-lightbulb"></i> View Personalized Care Plan
                </button>
                <button class="btn btn-secondary" onclick="setActiveStep(2)">
                    <i class="fas fa-edit"></i> Update Symptoms
                </button>
            </div>
        </div>
    `;
}

function getRiskDescription(score) {
    if (score >= 70) return 'Your symptoms indicate a high likelihood of PCOS. We strongly recommend consulting a gynecologist soon.';
    if (score >= 40) return 'Your symptoms show moderate risk indicators. A medical consultation would be beneficial.';
    if (score >= 20) return 'Some mild risk factors detected. Keep tracking your symptoms and maintain a healthy lifestyle.';
    return 'Your risk appears low based on current data. Continue tracking for early detection.';
}

function generateInsightText(score, factors) {
    const highFactors = factors.filter(f => f.type === 'high');
    const medFactors = factors.filter(f => f.type === 'medium');

    if (score >= 70) {
        return `Based on your tracked data, there's a ${score}% likelihood of hormonal imbalance consistent with PCOS. ${highFactors.length > 0 ? 'Key concerns include ' + highFactors.map(f => f.text.toLowerCase()).join(', ') + '.' : ''} We recommend scheduling a gynecologist appointment within 1-2 weeks for hormone panel testing and ultrasound.`;
    }
    if (score >= 40) {
        return `Your analysis shows a ${score}% risk level. ${medFactors.length > 0 ? 'Notable symptoms include ' + medFactors.slice(0, 3).map(f => f.text.toLowerCase()).join(', ') + '.' : ''} Consider consulting a gynecologist within 2-4 weeks and following our personalized care plan.`;
    }
    if (score >= 20) {
        return `Your current risk is ${score}%. While this is in the low-moderate range, ${factors.length > 0 ? 'we noticed ' + factors.slice(0, 2).map(f => f.text.toLowerCase()).join(' and ') + '.' : 'continue monitoring.'} Keep logging your symptoms daily for more accurate tracking.`;
    }
    return `Great news! Your current risk score is only ${score}%. Your symptoms appear within normal ranges. Continue tracking daily to catch any changes early.`;
}

function attachAnalysisHandlers() { /* buttons use inline onclick */ }

// ==================== STEP 4: Personalized Care Plan ====================
function renderCarePlan() {
    const risk = hormoCareApp.getLastRiskAssessment();

    if (!risk || !risk.recommendations) {
        return `
            <div class="demo-recommendations">
                <h3><i class="fas fa-lightbulb"></i> Personalized Care Plan</h3>
                <div class="empty-state">
                    <i class="fas fa-clipboard-check empty-icon"></i>
                    <h4>Run Analysis First</h4>
                    <p>Complete your profile and symptom tracking, then run the AI analysis to get your personalized care plan.</p>
                    <button class="btn btn-primary" onclick="setActiveStep(3)"><i class="fas fa-brain"></i> Run Analysis</button>
                </div>
            </div>
        `;
    }

    const recs = risk.recommendations;

    return `
        <div class="demo-recommendations">
            <h3><i class="fas fa-lightbulb"></i> Your Personalized Care Plan</h3>
            <p class="form-subtitle">Based on your risk score of <strong>${risk.score}%</strong> (${risk.level.label})</p>

            <!-- Medical Actions -->
            <div class="care-section">
                <div class="rec-card urgent">
                    <div class="rec-header">
                        <i class="fas fa-user-md"></i>
                        <h4>Medical Action</h4>
                        <span class="priority">${recs.immediate[0]?.priority === 'urgent' ? 'Urgent' : recs.immediate[0]?.priority === 'high' ? 'High Priority' : 'Recommended'}</span>
                    </div>
                    ${recs.immediate.map(r => `
                        <div class="rec-item">
                            <i class="${r.icon}"></i>
                            <div>
                                <strong>${r.text}</strong>
                                <p>${r.detail}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Diet Plan -->
            <div class="care-section">
                <div class="rec-card lifestyle">
                    <div class="rec-header">
                        <i class="fas fa-apple-alt"></i>
                        <h4>Diet Recommendations</h4>
                        <button class="expand-btn" data-target="dietDetails"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="rec-list" id="dietDetails">
                        ${recs.diet.map(d => `
                            <div class="rec-detail-item">
                                <strong>${d.text}</strong>
                                <p>${d.detail}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-small" onclick="setActiveStep(5)">
                        <i class="fas fa-utensils"></i> Open Diet Tracker
                    </button>
                </div>
            </div>

            <!-- Exercise Plan -->
            <div class="care-section">
                <div class="rec-card exercise">
                    <div class="rec-header">
                        <i class="fas fa-dumbbell"></i>
                        <h4>Exercise Plan</h4>
                        <button class="expand-btn" data-target="exerciseDetails"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="rec-list" id="exerciseDetails">
                        ${recs.exercise.map(ex => `
                            <div class="rec-detail-item">
                                <strong>${ex.text}</strong>
                                <p>${ex.detail}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Supplements -->
            ${recs.supplements.length > 0 ? `
            <div class="care-section">
                <div class="rec-card supplements">
                    <div class="rec-header">
                        <i class="fas fa-pills"></i>
                        <h4>Recommended Supplements</h4>
                        <button class="expand-btn" data-target="supplementDetails"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="rec-list" id="supplementDetails">
                        ${recs.supplements.map(s => `
                            <div class="supplement-item">
                                <div class="supplement-name">${s.name}</div>
                                <div class="supplement-dosage">${s.dosage}</div>
                                <div class="supplement-benefit">${s.benefit}</div>
                                <div class="supplement-note"><i class="fas fa-info-circle"></i> ${s.note}</div>
                            </div>
                        `).join('')}
                    </div>
                    <p class="disclaimer-text"><i class="fas fa-exclamation-triangle"></i> Always consult your doctor before starting any supplements.</p>
                </div>
            </div>
            ` : ''}

            <!-- Monitoring Checklist -->
            <div class="care-section">
                <div class="rec-card monitoring">
                    <div class="rec-header">
                        <i class="fas fa-tasks"></i>
                        <h4>Daily Monitoring Checklist</h4>
                    </div>
                    <div class="monitoring-checklist">
                        ${recs.monitoring.map((m, i) => `
                            <label class="checklist-item">
                                <input type="checkbox" id="monitor-${i}" ${getCheckState(i) ? 'checked' : ''}>
                                <span>${m}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="care-section">
                <h4 style="text-align:center; color:var(--text-dark); margin-bottom:1rem;">Take Action Now</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
                    <a href="doctor-consultation.html" class="btn btn-primary" style="text-decoration:none; justify-content:center;">
                        <i class="fas fa-stethoscope"></i> Book Doctor Consultation
                    </a>
                    <a href="medicine-store.html" class="btn btn-primary" style="text-decoration:none; justify-content:center;">
                        <i class="fas fa-capsules"></i> Order Supplements
                    </a>
                    <a href="meal-plan.html" class="btn btn-secondary" style="text-decoration:none; justify-content:center;">
                        <i class="fas fa-calendar-week"></i> View Meal Plans
                    </a>
                    <button class="btn btn-secondary" onclick="setActiveStep(5)">
                        <i class="fas fa-utensils"></i> Track Diet
                    </button>
                </div>
            </div>

            <div class="form-actions" style="margin-top:2rem;">
                <button class="btn btn-secondary" onclick="setActiveStep(2)">
                    <i class="fas fa-edit"></i> Update Symptoms
                </button>
                <a href="reviews.html" class="btn btn-secondary" style="text-decoration:none;">
                    <i class="fas fa-star"></i> Share Your Experience
                </a>
            </div>
        </div>
    `;
}

function getCheckState(index) {
    try {
        const checks = JSON.parse(localStorage.getItem('hormocare_checklist') || '{}');
        const today = new Date().toISOString().split('T')[0];
        return checks[today]?.[index] || false;
    } catch { return false; }
}

function attachCarePlanHandlers() {
    // Expand/collapse
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const target = document.getElementById(this.dataset.target);
            if (target) {
                target.classList.toggle('collapsed');
                this.querySelector('i').classList.toggle('fa-chevron-down');
                this.querySelector('i').classList.toggle('fa-chevron-up');
            }
        });
    });

    // Monitoring checklist persistence
    document.querySelectorAll('.monitoring-checklist input').forEach(cb => {
        cb.addEventListener('change', function () {
            const today = new Date().toISOString().split('T')[0];
            let checks = {};
            try { checks = JSON.parse(localStorage.getItem('hormocare_checklist') || '{}'); } catch {}
            if (!checks[today]) checks[today] = {};
            const idx = this.id.replace('monitor-', '');
            checks[today][idx] = this.checked;
            localStorage.setItem('hormocare_checklist', JSON.stringify(checks));
        });
    });
}

// ==================== STEP 5: Diet Tracker ====================
let currentDietDate = null;

function renderDietTracker() {
    currentDietDate = currentDietDate || hormoCareApp.todayStr();
    const entry = hormoCareApp.getDietEntry(currentDietDate) || { meals: [], waterIntake: 0 };
    const meals = entry.meals || [];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const goals = hormoCareApp.dailyGoals;
    const totals = hormoCareApp._calculateDietTotals(meals);

    return `
        <div class="diet-tracker">
            <h3><i class="fas fa-utensils"></i> Diet & Nutrition Tracker</h3>
            <p class="form-subtitle">Track your meals and monitor nutritional intake for PCOS management.</p>

            <div class="tracking-date-picker">
                <button class="date-nav-btn" id="dietPrevDay"><i class="fas fa-chevron-left"></i></button>
                <input type="date" id="dietDate" value="${currentDietDate}" max="${hormoCareApp.todayStr()}">
                <button class="date-nav-btn" id="dietNextDay"><i class="fas fa-chevron-right"></i></button>
            </div>

            <!-- Daily Summary -->
            <div class="nutrition-summary">
                <div class="macro-card calories">
                    <div class="macro-ring" style="--percent: ${Math.min(100, (totals.calories / goals.calories) * 100)}">
                        <span class="macro-value">${totals.calories}</span>
                    </div>
                    <span class="macro-label">Calories</span>
                    <span class="macro-goal">/ ${goals.calories} kcal</span>
                </div>
                <div class="macro-card protein">
                    <div class="macro-bar"><div class="macro-fill" style="width: ${Math.min(100, (totals.protein / goals.protein) * 100)}%"></div></div>
                    <span class="macro-value">${totals.protein}g</span>
                    <span class="macro-label">Protein</span>
                    <span class="macro-goal">/ ${goals.protein}g</span>
                </div>
                <div class="macro-card carbs">
                    <div class="macro-bar"><div class="macro-fill" style="width: ${Math.min(100, (totals.carbs / goals.carbs) * 100)}%"></div></div>
                    <span class="macro-value">${totals.carbs}g</span>
                    <span class="macro-label">Carbs</span>
                    <span class="macro-goal">/ ${goals.carbs}g</span>
                </div>
                <div class="macro-card fats">
                    <div class="macro-bar"><div class="macro-fill" style="width: ${Math.min(100, (totals.fats / goals.fats) * 100)}%"></div></div>
                    <span class="macro-value">${totals.fats}g</span>
                    <span class="macro-label">Fats</span>
                    <span class="macro-goal">/ ${goals.fats}g</span>
                </div>
            </div>

            <!-- Water Intake -->
            <div class="water-tracker">
                <h4><i class="fas fa-tint"></i> Water Intake</h4>
                <div class="water-glasses">
                    ${Array.from({ length: 10 }, (_, i) => `
                        <button class="water-glass ${i < (entry.waterIntake || 0) ? 'filled' : ''}" data-glass="${i + 1}">
                            <i class="fas fa-glass-water"></i>
                        </button>
                    `).join('')}
                </div>
                <span class="water-count">${entry.waterIntake || 0} / ${goals.water} glasses</span>
            </div>

            <!-- Meal Sections -->
            ${mealTypes.map(type => {
                const meal = meals.find(m => m.type === type) || { type, items: [] };
                return renderMealSection(type, meal);
            }).join('')}

            <!-- Quick Add Food -->
            <div class="food-search-section">
                <h4><i class="fas fa-plus-circle"></i> Add Food Item</h4>
                <div class="food-search-container">
                    <select id="mealTypeSelect" class="meal-type-select">
                        ${mealTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                    <div class="food-search-wrapper">
                        <input type="text" id="foodSearchInput" placeholder="Search food... (e.g. rice, dal, roti)" autocomplete="off">
                        <div class="food-suggestions" id="foodSuggestions"></div>
                    </div>
                </div>
                <div class="manual-food-entry" id="manualFoodEntry" style="display:none">
                    <h5>Custom Food Item</h5>
                    <div class="manual-food-grid">
                        <input type="text" id="customFoodName" placeholder="Food name">
                        <input type="number" id="customCalories" placeholder="Calories" min="0">
                        <input type="number" id="customProtein" placeholder="Protein (g)" min="0" step="0.1">
                        <input type="number" id="customCarbs" placeholder="Carbs (g)" min="0" step="0.1">
                        <input type="number" id="customFats" placeholder="Fats (g)" min="0" step="0.1">
                    </div>
                    <button class="btn-small" id="addCustomFoodBtn">Add Custom Food</button>
                </div>
                <button class="btn-link" id="toggleManualEntry">+ Add custom food manually</button>
            </div>

            <div id="diet-msg" class="form-message"></div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="setActiveStep(4)">
                    <i class="fas fa-arrow-left"></i> Back to Care Plan
                </button>
            </div>
        </div>
    `;
}

function renderMealSection(type, meal) {
    const icon = { Breakfast: 'fa-sun', Lunch: 'fa-cloud-sun', Dinner: 'fa-moon', Snacks: 'fa-cookie-bite' }[type] || 'fa-utensils';
    const items = meal.items || [];
    const mealTotals = items.reduce((t, item) => ({
        calories: t.calories + (item.calories || 0),
        protein: t.protein + (item.protein || 0),
        carbs: t.carbs + (item.carbs || 0),
        fats: t.fats + (item.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return `
        <div class="meal-section" data-meal="${type}">
            <div class="meal-header">
                <i class="fas ${icon}"></i>
                <h4>${type}</h4>
                <span class="meal-total">${Math.round(mealTotals.calories)} kcal</span>
            </div>
            ${items.length > 0 ? `
                <div class="meal-items">
                    ${items.map((item, idx) => `
                        <div class="meal-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-macros">
                                <span>${item.calories} cal</span>
                                <span>${item.protein}g P</span>
                                <span>${item.carbs}g C</span>
                                <span>${item.fats}g F</span>
                            </span>
                            <button class="remove-food-btn" data-meal="${type}" data-idx="${idx}"><i class="fas fa-times"></i></button>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="no-items">No items logged yet</p>'}
        </div>
    `;
}

function attachDietHandlers() {
    const dateInput = document.getElementById('dietDate');

    // Date navigation
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            currentDietDate = dateInput.value;
            setActiveStep(5);
        });
    }
    document.getElementById('dietPrevDay')?.addEventListener('click', () => {
        const d = new Date(currentDietDate);
        d.setDate(d.getDate() - 1);
        currentDietDate = d.toISOString().split('T')[0];
        setActiveStep(5);
    });
    document.getElementById('dietNextDay')?.addEventListener('click', () => {
        const d = new Date(currentDietDate);
        d.setDate(d.getDate() + 1);
        const today = hormoCareApp.todayStr();
        if (d.toISOString().split('T')[0] <= today) {
            currentDietDate = d.toISOString().split('T')[0];
            setActiveStep(5);
        }
    });

    // Water tracker
    document.querySelectorAll('.water-glass').forEach(btn => {
        btn.addEventListener('click', function () {
            const count = parseInt(this.dataset.glass);
            const entry = hormoCareApp.getDietEntry(currentDietDate) || { meals: [], waterIntake: 0 };
            entry.date = currentDietDate;
            entry.waterIntake = entry.waterIntake === count ? count - 1 : count;
            hormoCareApp.saveDietEntry(entry);
            setActiveStep(5);
        });
    });

    // Food search
    const searchInput = document.getElementById('foodSearchInput');
    const suggestions = document.getElementById('foodSuggestions');
    let searchTimeout = null;

    if (searchInput && suggestions) {
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const results = hormoCareApp.searchFood(this.value);
                if (results.length > 0) {
                    suggestions.innerHTML = results.map(f => `
                        <div class="food-suggestion" data-food='${JSON.stringify(f)}'>
                            <span class="food-name">${f.name}</span>
                            <span class="food-cal">${f.calories} cal</span>
                        </div>
                    `).join('');
                    suggestions.style.display = 'block';
                    suggestions.querySelectorAll('.food-suggestion').forEach(s => {
                        s.addEventListener('click', function () {
                            addFoodToMeal(JSON.parse(this.dataset.food));
                            searchInput.value = '';
                            suggestions.style.display = 'none';
                        });
                    });
                } else {
                    suggestions.style.display = 'none';
                }
            }, 200);
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => { suggestions.style.display = 'none'; }, 200);
        });

        searchInput.addEventListener('focus', function () {
            if (this.value.length >= 2) {
                this.dispatchEvent(new Event('input'));
            }
        });
    }

    // Manual entry toggle
    document.getElementById('toggleManualEntry')?.addEventListener('click', function () {
        const panel = document.getElementById('manualFoodEntry');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            this.textContent = panel.style.display === 'none' ? '+ Add custom food manually' : '- Hide custom food form';
        }
    });

    // Add custom food
    document.getElementById('addCustomFoodBtn')?.addEventListener('click', () => {
        const name = document.getElementById('customFoodName')?.value;
        if (!name) { showFormMessage('diet-msg', 'Please enter a food name.', 'error'); return; }
        addFoodToMeal({
            name,
            calories: parseInt(document.getElementById('customCalories')?.value) || 0,
            protein: parseFloat(document.getElementById('customProtein')?.value) || 0,
            carbs: parseFloat(document.getElementById('customCarbs')?.value) || 0,
            fats: parseFloat(document.getElementById('customFats')?.value) || 0
        });
    });

    // Remove food items
    document.querySelectorAll('.remove-food-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            removeFoodFromMeal(this.dataset.meal, parseInt(this.dataset.idx));
        });
    });
}

function addFoodToMeal(food) {
    const mealType = document.getElementById('mealTypeSelect')?.value || 'Breakfast';
    const entry = hormoCareApp.getDietEntry(currentDietDate) || { meals: [], waterIntake: 0 };
    entry.date = currentDietDate;

    if (!entry.meals) entry.meals = [];
    let meal = entry.meals.find(m => m.type === mealType);
    if (!meal) {
        meal = { type: mealType, items: [] };
        entry.meals.push(meal);
    }
    meal.items.push({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats
    });

    hormoCareApp.saveDietEntry(entry);
    showFormMessage('diet-msg', `Added "${food.name}" to ${mealType}!`, 'success');
    setTimeout(() => setActiveStep(5), 400);
}

function removeFoodFromMeal(mealType, idx) {
    const entry = hormoCareApp.getDietEntry(currentDietDate);
    if (!entry) return;
    const meal = entry.meals?.find(m => m.type === mealType);
    if (meal && meal.items) {
        meal.items.splice(idx, 1);
        hormoCareApp.saveDietEntry(entry);
        setActiveStep(5);
    }
}

// ==================== Utilities ====================
function showFormMessage(id, text, type) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = `<div class="msg msg-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${text}</div>`;
        setTimeout(() => { el.innerHTML = ''; }, 3000);
    }
}

function startAssessment() {
    setActiveStep(1);
    document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
}

function learnMore() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
}

// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});
