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
        function setPlayerName() {
            showCustomPrompt("Enter your name for the leaderboard:", (playerName) => {
                if (playerName && playerName.trim()) {
                    currentPlayer = playerName.trim();
                    showCustomPopup("Name updated to: " + currentPlayer);
                    saveScore();
                } else {
                    showCustomPopup("Name not changed.");
                }
            });
        }

        function toggleLeaderboard() {
            const section = document.getElementById("leaderboardSection");
            const btn = document.querySelector(".show-leaderboard-btn") || document.querySelector("button[onclick*=toggleLeaderboard]");
            
            if (section.classList.contains("hidden")) {
                section.classList.remove("hidden");
                btn.textContent = "🎯 Hide Leaderboards";
                updateLeaderboards();
            } else {
                section.classList.add("hidden");
                btn.textContent = "🏆 Show Leaderboards";
            }
        }

        function updateLeaderboards() {
            updateChampionsList();
            updateShameList();
        }

        function updateChampionsList() {
            const list = document.getElementById("championsList");
            const champions = Object.entries(playerScores)
                .filter(([name, data]) => data.attempts >= 5 && data.accuracy >= 0.8)
                .sort((a, b) => b[1].accuracy - a[1].accuracy);
            
            if (champions.length === 0) {
                list.innerHTML = "<div class=\"no-data\">No champions yet! Score 80% or better to make the list.</div>";
            } else {
                list.innerHTML = champions.map(([name, data]) => 
                    `<div class="player-entry positive">
                        <span class="player-name">${name}</span>
                        <span class="player-score positive">${data.score}/${data.attempts} (${Math.round(data.accuracy*100)}%)</span>
                    </div>`
                ).join("");
            }
        }

        function updateShameList() {
            const list = document.getElementById("shameList");
            const shame = Object.entries(playerScores)
                .filter(([name, data]) => data.attempts >= 5 && data.accuracy < 0.6)
                .sort((a, b) => a[1].accuracy - b[1].accuracy);
            
            if (shame.length === 0) {
                list.innerHTML = "<div class=\"no-data\">Everyone is doing great! (Score under 60% to appear here)</div>";
            } else {
                list.innerHTML = shame.map(([name, data]) => 
                    `<div class="player-entry negative">
                        <span class="player-name">${name}</span>
                        <span class="player-score negative">${data.score}/${data.attempts} (${Math.round(data.accuracy*100)}%)</span>
                    </div>`
                ).join("");
            }
        }

        function resetLeaderboards() {
            showCustomConfirm("Reset all leaderboard scores? This cannot be undone.", (confirmed) => {
                if (confirmed) {
                    playerScores = {};
                    localStorage.removeItem("taskGameScores");
                    updateLeaderboards();
                    showCustomPopup("All scores reset!");
                }
            });
        }
        function showCustomPopup(message) {
            const overlay = document.createElement("div");
            overlay.className = "popup-overlay";
            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-message">${message}</div>
                    <button class="popup-button" onclick="this.closest(\".popup-overlay\").remove()">OK</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        function showCustomPrompt(message, callback) {
            const overlay = document.createElement("div");
            overlay.className = "popup-overlay";
            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-message">${message}</div>
                    <input type="text" class="popup-input" placeholder="Enter your name" maxlength="20">
                    <div>
                        <button class="popup-button" onclick="submitPrompt()">Submit</button>
                        <button class="popup-button secondary" onclick="cancelPrompt()">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            const input = overlay.querySelector(".popup-input");
            input.focus();
            
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") submitPrompt();
            });
            
            window.submitPrompt = () => {
                const value = input.value.trim();
                overlay.remove();
                callback(value);
                delete window.submitPrompt;
                delete window.cancelPrompt;
            };
            
            window.cancelPrompt = () => {
                overlay.remove();
                callback(null);
                delete window.submitPrompt;
                delete window.cancelPrompt;
            };
        }

        function showCustomConfirm(message, callback) {
            const overlay = document.createElement("div");
            overlay.className = "popup-overlay";
            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-message">${message}</div>
                    <div>
                        <button class="popup-button" onclick="confirmYes()">Yes</button>
                        <button class="popup-button secondary" onclick="confirmNo()">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            window.confirmYes = () => {
                overlay.remove();
                callback(true);
                delete window.confirmYes;
                delete window.confirmNo;
            };
            
            window.confirmNo = () => {
                overlay.remove();
                callback(false);
                delete window.confirmYes;
                delete window.confirmNo;
            };
        }
        document.addEventListener('DOMContentLoaded', initGame);
