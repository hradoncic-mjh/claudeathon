# ClueChaser - Veterinary Diagnosis Game

## 🎮 Latest Updates

### All Requested Changes Implemented:

1. ✅ **Demo Reveal uses Current Score** - Button now captures score at moment of clicking
2. ✅ **Dynamic Clue Timing** - Intervals calculated as 60 seconds / number of clues
3. ✅ **Variable Clue Count** - Games can have 1-20 clues (not fixed at 6)
4. ✅ **Image Credit Support** - Creative Commons attribution displayed over images
5. ✅ **New Stethoscope Game** - Heart murmur diagnosis game with stethoscope image
6. ✅ **Separated JSON Files** - Each game is now its own .json file

---

## 📁 File Structure

```
cluechaser.html                 Main game file
stethoscope.png                 Stethoscope image for heart murmur game
canine-parvovirus.json          Parvovirus diagnosis game
cushings-disease.json           Cushing's disease diagnosis game
heartworm-disease.json          Heartworm diagnosis game
bloat-gdv.json                  Bloat/GDV emergency game
addisons-disease.json           Addison's disease diagnosis game
heart-murmur.json               NEW! Heart auscultation game
```

**IMPORTANT:** All files must be in the same directory for the game to work properly.

---

## 🚀 How to Use

### Quick Start:
1. Place all files (HTML, JSON, and PNG) in the same folder
2. Open `cluechaser.html` in a web browser
3. Select a game from the menu
4. Start playing!

### For Web Hosting:
- Upload all files to the same directory on your web server
- Access the HTML file via your URL
- All references are relative, so no configuration needed

---

## 🎯 How the Game Works Now

### Dynamic Clue Intervals:
The game automatically calculates when to reveal clues based on the total number:

- **1 clue**: Revealed immediately (all 60 seconds to guess)
- **2 clues**: One every 30 seconds
- **3 clues**: One every 20 seconds
- **4 clues**: One every 15 seconds
- **6 clues**: One every 10 seconds (like before)
- **10 clues**: One every 6 seconds
- **20 clues**: One every 3 seconds

**Formula**: `Interval = 60 seconds / number of clues`

### Scoring:
- Starts at maximum points (defined in JSON)
- Decreases linearly over 60 seconds
- **Demo Reveal** now captures your **current score** when clicked
- Example: Click demo at 40s with max 1000 → you get ~667 points

### Clue Requirements:
Each clue must have **at least one** of the following:
- `text`: String describing the clue
- `image`: URL to an image
- Both text and image together

---

## 📋 JSON File Format

### Complete Structure:
```json
{
    "id": "unique-game-id",
    "title": "Display Title",
    "hint": "Brief description",
    "maxScore": 1200,
    "clues": [
        {
            "text": "Clue description (optional if image provided)",
            "image": "path/to/image.png",
            "imageCredit": "Image: CC0 Public Domain",
            "explanation": "How this clue relates to the answer"
        }
    ],
    "answers": ["primary answer", "alternative"]
}
```

### Field Explanations:

#### Required Top-Level Fields:
- **id**: Unique identifier (lowercase, hyphens, no spaces)
- **title**: Displayed on game selection screen
- **hint**: Game description
- **maxScore**: Maximum points possible (number)
- **clues**: Array of 1-20 clue objects
- **answers**: Array of accepted answers (case-insensitive matching)

#### Clue Object Fields:
- **text** (optional): Text description of the clue
- **image** (optional): Relative or absolute URL to image
- **imageCredit** (optional): Attribution text for image (e.g., "CC0 Public Domain")
- **explanation** (required): How the clue relates to the answer

**IMPORTANT**: Each clue must have `text`, `image`, or both. A clue with neither will fail validation.

---

## 🆕 New Heart Murmur Game

Located in `heart-murmur.json`, this game features:

- **Stethoscope image** from the provided upload
- **6 clues** about cardiac auscultation
- **Image credit**: "Image: CC0 Public Domain"
- **Focus**: Diagnosing heart murmurs through physical examination
- **Max score**: 1000 points

### Key Learning Points:
1. Stethoscope is the primary diagnostic tool
2. Murmurs graded I-VI based on loudness
3. Common in older small breed dogs
4. Requires echocardiogram for definitive diagnosis

---

## 🎨 Using Images in Your Games

### Image Placement Options:

#### Option 1: Same Directory (Simplest)
```json
"image": "my-image.png"
```
Place image in same folder as HTML file.

#### Option 2: Subdirectory
```json
"image": "images/my-image.png"
```
Create an `images` folder in the same directory.

#### Option 3: External URL
```json
"image": "https://example.com/images/my-image.jpg"
```
Use any publicly accessible URL.

### Image Credits:
If your image requires attribution (Creative Commons, etc.):
```json
{
    "text": "Optional text clue",
    "image": "image.png",
    "imageCredit": "Photo by Name / CC BY 4.0",
    "explanation": "..."
}
```

The credit will display below the image when revealed.

---

## ➕ Adding New Games

### Step 1: Create JSON File
Create a new file like `my-game.json` with proper structure (see format above).

### Step 2: Update HTML
Open `cluechaser.html` and find this section (around line 977):
```javascript
const GAME_FILES = [
    'canine-parvovirus.json',
    'cushings-disease.json',
    'heartworm-disease.json',
    'bloat-gdv.json',
    'addisons-disease.json',
    'heart-murmur.json'
];
```

Add your game:
```javascript
const GAME_FILES = [
    'canine-parvovirus.json',
    'cushings-disease.json',
    'heartworm-disease.json',
    'bloat-gdv.json',
    'addisons-disease.json',
    'heart-murmur.json',
    'my-game.json'  // <-- Add here
];
```

### Step 3: Test
Refresh the page and your game should appear in the selection menu!

---

## 🔧 Clue Count Guidelines

### Recommended by Difficulty:

- **1-3 clues**: Very hard (minimal information)
- **4-6 clues**: Medium difficulty (balanced)
- **7-10 clues**: Easy (lots of hints)
- **11-20 clues**: Very easy (rapid-fire clues)

### Timing Examples:

| Clues | Interval | Use Case |
|-------|----------|----------|
| 2 | 30s each | Expert challenge |
| 4 | 15s each | Quick game |
| 6 | 10s each | Standard (current games) |
| 8 | 7.5s each | Rapid hints |
| 12 | 5s each | Beginner friendly |

---

## 🎓 Creating Educational Games

### Best Practices:

1. **Progressive Difficulty**: Order clues from general → specific
2. **Educational Value**: Each clue should teach something
3. **Clear Explanations**: Help players learn why each clue matters
4. **Visual Aids**: Use images to reinforce learning
5. **Multiple Answers**: Include common variations and abbreviations

### Example Clue Progression:
```
Clue 1: General category (e.g., "A viral disease")
Clue 2: Affected population (e.g., "Common in puppies")
Clue 3: Main symptom (e.g., "Bloody diarrhea")
Clue 4: Diagnostic test (e.g., "Fecal SNAP test")
Clue 5: Specific detail (e.g., "Attacks intestinal lining")
Clue 6: Near give-away (e.g., "Prevented by vaccination")
```

---

## 🐛 Troubleshooting

### Game Not Loading:
**Error**: "Error loading games..."
**Solution**: 
- Check that all JSON files are in the same directory as the HTML
- Verify JSON syntax (use a JSON validator)
- Check browser console for specific errors

### Image Not Displaying:
**Possible causes**:
- File path is incorrect
- Image file doesn't exist at specified location
- External URL is broken or requires authentication
- Browser blocked mixed content (HTTP image on HTTPS site)

### Game Validation Fails:
The game validates on load. Check for:
- Missing required fields (id, title, maxScore, clues, answers)
- Clue count outside 1-20 range
- Clues without both text and image (need at least one)
- Invalid JSON syntax

### Demo Button Score:
If demo button shows unexpected score:
- It captures the **current** score at click time
- Score decreases every second
- Click at 30 seconds = ~50% of max score
- Click at 60 seconds = 100% of max score

---

## 📊 Current Game Collection

| Game | Clues | Max Score | Difficulty |
|------|-------|-----------|------------|
| Canine Parvovirus | 6 | 1200 | Medium |
| Cushing's Disease | 6 | 1200 | Medium |
| Heartworm Disease | 6 | 1200 | Medium |
| Bloat/GDV | 6 | 1500 | High (emergency) |
| Addison's Disease | 6 | 1200 | Medium |
| Heart Murmur ⭐NEW | 6 | 1000 | Medium |

All games use the standard 10-second interval (6 clues in 60 seconds).

---

## 🎨 Customization

### Changing Game Colors:
Edit CSS variables in `cluechaser.html` (lines 9-17):
```css
:root {
    --neon-cyan: #00ffff;      /* Timer, borders */
    --neon-magenta: #ff00ff;   /* Score, accents */
    --neon-yellow: #ffff00;    /* Clue numbers */
    --dark-bg: #0a0a0f;        /* Background */
    --card-bg: #1a1a2e;        /* Card backgrounds */
}
```

### Changing Total Time:
Find `timeRemaining = 60;` (around line 1052) and change to desired seconds.
Clue intervals will automatically adjust!

### Hiding Demo Button:
Remove or comment out this section (around line 1004):
```html
<!-- <button class="demo-btn" id="demoBtn">Demo Reveal - Show Answer</button> -->
```

---

## 💡 Advanced Features

### Image-Only Clues:
Perfect for visual diagnosis:
```json
{
    "text": null,
    "image": "xray-image.jpg",
    "imageCredit": "Radiograph courtesy of...",
    "explanation": "X-ray shows characteristic pattern..."
}
```

### Text-Only Clues:
Standard clinical descriptions:
```json
{
    "text": "Patient presents with lethargy",
    "image": null,
    "explanation": "Lethargy indicates systemic illness..."
}
```

### Combined Clues:
Maximum educational value:
```json
{
    "text": "Enlarged heart on radiograph",
    "image": "chest-xray.jpg",
    "imageCredit": "CC BY-SA 4.0",
    "explanation": "Cardiomegaly visible as increased..."
}
```

---

## 🌐 Browser Compatibility

**Tested on**:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requires**:
- JavaScript enabled
- Modern browser (ES6+ support)
- Local file access OR web server for JSON loading

---

## 📝 License & Attribution

### Game Framework:
- **Name**: ClueChaser
- **Type**: Educational word game
- **Style**: Retro-futuristic cyberpunk

### Stethoscope Image:
- **File**: `stethoscope.png`
- **License**: CC0 Public Domain (as indicated)
- **Usage**: Heart Murmur diagnosis game

### Fonts:
- **Orbitron**: Google Fonts (SIL Open Font License)
- **Share Tech Mono**: Google Fonts (SIL Open Font License)

---

## 🔄 Updates Summary

### What Changed:

1. **Score Calculation**: Demo button now captures actual current score
2. **Timing System**: Dynamic calculation based on clue count (1-20 supported)
3. **File Structure**: JSON separated from HTML for easier management
4. **Validation**: Added checks for clue count and required fields
5. **Image Credits**: Support for attribution text on images
6. **New Game**: Heart murmur diagnosis with stethoscope visual

### Backward Compatibility:
- All existing features maintained
- Previous game structure still works
- New features are additive only

---

## 📧 Need Help?

**Common Issues**:
1. Files not loading → Check they're in same directory
2. Images not showing → Verify file paths
3. JSON errors → Use online validator
4. Game not appearing → Check console for validation errors

**Development Tips**:
- Use browser dev tools (F12) to see errors
- Test JSON in validator before adding to game
- Start with 6 clues for standard difficulty
- Always test on mobile devices too

---

## 🎯 Quick Reference

**Minimum Valid Game**:
```json
{
    "id": "test",
    "title": "Test Game",
    "hint": "A test",
    "maxScore": 100,
    "clues": [
        {
            "text": "Only clue",
            "image": null,
            "explanation": "This is the answer"
        }
    ],
    "answers": ["test"]
}
```

**File Checklist**:
- [ ] cluechaser.html (main file)
- [ ] All .json game files
- [ ] Any referenced image files
- [ ] All in same directory

Happy gaming! 🎮🐕
