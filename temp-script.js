        // Owner-defined team and tasks
        window.sampleData = [
            {
                name: 'Laura',
                avatar: 'avatars/laura.png',
                tasks: [
                    'office supplies',
                    'snacks and drinks',
                    'office vendor management',
                    'internet troubleshooting and basic IT',
                    'Alta Open management',
                    'property manager liaison'
                ]
            },
            {
                name: 'Deena',
                avatar: 'avatars/deena.png',
                tasks: [
                    'visas',
                    'benefits',
                    'leave',
                    'HR business partnership',
                    'employee disputes'
                ]
            },
            {
                name: 'Christina',
                avatar: 'avatars/christina.png',
                tasks: [
                    'onboarding',
                    'company events',
                    'swag store',
                    'company culture and engagement'
                ]
            }
        ];
        let teamData = [];
        let allTasks = [];
        let currentTask = '';
        let currentOwner = '';
        let score = 0;
        let attempts = 0;
        let streak = 0;
        let usedTasks = [];
        let playerScores = JSON.parse(localStorage.getItem('taskGameScores')) || {};
        let currentPlayer = '';

        // Custom popup function to replace browser alerts
        function showCustomPopup(message) {
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            overlay.innerHTML = `
                <div class="popup-content">
                    <div class="popup-message">${message}</div>
                    <button class="popup-button" onclick="this.parentElement.parentElement.remove()">OK</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }        function loadSampleData() {
            const sampleData = window.sampleData;
            teamData = [];
            sampleData.forEach(member => {
                teamData.push({
                    name: member.name,
                    tasks: member.tasks,
                    avatar: member.avatar
                });
            });
            // Flatten all tasks for the game
            allTasks = [];
            teamData.forEach(member => {
                member.tasks.forEach(task => {
                    allTasks.push({
                        task: task,
                        owner: member.name
                    });
                });
            });
            // Prompt for player name
            if (!promptPlayerName()) {
                currentPlayer = 'Anonymous Player';
            }
            startNewRound();
        }
        function startNewRound() {
            if (usedTasks.length >= allTasks.length) usedTasks = [];
            let availableTasks = allTasks.filter(taskObj => !usedTasks.includes(taskObj.task));
            if (availableTasks.length === 0) {
                availableTasks = allTasks;
                usedTasks = [];
            }
            const randomTaskObj = availableTasks[Math.floor(Math.random() * availableTasks.length)];
            currentTask = randomTaskObj.task;
            currentOwner = randomTaskObj.owner;
            usedTasks.push(currentTask);
            document.getElementById('currentTask').textContent = `Who owns: "${currentTask}"?`;
            document.getElementById('feedback').classList.add('hidden');
            const teamMembersDiv = document.getElementById('teamMembers');
            teamMembersDiv.innerHTML = '';
            const uniqueMembers = [...new Set(teamData.map(member => member.name))];
            const shuffledMembers = uniqueMembers.sort(() => Math.random() - 0.5);
            shuffledMembers.forEach(memberName => {
                const button = document.createElement('button');
                button.className = 'member-btn';
                button.innerHTML = `<img src=\"${getAvatarByName(memberName)}\" alt=\"${memberName}\" style=\"width:32px;height:32px;border-radius:50%;vertical-align:middle;margin-right:10px;object-fit:cover;\">${memberName}`;
                button.onclick = () => checkGuess(memberName);
                teamMembersDiv.appendChild(button);
            });
        }
        function checkGuess(guessedName) {
            attempts++;
            document.getElementById('attempts').textContent = attempts;
            const buttons = document.querySelectorAll('.member-btn');
            buttons.forEach(btn => btn.disabled = true);
            if (guessedName === currentOwner) {
                score++;
                streak++;
                document.getElementById('score').textContent = score;
                document.getElementById('streak').textContent = streak;
                const correctButton = Array.from(buttons).find(btn => btn.textContent === guessedName);
                correctButton.classList.add('correct');
                const feedback = document.getElementById('feedback');
                feedback.textContent = `✅ Correct! ${guessedName} owns "${currentTask}"`;
                feedback.className = 'feedback correct';
                feedback.classList.remove('hidden');
                setTimeout(() => {
                    if (usedTasks.length >= allTasks.length) {
                        savePlayerScore();
                        showCustomPopup(`🎉 Game completed! Final score: ${score} correct out of ${attempts} attempts. Your score has been saved to the leaderboard!`);
                        resetGame();
                    } else {
                        startNewRound();
                    }
                }, 2000);
            } else {
                streak = 0;
                document.getElementById('streak').textContent = streak;
                const incorrectButton = Array.from(buttons).find(btn => btn.textContent === guessedName);
                incorrectButton.classList.add('incorrect');
                const feedback = document.getElementById('feedback');
                feedback.textContent = `🔪 Wrong! Try again. Who owns "${currentTask}"?`;
                feedback.className = 'feedback incorrect';
                feedback.classList.remove('hidden');
                // Special popups for each member
                if (guessedName === 'Laura' && currentOwner !== 'Laura') {
                    setTimeout(() => { alert("Did you just guess Laura because she's closest to you right now?"); showCustomPopup("Did you just guess Laura because she's closest to you right now?"); }, 100);
                }
                if (guessedName === 'Deena' && currentOwner !== 'Deena') {
                    setTimeout(() => { showCustomPopup("how am I supposed to live, laugh, love in these conditions?"); }, 100);
                }
                if (guessedName === 'Christina' && currentOwner !== 'Christina') {
                    setTimeout(() => { showCustomPopup("you're killin me, smalls"); }, 100);
                }
                setTimeout(() => {
                    buttons.forEach(btn => {
                        btn.disabled = false;
                        btn.classList.remove('incorrect');
                    });
                    document.getElementById('feedback').classList.add('hidden');
                }, 1500);
            }
        }
        function resetGame() {
            savePlayerScore();
            score = 0;
            attempts = 0;
            streak = 0;
            usedTasks = [];
            document.getElementById('score').textContent = score;
            document.getElementById('attempts').textContent = attempts;
            document.getElementById('streak').textContent = streak;
            startNewRound();
        }
        function toggleLeaderboard() {
            const leaderboardSection = document.getElementById('leaderboardSection');
            if (leaderboardSection.classList.contains('hidden')) {
                leaderboardSection.classList.remove('hidden');
                updateLeaderboards();
            } else {
                leaderboardSection.classList.add('hidden');
            }
        }
        function updateLeaderboards() {
            updateChampionsList();
            updateShameList();
        }
        function updateChampionsList() {
            const championsList = document.getElementById('championsList');
            const sortedPlayers = Object.entries(playerScores)
                .filter(([name, data]) => data.correct > 0)
                .sort((a, b) => {
                    const aAccuracy = a[1].correct / a[1].attempts;
                    const bAccuracy = b[1].correct / b[1].attempts;
                    if (aAccuracy !== bAccuracy) return bAccuracy - aAccuracy;
                    return b[1].correct - a[1].correct;
                })
                .slice(0, 5);
            if (sortedPlayers.length === 0) {
                championsList.innerHTML = '<div class="no-data">No champions yet. Start playing Whose Job Is It Anyways to see who knows the team best!</div>';
                return;
            }
            championsList.innerHTML = '';
            sortedPlayers.forEach(([name, data], index) => {
                const accuracy = ((data.correct / data.attempts) * 100).toFixed(1);
                const entry = document.createElement('div');
                entry.className = 'player-entry positive';
                entry.innerHTML = `
                    <img src="${getAvatarByName(name)}" alt="${name}" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:8px;object-fit:cover;">
                    <div class="player-name" style="flex:1;">${index + 1}. ${name}</div>
                    <div class="player-score positive">${data.correct}/${data.attempts} (${accuracy}%)</div>
                `;
                championsList.appendChild(entry);
            });
        }
        function updateShameList() {
            const shameList = document.getElementById('shameList');
            const sortedPlayers = Object.entries(playerScores)
                .filter(([name, data]) => data.attempts >= 5)
                .sort((a, b) => {
                    const aAccuracy = a[1].correct / a[1].attempts;
                    const bAccuracy = b[1].correct / b[1].attempts;
                    if (aAccuracy !== bAccuracy) return aAccuracy - bAccuracy;
                    return a[1].attempts - b[1].attempts;
                })
                .slice(0, 5);
            if (sortedPlayers.length === 0) {
                shameList.innerHTML = '<div class="no-data">No shame board entries yet. Keep playing Whose Job Is It Anyways!</div>';
                return;
            }
            shameList.innerHTML = '';
            sortedPlayers.forEach(([name, data], index) => {
                const accuracy = ((data.correct / data.attempts) * 100).toFixed(1);
                const entry = document.createElement('div');
                entry.className = 'player-entry negative';
                entry.innerHTML = `
                    <img src="${getAvatarByName(name)}" alt="${name}" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:8px;object-fit:cover;">
                    <div class="player-name" style="flex:1;">${index + 1}. ${name}</div>
                    <div class="player-score negative">${data.correct}/${data.attempts} (${accuracy}%)</div>
                `;
                shameList.appendChild(entry);
            });
        }
        function savePlayerScore() {
            if (!currentPlayer || attempts === 0) return;
            if (!playerScores[currentPlayer]) {
                playerScores[currentPlayer] = { correct: 0, attempts: 0 };
            }
            playerScores[currentPlayer].correct += score;
            playerScores[currentPlayer].attempts += attempts;
            localStorage.setItem('taskGameScores', JSON.stringify(playerScores));
        }
        function resetLeaderboards() {
            if (confirm('Are you sure you want to reset all player scores? This cannot be undone.')) {
                playerScores = {};
                localStorage.removeItem('taskGameScores');
                updateLeaderboards();
            }
        }
        function promptPlayerName() {
            const playerName = prompt('Enter your name for the leaderboard:');
            if (playerName && playerName.trim()) {
                currentPlayer = playerName.trim();
                return true;
            }
            return false;
        }
        // Helper to get avatar by name
        function getAvatarByName(name) {
            const member = teamData.find(m => m.name === name);
            return member && member.avatar ? member.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
        }
        // On page load, start the game with owner-defined data
        document.addEventListener('DOMContentLoaded', function() {
            loadSampleData();
        });
