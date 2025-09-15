// verification.js - Run with Node.js to check if changes are still implemented
const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'js');
const results = {
    passed: [],
    failed: []
};

// Check for specific code patterns that should be present after our changes
const checks = [
    {
        file: 'uiManager.js',
        patterns: [
            'ctx.textAlign = \'center\';',
            'ctx.save()',
            'ctx.restore()'
        ]
    },
    {
        file: 'characterManager.js',
        patterns: [
            'ctx.save()',
            'ctx.restore()',
            'if (!this.selectedCharacter && this.characters'
        ]
    },
    {
        file: 'gameState.js',
        patterns: [
            'setDifficulty',
            'const validAmount = typeof amount === \'number\'',
            'this.difficulty = null;'
        ]
    },
    {
        file: 'inputManager.js',
        patterns: [
            'const scaleX = this.canvas.width',
            'const scaleY = this.canvas.height',
            'this.isPassiveSupported'
        ]
    },
    {
        file: 'obstacles.js',
        patterns: [
            'const activeRange =',
            'const distanceToCenter =',
            'ctx.save()',
            'ctx.restore()'
        ]
    },
    {
        file: 'particles.js',
        patterns: [
            'ctx.save()',
            'if (this.particles.length === 0) return;',
            'const particlesByColor = {}'
        ]
    }
];

// Run the checks
console.log('Checking for implemented changes...');
console.log('-----------------------------------');

checks.forEach(check => {
    const filePath = path.join(jsDir, check.file);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ File not found: ${check.file}`);
            results.failed.push(check.file);
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        let allFound = true;
        let missing = [];
        
        check.patterns.forEach(pattern => {
            if (!content.includes(pattern)) {
                allFound = false;
                missing.push(pattern);
            }
        });
        
        if (allFound) {
            console.log(`✅ ${check.file}: All changes found!`);
            results.passed.push(check.file);
        } else {
            console.log(`❌ ${check.file}: Missing some changes`);
            console.log(`   Missing: ${missing.join(', ')}`);
            results.failed.push(check.file);
        }
    } catch (error) {
        console.error(`Error checking ${check.file}:`, error.message);
        results.failed.push(check.file);
    }
});

console.log('\n-----------------------------------');
console.log(`Summary: ${results.passed.length} files have all changes, ${results.failed.length} files need updating`);
console.log(`Files that need updating: ${results.failed.join(', ') || 'None'}`);