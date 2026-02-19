// ===== PHASE 2: TOURNAMENTS, TEAMS, SOCIAL & ANALYTICS =====

// Tournament System
const TOURNAMENT_TEMPLATES = [
    {
        id: 'weekly_emergency',
        name: 'Emergency Medicine Challenge',
        description: 'Test your emergency response skills',
        category: 'Emergency Medicine',
        duration: 48, // hours
        scenarioIds: [8], // IDs from SCENARIOS_DATA
        entryFee: 0,
        rewards: {
            first: { coins: 5000, badge: 'tournament_champion', title: 'Champion' },
            top10: { coins: 2000, badge: 'tournament_gold' },
            top50: { coins: 1000, badge: 'tournament_silver' },
            top100: { coins: 500, badge: 'tournament_bronze' },
            participation: { coins: 100, badge: 'tournament_participant' }
        },
        recurring: 'weekly', // Starts every Friday
        divisions: ['Bronze', 'Silver', 'Gold', 'Platinum']
    },
    {
        id: 'monthly_championship',
        name: 'Monthly Championship',
        description: 'The ultimate test across all categories',
        category: 'Mixed',
        duration: 72, // hours
        scenarioIds: [1, 3, 4, 6, 7, 8], // Mix of scenarios
        entryFee: 100,
        rewards: {
            first: { coins: 10000, badge: 'monthly_champion', title: 'Monthly Champion' },
            top10: { coins: 5000, badge: 'monthly_gold' },
            top50: { coins: 2500, badge: 'monthly_silver' },
            top100: { coins: 1000, badge: 'monthly_bronze' },
            participation: { coins: 200, badge: 'monthly_participant' }
        },
        recurring: 'monthly', // First weekend of month
        divisions: ['Bronze', 'Silver', 'Gold', 'Platinum']
    },
    {
        id: 'diagnostic_masters',
        name: 'Diagnostic Masters',
        description: 'Master the art of diagnosis',
        category: 'Veterinary Diagnostics',
        duration: 24, // hours
        scenarioIds: [1, 6], // Diagnostic scenarios
        entryFee: 50,
        rewards: {
            first: { coins: 3000, badge: 'diagnostic_champion', title: 'Diagnostic Master' },
            top10: { coins: 1500, badge: 'diagnostic_gold' },
            top50: { coins: 750, badge: 'diagnostic_silver' },
            participation: { coins: 150, badge: 'diagnostic_participant' }
        },
        recurring: 'biweekly',
        divisions: ['Bronze', 'Silver', 'Gold', 'Platinum']
    }
];

// Sample Tournament Leaderboard Data (for demo - would be real in production)
function generateSampleLeaderboard(playerScore = 0, playerTime = 0) {
    const sampleNames = [
        'Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Dr. Emily Thompson', 
        'Dr. James Wilson', 'Dr. Lisa Anderson', 'Dr. Robert Taylor',
        'Dr. Jennifer Martinez', 'Dr. David Brown', 'Dr. Amanda Garcia',
        'Dr. Christopher Lee', 'Dr. Jessica White', 'Dr. Daniel Harris',
        'Dr. Michelle Clark', 'Dr. Kevin Lewis', 'Dr. Rachel Walker',
        'Dr. Brian Hall', 'Dr. Nicole Allen', 'Dr. Jason Young',
        'Dr. Stephanie King', 'Dr. Andrew Wright'
    ];
    
    const leaderboard = [];
    
    // Generate 50 sample entries
    for (let i = 0; i < 50; i++) {
        leaderboard.push({
            rank: i + 1,
            name: sampleNames[i % sampleNames.length] + (i >= sampleNames.length ? ` ${Math.floor(i / sampleNames.length) + 1}` : ''),
            organization: ['VetCare Plus', 'Animal Hospital', 'Pet Wellness Center', 'Companion Care'][i % 4],
            score: 500 - (i * 8) + Math.floor(Math.random() * 20),
            time: 600 + (i * 30) + Math.floor(Math.random() * 100),
            level: 10 - Math.floor(i / 5),
            accuracy: 100 - Math.floor(i * 1.5),
            isPlayer: false
        });
    }
    
    // Insert player if they have a score
    if (playerScore > 0) {
        const playerRank = leaderboard.findIndex(entry => entry.score < playerScore);
        const playerEntry = {
            rank: playerRank === -1 ? leaderboard.length + 1 : playerRank + 1,
            name: 'You',
            organization: gameState.player.organization || 'Your Organization',
            score: playerScore,
            time: playerTime,
            level: gameState.player.level,
            accuracy: Math.round((playerScore / 500) * 100),
            isPlayer: true
        };
        
        if (playerRank === -1) {
            leaderboard.push(playerEntry);
        } else {
            leaderboard.splice(playerRank, 0, playerEntry);
            // Re-rank everyone
            leaderboard.forEach((entry, index) => {
                entry.rank = index + 1;
            });
        }
    }
    
    return leaderboard;
}

// Organization/Team Competition Data
const SAMPLE_ORGANIZATIONS = [
    {
        name: 'Smith Veterinary Clinic',
        members: 12,
        totalScore: 45320,
        avgLevel: 8.5,
        casesCompleted: 567,
        activePlayers: 10,
        founded: '2024-01-15'
    },
    {
        name: 'PetCare Plus',
        members: 8,
        totalScore: 38910,
        avgLevel: 7.2,
        casesCompleted: 423,
        activePlayers: 7,
        founded: '2024-01-20'
    },
    {
        name: 'Animal Hospital Co',
        members: 15,
        totalScore: 36540,
        avgLevel: 6.8,
        casesCompleted: 612,
        activePlayers: 12,
        founded: '2024-01-10'
    },
    {
        name: 'Companion Care Center',
        members: 6,
        totalScore: 28750,
        avgLevel: 9.1,
        casesCompleted: 298,
        activePlayers: 5,
        founded: '2024-02-01'
    },
    {
        name: 'VetWell Associates',
        members: 10,
        totalScore: 27430,
        avgLevel: 7.5,
        casesCompleted: 401,
        activePlayers: 8,
        founded: '2024-01-25'
    }
];

// Analytics Data Structures
const ANALYTICS_CATEGORIES = [
    'Veterinary Diagnostics',
    'Animal Nutrition',
    'Pharmaceutical Treatment',
    'Practice Management',
    'Regulatory Compliance',
    'Emergency Medicine',
    'Client Care'
];

// Social Sharing Templates
const SHARE_TEMPLATES = {
    achievement: (name, icon) => `🐾 Animal Health Pro Achievement! 🐾

I just unlocked: ${icon} ${name}

Think you have what it takes?
Play Animal Health Pro and test your veterinary knowledge!`,
    
    levelUp: (level) => `🎉 Level ${level} Veterinarian! 🎉

I just reached Level ${level} in Animal Health Pro!

How do your veterinary skills compare?
Test yourself: [Game Link]`,
    
    tournament: (rank, name) => `🏆 Tournament Results! 🏆

${name}
I placed #${rank}!

Can you beat my score?
Join the competition: [Game Link]`,
    
    certification: (cert, tier) => `🎓 ${tier} Certification Earned! 🎓

${cert}

Continuing to sharpen my veterinary expertise!
Join me in Animal Health Pro!`,
    
    streak: (days) => `🔥 ${days}-Day Streak! 🔥

Still going strong in Animal Health Pro!
${days} consecutive days of veterinary learning!

Challenge yourself: [Game Link]`,
    
    challenge: (score) => `⚔️ I Challenge You! ⚔️

I scored ${score} points in Animal Health Pro.

Think you can beat me?
Accept the challenge: [Game Link]`
};

// Tournament Badges/Titles
const TOURNAMENT_BADGES = {
    tournament_champion: { name: 'Tournament Champion', icon: '🏆', color: '#FFD700' },
    tournament_gold: { name: 'Gold Medalist', icon: '🥇', color: '#FFD700' },
    tournament_silver: { name: 'Silver Medalist', icon: '🥈', color: '#C0C0C0' },
    tournament_bronze: { name: 'Bronze Medalist', icon: '🥉', color: '#CD7F32' },
    tournament_participant: { name: 'Tournament Participant', icon: '🎖️', color: '#667eea' },
    monthly_champion: { name: 'Monthly Champion', icon: '👑', color: '#FFD700' },
    diagnostic_champion: { name: 'Diagnostic Champion', icon: '🔬', color: '#667eea' }
};

// Speed Bonus System
function calculateSpeedBonus(timeInSeconds) {
    if (timeInSeconds < 30) return 50;
    if (timeInSeconds < 60) return 25;
    if (timeInSeconds < 120) return 10;
    return 0;
}

function calculateTournamentScore(points, speedBonus, accuracy) {
    const baseScore = points;
    const timeBonus = speedBonus;
    const accuracyMultiplier = accuracy / 100;
    
    return Math.round(baseScore + timeBonus * accuracyMultiplier);
}
// ===== GAME DATA STRUCTURES =====

// Certification Badge System
const CERTIFICATIONS = {
    'Veterinary Diagnostics': {
        name: 'Diagnostic Certification',
        icon: '🔬',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Animal Nutrition': {
        name: 'Nutrition Certification',
        icon: '🥗',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Pharmaceutical Treatment': {
        name: 'Pharmacology Certification',
        icon: '💊',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Practice Management': {
        name: 'Management Certification',
        icon: '🤝',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Regulatory Compliance': {
        name: 'Compliance Certification',
        icon: '📚',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Emergency Medicine': {
        name: 'Emergency Certification',
        icon: '🚨',
        tiers: [
            { level: 'Bronze', required: 2, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 6, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 12, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 20, coins: 500, color: '#E5E4E2' }
        ]
    },
    'Client Care': {
        name: 'Client Relations Certification',
        icon: '💬',
        tiers: [
            { level: 'Bronze', required: 3, coins: 50, color: '#CD7F32' },
            { level: 'Silver', required: 8, coins: 100, color: '#C0C0C0' },
            { level: 'Gold', required: 15, coins: 200, color: '#FFD700' },
            { level: 'Platinum', required: 25, coins: 500, color: '#E5E4E2' }
        ]
    }
};

// Knowledge Base Library (Unlockable with VetCoins)
const KNOWLEDGE_BASE = [
    {
        id: 'lameness_guide',
        title: 'Complete Guide to Canine Lameness',
        category: 'Veterinary Diagnostics',
        cost: 100,
        preview: 'Comprehensive diagnosis and treatment protocols for orthopedic conditions...',
        content: 'Full guide content would go here...'
    },
    {
        id: 'feline_obesity',
        title: 'Feline Obesity Management Protocol',
        category: 'Animal Nutrition',
        cost: 75,
        preview: 'Evidence-based weight loss strategies for cats...',
        content: 'Full guide content would go here...'
    },
    {
        id: 'pain_management',
        title: 'Multimodal Pain Management',
        category: 'Pharmaceutical Treatment',
        cost: 150,
        preview: 'Advanced pain control techniques for post-operative patients...',
        content: 'Full guide content would go here...'
    },
    {
        id: 'client_communication',
        title: 'Difficult Conversations in Veterinary Medicine',
        category: 'Practice Management',
        cost: 100,
        preview: 'Communication strategies for financial discussions and end-of-life care...',
        content: 'Full guide content would go here...'
    },
    {
        id: 'dea_compliance',
        title: 'DEA Controlled Substance Regulations',
        category: 'Regulatory Compliance',
        cost: 125,
        preview: 'Complete guide to federal controlled substance requirements...',
        content: 'Full guide content would go here...'
    },
    {
        id: 'toxicology',
        title: 'Emergency Toxicology Reference',
        category: 'Emergency Medicine',
        cost: 200,
        preview: 'Quick reference for common pet toxins and treatment protocols...',
        content: 'Full guide content would go here...'
    }
];

// Daily Challenge Configuration
const DAILY_CHALLENGE_CONFIG = {
    bonusXP: 100,
    bonusCoins: 50,
    streakBonusCoins: 25, // Additional coins per day of streak
    maxStreakBonus: 200 // Cap at 8 days
};

// Streak Milestones
const STREAK_MILESTONES = [
    { days: 3, reward: 100, name: '3-Day Dedication' },
    { days: 7, reward: 300, name: 'Week Warrior' },
    { days: 14, reward: 750, name: 'Fortnight Champion' },
    { days: 30, reward: 2000, name: 'Monthly Master' },
    { days: 60, reward: 5000, name: 'Commitment Legend' },
    { days: 100, reward: 10000, name: 'Centurion' }
];

// Achievement Definitions (Enhanced with coin rewards)
const ACHIEVEMENTS = [
    {
        id: 'first_case',
        name: 'First Case',
        description: 'Complete your first case',
        icon: '🎯',
        coins: 50,
        condition: (player, stats) => player.casesCompleted >= 1
    },
    {
        id: 'perfect_case',
        name: 'Perfect Diagnosis',
        description: 'Get all decisions correct in a single case',
        icon: '💯',
        coins: 100,
        condition: (player, stats) => player.perfectCases >= 1
    },
    {
        id: 'first_daily',
        name: 'Daily Commitment',
        description: 'Complete your first daily challenge',
        icon: '📅',
        coins: 75,
        condition: (player, stats) => player.dailyChallengesCompleted >= 1
    },
    {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        coins: 300,
        condition: (player, stats) => player.longestStreak >= 7
    },
    {
        id: 'diagnostic_expert',
        name: 'Diagnostic Expert',
        description: 'Complete 5 diagnostic cases correctly',
        icon: '🔬',
        coins: 150,
        condition: (player, stats) => (stats.categoryCorrect['Veterinary Diagnostics'] || 0) >= 5
    },
    {
        id: 'nutrition_guru',
        name: 'Nutrition Guru',
        description: 'Complete 3 nutrition cases correctly',
        icon: '🥗',
        coins: 100,
        condition: (player, stats) => (stats.categoryCorrect['Animal Nutrition'] || 0) >= 3
    },
    {
        id: 'pharmacist',
        name: 'Pharmacist',
        description: 'Complete 3 pharmaceutical treatment cases correctly',
        icon: '💊',
        coins: 100,
        condition: (player, stats) => (stats.categoryCorrect['Pharmaceutical Treatment'] || 0) >= 3
    },
    {
        id: 'people_person',
        name: 'People Person',
        description: 'Excel in client communication',
        icon: '🤝',
        coins: 100,
        condition: (player, stats) => (stats.categoryCorrect['Practice Management'] || 0) >= 3
    },
    {
        id: 'by_the_book',
        name: 'By The Book',
        description: 'Perfect compliance record',
        icon: '📚',
        coins: 100,
        condition: (player, stats) => (stats.categoryCorrect['Regulatory Compliance'] || 0) >= 3
    },
    {
        id: 'emergency_hero',
        name: 'Emergency Hero',
        description: 'Handle emergency cases perfectly',
        icon: '🚨',
        coins: 150,
        condition: (player, stats) => (stats.categoryCorrect['Emergency Medicine'] || 0) >= 2
    },
    {
        id: 'level_5',
        name: 'Experienced Vet',
        description: 'Reach Level 5',
        icon: '⭐',
        coins: 250,
        condition: (player, stats) => player.level >= 5
    },
    {
        id: 'high_scorer',
        name: 'High Achiever',
        description: 'Score 200+ points in total',
        icon: '🏆',
        coins: 300,
        condition: (player, stats) => player.totalScore >= 200
    },
    {
        id: 'first_certification',
        name: 'Certified Professional',
        description: 'Earn your first certification badge',
        icon: '🎓',
        coins: 200,
        condition: (player, stats) => player.certifications && player.certifications.length >= 1
    },
    {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Unlock your first knowledge base article',
        icon: '📖',
        coins: 100,
        condition: (player, stats) => player.unlockedKnowledge && player.unlockedKnowledge.length >= 1
    },
    {
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Accumulate 1000 VetCoins',
        icon: '💰',
        coins: 500,
        condition: (player, stats) => player.vetCoins >= 1000
    }
];

// Branching Story Paths
const STORY_BRANCHES = {
    cautious: { name: 'Cautious Practitioner', multiplier: 1.1 },
    aggressive: { name: 'Aggressive Diagnostician', multiplier: 1.15 },
    holistic: { name: 'Holistic Approach', multiplier: 1.12 },
    specialist: { name: 'Specialist Track', multiplier: 1.2 }
};

// XP and Level System
const XP_PER_LEVEL = [100, 150, 225, 300, 400, 500, 625, 750, 900, 1100];

function getXPForLevel(level) {
    if (level >= XP_PER_LEVEL.length) {
        return XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length) * 200;
    }
    return XP_PER_LEVEL[level];
}

// VetCoins Earning Rates
const COIN_REWARDS = {
    correctAnswer: 10,
    incorrectAnswer: 3,
    perfectCase: 50,
    levelUp: 100,
    dailyChallenge: 50,
    streakDay: 25
};

// ===== EMBEDDED SCENARIOS DATA =====
const SCENARIOS_DATA = [
    {
        id: 1,
        category: "Veterinary Diagnostics",
        difficulty: "easy",
        title: "Limping Labrador",
        type: "single",
        text: "A 5-year-old Labrador Retriever named Max is brought in by his owner. Max has been limping on his right front leg for the past two days. There's no visible wound, and he doesn't cry when you palpate the leg, but he's reluctant to put full weight on it. The owner mentions Max was playing fetch vigorously at the park three days ago.",
        choices: [
            {
                text: "Immediately prescribe pain medication and rest without further examination",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "While pain management is important, prescribing medication without proper diagnosis could mask a serious underlying condition. A thorough physical examination and diagnostic imaging would be the appropriate first steps to identify potential fractures, ligament damage, or joint issues.",
                branch: null
            },
            {
                text: "Perform a thorough orthopedic examination and take radiographs",
                correct: true,
                points: 10,
                xp: 50,
                feedback: "Excellent choice! A systematic orthopedic examination followed by radiographs is the gold standard for diagnosing lameness. This approach helps identify fractures, joint problems, or soft tissue injuries. Given Max's recent vigorous activity, you're looking for possible sprains, strains, or stress-related injuries.",
                branch: 'cautious'
            },
            {
                text: "Tell the owner it's probably just a sprain and will heal on its own",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "This assumption without proper diagnosis could be dangerous. While sprains are common, ruling out more serious conditions like fractures, ligament tears, or joint disease is essential. Proper diagnosis ensures appropriate treatment and prevents complications.",
                branch: null
            },
            {
                text: "Recommend immediate surgery",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Surgery should only be considered after proper diagnosis through examination and imaging. Many cases of lameness can be managed conservatively with rest, medication, and physical therapy. Jumping to surgery without diagnostics would be inappropriate and potentially harmful.",
                branch: 'aggressive'
            }
        ]
    },
    {
        id: 2,
        category: "Animal Nutrition",
        difficulty: "easy",
        title: "Overweight Cat Consultation",
        type: "single",
        text: "Mrs. Johnson brings in her 8-year-old domestic shorthair cat, Whiskers, for a routine check-up. You note that Whiskers weighs 18 pounds (ideal weight should be around 10-12 pounds). Mrs. Johnson mentions she free-feeds dry food and gives treats throughout the day. Whiskers is otherwise healthy.",
        choices: [
            {
                text: "Recommend immediately cutting food portions in half",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Drastic calorie reduction can be dangerous for cats, potentially leading to hepatic lipidosis (fatty liver disease). Weight loss in cats should be gradual - typically no more than 1-2% of body weight per week. A measured, controlled approach is safer.",
                branch: 'aggressive'
            },
            {
                text: "Develop a gradual weight loss plan with portion-controlled feeding and reduced treats",
                correct: true,
                points: 10,
                xp: 50,
                feedback: "Perfect! A structured weight loss plan is the safest approach. This includes calculating daily caloric needs for target weight, measuring portions, scheduled feeding times instead of free-feeding, and limiting treats to less than 10% of daily calories. Regular monitoring ensures safe, sustainable weight loss.",
                branch: 'holistic'
            },
            {
                text: "Switch to a raw food diet immediately",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "While diet changes can help with weight management, raw diets require careful consideration of nutritional balance, food safety, and client education. Simply switching to raw food doesn't guarantee weight loss and introduces new risks. A balanced, portion-controlled diet tailored to weight loss is more appropriate.",
                branch: null
            },
            {
                text: "Tell the owner the cat is fine and doesn't need to lose weight",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "Obesity in cats is a serious health concern that increases risks for diabetes, arthritis, urinary disease, and reduced lifespan. At 18 pounds when ideal weight is 10-12 pounds, Whiskers is significantly overweight and would benefit greatly from a weight management program.",
                branch: null
            }
        ]
    },
    {
        id: 3,
        category: "Pharmaceutical Treatment",
        difficulty: "medium",
        title: "Post-Surgical Pain Management",
        type: "multi",
        steps: 2,
        currentStep: 1,
        text: "You're treating a 7-year-old German Shepherd who underwent a routine dental cleaning with several extractions. The dog has a history of mild kidney disease (IRIS Stage 2). The owner is anxious about post-operative pain.",
        choices: [
            {
                text: "Prescribe NSAIDs (carprofen) for 7 days without additional precautions",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "While NSAIDs are effective for pain management, they should be used cautiously in patients with kidney disease as they can reduce renal blood flow and potentially worsen kidney function. Additional monitoring and shorter duration would be needed, or alternative pain management considered.",
                branch: 'aggressive',
                nextStep: null
            },
            {
                text: "Use multimodal analgesia with a short course of NSAIDs, opioids, and local nerve blocks, with kidney values monitoring",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Excellent decision! Multimodal analgesia combines different drug classes to provide better pain control with lower doses of each medication, reducing individual drug side effects. For patients with kidney disease, this approach minimizes NSAID exposure while maintaining comfort.",
                branch: 'cautious',
                nextStep: {
                    text: "Three days post-op, the owner calls concerned that the dog seems more painful and is reluctant to eat. What's your next step?",
                    choices: [
                        {
                            text: "Increase NSAID dosage immediately",
                            correct: false,
                            points: 0,
                            xp: 10,
                            feedback: "Increasing NSAIDs in a patient with kidney disease without assessment could be dangerous. The reluctance to eat and increased pain could indicate complications that need evaluation.",
                            branch: null
                        },
                        {
                            text: "Schedule a recheck exam to assess for complications and adjust pain protocol",
                            correct: true,
                            points: 15,
                            xp: 75,
                            feedback: "Perfect! A recheck allows you to evaluate for potential complications like infection, dehiscence, or adverse drug reactions. You can then adjust the pain management protocol safely based on physical findings and updated kidney values.",
                            branch: 'cautious'
                        },
                        {
                            text: "Tell owner to wait it out, healing takes time",
                            correct: false,
                            points: 0,
                            xp: 5,
                            feedback: "Dismissing the owner's concerns without evaluation could miss serious complications. Post-operative pain should be improving, not worsening, by day 3.",
                            branch: null
                        }
                    ]
                }
            },
            {
                text: "Avoid all pain medication due to kidney disease",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Withholding pain management is not appropriate. Pain causes stress and can impair healing. Patients with kidney disease can receive pain medication with proper selection, dosing, and monitoring. Alternative analgesics like opioids or gabapentin can be safely used.",
                branch: null,
                nextStep: null
            },
            {
                text: "Give the owner over-the-counter acetaminophen to use at home",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "Acetaminophen (Tylenol) is toxic to dogs and cats! Even small doses can cause severe liver damage, methemoglobinemia, and death. Never recommend human over-the-counter pain medications for pets without veterinary oversight. This would be a dangerous error.",
                branch: null,
                nextStep: null
            }
        ]
    },
    {
        id: 4,
        category: "Practice Management",
        difficulty: "medium",
        title: "Difficult Financial Discussion",
        type: "single",
        text: "A client becomes upset when you present a treatment estimate of $1,200 for their dog's needed diagnostic workup (bloodwork, radiographs, and urinalysis). They say their previous vet 'never charged this much' and accuse you of being greedy. The dog has been vomiting for 3 days.",
        choices: [
            {
                text: "Get defensive and explain that your prices are standard for the area",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Getting defensive can escalate the situation and damage the veterinarian-client relationship. While your prices may be fair, the client's concern is valid and requires empathy. Focusing on defensive explanations rather than the pet's needs can make clients feel unheard.",
                branch: null
            },
            {
                text: "Empathetically explain the medical necessity of each test, offer payment options, and discuss prioritizing diagnostics if needed",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Perfect approach! Acknowledge their concern, explain the medical reasoning (e.g., 'The bloodwork checks organ function, radiographs look for obstructions'), present payment options (CareCredit, payment plans), and if needed, prioritize the most essential tests first. This shows empathy while maintaining medical standards.",
                branch: 'holistic'
            },
            {
                text: "Immediately reduce your prices to keep the client happy",
                correct: false,
                points: 5,
                xp: 25,
                feedback: "While accommodating, routinely discounting services can devalue your expertise, create unsustainable precedents, and may make clients question the necessity of the care. Better to explore payment options or discuss phased diagnostics while maintaining your practice's value and sustainability.",
                branch: null
            },
            {
                text: "Tell them to find another veterinarian if they don't like your prices",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "This dismissive response damages client relationships and could be perceived as patient abandonment in an acute situation. It's unprofessional and fails to address the client's concerns or the pet's medical needs. There are much better ways to handle financial discussions.",
                branch: null
            }
        ]
    },
    {
        id: 5,
        category: "Regulatory Compliance",
        difficulty: "medium",
        title: "Controlled Substance Discrepancy",
        type: "single",
        text: "While doing inventory, you discover that your controlled substance log shows a discrepancy - 5 tablets of hydrocodone are unaccounted for. Your records show they should be in stock but they're not in the safe.",
        choices: [
            {
                text: "Just adjust the log to match current inventory and move on",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "Falsifying controlled substance records is a serious legal violation that can result in DEA sanctions, loss of your license to prescribe controlled substances, and potential criminal charges. All discrepancies must be properly documented and investigated according to DEA regulations.",
                branch: null
            },
            {
                text: "Document the discrepancy, conduct a thorough investigation, notify the DEA, and implement additional security measures",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Correct! DEA regulations require you to document all controlled substance discrepancies, investigate possible causes (theft, documentation errors, spills), report losses to the DEA (Form 106), and implement corrective measures. This protects your license and ensures compliance with federal law.",
                branch: 'cautious'
            },
            {
                text: "Quietly question staff members to find out who took them",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While staff may be questioned during an investigation, this should be part of a formal, documented process. Simply 'quietly questioning' staff without proper documentation, DEA notification, and following legal protocols could create liability issues and doesn't meet regulatory requirements.",
                branch: null
            },
            {
                text: "Assume it was a documentation error and recount all medications",
                correct: false,
                points: 3,
                xp: 20,
                feedback: "While recounting is part of the investigation, assuming it's just an error without proper documentation and investigation is insufficient. Even if it's a clerical error, DEA regulations require thorough documentation of the discrepancy and the investigation process.",
                branch: null
            }
        ]
    },
    {
        id: 6,
        category: "Veterinary Diagnostics",
        difficulty: "hard",
        title: "Complex Endocrine Case",
        type: "multi",
        steps: 2,
        currentStep: 1,
        text: "A 12-year-old cat presents with weight loss, increased thirst, increased urination, and a dull hair coat over the past month. Blood work shows: elevated glucose (380 mg/dL), elevated T4 (8.5 μg/dL, normal: 1-4), and mildly elevated kidney values (BUN 35 mg/dL, creatinine 2.1 mg/dL).",
        choices: [
            {
                text: "Diagnose and treat diabetes immediately, address other issues later",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While the elevated glucose suggests diabetes, the significantly elevated T4 indicates hyperthyroidism, which is more likely the primary condition causing the hyperglycemia. Hyperthyroidism can cause stress hyperglycemia and must be addressed first.",
                branch: 'aggressive',
                nextStep: null
            },
            {
                text: "Focus only on the kidney disease as the most serious condition",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "The kidney values are only mildly elevated and may be secondary to the hyperthyroidism (which increases renal blood flow). Treating the underlying hyperthyroidism is the priority. However, kidney function must be monitored when treating hyperthyroidism.",
                branch: null,
                nextStep: null
            },
            {
                text: "Recognize this as likely hyperthyroidism with secondary effects, confirm with additional testing, and address in proper sequence",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Outstanding clinical reasoning! This cat likely has hyperthyroidism (elevated T4, classic clinical signs) causing stress hyperglycemia and increased renal blood flow (masking underlying kidney disease).",
                branch: 'specialist',
                nextStep: {
                    text: "After starting methimazole for hyperthyroidism, you recheck bloodwork in 3 weeks. T4 is now normal (2.8), but glucose is still 320 mg/dL and kidney values worsened (BUN 48, creatinine 3.2). What's your interpretation?",
                    choices: [
                        {
                            text: "The methimazole is causing kidney damage, stop it immediately",
                            correct: false,
                            points: 0,
                            xp: 20,
                            feedback: "Methimazole doesn't typically cause acute kidney injury. The worsening kidney values are more likely due to unmasking pre-existing kidney disease that was hidden by the hyperthyroid state's increased renal blood flow.",
                            branch: null
                        },
                        {
                            text: "Recognize the cat likely has concurrent diabetes and chronic kidney disease that were masked by hyperthyroidism",
                            correct: true,
                            points: 20,
                            xp: 100,
                            feedback: "Excellent! This demonstrates advanced understanding of feline endocrine disorders. The hyperthyroidism masked both diabetes and CKD. Now you'll need to manage all three conditions carefully, as treating hyperthyroidism can unmask or worsen kidney disease.",
                            branch: 'specialist'
                        },
                        {
                            text: "Increase methimazole dose to bring T4 lower",
                            correct: false,
                            points: 0,
                            xp: 10,
                            feedback: "The T4 is already in normal range. Further lowering it could worsen kidney function. The persistent hyperglycemia suggests concurrent diabetes that needs to be addressed separately.",
                            branch: null
                        }
                    ]
                }
            },
            {
                text: "Refer immediately to a specialist without any initial treatment",
                correct: false,
                points: 3,
                xp: 25,
                feedback: "While complex cases may benefit from specialist input, this case can be managed by general practitioners. The diagnostic picture is relatively clear - hyperthyroidism with secondary effects. Immediate referral without initial diagnostics and stabilization could delay treatment unnecessarily.",
                branch: null,
                nextStep: null
            }
        ]
    },
    {
        id: 7,
        category: "Client Care",
        difficulty: "hard",
        title: "End-of-Life Decision Support",
        type: "single",
        text: "You're seeing a 14-year-old Golden Retriever with advanced cancer. Previous treatments have failed, and the dog now has poor appetite, difficulty breathing, and seems uncomfortable despite pain medication. The owner is struggling with the decision of euthanasia.",
        choices: [
            {
                text: "Tell them firmly that euthanasia is the only option and they need to decide today",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "This approach lacks empathy during one of the most difficult decisions a pet owner makes. While euthanasia may be medically appropriate, pressuring clients or setting ultimatums can cause guilt and traumatic memories.",
                branch: null
            },
            {
                text: "Avoid the topic and just continue palliative care without discussing prognosis",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Avoiding end-of-life discussions doesn't serve the patient's best interests and can prolong suffering. Veterinarians have a responsibility to advocate for the patient's quality of life and help owners understand when curative treatment is no longer beneficial.",
                branch: null
            },
            {
                text: "Use a quality-of-life scale, discuss the pet's current state compassionately, validate their feelings, and provide guidance without pressure",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Excellent approach! Using objective quality-of-life assessments (good days vs bad days, pain level, eating, mobility, engagement) helps owners evaluate their pet's condition. Acknowledge their love and difficulty of the decision, explain the signs of suffering, and offer support for whatever decision they make.",
                branch: 'holistic'
            },
            {
                text: "Suggest they take the dog home and wait until it gets worse",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Delaying euthanasia until suffering is severe is not in the patient's best interest. Veterinarians should help owners recognize when quality of life is compromised and guide them toward timely, compassionate decisions.",
                branch: null
            }
        ]
    },
    {
        id: 8,
        category: "Emergency Medicine",
        difficulty: "hard",
        title: "Acute Toxicity Emergency",
        type: "single",
        text: "A panicked owner calls: their dog ingested an entire bottle of ibuprofen (about 20 tablets, 200mg each) 30 minutes ago. The 40-pound dog is currently acting normally.",
        choices: [
            {
                text: "Tell them to monitor at home since the dog seems fine",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "This is dangerously inadequate! At approximately 100 mg/kg, this is a potentially toxic dose of ibuprofen that can cause severe gastrointestinal ulceration, kidney failure, and neurological signs. The dog appearing normal now doesn't mean toxicity won't develop.",
                branch: null
            },
            {
                text: "Instruct them to induce vomiting at home with hydrogen peroxide and then bring the dog in",
                correct: false,
                points: 10,
                xp: 50,
                feedback: "While inducing vomiting can be appropriate for some toxicities, it's safer to do this under veterinary supervision, especially with potentially caustic substances and when aggressive decontamination may be needed.",
                branch: null
            },
            {
                text: "Direct them to bring the dog to the clinic immediately for decontamination, activated charcoal, and monitoring",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Perfect emergency response! With recent ingestion (30 minutes), the dog is within the window for gastric decontamination. The dose is high enough to cause serious toxicity. Immediate actions include: induced vomiting (if no contraindications), activated charcoal, IV fluids to protect kidneys, gastroprotectants, and monitoring bloodwork.",
                branch: 'cautious'
            },
            {
                text: "Recommend they call a pet poison control hotline first before doing anything",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While poison control hotlines are valuable resources, this delays critical treatment. With a known toxic ingestion within the decontamination window, the immediate action should be getting the dog to veterinary care.",
                branch: null
            }
        ]
    },
    // NEW SCENARIOS (9-18) - Added via Admin System
    {
        id: 9,
        category: "Veterinary Diagnostics",
        difficulty: "medium",
        title: "Acute Vomiting in Senior Dog",
        type: "single",
        text: "A 10-year-old mixed breed presents with acute vomiting (5 episodes in 12 hours). The dog ate normally yesterday but refuses food today. Physical exam shows mild dehydration and discomfort on abdominal palpation.",
        choices: [
            {
                text: "Prescribe anti-nausea medication and send home without diagnostics",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "While symptomatic treatment may help, acute vomiting in a senior dog warrants baseline diagnostics to rule out serious conditions like pancreatitis, foreign body, or organ dysfunction.",
                branch: null
            },
            {
                text: "Perform bloodwork and abdominal radiographs, start supportive care",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Excellent approach! Senior dogs with acute vomiting need diagnostics to identify causes like pancreatitis, kidney disease, foreign bodies, or metabolic issues. Radiographs check for obstructions, bloodwork assesses organ function.",
                branch: 'cautious'
            },
            {
                text: "Recommend immediate exploratory surgery",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Surgery should only be considered after diagnostics confirm a surgical condition like obstruction. Many causes of acute vomiting respond to medical management.",
                branch: 'aggressive'
            },
            {
                text: "Wait 24 hours to see if symptoms resolve on their own",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Waiting could be dangerous in a senior dog. Dehydration can worsen quickly, and serious conditions require prompt intervention.",
                branch: null
            }
        ]
    },
    {
        id: 10,
        category: "Animal Nutrition",
        difficulty: "medium",
        title: "Diabetic Dog Diet Management",
        type: "single",
        text: "You've diagnosed a 7-year-old Beagle with diabetes mellitus. The dog is overweight (35 lbs, ideal 25 lbs) and currently eats free-choice dry food. Owner asks about dietary management to help control blood sugar.",
        choices: [
            {
                text: "Keep current food, just reduce amount by half",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "While portion control is important, diabetic dogs benefit from specific high-fiber, low-fat diets that help regulate glucose absorption. The current food may not be optimal.",
                branch: null
            },
            {
                text: "Switch to high-fiber diabetic diet, feed consistent amounts twice daily with insulin",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Perfect! Diabetic dogs need consistent feeding schedules synchronized with insulin. High-fiber diets slow glucose absorption, improving glycemic control. Consistent amounts prevent blood sugar fluctuations.",
                branch: 'holistic'
            },
            {
                text: "Recommend grain-free diet to reduce carbohydrates",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "Grain-free doesn't necessarily mean low-carb. Diabetic diets need specific fiber content and nutrient balance. 'Grain-free' is a marketing term, not a therapeutic approach for diabetes.",
                branch: null
            },
            {
                text: "Feed only meat and vegetables, no commercial food",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Homemade diets for diabetic dogs are risky without veterinary nutritionist consultation. Nutritional imbalances can worsen the condition. Commercial diabetic diets are formulated for proper balance.",
                branch: null
            }
        ]
    },
    {
        id: 11,
        category: "Pharmaceutical Treatment",
        difficulty: "easy",
        title: "Flea Prevention Selection",
        type: "single",
        text: "A client with a healthy 2-year-old indoor/outdoor cat asks for flea prevention. The cat lives in a household with a 6-month-old infant who crawls on the floor.",
        choices: [
            {
                text: "Recommend topical flea prevention despite the infant",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "With an infant in the home, oral flea prevention is safer. Topical products can leave residue on the cat's fur that the infant could contact during petting or playing.",
                branch: null
            },
            {
                text: "Recommend oral flea prevention to avoid topical residue concerns",
                correct: true,
                points: 10,
                xp: 50,
                feedback: "Excellent choice! Oral flea preventives eliminate concerns about topical residue that could contact the infant. They're equally effective and safer for households with crawling babies.",
                branch: 'cautious'
            },
            {
                text: "Tell client flea prevention is unnecessary for indoor cats",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "The cat goes outdoor, which creates flea risk. Even indoor-only cats can get fleas from other pets or visitors. This cat definitely needs prevention.",
                branch: null
            },
            {
                text: "Recommend flea collar instead",
                correct: false,
                points: 3,
                xp: 20,
                feedback: "Flea collars are less effective than modern oral or topical products and still pose contact risks for the infant. Oral prevention is the best choice here.",
                branch: null
            }
        ]
    },
    {
        id: 12,
        category: "Practice Management",
        difficulty: "hard",
        title: "Euthanasia Payment Dispute",
        type: "single",
        text: "A client's dog requires emergency euthanasia due to severe trauma. The client is emotional and states they cannot pay the $200 fee today but promises to pay next week. Your practice policy requires payment at time of service.",
        choices: [
            {
                text: "Refuse service unless payment is made immediately",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "While policies exist for business reasons, showing zero flexibility in an emergency euthanasia situation is harsh and could constitute abandonment. Compassionate alternatives exist.",
                branch: null
            },
            {
                text: "Provide euthanasia with payment plan agreement, documented in writing",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Excellent compassionate solution! A written payment plan honors your policy while helping a client in crisis. Document the agreement, set clear terms, and consider third-party financing options like CareCredit for future cases.",
                branch: 'holistic'
            },
            {
                text: "Provide free service and waive all fees",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While compassionate, completely waiving fees sets unsustainable precedents. A payment plan balances compassion with business needs and respects the value of veterinary services.",
                branch: null
            },
            {
                text: "Tell client to surrender the pet to a shelter for euthanasia",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "This is inappropriate and cruel. Referring an emotional client away during their pet's final moments damages your practice's reputation and violates the principle of compassionate care.",
                branch: null
            }
        ]
    },
    {
        id: 13,
        category: "Emergency Medicine",
        difficulty: "hard",
        title: "Bloat (GDV) Emergency",
        type: "single",
        text: "A large-breed dog presents with acute distended abdomen, non-productive retching, and restlessness that started 2 hours ago. Physical exam shows tympanic abdomen, pale gums, weak pulses, and tachycardia (180 bpm).",
        choices: [
            {
                text: "Take radiographs first to confirm diagnosis before treatment",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While radiographs confirm GDV, this patient is in shock. Immediate stabilization (IV fluids, decompression) should begin while radiographs are being prepared. Minutes matter in GDV.",
                branch: null
            },
            {
                text: "Immediately stabilize with IV fluids and gastric decompression, then radiographs and surgery",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Perfect emergency response! GDV is life-threatening. Rapid stabilization with large-bore IV access, aggressive fluid resuscitation, and gastric decompression (trocarization if needed) stabilizes the patient before surgery. Time is critical.",
                branch: 'cautious'
            },
            {
                text: "Send home with anti-nausea medication and gastroprotectants",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "This would be fatal! GDV is a surgical emergency. Without immediate intervention and surgery, the stomach will continue to twist, cutting off blood supply and causing tissue death. The dog will die within hours.",
                branch: null
            },
            {
                text: "Induce vomiting to decompress the stomach",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Never induce vomiting in suspected GDV! The stomach is twisted and cannot empty. Inducing vomiting could cause aspiration or esophageal rupture. Gastric decompression via tube or trocar is needed.",
                branch: null
            }
        ]
    },
    {
        id: 14,
        category: "Regulatory Compliance",
        difficulty: "easy",
        title: "Prescription Refill Request",
        type: "single",
        text: "A client calls requesting a refill of their dog's heartworm prevention. The pet's last exam was 14 months ago. Your state requires VCPR within 12 months for prescription renewal.",
        choices: [
            {
                text: "Refill the prescription as a courtesy since it's preventive medication",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Even for preventive medications, state law requires a current VCPR. Refilling without an exam violates regulations and could result in board action against your license.",
                branch: null
            },
            {
                text: "Require an appointment for exam before refilling prescription",
                correct: true,
                points: 10,
                xp: 50,
                feedback: "Correct! State VCPR laws exist for good reason - annual exams detect health issues early. Politely explain the legal requirement and schedule the exam. This protects your license and ensures the pet's health.",
                branch: 'cautious'
            },
            {
                text: "Refill one month only and tell client to schedule exam soon",
                correct: false,
                points: 3,
                xp: 20,
                feedback: "This still violates VCPR requirements. The law doesn't allow partial refills without current VCPR. You must require the exam before any refill.",
                branch: null
            },
            {
                text: "Tell client to buy heartworm prevention over-the-counter instead",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Heartworm preventives are prescription-only. There are no OTC options. This advice is incorrect and doesn't address the compliance issue.",
                branch: null
            }
        ]
    },
    {
        id: 15,
        category: "Client Care",
        difficulty: "medium",
        title: "Difficult Diagnosis Communication",
        type: "single",
        text: "You've diagnosed a 5-year-old cat with lymphoma. The owner is shocked and becomes angry, accusing you of misdiagnosis and demanding a second opinion. How do you respond?",
        choices: [
            {
                text: "Get defensive and insist your diagnosis is correct",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Defensiveness escalates conflict. Clients processing bad news often express anger. Responding defensively damages the relationship when empathy and support are needed.",
                branch: null
            },
            {
                text: "Validate their feelings, offer to share records for second opinion, and remain supportive",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Excellent approach! Acknowledging emotions ('I understand this is shocking news'), supporting second opinions (shows confidence), and offering continued support demonstrates professionalism and compassion. Most clients return after their emotions settle.",
                branch: 'holistic'
            },
            {
                text: "Immediately refer to oncologist without further discussion",
                correct: false,
                points: 5,
                xp: 25,
                feedback: "While referral may eventually be appropriate, abruptly ending the conversation avoids addressing the client's emotional needs. First validate feelings and discuss options.",
                branch: null
            },
            {
                text: "Tell them they're in denial and need to accept the diagnosis",
                correct: false,
                points: 0,
                xp: 0,
                feedback: "This is dismissive and inappropriate. Clients need time to process devastating news. Labeling their reaction as 'denial' is confrontational and damages trust.",
                branch: null
            }
        ]
    },
    {
        id: 16,
        category: "Veterinary Diagnostics",
        difficulty: "hard",
        title: "Seizure Workup Strategy",
        type: "multi",
        steps: 2,
        currentStep: 1,
        text: "A 3-year-old previously healthy Labrador had two generalized seizures in the past week. Physical and neurological exams are normal between episodes. Owner is very concerned.",
        choices: [
            {
                text: "Start anti-seizure medication immediately without diagnostics",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "Starting medication without investigating the cause means you could miss treatable conditions like hypoglycemia, liver disease, or toxins. Diagnostics should precede treatment.",
                branch: null,
                nextStep: null
            },
            {
                text: "Perform minimum database (CBC, chemistry, urinalysis) and consider advanced imaging",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Excellent systematic approach! Blood work rules out metabolic causes (hypoglycemia, liver disease, kidney disease). In young dogs with new-onset seizures, structural brain disease should also be considered.",
                branch: 'specialist',
                nextStep: {
                    text: "Bloodwork is completely normal. Owner asks if you should start seizure medication now or wait. What do you recommend?",
                    choices: [
                        {
                            text: "Start medication after only 2 seizures to prevent more",
                            correct: false,
                            points: 0,
                            xp: 25,
                            feedback: "Standard recommendation is to start medication after 2+ seizures in 6 months, or after cluster seizures/status epilepticus. However, client preference and seizure severity matter. Discuss risks/benefits.",
                            branch: null
                        },
                        {
                            text: "Discuss that treatment typically starts after more frequent seizures, but present the option",
                            correct: true,
                            points: 20,
                            xp: 100,
                            feedback: "Perfect! Present evidence-based guidelines while acknowledging individual circumstances. Two seizures in one week warrants discussion of starting medication, considering seizure severity, owner concerns, and commitment to medication.",
                            branch: 'holistic'
                        },
                        {
                            text: "Tell owner to definitely wait for more seizures",
                            correct: false,
                            points: 5,
                            xp: 30,
                            feedback: "Being too rigid ignores individual factors. The frequency (2 in one week) and owner anxiety are valid considerations. Treatment decisions should be collaborative.",
                            branch: null
                        }
                    ]
                }
            },
            {
                text: "Assume epilepsy and reassure owner it's common and benign",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "You cannot assume idiopathic epilepsy without ruling out other causes. Seizures have many potentially serious causes that require investigation.",
                branch: null,
                nextStep: null
            },
            {
                text: "Refer immediately to neurology specialist without any testing",
                correct: false,
                points: 3,
                xp: 20,
                feedback: "While specialists are valuable for complex cases, basic bloodwork should be performed first. Many seizure causes are identified with routine diagnostics and don't require specialty referral.",
                branch: null,
                nextStep: null
            }
        ]
    },
    {
        id: 17,
        category: "Animal Nutrition",
        difficulty: "hard",
        title: "Chronic Diarrhea Diet Trial",
        type: "single",
        text: "A 4-year-old dog has chronic intermittent diarrhea for 6 months. Fecal exams, bloodwork, and abdominal ultrasound are normal. You suspect food-responsive enteropathy. Current diet is chicken-based kibble with various treats.",
        choices: [
            {
                text: "Switch to any grain-free diet",
                correct: false,
                points: 0,
                xp: 15,
                feedback: "Grain-free isn't a diagnostic diet for food-responsive disease. Hydrolyzed or novel protein elimination diets with NO treats or extras for 8-12 weeks are needed to diagnose food sensitivity.",
                branch: null
            },
            {
                text: "Recommend strict hydrolyzed or novel protein diet trial for 8-12 weeks, NO treats or table food",
                correct: true,
                points: 20,
                xp: 100,
                feedback: "Perfect! Food-responsive enteropathy requires elimination diet trials. Hydrolyzed proteins or novel protein sources (proteins the dog has never eaten) for 8-12 weeks with ZERO extras. Strict compliance is essential.",
                branch: 'specialist'
            },
            {
                text: "Try probiotics and keep current diet",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While probiotics may help some cases, after 6 months of chronic diarrhea with normal diagnostics, a proper elimination diet trial is warranted to diagnose food sensitivity.",
                branch: null
            },
            {
                text: "Start immunosuppressive medications for IBD",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "IBD diagnosis requires intestinal biopsies, and dietary trial should always precede immunosuppression since food-responsive disease is more common and safer to treat.",
                branch: 'aggressive'
            }
        ]
    },
    {
        id: 18,
        category: "Pharmaceutical Treatment",
        difficulty: "medium",
        title: "Antibiotic Selection for UTI",
        type: "single",
        text: "An 8-year-old spayed female dog has cystitis symptoms. Urinalysis shows bacteria and WBCs. You submit urine for culture. The owner asks if you should start antibiotics now or wait for culture results (3-day turnaround).",
        choices: [
            {
                text: "Wait for culture results before starting any antibiotics",
                correct: false,
                points: 5,
                xp: 30,
                feedback: "While waiting for culture is ideal for antibiotic stewardship, the dog is symptomatic. Starting empirical therapy based on urinalysis and adjusting based on culture is appropriate.",
                branch: null
            },
            {
                text: "Start empirical first-line antibiotic (amoxicillin), adjust if needed when culture returns",
                correct: true,
                points: 15,
                xp: 75,
                feedback: "Excellent approach! Treat the symptomatic patient empirically with first-line antibiotics (amoxicillin, cephalexin). When culture results arrive, adjust if resistance is found. This balances patient comfort with stewardship.",
                branch: 'cautious'
            },
            {
                text: "Start broad-spectrum fluoroquinolone immediately",
                correct: false,
                points: 0,
                xp: 10,
                feedback: "Fluoroquinolones are restricted-use antibiotics that should be reserved for cases where culture shows resistance to first-line drugs. Starting with broad-spectrum promotes resistance.",
                branch: 'aggressive'
            },
            {
                text: "Recommend only cranberry supplements without antibiotics",
                correct: false,
                points: 0,
                xp: 5,
                feedback: "Active bacterial cystitis with clinical signs requires antibiotic therapy. Cranberry supplements have no proven efficacy in treating established infections.",
                branch: null
            }
        ]
    }
];


// ===== GAME STATE =====
let gameState = {
    player: {
        // Profile information
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        professionalTitle: '',
        city: '',
        state: '',
        country: '',
        registrationDate: null,
        
        // Game progress
        name: 'Veterinarian',
        level: 1,
        xp: 0,
        totalScore: 0,
        casesCompleted: 0,
        perfectCases: 0,
        accuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        storyBranch: null,
        achievements: [],
        
        // New Phase 1 features
        vetCoins: 100, // Starting coins
        dailyChallengesCompleted: 0,
        lastDailyChallenge: null,
        consecutiveDays: 0,
        streakMilestonesReached: [],
        certifications: [],
        unlockedKnowledge: []
    },
    session: {
        difficulty: '',
        currentScenarioIndex: 0,
        currentScore: 0,
        maxPossibleScore: 0,
        scenarios: [],
        correctAnswers: 0,
        totalQuestions: 0,
        currentCase: null,
        currentStep: 1,
        hasAnswered: false,
        isDailyChallenge: false,
        coinsEarnedThisSession: 0
    },
    stats: {
        categoryCorrect: {},
        categoryAttempted: {},
        branchChoices: {}
    },
    leaderboard: [],
    dailyChallenge: {
        available: true,
        completedToday: false,
        scenario: null,
        expiresAt: null
    },
    tournaments: {
        active: [],
        completed: [],
        userParticipation: [],
        currentTournament: null
    },
    analytics: {
        playHistory: [],
        categoryTrends: {},
        dailyActivity: {},
        personalBests: {}
    },
    social: {
        sharedAchievements: [],
        challengesSent: [],
        challengesReceived: []
    }
};

// ===== LOCAL STORAGE FUNCTIONS =====
function saveGameState() {
    try {
        localStorage.setItem('animalHealthPro_player', JSON.stringify(gameState.player));
        localStorage.setItem('animalHealthPro_stats', JSON.stringify(gameState.stats));
        localStorage.setItem('animalHealthPro_leaderboard', JSON.stringify(gameState.leaderboard));
        localStorage.setItem('animalHealthPro_dailyChallenge', JSON.stringify(gameState.dailyChallenge));
    } catch (e) {
        console.error('Error saving game state:', e);
    }
}

function loadGameState() {
    try {
        const savedPlayer = localStorage.getItem('animalHealthPro_player');
        const savedStats = localStorage.getItem('animalHealthPro_stats');
        const savedLeaderboard = localStorage.getItem('animalHealthPro_leaderboard');
        const savedDaily = localStorage.getItem('animalHealthPro_dailyChallenge');
        
        if (savedPlayer) {
            const loaded = JSON.parse(savedPlayer);
            // Ensure new properties exist
            gameState.player = {
                ...gameState.player,
                ...loaded,
                vetCoins: loaded.vetCoins || 100,
                dailyChallengesCompleted: loaded.dailyChallengesCompleted || 0,
                consecutiveDays: loaded.consecutiveDays || 0,
                certifications: loaded.certifications || [],
                unlockedKnowledge: loaded.unlockedKnowledge || [],
                streakMilestonesReached: loaded.streakMilestonesReached || []
            };
        }
        if (savedStats) gameState.stats = JSON.parse(savedStats);
        if (savedLeaderboard) gameState.leaderboard = JSON.parse(savedLeaderboard);
        if (savedDaily) gameState.dailyChallenge = JSON.parse(savedDaily);
        
        // Ensure Phase 2 objects exist (for users upgrading from earlier versions)
        if (!gameState.tournaments) {
            gameState.tournaments = {
                active: [],
                completed: [],
                userParticipation: [],
                currentTournament: null
            };
        }
        if (!gameState.analytics) {
            gameState.analytics = {
                playHistory: [],
                categoryTrends: {},
                dailyActivity: {},
                personalBests: {}
            };
        }
        if (!gameState.social) {
            gameState.social = {
                sharedAchievements: [],
                challengesSent: [],
                challengesReceived: []
            };
        }
        
        // Check if daily challenge needs reset
        checkDailyChallengeReset();
        
        // Ensure daily challenge scenario is initialized
        if (!gameState.dailyChallenge.scenario) {
            gameState.dailyChallenge.scenario = selectDailyChallenge();
            gameState.dailyChallenge.available = true;
            gameState.dailyChallenge.completedToday = false;
            
            const now = new Date();
            const expires = new Date(now);
            expires.setHours(23, 59, 59, 999);
            gameState.dailyChallenge.expiresAt = expires.toISOString();
            
            saveGameState();
        }
        
        updateSidebarDisplay();
    } catch (e) {
        console.error('Error loading game state:', e);
    }
}

// ===== DAILY CHALLENGE SYSTEM =====
function checkDailyChallengeReset() {
    const now = new Date();
    const lastChallenge = gameState.player.lastDailyChallenge ? new Date(gameState.player.lastDailyChallenge) : null;
    
    // Check if it's a new day
    if (!lastChallenge || !isSameDay(now, lastChallenge)) {
        // Check if streak should continue
        if (lastChallenge) {
            const daysDiff = Math.floor((now - lastChallenge) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                // Consecutive day - maintain streak
                // (streak incremented when challenge is completed)
            } else if (daysDiff > 1) {
                // Missed a day - reset streak
                gameState.player.consecutiveDays = 0;
            }
        }
        
        // Reset daily challenge
        gameState.dailyChallenge.available = true;
        gameState.dailyChallenge.completedToday = false;
        gameState.dailyChallenge.scenario = selectDailyChallenge();
        
        // Set expiration to end of day
        const expires = new Date(now);
        expires.setHours(23, 59, 59, 999);
        gameState.dailyChallenge.expiresAt = expires.toISOString();
        
        saveGameState();
    }
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function selectDailyChallenge() {
    // Use date as seed for consistent daily challenge
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % SCENARIOS_DATA.length;
    return SCENARIOS_DATA[index];
}

function startDailyChallenge() {
    // Make sure daily challenge is initialized
    if (!gameState.dailyChallenge.scenario) {
        gameState.dailyChallenge.scenario = selectDailyChallenge();
    }
    
    if (!gameState.dailyChallenge.available || gameState.dailyChallenge.completedToday) {
        alert('Daily challenge already completed! Come back tomorrow for a new challenge.');
        return;
    }
    
    gameState.session.isDailyChallenge = true;
    gameState.session.difficulty = 'daily';
    gameState.session.currentScenarioIndex = 0;
    gameState.session.currentScore = 0;
    gameState.session.correctAnswers = 0;
    gameState.session.totalQuestions = 0;
    gameState.session.hasAnswered = false;
    gameState.session.coinsEarnedThisSession = 0;
    
    gameState.session.scenarios = [gameState.dailyChallenge.scenario];
    gameState.session.maxPossibleScore = calculateMaxScore(gameState.session.scenarios);
    
    // Initialize category stats if needed
    const scenario = gameState.dailyChallenge.scenario;
    if (!gameState.stats.categoryAttempted[scenario.category]) {
        gameState.stats.categoryAttempted[scenario.category] = 0;
        gameState.stats.categoryCorrect[scenario.category] = 0;
    }
    
    showScreen('gameScreen');
    document.getElementById('difficultyDisplay').textContent = 'Daily Challenge';
    updateSidebarDisplay();
    
    loadScenario();
}

function completeDailyChallenge() {
    const now = new Date();
    const lastChallenge = gameState.player.lastDailyChallenge ? new Date(gameState.player.lastDailyChallenge) : null;
    
    // Increment streak
    if (!lastChallenge || !isSameDay(now, lastChallenge)) {
        gameState.player.consecutiveDays++;
        if (gameState.player.consecutiveDays > gameState.player.longestStreak) {
            gameState.player.longestStreak = gameState.player.consecutiveDays;
        }
    }
    
    // Award bonus rewards
    const bonusXP = DAILY_CHALLENGE_CONFIG.bonusXP;
    const baseCoins = DAILY_CHALLENGE_CONFIG.bonusCoins;
    const streakBonus = Math.min(
        gameState.player.consecutiveDays * DAILY_CHALLENGE_CONFIG.streakBonusCoins,
        DAILY_CHALLENGE_CONFIG.maxStreakBonus
    );
    const totalCoins = baseCoins + streakBonus;
    
    addXP(bonusXP);
    addCoins(totalCoins, 'Daily Challenge Bonus');
    
    // Check for streak milestones
    checkStreakMilestones();
    
    // Update state
    gameState.player.dailyChallengesCompleted++;
    gameState.player.lastDailyChallenge = now.toISOString();
    gameState.dailyChallenge.completedToday = true;
    gameState.dailyChallenge.available = false;
    
    saveGameState();
    
    return { bonusXP, totalCoins, streak: gameState.player.consecutiveDays };
}

function checkStreakMilestones() {
    const streak = gameState.player.consecutiveDays;
    
    STREAK_MILESTONES.forEach(milestone => {
        if (streak >= milestone.days && !gameState.player.streakMilestonesReached.includes(milestone.days)) {
            gameState.player.streakMilestonesReached.push(milestone.days);
            addCoins(milestone.reward, `Streak Milestone: ${milestone.name}`);
            
            // Show notification
            setTimeout(() => {
                alert(`🎉 Streak Milestone Reached!\n\n${milestone.name}\n+${milestone.reward} VetCoins!`);
            }, 500);
        }
    });
}

function getTimeUntilDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

// ===== VETCOINS SYSTEM =====
function addCoins(amount, reason = '') {
    gameState.player.vetCoins += amount;
    gameState.session.coinsEarnedThisSession += amount;
    
    // Show coin animation (if in game screen)
    if (reason) {
        console.log(`+${amount} VetCoins: ${reason}`);
    }
    
    updateCoinDisplay();
    saveGameState();
}

function spendCoins(amount, item) {
    if (gameState.player.vetCoins >= amount) {
        gameState.player.vetCoins -= amount;
        updateCoinDisplay();
        saveGameState();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const coinElement = document.getElementById('vetCoinsDisplay');
    if (coinElement) {
        coinElement.textContent = gameState.player.vetCoins.toLocaleString();
    }
}

// ===== CERTIFICATION SYSTEM =====
function checkCertifications() {
    const newCerts = [];
    
    Object.keys(CERTIFICATIONS).forEach(category => {
        const cert = CERTIFICATIONS[category];
        const correct = gameState.stats.categoryCorrect[category] || 0;
        
        cert.tiers.forEach((tier, index) => {
            const certId = `${category}_${tier.level}`;
            
            if (correct >= tier.required && !gameState.player.certifications.includes(certId)) {
                gameState.player.certifications.push(certId);
                addCoins(tier.coins, `${tier.level} Certification: ${cert.name}`);
                newCerts.push({
                    category,
                    tier: tier.level,
                    name: cert.name,
                    icon: cert.icon,
                    coins: tier.coins
                });
            }
        });
    });
    
    return newCerts;
}

function getCertificationLevel(category) {
    const correct = gameState.stats.categoryCorrect[category] || 0;
    const cert = CERTIFICATIONS[category];
    
    if (!cert) return null;
    
    let currentTier = null;
    cert.tiers.forEach((tier) => {
        if (correct >= tier.required) {
            currentTier = tier.level;
        }
    });
    
    return currentTier;
}

function getNextCertificationProgress(category) {
    const correct = gameState.stats.categoryCorrect[category] || 0;
    const cert = CERTIFICATIONS[category];
    
    if (!cert) return null;
    
    let nextTier = null;
    for (let tier of cert.tiers) {
        if (correct < tier.required) {
            nextTier = tier;
            break;
        }
    }
    
    if (!nextTier) return null; // Already at max tier
    
    return {
        current: correct,
        required: nextTier.required,
        level: nextTier.level,
        percentage: Math.round((correct / nextTier.required) * 100)
    };
}

// ===== KNOWLEDGE BASE SYSTEM =====
function unlockKnowledge(articleId) {
    const article = KNOWLEDGE_BASE.find(a => a.id === articleId);
    
    if (!article) return false;
    
    if (gameState.player.unlockedKnowledge.includes(articleId)) {
        alert('You already own this article!');
        return false;
    }
    
    if (spendCoins(article.cost, article.title)) {
        gameState.player.unlockedKnowledge.push(articleId);
        saveGameState();
        return true;
    } else {
        alert(`Not enough VetCoins! You need ${article.cost} coins.\nYou have: ${gameState.player.vetCoins} coins.`);
        return false;
    }
}

function viewKnowledgeBase() {
    let html = '📚 KNOWLEDGE BASE LIBRARY\n\n';
    
    KNOWLEDGE_BASE.forEach(article => {
        const unlocked = gameState.player.unlockedKnowledge.includes(article.id);
        html += unlocked ? '✅ ' : '🔒 ';
        html += `${article.title} (${article.cost} coins)\n`;
        html += `Category: ${article.category}\n`;
        html += unlocked ? `UNLOCKED - Available to read\n` : `${article.preview}\n`;
        html += '\n';
    });
    
    html += `\nYour VetCoins: ${gameState.player.vetCoins}`;
    
    alert(html);
}


// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    
    // Check if player is registered
    if (gameState.player.email && gameState.player.firstName) {
        // Player is registered, skip to welcome screen
        showScreen('welcomeScreen');
        
        // Pre-fill welcome message
        const welcomeScreen = document.querySelector('#welcomeScreen h2');
        if (welcomeScreen) {
            welcomeScreen.textContent = `Welcome back, ${gameState.player.firstName}!`;
        }
        
        // Update displays after a brief delay to ensure DOM is ready
        setTimeout(() => {
            updateSidebarDisplay();
            updateAchievementDisplay();
            updateLeaderboardDisplay();
            updateDailyChallengeDisplay();
        }, 100);
    } else {
        // Show registration screen
        showScreen('registrationScreen');
    }
    
    // Set up registration form handler
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    console.log('Animal Health Pro: Enhanced Edition loaded successfully!');
});

function handleRegistration(e) {
    e.preventDefault();
    
    // Get form values
    gameState.player.firstName = document.getElementById('firstName').value.trim();
    gameState.player.lastName = document.getElementById('lastName').value.trim();
    gameState.player.email = document.getElementById('email').value.trim();
    gameState.player.organization = document.getElementById('organization').value.trim();
    gameState.player.professionalTitle = document.getElementById('professionalTitle').value.trim();
    gameState.player.city = document.getElementById('city').value.trim();
    gameState.player.state = document.getElementById('state').value.trim();
    gameState.player.country = document.getElementById('country').value.trim();
    gameState.player.registrationDate = new Date().toISOString();
    
    // Set display name
    gameState.player.name = `${gameState.player.firstName} ${gameState.player.lastName}`;
    
    // Give starting bonus
    gameState.player.vetCoins = 100;
    
    // Save to localStorage
    saveGameState();
    
    // Show welcome screen FIRST
    showScreen('welcomeScreen');
    
    // Update welcome message
    const welcomeScreen = document.querySelector('#welcomeScreen h2');
    if (welcomeScreen) {
        welcomeScreen.textContent = `Welcome, ${gameState.player.firstName}!`;
    }
    
    // Then update displays (now that elements exist)
    setTimeout(() => {
        updateSidebarDisplay();
        updateAchievementDisplay();
        updateLeaderboardDisplay();
        updateDailyChallengeDisplay();
    }, 100);
}

// ===== CORE GAME FUNCTIONS =====
function startGame(difficulty) {
    // Player name already set from registration
    if (!gameState.player.name || gameState.player.name === 'Veterinarian') {
        gameState.player.name = `${gameState.player.firstName} ${gameState.player.lastName}`;
    }
    
    gameState.session.isDailyChallenge = false;
    gameState.session.difficulty = difficulty;
    gameState.session.currentScenarioIndex = 0;
    gameState.session.currentScore = 0;
    gameState.session.correctAnswers = 0;
    gameState.session.totalQuestions = 0;
    gameState.session.hasAnswered = false;
    gameState.session.coinsEarnedThisSession = 0;
    
    // Filter scenarios based on difficulty
    let filteredScenarios = SCENARIOS_DATA.filter(s => {
        if (difficulty === 'easy') return s.difficulty === 'easy';
        if (difficulty === 'medium') return s.difficulty === 'easy' || s.difficulty === 'medium';
        if (difficulty === 'hard') return true;
    });
    
    // Shuffle scenarios
    gameState.session.scenarios = shuffleArray([...filteredScenarios]);
    
    // Calculate max possible score
    gameState.session.maxPossibleScore = calculateMaxScore(gameState.session.scenarios);
    
    // Initialize category stats if needed
    gameState.session.scenarios.forEach(scenario => {
        if (!gameState.stats.categoryAttempted[scenario.category]) {
            gameState.stats.categoryAttempted[scenario.category] = 0;
            gameState.stats.categoryCorrect[scenario.category] = 0;
        }
    });
    
    showScreen('gameScreen');
    document.getElementById('difficultyDisplay').textContent = capitalizeFirst(difficulty);
    updateSidebarDisplay();
    
    loadScenario();
}

function calculateMaxScore(scenarios) {
    let total = 0;
    scenarios.forEach(scenario => {
        const maxPoints = Math.max(...scenario.choices.map(c => c.points));
        total += maxPoints;
        
        // If multi-step, add next step max points
        if (scenario.type === 'multi') {
            scenario.choices.forEach(choice => {
                if (choice.nextStep && choice.nextStep.choices) {
                    const stepMax = Math.max(...choice.nextStep.choices.map(c => c.points));
                    if (stepMax > 0) total += stepMax;
                }
            });
        }
    });
    return total;
}

function loadScenario() {
    if (gameState.session.currentScenarioIndex >= gameState.session.scenarios.length) {
        showResults();
        return;
    }
    
    const scenario = gameState.session.scenarios[gameState.session.currentScenarioIndex];
    gameState.session.currentCase = scenario;
    gameState.session.currentStep = 1;
    gameState.session.hasAnswered = false;
    
    displayScenario(scenario);
}

function displayScenario(scenario, stepData = null) {
    // Track start time for analytics
    window.scenarioStartTime = Date.now();
    
    // Update progress bar
    const progress = (gameState.session.currentScenarioIndex / gameState.session.scenarios.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update status bar
    document.getElementById('scenarioCounter').textContent = 
        `${gameState.session.currentScenarioIndex + 1}/${gameState.session.scenarios.length}`;
    document.getElementById('currentScore').textContent = gameState.session.currentScore;
    
    // Update case file
    document.getElementById('scenarioTitle').textContent = stepData ? 'Follow-up: ' + scenario.title : scenario.title;
    document.getElementById('scenarioCategory').textContent = scenario.category;
    document.getElementById('scenarioDifficulty').textContent = capitalizeFirst(scenario.difficulty);
    
    const caseTypeEl = document.getElementById('caseType');
    if (gameState.session.isDailyChallenge) {
        caseTypeEl.textContent = '⭐ Daily Challenge';
        caseTypeEl.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    } else {
        caseTypeEl.textContent = scenario.type === 'multi' ? 'Multi-Step Case' : 'Single Step';
        caseTypeEl.style.background = '#667eea';
    }
    
    // Update step indicator for multi-step cases
    const stepIndicator = document.getElementById('stepIndicator');
    if (scenario.type === 'multi') {
        stepIndicator.style.display = 'flex';
        stepIndicator.innerHTML = '';
        for (let i = 0; i < scenario.steps; i++) {
            const dot = document.createElement('div');
            dot.className = 'step-dot';
            if (i < gameState.session.currentStep - 1) dot.classList.add('completed');
            if (i === gameState.session.currentStep - 1) dot.classList.add('current');
            stepIndicator.appendChild(dot);
        }
    } else {
        stepIndicator.style.display = 'none';
    }
    
    // Display text
    const textToShow = stepData ? stepData.text : scenario.text;
    document.getElementById('scenarioText').textContent = textToShow;
    
    // Display choices
    const choicesContainer = document.getElementById('choicesContainer');
    choicesContainer.innerHTML = '';
    
    const choicesToShow = stepData ? stepData.choices : scenario.choices;
    choicesToShow.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.innerHTML = choice.text;
        
        if (choice.impact) {
            const impact = document.createElement('div');
            impact.className = 'choice-impact';
            impact.textContent = choice.impact;
            button.appendChild(impact);
        }
        
        button.onclick = () => selectChoice(index, stepData);
        choicesContainer.appendChild(button);
    });
    
    // Hide feedback
    document.getElementById('feedbackSection').classList.remove('show');
}

function selectChoice(choiceIndex, stepData = null) {
    if (gameState.session.hasAnswered) return;
    
    const startTime = Date.now();
    
    gameState.session.hasAnswered = true;
    const scenario = gameState.session.currentCase;
    const choicesToUse = stepData ? stepData.choices : scenario.choices;
    const selectedChoice = choicesToUse[choiceIndex];
    
    // Record time spent
    const timeSpent = stepData ? 0 : Math.floor((Date.now() - (window.scenarioStartTime || Date.now())) / 1000);
    
    // Update stats
    gameState.session.totalQuestions++;
    gameState.stats.categoryAttempted[scenario.category]++;
    
    if (selectedChoice.correct) {
        gameState.session.correctAnswers++;
        gameState.stats.categoryCorrect[scenario.category]++;
        gameState.player.currentStreak++;
        if (gameState.player.currentStreak > gameState.player.longestStreak) {
            gameState.player.longestStreak = gameState.player.currentStreak;
        }
    } else {
        gameState.player.currentStreak = 0;
    }
    
    // Record play for analytics (Phase 2)
    recordPlay(scenario, selectedChoice.correct, timeSpent, selectedChoice.points);
    
    // Update score and XP
    gameState.session.currentScore += selectedChoice.points;
    gameState.player.totalScore += selectedChoice.points;
    addXP(selectedChoice.xp);
    
    // Award coins
    const coinsEarned = selectedChoice.correct ? COIN_REWARDS.correctAnswer : COIN_REWARDS.incorrectAnswer;
    addCoins(coinsEarned, selectedChoice.correct ? 'Correct Answer' : 'Participation');
    
    // Track story branch
    if (selectedChoice.branch && selectedChoice.correct) {
        if (!gameState.stats.branchChoices[selectedChoice.branch]) {
            gameState.stats.branchChoices[selectedChoice.branch] = 0;
        }
        gameState.stats.branchChoices[selectedChoice.branch]++;
        
        // Update player's dominant branch
        updateStoryBranch();
    }
    
    // Visual feedback
    const choiceButtons = document.querySelectorAll('.choice-btn');
    choiceButtons.forEach((btn, index) => {
        btn.style.pointerEvents = 'none';
        if (index === choiceIndex) {
            btn.classList.add('selected');
            btn.classList.add(selectedChoice.correct ? 'correct' : 'incorrect');
        }
        if (choicesToUse[index].correct) {
            btn.classList.add('correct');
        }
    });
    
    // Show feedback
    showFeedback(selectedChoice, scenario, stepData);
    
    saveGameState();
}

function showFeedback(choice, scenario, stepData) {
    const feedbackSection = document.getElementById('feedbackSection');
    feedbackSection.classList.add('show');
    feedbackSection.classList.toggle('correct', choice.correct);
    feedbackSection.classList.toggle('incorrect', !choice.correct);
    
    document.getElementById('feedbackTitle').textContent = 
        choice.correct ? '✓ Excellent Decision!' : '✗ Consider This...';
    document.getElementById('xpGained').textContent = `+${choice.xp} XP`;
    document.getElementById('feedbackText').textContent = choice.feedback;
    
    // Show coin reward
    const coinsEarned = choice.correct ? COIN_REWARDS.correctAnswer : COIN_REWARDS.incorrectAnswer;
    const coinFeedback = document.createElement('div');
    coinFeedback.style.cssText = 'margin-top: 10px; color: #f59e0b; font-weight: bold;';
    coinFeedback.textContent = `💰 +${coinsEarned} VetCoins`;
    document.getElementById('feedbackText').appendChild(coinFeedback);
    
    // Show branching info if applicable
    const branchingInfo = document.getElementById('branchingInfo');
    if (choice.branch && choice.correct) {
        branchingInfo.style.display = 'block';
        const branchName = STORY_BRANCHES[choice.branch].name;
        document.getElementById('branchingText').textContent = 
            `This decision aligns with the "${branchName}" approach, which may influence future scenarios.`;
    } else {
        branchingInfo.style.display = 'none';
    }
    
    // Update next button text and handler
    const nextBtn = document.getElementById('nextBtnText');
    const button = document.querySelector('.next-btn');
    
    if (choice.nextStep) {
        nextBtn.textContent = 'Continue Case →';
        // Remove old listener and add new one
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector('.next-btn');
        newButton.onclick = () => continueMultiStepCase(choice.nextStep);
    } else {
        nextBtn.textContent = 'Next Case →';
        // Remove old listener and add new one
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector('.next-btn');
        newButton.onclick = nextScenario;
    }
}

function continueMultiStepCase(nextStepData) {
    gameState.session.currentStep++;
    gameState.session.hasAnswered = false;
    displayScenario(gameState.session.currentCase, nextStepData);
}

function nextScenario() {
    gameState.session.currentScenarioIndex++;
    gameState.player.casesCompleted++;
    
    // Check for perfect case
    const questionsInThisCase = gameState.session.totalQuestions;
    const correctInThisCase = gameState.session.correctAnswers;
    if (questionsInThisCase === correctInThisCase) {
        gameState.player.perfectCases++;
        addCoins(COIN_REWARDS.perfectCase, 'Perfect Case Bonus');
    }
    
    saveGameState();
    updateSidebarDisplay();
    checkAchievements();
    checkCertifications();
    loadScenario();
}


function addXP(amount) {
    gameState.player.xp += amount;
    
    const xpNeeded = getXPForLevel(gameState.player.level);
    
    while (gameState.player.xp >= xpNeeded) {
        levelUp();
    }
    
    updateXPDisplay();
}

function levelUp() {
    const xpNeeded = getXPForLevel(gameState.player.level);
    gameState.player.xp -= xpNeeded;
    gameState.player.level++;
    
    // Award level up bonus
    addCoins(COIN_REWARDS.levelUp, 'Level Up Bonus');
    
    console.log(`Level Up! Now level ${gameState.player.level}`);
}

function updateStoryBranch() {
    let maxBranch = null;
    let maxCount = 0;
    
    Object.keys(gameState.stats.branchChoices).forEach(branch => {
        if (gameState.stats.branchChoices[branch] > maxCount) {
            maxCount = gameState.stats.branchChoices[branch];
            maxBranch = branch;
        }
    });
    
    if (maxBranch && maxCount >= 3) {
        gameState.player.storyBranch = maxBranch;
    }
}

// ===== DISPLAY UPDATE FUNCTIONS =====
function updateSidebarDisplay() {
    const playerName = document.getElementById('playerName');
    const playerLevel = document.getElementById('playerLevel');
    const casesSolved = document.getElementById('casesSolved');
    const totalScore = document.getElementById('totalScore');
    const vetCoinsDisplay = document.getElementById('vetCoinsDisplay');
    const dailyStreakDisplay = document.getElementById('dailyStreakDisplay');
    const playerAccuracy = document.getElementById('playerAccuracy');
    
    if (playerName) playerName.textContent = gameState.player.name;
    if (playerLevel) playerLevel.textContent = gameState.player.level;
    if (casesSolved) casesSolved.textContent = gameState.player.casesCompleted;
    if (totalScore) totalScore.textContent = gameState.player.totalScore;
    if (vetCoinsDisplay) vetCoinsDisplay.textContent = gameState.player.vetCoins.toLocaleString();
    if (dailyStreakDisplay) dailyStreakDisplay.textContent = gameState.player.consecutiveDays;
    
    const totalAttempted = Object.values(gameState.stats.categoryAttempted).reduce((a, b) => a + b, 0);
    const totalCorrect = Object.values(gameState.stats.categoryCorrect).reduce((a, b) => a + b, 0);
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    if (playerAccuracy) playerAccuracy.textContent = accuracy + '%';
    
    updateXPDisplay();
    updateCoinDisplay();
    updateCertificationBadges();
}

function updateXPDisplay() {
    const xpFill = document.getElementById('xpFill');
    const xpText = document.getElementById('xpText');
    
    if (!xpFill || !xpText) return;
    
    const xpNeeded = getXPForLevel(gameState.player.level);
    const percentage = (gameState.player.xp / xpNeeded) * 100;
    
    xpFill.style.width = percentage + '%';
    xpText.textContent = `${gameState.player.xp} / ${xpNeeded} XP`;
}

function updateCertificationBadges() {
    const container = document.getElementById('certificationBadges');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show top 3 certifications
    const certEntries = [];
    Object.keys(CERTIFICATIONS).forEach(category => {
        const level = getCertificationLevel(category);
        if (level) {
            certEntries.push({
                category,
                level,
                icon: CERTIFICATIONS[category].icon,
                name: CERTIFICATIONS[category].name
            });
        }
    });
    
    certEntries.slice(0, 3).forEach(cert => {
        const badge = document.createElement('div');
        badge.className = 'cert-mini-badge';
        badge.title = `${cert.name} - ${cert.level}`;
        badge.innerHTML = `
            <div style="font-size: 1.5em;">${cert.icon}</div>
            <div style="font-size: 0.7em; font-weight: bold;">${cert.level.substring(0, 2)}</div>
        `;
        container.appendChild(badge);
    });
}

function updateDailyChallengeDisplay() {
    const dailyCard = document.getElementById('dailyChallengeCard');
    if (!dailyCard) return;
    
    if (gameState.dailyChallenge.completedToday) {
        dailyCard.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3em; margin-bottom: 10px;">✅</div>
                <h3 style="color: #4ade80; margin-bottom: 10px;">Daily Challenge Complete!</h3>
                <p style="color: #666; margin-bottom: 15px;">
                    🔥 ${gameState.player.consecutiveDays}-Day Streak!
                </p>
                <p style="color: #999; font-size: 0.9em;">
                    Next challenge in: ${getTimeUntilDailyReset()}
                </p>
            </div>
        `;
    } else if (gameState.dailyChallenge.scenario) {
        const scenario = gameState.dailyChallenge.scenario;
        dailyCard.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="color: #667eea; margin-bottom: 10px;">⭐ Today's Daily Challenge</h3>
                <p style="color: #666; margin-bottom: 5px;"><strong>${scenario.title}</strong></p>
                <p style="color: #999; font-size: 0.9em; margin-bottom: 15px;">
                    Category: ${scenario.category} | Difficulty: ${capitalizeFirst(scenario.difficulty)}
                </p>
                <p style="color: #f59e0b; font-weight: bold; margin-bottom: 15px;">
                    Bonus: +${DAILY_CHALLENGE_CONFIG.bonusXP} XP, +${DAILY_CHALLENGE_CONFIG.bonusCoins} Coins
                </p>
                ${gameState.player.consecutiveDays > 0 ? 
                    `<p style="color: #4ade80; margin-bottom: 15px;">🔥 Current Streak: ${gameState.player.consecutiveDays} days</p>` : ''}
                <button onclick="startDailyChallenge()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; border: none; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer;">
                    Start Daily Challenge
                </button>
                <p style="color: #999; font-size: 0.8em; margin-top: 10px; text-align: center;">
                    Resets in: ${getTimeUntilDailyReset()}
                </p>
            </div>
        `;
    }
}

function updateAchievementDisplay() {
    const container = document.getElementById('achievementBadges');
    if (!container) return;
    
    container.innerHTML = '';
    
    ACHIEVEMENTS.slice(0, 6).forEach(achievement => {
        const unlocked = gameState.player.achievements.includes(achievement.id);
        
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${unlocked ? 'unlocked' : 'locked'}`;
        badge.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.coins ? `<div style="color: #f59e0b; font-size: 0.8em; margin-top: 3px;">💰 ${achievement.coins} coins</div>` : ''}
            </div>
        `;
        container.appendChild(badge);
    });
}

function checkAchievements() {
    const newlyUnlocked = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!gameState.player.achievements.includes(achievement.id)) {
            if (achievement.condition(gameState.player, gameState.stats)) {
                gameState.player.achievements.push(achievement.id);
                if (achievement.coins) {
                    addCoins(achievement.coins, `Achievement: ${achievement.name}`);
                }
                newlyUnlocked.push(achievement);
            }
        }
    });
    
    if (newlyUnlocked.length > 0) {
        updateAchievementDisplay();
        return newlyUnlocked;
    }
    
    return [];
}

function updateLeaderboardDisplay() {
    // Add current player to leaderboard
    const existingIndex = gameState.leaderboard.findIndex(e => e.email === gameState.player.email);
    const playerEntry = {
        name: gameState.player.name,
        email: gameState.player.email,
        score: gameState.player.totalScore,
        level: gameState.player.level,
        organization: gameState.player.organization
    };
    
    if (existingIndex >= 0) {
        gameState.leaderboard[existingIndex] = playerEntry;
    } else {
        gameState.leaderboard.push(playerEntry);
    }
    
    // Sort by score
    gameState.leaderboard.sort((a, b) => b.score - a.score);
    gameState.leaderboard = gameState.leaderboard.slice(0, 10); // Keep top 10
    
    // Display
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.leaderboard.slice(0, 5).forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';
        if (entry.email === gameState.player.email) {
            div.classList.add('current-player');
        }
        div.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${entry.name} (Lv.${entry.level})</span>
            <span class="leaderboard-score">${entry.score}</span>
        `;
        container.appendChild(div);
    });
    
    saveGameState();
}

// ===== RESULTS SCREEN =====
function showResults() {
    showScreen('resultsScreen');
    
    const startLevel = gameState.player.level;
    const accuracy = gameState.session.totalQuestions > 0 
        ? Math.round((gameState.session.correctAnswers / gameState.session.totalQuestions) * 100)
        : 0;
    
    // Handle daily challenge completion
    let dailyBonus = null;
    if (gameState.session.isDailyChallenge && !gameState.dailyChallenge.completedToday) {
        dailyBonus = completeDailyChallenge();
    }
    
    // Handle tournament completion (Phase 2)
    let tournamentResults = null;
    if (gameState.session.isTournament) {
        tournamentResults = completeTournament();
    }
    
    // Update displays
    document.getElementById('finalScore').textContent = gameState.session.currentScore;
    document.getElementById('maxScore').textContent = gameState.session.maxPossibleScore;
    document.getElementById('xpEarned').textContent = gameState.session.coinsEarnedThisSession;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // Show coins earned
    const coinsEarnedEl = document.getElementById('coinsEarned');
    if (coinsEarnedEl) {
        let coinsText = `${gameState.session.coinsEarnedThisSession} VetCoins`;
        if (dailyBonus) {
            coinsText += ` (+${dailyBonus.totalCoins} Daily Bonus)`;
        }
        coinsEarnedEl.textContent = coinsText;
    }
    
    // Performance message
    let message = '';
    if (accuracy >= 90) {
        message = 'Outstanding performance! You demonstrate exceptional expertise in animal health!';
    } else if (accuracy >= 75) {
        message = 'Great work! You have strong knowledge in veterinary care.';
    } else if (accuracy >= 60) {
        message = 'Good effort! Keep learning to strengthen your clinical skills.';
    } else {
        message = 'Keep studying! Review the feedback to improve your knowledge.';
    }
    document.getElementById('performanceMessage').textContent = message;
    
    // Check for level up
    if (gameState.player.level > startLevel) {
        document.getElementById('levelUpBadge').style.display = 'block';
        document.getElementById('newLevel').textContent = gameState.player.level;
    } else {
        document.getElementById('levelUpBadge').style.display = 'none';
    }
    
    // Show daily challenge bonus if applicable
    if (dailyBonus) {
        const dailyBonusEl = document.getElementById('dailyBonusInfo');
        if (dailyBonusEl) {
            dailyBonusEl.style.display = 'block';
            dailyBonusEl.innerHTML = `
                <h3>⭐ Daily Challenge Bonus!</h3>
                <p>+${dailyBonus.bonusXP} Bonus XP</p>
                <p>+${dailyBonus.totalCoins} VetCoins</p>
                <p style="color: #4ade80; font-weight: bold;">🔥 ${dailyBonus.streak}-Day Streak!</p>
            `;
        }
    }
    
    // Check achievements
    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) {
        const achievementsSection = document.getElementById('unlockedAchievements');
        achievementsSection.style.display = 'block';
        
        const list = document.getElementById('achievementsList');
        list.innerHTML = '';
        newAchievements.forEach(ach => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge unlocked';
            badge.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.description}</div>
                    ${ach.coins ? `<div style="color: #f59e0b; margin-top: 5px;">💰 +${ach.coins} VetCoins</div>` : ''}
                </div>
            `;
            list.appendChild(badge);
        });
    } else {
        document.getElementById('unlockedAchievements').style.display = 'none';
    }
    
    // Check certifications
    const newCerts = checkCertifications();
    if (newCerts.length > 0) {
        const certsSection = document.getElementById('unlockedCertifications');
        if (certsSection) {
            certsSection.style.display = 'block';
            const list = document.getElementById('certificationsList');
            list.innerHTML = '';
            newCerts.forEach(cert => {
                const div = document.createElement('div');
                div.className = 'achievement-badge unlocked';
                div.style.borderColor = CERTIFICATIONS[cert.category].tiers.find(t => t.level === cert.tier).color;
                div.innerHTML = `
                    <div class="achievement-icon">${cert.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${cert.tier} Certification</div>
                        <div class="achievement-desc">${cert.name}</div>
                        <div style="color: #f59e0b; margin-top: 5px;">💰 +${cert.coins} VetCoins</div>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    } else {
        const certsSection = document.getElementById('unlockedCertifications');
        if (certsSection) certsSection.style.display = 'none';
    }
    
    updateLeaderboardDisplay();
    updateSidebarDisplay();
    updateDailyChallengeDisplay();
    saveGameState();
}

function continueGame() {
    showScreen('welcomeScreen');
    updateDailyChallengeDisplay();
}

function viewLeaderboard() {
    let text = '🏆 TOP VETERINARIANS 🏆\n\n';
    
    gameState.leaderboard.forEach((entry, index) => {
        const isCurrent = entry.email === gameState.player.email;
        text += `${isCurrent ? '👉 ' : ''}#${index + 1} ${entry.name}\n`;
        text += `   Level ${entry.level} | ${entry.score} points\n`;
        text += `   ${entry.organization}\n\n`;
    });
    
    alert(text);
}

function restartGame() {
    if (confirm('This will reset your game progress but keep your profile. Continue?')) {
        const profile = {
            firstName: gameState.player.firstName,
            lastName: gameState.player.lastName,
            email: gameState.player.email,
            organization: gameState.player.organization,
            professionalTitle: gameState.player.professionalTitle,
            city: gameState.player.city,
            state: gameState.player.state,
            country: gameState.player.country,
            registrationDate: gameState.player.registrationDate
        };
        
        gameState.player = {
            ...profile,
            name: `${profile.firstName} ${profile.lastName}`,
            level: 1,
            xp: 0,
            totalScore: 0,
            casesCompleted: 0,
            perfectCases: 0,
            accuracy: 0,
            currentStreak: 0,
            longestStreak: 0,
            storyBranch: null,
            achievements: [],
            vetCoins: 100,
            dailyChallengesCompleted: 0,
            lastDailyChallenge: null,
            consecutiveDays: 0,
            streakMilestonesReached: [],
            certifications: [],
            unlockedKnowledge: []
        };
        
        gameState.stats = {
            categoryCorrect: {},
            categoryAttempted: {},
            branchChoices: {}
        };
        
        saveGameState();
        showScreen('welcomeScreen');
        updateSidebarDisplay();
        updateAchievementDisplay();
        updateDailyChallengeDisplay();
    }
}

function createNewUser() {
    const message = `CREATE NEW USER ACCOUNT

This will:
✓ Clear all current progress and stats
✓ Take you to registration to create a new profile
✓ Your current account data will be permanently deleted

Are you sure you want to create a completely new user account?`;
    
    if (confirm(message)) {
        // Clear all localStorage data
        localStorage.removeItem('animalHealthPro_player');
        localStorage.removeItem('animalHealthPro_stats');
        localStorage.removeItem('animalHealthPro_leaderboard');
        localStorage.removeItem('animalHealthPro_dailyChallenge');
        
        // Reset game state
        gameState = {
            player: {
                firstName: '',
                lastName: '',
                email: '',
                organization: '',
                professionalTitle: '',
                city: '',
                state: '',
                country: '',
                registrationDate: null,
                name: 'Veterinarian',
                level: 1,
                xp: 0,
                totalScore: 0,
                casesCompleted: 0,
                perfectCases: 0,
                accuracy: 0,
                currentStreak: 0,
                longestStreak: 0,
                storyBranch: null,
                achievements: [],
                vetCoins: 100,
                dailyChallengesCompleted: 0,
                lastDailyChallenge: null,
                consecutiveDays: 0,
                streakMilestonesReached: [],
                certifications: [],
                unlockedKnowledge: []
            },
            session: {
                difficulty: '',
                currentScenarioIndex: 0,
                currentScore: 0,
                maxPossibleScore: 0,
                scenarios: [],
                correctAnswers: 0,
                totalQuestions: 0,
                currentCase: null,
                currentStep: 1,
                hasAnswered: false,
                isDailyChallenge: false,
                coinsEarnedThisSession: 0
            },
            stats: {
                categoryCorrect: {},
                categoryAttempted: {},
                branchChoices: {}
            },
            leaderboard: [],
            dailyChallenge: {
                available: true,
                completedToday: false,
                scenario: selectDailyChallenge(), // Initialize with today's challenge
                expiresAt: null
            },
            tournaments: {
                active: [],
                completed: [],
                userParticipation: [],
                currentTournament: null
            },
            analytics: {
                playHistory: [],
                categoryTrends: {},
                dailyActivity: {},
                personalBests: {}
            },
            social: {
                sharedAchievements: [],
                challengesSent: [],
                challengesReceived: []
            }
        };
        
        // Initialize daily challenge properly
        checkDailyChallengeReset();
        
        // Clear registration form
        const form = document.getElementById('registrationForm');
        if (form) {
            form.reset();
        }
        
        // Show registration screen
        showScreen('registrationScreen');
        
        alert('All data cleared! Please complete registration to create your new account.');
    }
}

function viewPlayerProfile() {
    const p = gameState.player;
    const registrationDate = p.registrationDate ? new Date(p.registrationDate).toLocaleDateString() : 'N/A';
    
    let profileHTML = `
=== PLAYER PROFILE ===

Name: ${p.firstName} ${p.lastName}
Email: ${p.email}
Title: ${p.professionalTitle}
Organization: ${p.organization}

Location: ${p.city}, ${p.state}, ${p.country}

Registered: ${registrationDate}

=== GAME PROGRESS ===
Level: ${p.level}
Total XP: ${p.xp}
VetCoins: ${p.vetCoins} 💰
Cases Completed: ${p.casesCompleted}
Total Score: ${p.totalScore}
Daily Challenges: ${p.dailyChallengesCompleted}
Current Streak: ${p.consecutiveDays} days 🔥
Longest Streak: ${p.longestStreak} days

Achievements: ${p.achievements.length}
Certifications: ${p.certifications.length}
Knowledge Articles: ${p.unlockedKnowledge.length}

Story Branch: ${p.storyBranch ? STORY_BRANCHES[p.storyBranch].name : 'Not yet defined'}
    `;
    
    alert(profileHTML);
}

// ===== UTILITY FUNCTIONS =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}


// ===== PHASE 2: TOURNAMENT STATE & FUNCTIONS =====

// Extend gameState with tournament data
if (!gameState.tournaments) {
    gameState.tournaments = {
        active: [],
        completed: [],
        userParticipation: [],
        currentTournament: null
    };
}

if (!gameState.analytics) {
    gameState.analytics = {
        playHistory: [],
        categoryTrends: {},
        dailyActivity: {},
        personalBests: {}
    };
}

if (!gameState.social) {
    gameState.social = {
        sharedAchievements: [],
        challengesSent: [],
        challengesReceived: []
    };
}

// Tournament Management Functions
function initializeTournaments() {
    const now = new Date();
    
    // Check if we need to create active tournaments
    TOURNAMENT_TEMPLATES.forEach(template => {
        if (shouldCreateTournament(template, now)) {
            createTournament(template, now);
        }
    });
    
    // Clean up expired tournaments
    gameState.tournaments.active = gameState.tournaments.active.filter(t => {
        const endDate = new Date(t.endDate);
        if (endDate < now) {
            gameState.tournaments.completed.push(t);
            return false;
        }
        return true;
    });
    
    saveGameState();
}

function shouldCreateTournament(template, now) {
    // Check if tournament of this type already exists
    const existing = gameState.tournaments.active.find(t => t.templateId === template.id);
    if (existing) return false;
    
    // Check recurring schedule
    if (template.recurring === 'weekly') {
        // Start every Friday at noon
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        return dayOfWeek === 5 && hour >= 12 && hour < 13;
    }
    
    if (template.recurring === 'monthly') {
        // First Friday of month
        const date = now.getDate();
        const dayOfWeek = now.getDay();
        return date <= 7 && dayOfWeek === 5 && now.getHours() >= 12;
    }
    
    if (template.recurring === 'biweekly') {
        // Every other Tuesday
        const weekOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
        return weekOfYear % 2 === 0 && now.getDay() === 2 && now.getHours() >= 12;
    }
    
    return false;
}

function createTournament(template, startDate) {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + template.duration);
    
    const tournament = {
        id: `${template.id}_${startDate.getTime()}`,
        templateId: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        scenarios: template.scenarioIds.map(id => SCENARIOS_DATA.find(s => s.id === id)),
        entryFee: template.entryFee,
        rewards: template.rewards,
        leaderboard: generateSampleLeaderboard(),
        participants: 0,
        status: 'active'
    };
    
    gameState.tournaments.active.push(tournament);
    return tournament;
}

function joinTournament(tournamentId) {
    const tournament = gameState.tournaments.active.find(t => t.id === tournamentId);
    
    if (!tournament) {
        alert('Tournament not found!');
        return false;
    }
    
    // Check if already joined
    const alreadyJoined = gameState.tournaments.userParticipation.find(
        p => p.tournamentId === tournamentId
    );
    
    if (alreadyJoined) {
        alert('You have already joined this tournament!');
        return false;
    }
    
    // Check entry fee
    if (tournament.entryFee > 0) {
        if (gameState.player.vetCoins < tournament.entryFee) {
            alert(`Not enough VetCoins! You need ${tournament.entryFee} coins.\nYou have: ${gameState.player.vetCoins} coins.`);
            return false;
        }
        spendCoins(tournament.entryFee, `Tournament Entry: ${tournament.name}`);
    }
    
    // Join tournament
    const participation = {
        tournamentId: tournamentId,
        joinedAt: new Date().toISOString(),
        completedScenarios: [],
        totalScore: 0,
        totalTime: 0,
        accuracy: 0,
        completed: false
    };
    
    gameState.tournaments.userParticipation.push(participation);
    gameState.tournaments.currentTournament = tournamentId;
    
    saveGameState();
    return true;
}

function startTournament(tournamentId) {
    if (!joinTournament(tournamentId)) {
        return;
    }
    
    const tournament = gameState.tournaments.active.find(t => t.id === tournamentId);
    
    gameState.session.isTournament = true;
    gameState.session.tournamentId = tournamentId;
    gameState.session.difficulty = 'tournament';
    gameState.session.currentScenarioIndex = 0;
    gameState.session.currentScore = 0;
    gameState.session.correctAnswers = 0;
    gameState.session.totalQuestions = 0;
    gameState.session.hasAnswered = false;
    gameState.session.coinsEarnedThisSession = 0;
    gameState.session.tournamentStartTime = Date.now();
    gameState.session.scenarioTimes = [];
    
    gameState.session.scenarios = tournament.scenarios;
    gameState.session.maxPossibleScore = calculateMaxScore(gameState.session.scenarios);
    
    // Initialize category stats
    gameState.session.scenarios.forEach(scenario => {
        if (!gameState.stats.categoryAttempted[scenario.category]) {
            gameState.stats.categoryAttempted[scenario.category] = 0;
            gameState.stats.categoryCorrect[scenario.category] = 0;
        }
    });
    
    showScreen('gameScreen');
    document.getElementById('difficultyDisplay').textContent = '🏆 Tournament';
    updateSidebarDisplay();
    
    loadScenario();
}

function completeTournament() {
    const tournamentId = gameState.session.tournamentId;
    const participation = gameState.tournaments.userParticipation.find(
        p => p.tournamentId === tournamentId
    );
    
    if (!participation) return;
    
    const totalTime = Date.now() - gameState.session.tournamentStartTime;
    
    participation.totalScore = gameState.session.currentScore;
    participation.totalTime = totalTime;
    participation.accuracy = gameState.session.totalQuestions > 0 
        ? Math.round((gameState.session.correctAnswers / gameState.session.totalQuestions) * 100)
        : 0;
    participation.completed = true;
    participation.completedAt = new Date().toISOString();
    
    // Calculate rewards
    const tournament = gameState.tournaments.active.find(t => t.id === tournamentId);
    const leaderboard = generateSampleLeaderboard(participation.totalScore, participation.totalTime);
    const playerEntry = leaderboard.find(e => e.isPlayer);
    const rank = playerEntry ? playerEntry.rank : 999;
    
    let reward = null;
    if (rank === 1) reward = tournament.rewards.first;
    else if (rank <= 10) reward = tournament.rewards.top10;
    else if (rank <= 50) reward = tournament.rewards.top50;
    else if (rank <= 100) reward = tournament.rewards.top100;
    else reward = tournament.rewards.participation;
    
    // Award rewards
    if (reward.coins) {
        addCoins(reward.coins, `Tournament Reward (Rank #${rank})`);
    }
    
    if (reward.badge) {
        if (!gameState.player.tournamentBadges) {
            gameState.player.tournamentBadges = [];
        }
        if (!gameState.player.tournamentBadges.includes(reward.badge)) {
            gameState.player.tournamentBadges.push(reward.badge);
        }
    }
    
    if (reward.title) {
        gameState.player.tournamentTitle = reward.title;
    }
    
    participation.rank = rank;
    participation.reward = reward;
    
    saveGameState();
    
    return { rank, reward, totalTime, leaderboard };
}

// Organization/Team Functions
function getOrganizationLeaderboard() {
    // Combine sample data with player's organization
    let orgs = [...SAMPLE_ORGANIZATIONS];
    
    // Check if player's organization exists in samples
    const playerOrg = orgs.find(o => o.name === gameState.player.organization);
    
    if (!playerOrg && gameState.player.organization) {
        // Add player's organization
        orgs.push({
            name: gameState.player.organization,
            members: 1,
            totalScore: gameState.player.totalScore,
            avgLevel: gameState.player.level,
            casesCompleted: gameState.player.casesCompleted,
            activePlayers: 1,
            founded: gameState.player.registrationDate,
            isPlayerOrg: true
        });
    } else if (playerOrg) {
        // Update with player's contribution
        playerOrg.isPlayerOrg = true;
        playerOrg.totalScore += gameState.player.totalScore;
        playerOrg.members++;
    }
    
    // Sort by total score
    orgs.sort((a, b) => b.totalScore - a.totalScore);
    
    // Add rankings
    orgs.forEach((org, index) => {
        org.rank = index + 1;
    });
    
    return orgs;
}

// Analytics Functions
function recordPlay(scenario, correct, timeSpent, points) {
    const record = {
        timestamp: new Date().toISOString(),
        scenarioId: scenario.id,
        category: scenario.category,
        difficulty: scenario.difficulty,
        correct: correct,
        timeSpent: timeSpent,
        points: points
    };
    
    if (!gameState.analytics.playHistory) {
        gameState.analytics.playHistory = [];
    }
    
    gameState.analytics.playHistory.push(record);
    
    // Keep only last 100 plays
    if (gameState.analytics.playHistory.length > 100) {
        gameState.analytics.playHistory = gameState.analytics.playHistory.slice(-100);
    }
    
    // Update daily activity
    const today = new Date().toISOString().split('T')[0];
    if (!gameState.analytics.dailyActivity[today]) {
        gameState.analytics.dailyActivity[today] = 0;
    }
    gameState.analytics.dailyActivity[today]++;
    
    saveGameState();
}

function getCategoryPerformance() {
    const performance = {};
    
    ANALYTICS_CATEGORIES.forEach(category => {
        const attempted = gameState.stats.categoryAttempted[category] || 0;
        const correct = gameState.stats.categoryCorrect[category] || 0;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        
        performance[category] = {
            attempted,
            correct,
            accuracy,
            percentage: accuracy
        };
    });
    
    return performance;
}

function getImprovementSuggestions() {
    const performance = getCategoryPerformance();
    const suggestions = [];
    
    // Find weakest category
    let weakestCategory = null;
    let lowestAccuracy = 100;
    
    Object.keys(performance).forEach(category => {
        if (performance[category].attempted >= 3 && performance[category].accuracy < lowestAccuracy) {
            lowestAccuracy = performance[category].accuracy;
            weakestCategory = category;
        }
    });
    
    if (weakestCategory) {
        suggestions.push({
            type: 'weakness',
            category: weakestCategory,
            message: `Focus on: ${weakestCategory}`,
            action: `Your accuracy in ${weakestCategory} is ${lowestAccuracy}%. Review related knowledge base articles.`
        });
    }
    
    // Find strongest category
    let strongestCategory = null;
    let highestAccuracy = 0;
    
    Object.keys(performance).forEach(category => {
        if (performance[category].attempted >= 3 && performance[category].accuracy > highestAccuracy) {
            highestAccuracy = performance[category].accuracy;
            strongestCategory = category;
        }
    });
    
    if (strongestCategory) {
        suggestions.push({
            type: 'strength',
            category: strongestCategory,
            message: `You excel at: ${strongestCategory}`,
            action: `${highestAccuracy}% accuracy! Consider earning Platinum certification in this area.`
        });
    }
    
    return suggestions;
}

function getActivityHeatmap() {
    const heatmap = {};
    const last30Days = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last30Days.push(dateStr);
        heatmap[dateStr] = gameState.analytics.dailyActivity[dateStr] || 0;
    }
    
    return { dates: last30Days, activity: heatmap };
}


// ===== PHASE 2: UI FUNCTIONS =====

// Tournament UI Functions
function loadTournaments() {
    initializeTournaments();
    
    const activeContainer = document.getElementById('activeTournamentsList');
    const pastContainer = document.getElementById('pastTournamentsList');
    
    if (!activeContainer || !pastContainer) return;
    
    // Display active tournaments
    activeContainer.innerHTML = '';
    
    if (gameState.tournaments.active.length === 0) {
        activeContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No active tournaments at the moment. Check back soon!</p>';
    } else {
        gameState.tournaments.active.forEach(tournament => {
            const card = createTournamentCard(tournament);
            activeContainer.appendChild(card);
        });
    }
    
    // Display past tournaments
    pastContainer.innerHTML = '';
    
    if (gameState.tournaments.completed.length === 0) {
        pastContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No completed tournaments yet.</p>';
    } else {
        gameState.tournaments.completed.slice(-5).reverse().forEach(tournament => {
            const card = createTournamentCard(tournament, true);
            pastContainer.appendChild(card);
        });
    }
}

function createTournamentCard(tournament, isPast = false) {
    const card = document.createElement('div');
    card.style.cssText = 'background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 20px; cursor: pointer; transition: all 0.3s;';
    
    const now = new Date();
    const endDate = new Date(tournament.endDate);
    const timeRemaining = endDate - now;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    const participation = gameState.tournaments.userParticipation.find(p => p.tournamentId === tournament.id);
    const hasJoined = !!participation;
    const hasCompleted = participation && participation.completed;
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <h3 style="color: #667eea; margin-bottom: 5px;">${tournament.name}</h3>
                <p style="color: #666; font-size: 0.9em;">${tournament.description}</p>
            </div>
            <div style="background: ${isPast ? '#9ca3af' : '#fbbf24'}; color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                ${tournament.category}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div>
                <div style="color: #999; font-size: 0.8em;">Entry Fee</div>
                <div style="font-weight: bold; color: #333;">${tournament.entryFee > 0 ? tournament.entryFee + ' Coins' : 'Free'}</div>
            </div>
            <div>
                <div style="color: #999; font-size: 0.8em;">Scenarios</div>
                <div style="font-weight: bold; color: #333;">${tournament.scenarios.length} Cases</div>
            </div>
            <div>
                <div style="color: #999; font-size: 0.8em;">${isPast ? 'Ended' : 'Time Remaining'}</div>
                <div style="font-weight: bold; color: ${isPast ? '#9ca3af' : '#f59e0b'};">
                    ${isPast ? 'Completed' : hoursRemaining + 'h ' + minutesRemaining + 'm'}
                </div>
            </div>
        </div>
        
        ${hasCompleted ? `
            <div style="background: #f0fdf4; border: 2px solid #4ade80; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <div style="font-weight: bold; color: #16a34a; margin-bottom: 5px;">✅ Completed!</div>
                <div style="color: #666;">Rank: #${participation.rank} | Score: ${participation.totalScore} | Accuracy: ${participation.accuracy}%</div>
            </div>
        ` : hasJoined && !isPast ? `
            <div style="background: #eff6ff; border: 2px solid #667eea; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <div style="font-weight: bold; color: #667eea; margin-bottom: 5px;">🎮 In Progress</div>
                <div style="color: #666;">Continue your tournament run!</div>
            </div>
        ` : ''}
        
        ${!isPast && !hasCompleted ? `
            <button onclick="event.stopPropagation(); ${hasJoined ? 'startTournament' : 'viewTournamentDetail'}('${tournament.id}')" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; font-size: 1.1em; cursor: pointer;">
                ${hasJoined ? '▶ Continue Tournament' : '🏆 View Details'}
            </button>
        ` : ''}
    `;
    
    if (!isPast && !hasCompleted) {
        card.onmouseover = () => card.style.transform = 'translateY(-3px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';
        card.onclick = () => viewTournamentDetail(tournament.id);
    }
    
    return card;
}

function viewTournamentDetail(tournamentId) {
    const tournament = gameState.tournaments.active.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const detailContent = document.getElementById('tournamentDetailContent');
    if (!detailContent) return;
    
    const leaderboard = generateSampleLeaderboard();
    
    detailContent.innerHTML = `
        <h2 style="color: #333; margin-bottom: 10px;">${tournament.name}</h2>
        <p style="color: #666; margin-bottom: 30px;">${tournament.description}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px;">
                <div style="color: #999; margin-bottom: 5px;">Entry Fee</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${tournament.entryFee > 0 ? tournament.entryFee + ' 💰' : 'Free'}</div>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px;">
                <div style="color: #999; margin-bottom: 5px;">Scenarios</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${tournament.scenarios.length}</div>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px;">
                <div style="color: #999; margin-bottom: 5px;">1st Place Prize</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #fbbf24;">${tournament.rewards.first.coins} 💰</div>
            </div>
        </div>
        
        <h3 style="color: #333; margin-bottom: 15px;">🏆 Live Leaderboard</h3>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 30px; max-height: 400px; overflow-y: auto;">
            ${leaderboard.slice(0, 10).map(entry => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: ${entry.isPlayer ? '#eef2ff' : 'white'}; border: 2px solid ${entry.isPlayer ? '#667eea' : '#e5e7eb'}; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 1.2em; font-weight: bold; color: #667eea; min-width: 30px;">#${entry.rank}</div>
                        <div>
                            <div style="font-weight: bold; color: #333;">${entry.name}</div>
                            <div style="font-size: 0.85em; color: #999;">${entry.organization}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: #667eea;">${entry.score} pts</div>
                        <div style="font-size: 0.85em; color: #999;">${entry.accuracy}%</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="display: flex; gap: 15px;">
            <button onclick="showScreen('tournamentsScreen')" class="btn-secondary" style="flex: 1;">
                ← Back to Tournaments
            </button>
            <button onclick="startTournament('${tournament.id}')" class="btn-primary" style="flex: 2;">
                🏆 Join Tournament
            </button>
        </div>
    `;
    
    showScreen('tournamentDetailScreen');
}

// Analytics UI Functions
function loadAnalytics() {
    displayCategoryPerformance();
    displayImprovementSuggestions();
    displayActivityHeatmap();
    displayPersonalBests();
}

function displayCategoryPerformance() {
    const container = document.getElementById('categoryPerformanceChart');
    if (!container) return;
    
    const performance = getCategoryPerformance();
    
    container.innerHTML = '';
    
    Object.keys(performance).forEach(category => {
        const data = performance[category];
        const color = data.accuracy >= 80 ? '#4ade80' : data.accuracy >= 60 ? '#fbbf24' : '#f87171';
        
        const bar = document.createElement('div');
        bar.style.cssText = 'margin-bottom: 15px;';
        bar.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 0.9em; color: #333;">${category}</span>
                <span style="font-weight: bold; color: ${color};">${data.accuracy}%</span>
            </div>
            <div style="background: #e5e7eb; height: 10px; border-radius: 10px; overflow: hidden;">
                <div style="background: ${color}; height: 100%; width: ${data.accuracy}%; transition: width 0.5s;"></div>
            </div>
            <div style="font-size: 0.8em; color: #999; margin-top: 3px;">${data.correct}/${data.attempted} correct</div>
        `;
        container.appendChild(bar);
    });
}

function displayImprovementSuggestions() {
    const container = document.getElementById('improvementSuggestions');
    if (!container) return;
    
    const suggestions = getImprovementSuggestions();
    
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Complete more cases to get personalized suggestions!</p>';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const card = document.createElement('div');
        card.style.cssText = `background: ${suggestion.type === 'strength' ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${suggestion.type === 'strength' ? '#4ade80' : '#f87171'}; padding: 15px; border-radius: 10px; margin-bottom: 10px;`;
        card.innerHTML = `
            <div style="font-weight: bold; color: ${suggestion.type === 'strength' ? '#16a34a' : '#dc2626'}; margin-bottom: 5px;">
                ${suggestion.type === 'strength' ? '✨' : '💡'} ${suggestion.message}
            </div>
            <div style="color: #666; font-size: 0.9em;">${suggestion.action}</div>
        `;
        container.appendChild(card);
    });
}

function displayActivityHeatmap() {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;
    
    const { dates, activity } = getActivityHeatmap();
    
    container.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(30px, 1fr)); gap: 5px;"></div>';
    const grid = container.firstChild;
    
    dates.forEach(date => {
        const count = activity[date];
        const intensity = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3;
        const colors = ['#e5e7eb', '#a7f3d0', '#4ade80', '#16a34a'];
        
        const cell = document.createElement('div');
        cell.style.cssText = `background: ${colors[intensity]}; aspect-ratio: 1; border-radius: 4px; cursor: pointer;`;
        cell.title = `${date}: ${count} cases`;
        grid.appendChild(cell);
    });
}

function displayPersonalBests() {
    document.getElementById('bestScore').textContent = gameState.player.totalScore || 0;
    document.getElementById('bestPerfect').textContent = gameState.player.perfectCases || 0;
    document.getElementById('bestStreak').textContent = gameState.player.longestStreak || 0;
}

// Organization UI Functions
function loadOrganizations() {
    const container = document.getElementById('organizationLeaderboard');
    if (!container) return;
    
    const orgs = getOrganizationLeaderboard();
    
    container.innerHTML = '';
    
    orgs.forEach(org => {
        const card = document.createElement('div');
        card.style.cssText = `background: ${org.isPlayerOrg ? '#eef2ff' : 'white'}; border: 2px solid ${org.isPlayerOrg ? '#667eea' : '#e5e7eb'}; border-radius: 15px; padding: 20px; margin-bottom: 15px;`;
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                        #${org.rank} ${org.name} ${org.isPlayerOrg ? '⭐' : ''}
                    </div>
                    <div style="color: #999; font-size: 0.9em;">${org.members} members · Avg Level ${org.avgLevel}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.3em; font-weight: bold; color: #fbbf24;">${org.totalScore.toLocaleString()}</div>
                    <div style="color: #999; font-size: 0.85em;">Total Score</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <div style="background: #f9fafb; padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="color: #999; font-size: 0.8em;">Cases</div>
                    <div style="font-weight: bold; color: #333;">${org.casesCompleted}</div>
                </div>
                <div style="background: #f9fafb; padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="color: #999; font-size: 0.8em;">Active</div>
                    <div style="font-weight: bold; color: #4ade80;">${org.activePlayers}</div>
                </div>
                <div style="background: #f9fafb; padding: 10px; border-radius: 8px; text-align: center;">
                    <div style="color: #999; font-size: 0.8em;">Founded</div>
                    <div style="font-weight: bold; color: #333;">${new Date(org.founded).toLocaleDateString()}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Social Sharing Functions
function showShareModal(type, data = {}) {
    const modal = document.getElementById('shareModal');
    const content = document.getElementById('shareContent');
    
    if (!modal || !content) return;
    
    let shareText = '';
    
    switch(type) {
        case 'achievement':
            shareText = SHARE_TEMPLATES.achievement(data.name, data.icon);
            break;
        case 'levelUp':
            shareText = SHARE_TEMPLATES.levelUp(gameState.player.level);
            break;
        case 'tournament':
            shareText = SHARE_TEMPLATES.tournament(data.rank, data.name);
            break;
        case 'certification':
            shareText = SHARE_TEMPLATES.certification(data.name, data.tier);
            break;
        case 'streak':
            shareText = SHARE_TEMPLATES.streak(gameState.player.consecutiveDays);
            break;
        case 'general':
        default:
            shareText = `🐾 Animal Health Pro 🐾

Level ${gameState.player.level} Veterinarian
${gameState.player.casesCompleted} cases completed
${gameState.player.totalScore} total score

Join me in mastering veterinary medicine!`;
            break;
    }
    
    content.textContent = shareText;
    modal.style.display = 'flex';
    
    // Store current share text for copying
    window.currentShareText = shareText;
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) modal.style.display = 'none';
}

function copyShareText() {
    if (!window.currentShareText) return;
    
    navigator.clipboard.writeText(window.currentShareText).then(() => {
        alert('✅ Share text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.currentShareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ Share text copied to clipboard!');
    });
}

function downloadShareImage() {
    // Create a simple text-based image using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 Animal Health Pro', 300, 80);
    
    ctx.font = '20px Arial';
    const lines = window.currentShareText.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, 300, 140 + (index * 30));
    });
    
    // Download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animal-health-pro-share.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}


// ===== ADMIN SYSTEM =====

// Admin Configuration
const ADMIN_EMAILS = [
    'admin@example.com',
    'your-email@example.com'
    // Add more authorized admin emails here
];

const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password

let isAdminLoggedIn = false;
let currentAdminEmail = null;

// Admin Login
function showAdminLogin() {
    showScreen('adminLoginScreen');
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (ADMIN_EMAILS.includes(email) && password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        currentAdminEmail = email;
        showScreen('adminDashboard');
        loadAdminDashboard();
    } else {
        alert('Invalid email or password. Access denied.');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    currentAdminEmail = null;
    showScreen('welcomeScreen');
}

function loadAdminDashboard() {
    document.getElementById('adminTotalScenarios').textContent = SCENARIOS_DATA.length;
    document.getElementById('adminTotalPlayers').textContent = gameState.leaderboard.length || 1;
    document.getElementById('adminActiveTournaments').textContent = gameState.tournaments.active.length;
}

// Scenario Manager
function showScenarioManager() {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }
    
    showScreen('scenarioManagerScreen');
    loadScenariosList();
}

function loadScenariosList() {
    const container = document.getElementById('scenariosList');
    if (!container) return;
    
    container.innerHTML = '';
    
    SCENARIOS_DATA.forEach(scenario => {
        const card = document.createElement('div');
        card.style.cssText = 'background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 20px; margin-bottom: 15px;';
        card.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <span style="background: #667eea; color: white; padding: 5px 12px; border-radius: 15px; font-size: 0.85em;">ID: ${scenario.id}</span>
                        <span style="background: ${scenario.difficulty === 'easy' ? '#4ade80' : scenario.difficulty === 'medium' ? '#fbbf24' : '#f87171'}; color: white; padding: 5px 12px; border-radius: 15px; font-size: 0.85em;">${scenario.difficulty}</span>
                        <span style="background: #e5e7eb; color: #333; padding: 5px 12px; border-radius: 15px; font-size: 0.85em;">${scenario.type === 'multi' ? 'Multi-Step' : 'Single'}</span>
                    </div>
                    <h3 style="color: #333; margin-bottom: 5px;">${scenario.title}</h3>
                    <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">${scenario.category}</p>
                    <p style="color: #999; font-size: 0.85em;">${scenario.text.substring(0, 150)}...</p>
                </div>
                <div style="display: flex; gap: 10px; margin-left: 20px;">
                    <button onclick="editScenario(${scenario.id})" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteScenario(${scenario.id})" style="background: #f87171; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function showAddScenarioForm() {
    showScreen('scenarioFormScreen');
    document.getElementById('scenarioFormTitle').textContent = 'Add New Scenario';
    populateScenarioForm(null);
}

function editScenario(id) {
    const scenario = SCENARIOS_DATA.find(s => s.id === id);
    if (!scenario) return;
    
    showScreen('scenarioFormScreen');
    document.getElementById('scenarioFormTitle').textContent = 'Edit Scenario';
    populateScenarioForm(scenario);
}

function deleteScenario(id) {
    if (!confirm('Are you sure you want to delete this scenario? This cannot be undone.')) return;
    
    const index = SCENARIOS_DATA.findIndex(s => s.id === id);
    if (index >= 0) {
        SCENARIOS_DATA.splice(index, 1);
        alert('Scenario deleted successfully!');
        loadScenariosList();
    }
}

function populateScenarioForm(scenario) {
    const form = document.getElementById('scenarioForm');
    if (!form) return;
    
    const isEdit = !!scenario;
    
    form.innerHTML = `
        <input type="hidden" id="scenarioId" value="${isEdit ? scenario.id : ''}">
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Title *</label>
            <input type="text" id="scenarioTitle" required value="${isEdit ? scenario.title : ''}" 
                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Category *</label>
            <select id="scenarioCategory" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                <option value="Veterinary Diagnostics" ${isEdit && scenario.category === 'Veterinary Diagnostics' ? 'selected' : ''}>Veterinary Diagnostics</option>
                <option value="Animal Nutrition" ${isEdit && scenario.category === 'Animal Nutrition' ? 'selected' : ''}>Animal Nutrition</option>
                <option value="Pharmaceutical Treatment" ${isEdit && scenario.category === 'Pharmaceutical Treatment' ? 'selected' : ''}>Pharmaceutical Treatment</option>
                <option value="Practice Management" ${isEdit && scenario.category === 'Practice Management' ? 'selected' : ''}>Practice Management</option>
                <option value="Regulatory Compliance" ${isEdit && scenario.category === 'Regulatory Compliance' ? 'selected' : ''}>Regulatory Compliance</option>
                <option value="Emergency Medicine" ${isEdit && scenario.category === 'Emergency Medicine' ? 'selected' : ''}>Emergency Medicine</option>
                <option value="Client Care" ${isEdit && scenario.category === 'Client Care' ? 'selected' : ''}>Client Care</option>
            </select>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Difficulty *</label>
                <select id="scenarioDifficulty" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="easy" ${isEdit && scenario.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                    <option value="medium" ${isEdit && scenario.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="hard" ${isEdit && scenario.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Type *</label>
                <select id="scenarioType" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="single" ${isEdit && scenario.type === 'single' ? 'selected' : ''}>Single Step</option>
                    <option value="multi" ${isEdit && scenario.type === 'multi' ? 'selected' : ''}>Multi-Step</option>
                </select>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Case Description *</label>
            <textarea id="scenarioText" required rows="4" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: inherit;">${isEdit ? scenario.text : ''}</textarea>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Choices (4 required)</h3>
            <div id="choicesContainer">
                ${isEdit ? scenario.choices.map((choice, index) => createChoiceFieldHTML(index, choice)).join('') : 
                    Array.from({length: 4}, (_, i) => createChoiceFieldHTML(i)).join('')}
            </div>
        </div>
        
        <button type="submit" class="btn-primary" style="width: 100%;">
            ${isEdit ? 'Update Scenario' : 'Add Scenario'}
        </button>
    `;
}

function createChoiceFieldHTML(index, choice = null) {
    return `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin-bottom: 10px;">Choice ${index + 1}</h4>
            <textarea placeholder="Choice text..." class="choiceText" data-index="${index}" rows="2" 
                      style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; font-family: inherit;">${choice ? choice.text : ''}</textarea>
            <textarea placeholder="Feedback..." class="choiceFeedback" data-index="${index}" rows="3" 
                      style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; font-family: inherit;">${choice ? choice.feedback : ''}</textarea>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div>
                    <label style="display: flex; align-items: center; gap: 5px;">
                        <input type="checkbox" class="choiceCorrect" data-index="${index}" ${choice && choice.correct ? 'checked' : ''}>
                        <span>Correct Answer</span>
                    </label>
                </div>
                <div>
                    <input type="number" placeholder="Points" class="choicePoints" data-index="${index}" value="${choice ? choice.points : 0}" 
                           style="width: 100%; padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px;">
                </div>
                <div>
                    <input type="number" placeholder="XP" class="choiceXP" data-index="${index}" value="${choice ? choice.xp : 0}" 
                           style="width: 100%; padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px;">
                </div>
            </div>
        </div>
    `;
}

function handleScenarioSubmit(event) {
    event.preventDefault();
    
    const id = document.getElementById('scenarioId').value;
    const isEdit = !!id;
    
    // Gather form data
    const scenario = {
        id: isEdit ? parseInt(id) : SCENARIOS_DATA.length + 1,
        title: document.getElementById('scenarioTitle').value,
        category: document.getElementById('scenarioCategory').value,
        difficulty: document.getElementById('scenarioDifficulty').value,
        type: document.getElementById('scenarioType').value,
        text: document.getElementById('scenarioText').value,
        choices: []
    };
    
    // Gather choices
    for (let i = 0; i < 4; i++) {
        const text = document.querySelector(`.choiceText[data-index="${i}"]`).value;
        const feedback = document.querySelector(`.choiceFeedback[data-index="${i}"]`).value;
        const correct = document.querySelector(`.choiceCorrect[data-index="${i}"]`).checked;
        const points = parseInt(document.querySelector(`.choicePoints[data-index="${i}"]`).value) || 0;
        const xp = parseInt(document.querySelector(`.choiceXP[data-index="${i}"]`).value) || 0;
        
        scenario.choices.push({
            text,
            feedback,
            correct,
            points,
            xp,
            branch: null
        });
    }
    
    // Validate at least one correct answer
    if (!scenario.choices.some(c => c.correct)) {
        alert('At least one choice must be marked as correct!');
        return;
    }
    
    // Add or update scenario
    if (isEdit) {
        const index = SCENARIOS_DATA.findIndex(s => s.id === parseInt(id));
        if (index >= 0) {
            SCENARIOS_DATA[index] = scenario;
            alert('Scenario updated successfully!');
        }
    } else {
        SCENARIOS_DATA.push(scenario);
        alert('Scenario added successfully!');
    }
    
    showScenarioManager();
}

// Player Data Viewer
function showPlayerDataViewer() {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }
    
    showScreen('playerDataScreen');
    loadPlayerData();
}

function loadPlayerData() {
    const container = document.getElementById('playerDataList');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">Current Player</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <div style="color: #999; font-size: 0.9em;">Name</div>
                    <div style="font-weight: bold; color: #333;">${gameState.player.name}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Email</div>
                    <div style="font-weight: bold; color: #333;">${gameState.player.email}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Organization</div>
                    <div style="font-weight: bold; color: #333;">${gameState.player.organization}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Level</div>
                    <div style="font-weight: bold; color: #667eea;">${gameState.player.level}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Total Score</div>
                    <div style="font-weight: bold; color: #667eea;">${gameState.player.totalScore}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">VetCoins</div>
                    <div style="font-weight: bold; color: #fbbf24;">${gameState.player.vetCoins}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Cases Completed</div>
                    <div style="font-weight: bold; color: #4ade80;">${gameState.player.casesCompleted}</div>
                </div>
                <div>
                    <div style="color: #999; font-size: 0.9em;">Current Streak</div>
                    <div style="font-weight: bold; color: #f59e0b;">${gameState.player.consecutiveDays} days</div>
                </div>
            </div>
        </div>
        
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">All Players (Leaderboard)</h3>
            ${gameState.leaderboard.length > 0 ? gameState.leaderboard.map((player, index) => `
                <div style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between;">
                    <div>
                        <div style="font-weight: bold;">#${index + 1} ${player.name}</div>
                        <div style="font-size: 0.85em; color: #999;">${player.organization} - Level ${player.level}</div>
                    </div>
                    <div style="font-weight: bold; color: #667eea;">${player.score} pts</div>
                </div>
            `).join('') : '<p style="text-align: center; color: #999; padding: 20px;">No other players yet</p>'}
        </div>
    `;
}

// Tournament Manager
function showTournamentManager() {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }
    
    showScreen('tournamentManagerScreen');
    loadTournamentManager();
}

function loadTournamentManager() {
    const container = document.getElementById('tournamentManagerContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Active Tournaments</h3>
            ${gameState.tournaments.active.length > 0 ? gameState.tournaments.active.map(t => `
                <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #667eea; margin-bottom: 5px;">${t.name}</div>
                    <div style="font-size: 0.9em; color: #666;">Category: ${t.category} | Entry Fee: ${t.entryFee} coins</div>
                    <div style="font-size: 0.85em; color: #999;">Ends: ${new Date(t.endDate).toLocaleString()}</div>
                </div>
            `).join('') : '<p style="text-align: center; color: #999; padding: 20px;">No active tournaments</p>'}
        </div>
        
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">Player Tournament History</h3>
            ${gameState.tournaments.userParticipation.length > 0 ? gameState.tournaments.userParticipation.map(p => `
                <div style="background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #333; margin-bottom: 5px;">
                        ${p.completed ? '✅' : '🎮'} ${p.tournamentId}
                    </div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${p.completed ? `Rank: #${p.rank} | Score: ${p.totalScore} | Accuracy: ${p.accuracy}%` : 'In Progress'}
                    </div>
                </div>
            `).join('') : '<p style="text-align: center; color: #999; padding: 20px;">No tournament participation yet</p>'}
        </div>
    `;
}

// Settings Editor
function showSettingsEditor() {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }
    
    showScreen('settingsEditorScreen');
    loadSettingsEditor();
}

function loadSettingsEditor() {
    const container = document.getElementById('settingsEditorContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">VetCoins Rewards</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                ${Object.keys(COIN_REWARDS).map(key => `
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #666;">${key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input type="number" value="${COIN_REWARDS[key]}" onchange="updateCoinReward('${key}', this.value)" 
                               style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px;">
            <h3 style="color: #333; margin-bottom: 20px;">Admin Email Addresses</h3>
            <p style="color: #666; margin-bottom: 15px;">Current authorized emails:</p>
            <ul style="list-style: none; padding: 0;">
                ${ADMIN_EMAILS.map(email => `
                    <li style="padding: 10px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;">
                        ✉️ ${email}
                    </li>
                `).join('')}
            </ul>
            <p style="color: #999; font-size: 0.9em; margin-top: 15px;">
                To add more admin emails, edit the ADMIN_EMAILS array in game-admin.js
            </p>
        </div>
    `;
}

function updateCoinReward(key, value) {
    COIN_REWARDS[key] = parseInt(value);
    alert(`Updated ${key} to ${value} coins`);
}

