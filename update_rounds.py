import re

# Read the file
with open('whose-job-is-it-anyways.html', 'r') as f:
    content = f.read()

# Replace the startNewRound function
old_function = r'function startNewRound\(\) \{[^}]*if \(usedTasks\.length >= allTasks\.length\) usedTasks = \[\];[^}]*let availableTasks = allTasks\.filter\(taskObj => !usedTasks\.includes\(taskObj\.task\)\);[^}]*currentTaskObj = availableTasks\[Math\.floor\(Math\.random\(\) \* availableTasks\.length\)\];[^}]*currentTask = currentTaskObj\.task;[^}]*usedTasks\.push\(currentTask\);[^}]*document\.getElementById\(\'currentTask\'\)\.textContent = `Who owns: "\$\{currentTask\}"\?`;[^}]*document\.getElementById\(\'feedback\'\)\.classList\.add\(\'hidden\'\);[^}]*displayTeamMembers\(\);[^}]*\}'

new_function = '''function startNewRound() {
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
        }'''

content = re.sub(old_function, new_function, content, flags=re.DOTALL)

# Add endRound function after startNewRound
end_round_function = '''
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

# Insert after the startNewRound function
content = re.sub(r'(function startNewRound\(\) \{[^}]*\})', r'\1' + end_round_function, content, flags=re.DOTALL)

# Write back
with open('whose-job-is-it-anyways.html', 'w') as f:
    f.write(content)

print("Updated round system!")
