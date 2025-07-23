        const teamData = [
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
                    'employee disputes',
                    'review cycles',
                    'sweet treat drawer',
                    'calibrations',
                    'laptop ordering'
                ]
            },
            {
                name: 'Christina',
                avatar: 'avatars/christina.png',
                tasks: [
                    'onboarding',
                    'team events',
                    'swag store',
                    'company culture and engagement',
                    'Vollues prizes',
                    'Demo Weeks',
                    'employee appreciation gifts'
                ]
            }
        ];

        let allTasks = [];
        let currentTask = '';
        let currentTaskObj = null;
        let usedTasks = [];
        let score = 0;
        let attempts = 0;
        let streak = 0;
        let currentPlayer = 'Anonymous Player';
        let playerScores = JSON.parse(localStorage.getItem('taskGameScores')) || {};
        let currentRound = 1;
        let questionsInRound = 0;
        const QUESTIONS_PER_ROUND = 10;
        function initGame() {
            allTasks = [];
            teamData.forEach(member => {
                member.tasks.forEach(task => {
                    allTasks.push({
                        task: task,
                        owner: member.name
                    });
                });
            });
            startNewGame();
        }

        function startNewRound() {
            // Check if round is complete
            if (questionsInRound >= QUESTIONS_PER_ROUND) {
                endRound();
                return;
            }
        function endRound() {
            const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
            showCustomConfirm(`Round ${currentRound} Complete!

Your Score: ${score}/${attempts} (${accuracy}%)

Play another round?`, (playAgain) => {
                if (playAgain) {
                    startNewGame();
                } else {
                feedback.textContent = `❌ Try again!`;
                feedback.className = 'feedback incorrect';
                
                setTimeout(() => {
                    if (guess === 'Laura') {
                        showCustomPopup("Did you just guess Laura because she's closest to you right now?");
                    } else if (guess === 'Deena') {
                        showCustomPopup("how am I supposed to live, laugh, love in these conditions?");
                    } else if (guess === 'Christina') {
                        showCustomPopup("you're killin me, smalls");
                    }
                }, 1000);
                
                // Don't advance - let them guess again
                return;
            }
        }

        function resetGame() {
            showCustomConfirm('Reset your current game progress?', (confirmed) => {
                if (confirmed) {
                    score = 0;
                    attempts = 0;
                    streak = 0;
                    usedTasks = [];
                    document.getElementById('score').textContent = score;
                    document.getElementById('attempts').textContent = attempts;
                    document.getElementById('streak').textContent = streak;
                    startNewGame();
                }
            });
        }

        function toggleLeaderboard() {
            const section = document.getElementById('leaderboardSection');
            const btn = document.querySelector('.show-leaderboard-btn');
            
            if (section.classList.contains('hidden')) {
                section.classList.remove('hidden');
                btn.textContent = '🎯 Hide Leaderboards';
                updateLeaderboards();
            } else {
                section.classList.add('hidden');
                btn.textContent = '🏆 Show Leaderboards';
            }
        }

        function updateLeaderboards() {
            updateChampionsList();
            updateShameList();
        }

        function updateChampionsList() {
            const list = document.getElementById('championsList');
            const champions = Object.entries(playerScores)
                .filter(([name, data]) => data.attempts >= 5 && (data.score / data.attempts) >= 0.8)
                .sort((a, b) => (b[1].score / b[1].attempts) - (a[1].score / a[1].attempts));
            
            if (champions.length === 0) {
                list.innerHTML = '<div class="no-data">No champions yet! Score 80% or better to make the list.</div>';
            } else {
                list.innerHTML = champions.map(([name, data]) => 
                    `<div class="player-entry positive">
                        <span class="player-name">${name}</span>
                        <span class="player-score positive">${data.score}/${data.attempts} (${Math.round(data.score/data.attempts*100)}%)</span>
                    </div>`
                ).join('');
            }
        }

        function updateShameList() {
            const list = document.getElementById('shameList');
            const shame = Object.entries(playerScores)
                .filter(([name, data]) => data.attempts >= 5 && (data.score / data.attempts) < 0.6)
                .sort((a, b) => (a[1].score / a[1].attempts) - (b[1].score / b[1].attempts));
            
            if (shame.length === 0) {
                list.innerHTML = '<div class="no-data">Everyone\'s doing great! (Score under 60% to appear here)</div>';
            } else {
                list.innerHTML = shame.map(([name, data]) => 
                    `<div class="player-entry negative">
                        <span class="player-name">${name}</span>
                        <span class="player-score negative">${data.score}/${data.attempts} (${Math.round(data.score/data.attempts*100)}%)</span>
                    </div>`
                ).join('');
            }
        }

        function saveScore() {
            if (attempts >= 5) {
                playerScores[currentPlayer] = {
                    score: score,
                    attempts: attempts,
                    lastPlayed: new Date().toISOString()
                };
                localStorage.setItem('taskGameScores', JSON.stringify(playerScores));
                updateLeaderboards();
            }
        }

        function resetLeaderboards() {
            showCustomConfirm('Reset all leaderboard scores? This cannot be undone.', (confirmed) => {
                if (confirmed) {
                    playerScores = {};
                    localStorage.removeItem('taskGameScores');
                    updateLeaderboards();
                }
            });
        }

        function setPlayerName() {
            showCustomPrompt('Enter your name for the leaderboard:', (playerName) => {
                if (playerName && playerName.trim()) {
                    currentPlayer = playerName.trim();
                    showCustomPopup('Name updated to: ' + currentPlayer);
                    saveScore();
                } else {
                    showCustomPopup('Name not changed.');
                }
            });
        }

        function showCustomPopup(message) {
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

        function showCustomPrompt(message, callback) {
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
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
            
            const input = overlay.querySelector('.popup-input');
            input.focus();
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitPrompt();
                if (e.key === 'Escape') cancelPrompt();
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
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
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

        setInterval(() => {
            if (attempts > 0) {
                saveScore();
            }
        }, 10000);

            });
            startNewGame();
        }        document.addEventListener('DOMContentLoaded', initGame);
