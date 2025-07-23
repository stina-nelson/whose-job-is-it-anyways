        const teamData = [
            {
                name: 'Laura',
                avatar: 'avatars/laura.png',
                tasks: ['office supplies', 'snacks and drinks', 'office vendor management', 'internet troubleshooting and basic IT', 'Alta Open management', 'property manager liaison']
            },
            {
                name: 'Deena',
                avatar: 'avatars/deena.png',
                tasks: ['visas', 'benefits', 'leave', 'HR business partnership', 'employee disputes', 'review cycles', 'sweet treat drawer', 'calibrations', 'laptop ordering']
            },
            {
                name: 'Christina',
                avatar: 'avatars/christina.png',
                tasks: ['onboarding', 'team events', 'swag store', 'company culture and engagement', 'Vollues prizes', 'Demo Weeks', 'employee appreciation gifts']
            }
        ];

        let allTasks = [];
        let currentTask = null;
        let usedTasks = [];
        let score = 0;
        let attempts = 0;
        let questionsLeft = 10;

        function initGame() {
            console.log("Initializing game...");
            // Build task list
            allTasks = [];
            teamData.forEach(member => {
                member.tasks.forEach(task => {
                    allTasks.push({
                        task: task,
                        owner: member.name
                    });
                });
            });
            console.log("Tasks loaded:", allTasks.length);
            startNewRound();
        }

        function startNewRound() {
            console.log("Starting new round, questions left:", questionsLeft);
            
            if (questionsLeft <= 0) {
                endGame();
                return;
            }

            // Reset task pool if empty
            if (usedTasks.length >= allTasks.length) {
                usedTasks = [];
            }

            // Pick a random unused task
            let availableTasks = allTasks.filter(taskObj => !usedTasks.includes(taskObj.task));
            currentTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
            usedTasks.push(currentTask.task);

            // Update display
            document.getElementById('currentTask').textContent = `Who owns: "${currentTask.task}"?`;
            document.getElementById('feedback').classList.add('hidden');
            document.getElementById('questionsLeft').textContent = questionsLeft;

            displayTeamMembers();
        }

        function displayTeamMembers() {
            const container = document.getElementById('teamMembers');
            container.innerHTML = '';
            
            teamData.forEach(member => {
                const button = document.createElement('button');
                button.className = 'member-btn';
                button.onclick = () => checkAnswer(member.name);
                
                const avatar = document.createElement('img');
                avatar.src = member.avatar;
                avatar.alt = member.name;
                avatar.className = 'member-avatar';
                avatar.onerror = () => {
                    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=ffb347&color=ff7f50&size=70`;
                };
                
                const name = document.createElement('div');
                name.textContent = member.name;
                
                button.appendChild(avatar);
                button.appendChild(name);
                container.appendChild(button);
            });
        }

        function checkAnswer(guess) {
            attempts++;
            document.getElementById('attempts').textContent = attempts;
            
            const feedback = document.getElementById('feedback');
            feedback.classList.remove('hidden');
            
            if (guess === currentTask.owner) {
                score++;
                document.getElementById('score').textContent = score;
                
                feedback.textContent = `✅ Correct! ${guess} owns "${currentTask.task}"`;
                feedback.className = 'feedback correct';
                
                questionsLeft--;
                setTimeout(startNewRound, 2000);
            } else {
                feedback.textContent = `❌ Try again!`;
                feedback.className = 'feedback incorrect';
                
                setTimeout(() => {
                    if (guess === 'Laura') {
                        showPopup("Did you just guess Laura because she's closest to you right now?");
                    } else if (guess === 'Deena') {
                        showPopup("how am I supposed to live, laugh, love in these conditions?");
                    } else if (guess === 'Christina') {
                        showPopup("you're killin me, smalls");
                    }
                }, 1000);
            }
        }

        function endGame() {
            const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
            document.getElementById('currentTask').textContent = `Game Complete! Score: ${score}/10 (${accuracy}%)`;
            document.getElementById('teamMembers').innerHTML = '<button class="reset-btn" onclick="resetGame()">Play Again</button>';
        }

        function resetGame() {
            score = 0;
            attempts = 0;
            questionsLeft = 10;
            usedTasks = [];
            document.getElementById('score').textContent = score;
            document.getElementById('attempts').textContent = attempts;
            startNewRound();
        }

        function showPopup(message) {
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-message">${message}</div>
                    <button class="popup-button" onclick="this.closest('.popup-overlay').remove()">OK</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Start the game when page loads
        document.addEventListener('DOMContentLoaded', initGame);
