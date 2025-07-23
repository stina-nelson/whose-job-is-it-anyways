import re

with open('whose-job-is-it-anyways.html', 'r') as f:
    content = f.read()

# 1. Fix background (no more white)
content = content.replace('background: white;', 'background: linear-gradient(145deg, #fff9e6 0%, #ffe8cc 50%, #ffd9b3 100%);')

# 2. Move custom popups from correct to wrong answers  
content = re.sub(
    r'(feedback\.textContent = `✅ Correct! \$\{guess\} owns "\$\{currentTask\}"`;[\s\n]*feedback\.className = \'feedback correct\';)[\s\n]*setTimeout\(\(\) => \{[\s\S]*?if \(guess === \'Laura\'\)[\s\S]*?\}, 1000\);',
    r'\1',
    content
)

content = re.sub(
    r'(feedback\.textContent = `❌ Wrong! \$\{currentTaskObj\.owner\} owns "\$\{currentTask\}"`;[\s\n]*feedback\.className = \'feedback incorrect\';)',
    r'feedback.textContent = `❌ Try again!`;\n                feedback.className = \'feedback incorrect\';\n                \n                setTimeout(() => {\n                    if (guess === \'Laura\') {\n                        showCustomPopup("Did you just guess Laura because she\'s closest to you right now?");\n                    } else if (guess === \'Deena\') {\n                        showCustomPopup("how am I supposed to live, laugh, love in these conditions?");\n                    } else if (guess === \'Christina\') {\n                        showCustomPopup("you\'re killin me, smalls");\n                    }\n                }, 1000);\n                \n                // Don\'t advance - let them guess again\n                return;',
    content
)

# 3. Add round tracking variables
content = re.sub(
    r'(let playerScores = JSON\.parse\(localStorage\.getItem\(\'taskGameScores\'\)\) \|\| \{\};)',
    r'\1\n        let currentRound = 1;\n        let questionsInRound = 0;\n        const QUESTIONS_PER_ROUND = 10;',
    content
)

# 4. Update startNewRound for 10-question rounds
old_start_round = r'function startNewRound\(\) \{[\s\S]*?displayTeamMembers\(\);[\s\S]*?\}'
new_start_round = '''function startNewRound() {
            // Check if round is complete
            if (questionsInRound >= QUESTIONS_PER_ROUND) {
                endRound();
                return;
            }
            
            // Reset task pool if empty
            if (usedTasks.length >= allTasks.length) usedTasks = [];
            
            let availableTasks = allTasks.filter(taskObj => !usedTasks.includes(taskObj.task));
            currentTaskObj = availableTasks[Math.floor(Math.random() * availableTasks.length)];
            currentTask = currentTaskObj.task;
            
            usedTasks.push(currentTask);
            questionsInRound++;
            
            document.getElementById('currentTask').textContent = `Who owns: "${currentTask}"? (Question ${questionsInRound}/${QUESTIONS_PER_ROUND})`;
            document.getElementById('feedback').classList.add('hidden');
            
            displayTeamMembers();
        }
        
        function endRound() {
            const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
            showCustomConfirm(`Round ${currentRound} Complete!\\n\\nYour Score: ${score}/${attempts} (${accuracy}%)\\n\\nPlay another round?`, (playAgain) => {
                if (playAgain) {
                    startNewGame();
                } else {
                    document.getElementById('currentTask').textContent = `Game Over! Final Score: ${score}/${attempts} (${accuracy}%)`;
                    document.getElementById('teamMembers').innerHTML = '<button class="reset-btn" onclick="startNewGame()">Start New Game</button>';
                }
            });
        }
        
        function startNewGame() {
            currentRound++;
            questionsInRound = 0;
            usedTasks = [];
            score = 0;
            attempts = 0;
            streak = 0;
            document.getElementById('score').textContent = score;
            document.getElementById('attempts').textContent = attempts;
            document.getElementById('streak').textContent = streak;
            startNewRound();
        }'''

content = re.sub(old_start_round, new_start_round, content, flags=re.DOTALL)

with open('whose-job-is-it-anyways.html', 'w') as f:
    f.write(content)

print("Applied all fixes cleanly!")
