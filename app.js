// Rummy Score Tracker PWA - Main Application Logic

class RummyTracker {
    constructor() {
        this.players = [];
        this.scores = [];
        this.currentRound = 1;
        this.previousTotals = []; // Track previous scores for sound notifications
        this.currentZoom = 1; // Track zoom level
        this.currentHighlighting = { leaders: [], atRisk: [] }; // Track current highlighting
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadState(); // Load state from localStorage
        this.setupInstallPrompt();
        this.handleShortcuts();
    }

    // Sound Notification
    playDangerZoneSound() {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a sequence of beeps for danger alert
            const playBeep = (frequency, startTime, duration) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, startTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };
            
            // Play warning sound sequence (3 beeps)
            const now = audioContext.currentTime;
            playBeep(800, now, 0.2);        // High beep
            playBeep(600, now + 0.25, 0.2); // Medium beep  
            playBeep(800, now + 0.5, 0.2);  // High beep
            
        } catch (error) {
            console.log('Audio notification not supported:', error);
        }
    }

    // Zoom and Fullscreen Controls
    zoomIn() {
        this.currentZoom = (this.currentZoom || 1) + 0.1;
        this.applyZoom();
    }

    zoomOut() {
        this.currentZoom = Math.max(0.5, (this.currentZoom || 1) - 0.1);
        this.applyZoom();
    }

    zoomReset() {
        this.currentZoom = 1;
        this.applyZoom();
    }

    applyZoom() {
        const app = document.getElementById('app');
        app.style.transform = `scale(${this.currentZoom})`;
        app.style.transformOrigin = 'top center';
        
        // Adjust body height to prevent scroll issues
        document.body.style.height = `${100 / this.currentZoom}vh`;
        
        // Update zoom reset button to show current zoom level
        const resetBtn = document.getElementById('zoom-reset');
        resetBtn.title = `Reset Zoom (${Math.round(this.currentZoom * 100)}%)`;
    }

    toggleFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        const icon = fullscreenBtn.querySelector('i');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            document.documentElement.requestFullscreen().then(() => {
                icon.className = 'fas fa-compress';
                fullscreenBtn.title = 'Exit Fullscreen (F11)';
                fullscreenBtn.classList.add('active');
            }).catch(err => {
                console.log('Fullscreen not supported:', err);
                this.showNotification('Fullscreen not supported', 'warning');
            });
        } else {
            // Exit fullscreen
            document.exitFullscreen().then(() => {
                icon.className = 'fas fa-expand';
                fullscreenBtn.title = 'Toggle Fullscreen (F11)';
                fullscreenBtn.classList.remove('active');
            });
        }
    }

    handleKeyboardShortcuts(e) {
        // Zoom shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                this.zoomReset();
            }
        }
        
        // Fullscreen shortcut (F11)
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Setup section
        document.getElementById('player-count').addEventListener('change', () => this.updatePlayerInputs());
        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        // Game section
        document.getElementById('add-round').addEventListener('click', () => this.addRound());
        document.getElementById('new-game').addEventListener('click', () => this.newGame());

        // Zoom and fullscreen controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-reset').addEventListener('click', () => this.zoomReset());
        document.getElementById('fullscreen-toggle').addEventListener('click', () => this.toggleFullscreen());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Handle URL shortcuts
    handleShortcuts() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'new-game') {
            this.showSection('setup-section');
        }
    }

    // Player Setup
    updatePlayerInputs() {
        const count = parseInt(document.getElementById('player-count').value);
        const container = document.getElementById('player-names');
        container.innerHTML = '';

        // Default names list - will use first N names based on player count
        const defaultNames = ['Kanth', 'Hari', 'Krishna', 'Anu', 'Ranga', 'Nandu', 'Pinky', 'Kiran'];

        for (let i = 1; i <= count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i} Name`;
            input.id = `player-${i}`;
            input.required = true;
            
            // Set default value if we have a default name for this position
            if (i <= defaultNames.length) {
                input.value = defaultNames[i - 1];
            }
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.startGame();
            });
            container.appendChild(input);
        }
    }

    // Game Management
    startGame() {
        const count = parseInt(document.getElementById('player-count').value);
        this.players = [];

        // Validate player names
        for (let i = 1; i <= count; i++) {
            const name = document.getElementById(`player-${i}`).value.trim();
            if (!name) {
                this.showNotification(`Please enter name for Player ${i}`, 'warning');
                return;
            }
            this.players.push(name);
        }

        // Initialize game
        this.scores = this.players.map(() => []);
        this.previousTotals = this.players.map(() => 0); // Initialize previous totals for sound notifications
        this.currentRound = 1;

        this.showSection('game-section');
        this.addRound();
        this.saveState(); // Save initial state
        this.showNotification('Game started!', 'success');
    }

    addRound() {
        // Validate current round before adding new one (except for first round)
        if (this.currentRound > 1) {
            const validation = this.validateCurrentRound();
            if (!validation.valid) {
                this.showNotification(validation.message, 'danger');
                return;
            }
        }

        // Add new score slot for each player
        this.players.forEach((_, index) => {
            if (!this.scores[index]) this.scores[index] = [];
            this.scores[index].push(null);
        });

        this.currentRound++;
        this.updateGameBoard();
        this.saveState(); // Save state after adding a round
        
        // Highlight players based on total scores after round completion AND after game board update
        setTimeout(() => {
            this.highlightTotalScoreLeaders();
        }, 100); // Small delay to ensure DOM is updated
        
        this.autoScrollToLatest();
        
        // Check for eliminations at the start of new rounds
        this.checkAndHandleEliminations();
        
        if (this.currentRound > 2) {
            this.showNotification('Round completed! Starting new round.', 'success');
        }
    }

    newGame() {
        if (confirm('Start a new game? Current progress will be lost.')) {
            // Reset all game state completely
            this.players = [];
            this.scores = [];
            this.currentRound = 1;
            this.previousTotals = [];
            this.currentHighlighting = { leaders: [], atRisk: [] };
            
            // Clear saved state from localStorage
            this.clearState();
            
            // Reset player inputs to default
            document.getElementById('player-count').value = 8; // Reset dropdown
            this.updatePlayerInputs();
            
            this.showSection('setup-section');
            
            // Remove any existing highlighting classes and icons from DOM
            const playerCells = document.querySelectorAll('.table-cell.player-cell');
            playerCells.forEach(cell => {
                // Remove highlighting classes
                cell.classList.remove('total-leader', 'total-at-risk', 'winner', 'danger', 'warning', 'eliminated');
                
                // Clear content to be safe
                cell.innerHTML = '';
            });
        }
    }

    // Game Board Management
    updateGameBoard() {
        this.updatePlayersColumn();
        this.updateRoundsGrid();
        this.updateTotalsColumn();
        this.updateRoundInfo();
    }

    // State Management
    saveState() {
        const gameState = {
            players: this.players,
            scores: this.scores,
            currentRound: this.currentRound,
            previousTotals: this.previousTotals,
            currentHighlighting: this.currentHighlighting
        };
        localStorage.setItem('rummyGameState', JSON.stringify(gameState));
    }

    loadState() {
        const savedState = localStorage.getItem('rummyGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.players = gameState.players || [];
            this.scores = gameState.scores || [];
            this.currentRound = gameState.currentRound || 1;
            this.previousTotals = gameState.previousTotals || [];
            this.currentHighlighting = gameState.currentHighlighting || { leaders: [], atRisk: [] };

            if (this.players.length > 0) {
                this.showSection('game-section');
                this.updateGameBoard();
                this.highlightTotalScoreLeaders();
                this.autoScrollToLatest();
            } else {
                // If no players, show setup
                this.updatePlayerInputs();
            }
        } else {
            // Add a small delay to ensure DOM is fully ready, then populate default names
            setTimeout(() => {
                this.updatePlayerInputs();
            }, 100);
        }
    }

    clearState() {
        localStorage.removeItem('rummyGameState');
    }

    updatePlayersColumn() {
        const container = document.getElementById('players-column');
        container.innerHTML = '';

        // Header
        const header = this.createTableCell('Players', 'table-header');
        container.appendChild(header);

        // Player names
        this.players.forEach((name, index) => {
            const total = this.getTotalScore(index);
            const isWarning = total >= 200 && total < 230;  // Yellow/orange zone (200-229)
            const isDanger = total >= 230 && total < 250;   // Red zone (230-249)
            const isEliminated = total >= 250;              // Eliminated (250+)
            
            // Count how many "R" scores this player has
            const rCount = this.getRCount(index);
            const asterisks = '*'.repeat(rCount);
            
            let cellClass = 'player-cell';
            if (isEliminated) {
                cellClass += ' eliminated';
            } else if (isDanger) {
                cellClass += ' danger';
            } else if (isWarning) {
                cellClass += ' warning';
            }
            
            const cell = this.createPlayerCellWithStars(name, asterisks, cellClass);
            container.appendChild(cell);
        });
        
        // Reapply highlighting after creating cells
        this.reapplyStoredHighlighting();
    }

    updateRoundsGrid() {
        const container = document.getElementById('rounds-grid');
        container.innerHTML = '';

        // Create rounds columns
        for (let round = 0; round < this.currentRound - 1; round++) {
            const roundColumn = document.createElement('div');
            roundColumn.className = 'round-column';

            // Round header
            const header = this.createTableCell(`R${round + 1}`, 'table-header round-cell');
            roundColumn.appendChild(header);

            // Round scores
            this.players.forEach((_, playerIndex) => {
                const score = this.scores[playerIndex][round];
                const isEliminated = this.isPlayerEliminated(playerIndex);
                const cell = document.createElement('div');
                cell.className = 'table-cell round-cell';

                if (round === this.currentRound - 2) {
                    // Current round - input field
                    if (isEliminated) {
                        // Eliminated player - show disabled state
                        const span = document.createElement('span');
                        span.className = 'eliminated-score';
                        span.textContent = 'OUT';
                        cell.appendChild(span);
                        cell.classList.add('eliminated-cell');
                    } else {
                        // Active player - normal input
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'score-input';
                        input.placeholder = '0';
                        input.value = score !== null ? (score === 'R' ? 'R' : score) : '';
                        input.addEventListener('input', (e) => this.handleScoreInput(e, round, playerIndex));
                        input.addEventListener('blur', () => this.formatScoreInput(input));
                        input.addEventListener('focus', () => input.select());
                        cell.appendChild(input);
                    }
                } else {
                    // Previous rounds - editable display
                    if (isEliminated && score === null) {
                        // Show eliminated status for past rounds where player was eliminated
                        const span = document.createElement('span');
                        span.className = 'eliminated-score';
                        span.textContent = 'OUT';
                        cell.classList.add('eliminated-cell');
                        cell.appendChild(span);
                    } else {
                        // Normal display
                        const span = document.createElement('span');
                        span.className = `editable-score ${score === 'R' ? 'winner' : ''}`;
                        span.textContent = score !== null ? (score === 'R' ? 'R' : score) : '0';
                        
                        if (!isEliminated) {
                            span.addEventListener('click', () => this.editScore(round, playerIndex, span));
                        } else {
                            span.style.cursor = 'not-allowed';
                            span.style.opacity = '0.5';
                        }
                        cell.appendChild(span);
                    }
                }

                roundColumn.appendChild(cell);
            });

            container.appendChild(roundColumn);
        }
    }

    updateTotalsColumn() {
        const container = document.getElementById('totals-column');
        container.innerHTML = '';

        // Header
        const header = this.createTableCell('Total', 'table-header');
        container.appendChild(header);

        // Check for players entering danger zone (230+)
        let playersEnteringDangerZone = [];

        // Player totals
        this.players.forEach((_, index) => {
            const total = this.getTotalScore(index);
            const previousTotal = this.previousTotals[index] || 0;
            
            const isWarning = total >= 200 && total < 230;  // Yellow/orange zone (200-229)
            const isDanger = total >= 230 && total < 250;   // Red zone (230-249)
            const isEliminated = total >= 250;              // Eliminated (250+)
            
            // Check if player just entered danger zone (230+)
            if ((isDanger || isEliminated) && previousTotal < 230) {
                playersEnteringDangerZone.push(this.players[index]);
            }
            
            let cellClass = 'total-cell';
            if (isEliminated) {
                cellClass += ' eliminated';
            } else if (isDanger) {
                cellClass += ' danger';
            } else if (isWarning) {
                cellClass += ' warning';
            }
            
            const displayTotal = isEliminated ? 'OUT' : total;
            const cell = this.createTableCell(displayTotal, cellClass);
            container.appendChild(cell);
        });

        // Update previous totals for next comparison
        this.previousTotals = this.players.map((_, index) => this.getTotalScore(index));

        // Play sound and show notification if any player entered danger zone
        if (playersEnteringDangerZone.length > 0) {
            this.playDangerZoneSound();
            const playerNames = playersEnteringDangerZone.join(', ');
            this.showNotification(`⚠️ DANGER ZONE: ${playerNames} reached 230+ points!`, 'danger');
        }
    }

    updateRoundInfo() {
        const roundElement = document.getElementById('current-round');
        if (roundElement) {
            roundElement.textContent = this.currentRound - 1;
        }
    }

    highlightTotalScoreLeaders() {
        // Get all player cells
        const playerCells = document.querySelectorAll('.player-cell');
        
        // Remove existing total score highlighting
        playerCells.forEach(cell => {
            cell.classList.remove('total-leader', 'total-at-risk');
            // Remove icons from text content - handle both structured and simple layouts
            const playerNameDiv = cell.querySelector('.player-name');
            if (playerNameDiv) {
                playerNameDiv.textContent = playerNameDiv.textContent.replace('🏆 ', '').replace('⚠ ', '');
            } else {
                cell.textContent = cell.textContent.replace('🏆 ', '').replace('⚠ ', '');
            }
        });

        // Only highlight if we have at least one completed round
        if (this.currentRound <= 1 || !this.scores || this.scores.length === 0) {
            return;
        }

        // Calculate total scores for active players only (not eliminated)
        const activePlayers = [];
        this.players.forEach((player, index) => {
            const totalScore = this.getTotalScore(index);
            // Only include players who are not eliminated (< 250)
            if (totalScore < 250) {
                activePlayers.push({ 
                    index, 
                    player, 
                    totalScore 
                });
            }
        });

        // Need at least 2 active players to show highlighting
        if (activePlayers.length < 2) {
            return;
        }

        // Sort by total score (lowest first)
        activePlayers.sort((a, b) => a.totalScore - b.totalScore);
        
        // Find lowest and highest total scores
        const lowestTotal = activePlayers[0].totalScore;
        const highestTotal = activePlayers[activePlayers.length - 1].totalScore;
        
        // Don't highlight if all active players have the same total
        if (lowestTotal === highestTotal) {
            return;
        }

        // Find all players with lowest total score (leaders)
        const leaders = activePlayers.filter(p => p.totalScore === lowestTotal);
        
        // Find all players with highest total score (at risk)
        const atRiskPlayers = activePlayers.filter(p => p.totalScore === highestTotal);

        console.log('🏆 Leaders (lowest scores):', leaders);
        console.log('🚨 At risk (highest scores):', atRiskPlayers);

        // Store current highlighting state
        this.currentHighlighting = {
            leaders: leaders.map(l => l.index),
            atRisk: atRiskPlayers.map(a => a.index)
        };

        // Apply leader highlighting (crown for lowest total scores)
        leaders.forEach(leader => {
            const playerCell = playerCells[leader.index]; // No +1 needed since playerCells doesn't include header
            if (playerCell) {
                playerCell.classList.add('total-leader');
                // Add crown icon to the player name div if it exists, otherwise to textContent
                const playerNameDiv = playerCell.querySelector('.player-name');
                if (playerNameDiv) {
                    if (!playerNameDiv.textContent.includes('🏆')) {
                        playerNameDiv.textContent = `🏆 ${playerNameDiv.textContent}`;
                    }
                } else {
                    if (!playerCell.textContent.includes('🏆')) {
                        playerCell.textContent = `🏆 ${playerCell.textContent}`;
                    }
                }
                console.log('✅ Added total-leader class to:', playerCell.textContent);
            }
        });

        // Apply at-risk highlighting (warning for highest total scores)
        atRiskPlayers.forEach(atRisk => {
            const playerCell = playerCells[atRisk.index]; // No +1 needed since playerCells doesn't include header
            if (playerCell) {
                playerCell.classList.add('total-at-risk');
                // Add warning icon to the player name div if it exists, otherwise to textContent
                const playerNameDiv = playerCell.querySelector('.player-name');
                if (playerNameDiv) {
                    if (!playerNameDiv.textContent.includes('⚠')) {
                        playerNameDiv.textContent = `⚠ ${playerNameDiv.textContent}`;
                    }
                } else {
                    if (!playerCell.textContent.includes('⚠')) {
                        playerCell.textContent = `⚠ ${playerCell.textContent}`;
                    }
                }
                console.log('✅ Added total-at-risk class to:', playerCell.textContent);
            }
        });
    }

    reapplyStoredHighlighting() {
        const playerCells = document.querySelectorAll('.player-cell');
        
        // Apply stored leader highlighting
        this.currentHighlighting.leaders.forEach(index => {
            const playerCell = playerCells[index]; // No +1 needed since playerCells doesn't include header
            if (playerCell) {
                playerCell.classList.add('total-leader');
                // Add crown icon to the player name div if it exists, otherwise to textContent
                const playerNameDiv = playerCell.querySelector('.player-name');
                if (playerNameDiv) {
                    if (!playerNameDiv.textContent.includes('🏆')) {
                        playerNameDiv.textContent = `🏆 ${playerNameDiv.textContent}`;
                    }
                } else {
                    if (!playerCell.textContent.includes('🏆')) {
                        playerCell.textContent = `🏆 ${playerCell.textContent}`;
                    }
                }
            }
        });

        // Apply stored at-risk highlighting
        this.currentHighlighting.atRisk.forEach(index => {
            const playerCell = playerCells[index]; // No +1 needed since playerCells doesn't include header
            if (playerCell) {
                playerCell.classList.add('total-at-risk');
                // Add warning icon to the player name div if it exists, otherwise to textContent
                const playerNameDiv = playerCell.querySelector('.player-name');
                if (playerNameDiv) {
                    if (!playerNameDiv.textContent.includes('⚠')) {
                        playerNameDiv.textContent = `⚠ ${playerNameDiv.textContent}`;
                    }
                } else {
                    if (!playerCell.textContent.includes('⚠')) {
                        playerCell.textContent = `⚠ ${playerCell.textContent}`;
                    }
                }
            }
        });
    }

    createTableCell(content, className) {
        const cell = document.createElement('div');
        cell.className = `table-cell ${className}`;
        cell.textContent = content;
        return cell;
    }

    createPlayerCellWithStars(playerName, asterisks, className) {
        const cell = document.createElement('div');
        cell.className = `table-cell ${className}`;
        
        if (asterisks) {
            // Create container for stacked layout
            const starsDiv = document.createElement('div');
            starsDiv.className = 'r-score-stars';
            starsDiv.textContent = asterisks;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'player-name';
            nameDiv.textContent = playerName;
            
            cell.appendChild(starsDiv);
            cell.appendChild(nameDiv);
        } else {
            cell.textContent = playerName;
        }
        
        return cell;
    }

    // Score Management
    handleScoreInput(event, round, playerIndex) {
        const value = event.target.value.toString().trim().toUpperCase();
        
        // Allow empty input
        if (value === '') {
            this.scores[playerIndex][round] = null;
            event.target.className = 'score-input';
            this.updateTotalsColumn();
            return;
        }

        // Handle "R" for winner
        if (value === 'R') {
            // Check if another player already has R for this round
            const existingRCount = this.countRsInRound(round);
            const currentPlayerHasR = this.scores[playerIndex][round] === 'R';
            
            if (existingRCount > 0 && !currentPlayerHasR) {
                event.target.value = '';
                event.target.className = 'score-input danger';
                this.showNotification('Only one player can win each round!', 'warning');
                return;
            }
            
            this.scores[playerIndex][round] = 'R';
            event.target.className = 'score-input winner';
            this.updateTotalsColumn();
            return;
        }

        // Handle numeric input
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            if (numValue >= 2 && numValue <= 80) {
                this.scores[playerIndex][round] = numValue;
                event.target.className = 'score-input';
            } else {
                event.target.className = 'score-input danger';
                this.showNotification('Enter a number between 2-80 or R for winner', 'warning');
                return;
            }
        } else {
            event.target.className = 'score-input danger';
            this.showNotification('Enter a number between 2-80 or R for winner', 'warning');
            return;
        }
        
        this.updateTotalsColumn();
        this.saveState(); // Save state after score input
        
        // Check if player will be eliminated after this round
        const newTotal = this.getTotalScore(playerIndex);
        if (newTotal >= 250) {
            this.showNotification(`${this.players[playerIndex]} will be eliminated after this round (${newTotal} points)!`, 'warning');
        }
    }

    formatScoreInput(input) {
        const value = input.value.toString().trim().toUpperCase();
        if (value === 'R') {
            input.value = 'R';
            input.className = 'score-input winner';
        }
    }

    editScore(round, playerIndex, element) {
        const currentScore = this.scores[playerIndex][round];
        const displayScore = currentScore === 'R' ? 'R' : (currentScore || '');
        const newScore = prompt(
            `Edit score for ${this.players[playerIndex]} - Round ${round + 1}:\n(Enter 2-80 or 'R' for round winner)`, 
            displayScore
        );
        
        if (newScore !== null) {
            const cleanValue = newScore.toString().trim().toUpperCase();
            
            if (cleanValue === '') {
                this.scores[playerIndex][round] = null;
                element.textContent = '0';
                element.className = 'editable-score';
            } else if (cleanValue === 'R') {
                // Check for existing R in round
                const existingRCount = this.countRsInRound(round);
                const currentPlayerHasR = this.scores[playerIndex][round] === 'R';
                
                if (existingRCount > 0 && !currentPlayerHasR) {
                    this.showNotification('Only one player can win each round!', 'warning');
                    return;
                }
                
                this.scores[playerIndex][round] = 'R';
                element.textContent = 'R';
                element.className = 'editable-score winner';
            } else {
                const numValue = parseInt(cleanValue);
                if (!isNaN(numValue) && numValue >= 2 && numValue <= 80) {
                    this.scores[playerIndex][round] = numValue;
                    element.textContent = numValue;
                    element.className = 'editable-score';
                } else {
                    this.showNotification('Enter a number between 2-80 or R for winner', 'warning');
                    return;
                }
            }
            
            this.updateTotalsColumn();
            this.saveState(); // Save state after editing a score
        }
    }

    countRsInRound(round) {
        let count = 0;
        for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
            if (this.scores[playerIndex][round] === 'R') {
                count++;
            }
        }
        return count;
    }

    getTotalScore(playerIndex) {
        if (!this.scores[playerIndex]) return 0;
        return this.scores[playerIndex].reduce((sum, score) => {
            if (score === 'R' || score === null) return sum;
            return sum + (score || 0);
        }, 0);
    }

    // Count how many "R" scores a player has
    getRCount(playerIndex) {
        if (!this.scores[playerIndex]) return 0;
        return this.scores[playerIndex].filter(score => score === 'R').length;
    }

    // Check and handle player eliminations at the start of new rounds
    checkAndHandleEliminations() {
        this.players.forEach((player, index) => {
            const total = this.getTotalScore(index);
            if (total >= 250) {
                this.showNotification(`${player} is eliminated with ${total} points!`, 'danger');
            }
        });
        
        // Update the game board to reflect elimination status
        setTimeout(() => this.updateGameBoard(), 100);
    }

    // Check if player is eliminated (250+ points) - only check BEFORE current round
    isPlayerEliminated(playerIndex) {
        // Don't count the current round when checking elimination status
        const currentRoundIndex = this.currentRound - 2;
        if (currentRoundIndex < 0) return false;
        
        let total = 0;
        for (let round = 0; round < currentRoundIndex; round++) {
            const score = this.scores[playerIndex][round];
            if (score !== 'R' && score !== null && score !== undefined) {
                total += (score || 0);
            }
        }
        
        return total >= 250;
    }

    // Get total score including current round
    getTotalScore(playerIndex) {
        if (!this.scores[playerIndex]) return 0;
        return this.scores[playerIndex].reduce((sum, score) => {
            if (score === 'R' || score === null) return sum;
            return sum + (score || 0);
        }, 0);
    }

    // Get active (non-eliminated) players
    getActivePlayers() {
        return this.players.filter((_, index) => !this.isPlayerEliminated(index));
    }

    validateCurrentRound() {
        const currentRoundIndex = this.currentRound - 2;
        if (currentRoundIndex < 0) return { valid: true };
        
        let rCount = 0;
        let invalidPlayers = [];
        let emptyPlayers = [];
        
        // First pass: check for R count and identify empty players
        for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
            const score = this.scores[playerIndex][currentRoundIndex];
            
            // Skip validation for eliminated players (they should have null scores)
            if (this.isPlayerEliminated(playerIndex)) {
                // Eliminated players should not have scores for this round
                if (score !== null && score !== undefined) {
                    this.scores[playerIndex][currentRoundIndex] = null;
                }
                continue;
            }
            
            if (score === null || score === undefined) {
                emptyPlayers.push(playerIndex);
            } else if (score === 'R') {
                rCount++;
            }
        }
        
        // Check if we have at least one winner (R) before auto-filling
        if (rCount === 0) {
            return {
                valid: false,
                message: 'Every round must have exactly one winner (R).'
            };
        }
        
        if (rCount > 1) {
            return {
                valid: false,
                message: 'Only one player can win each round.'
            };
        }
        
        // Auto-fill empty scores with 20 for active players
        emptyPlayers.forEach(playerIndex => {
            this.scores[playerIndex][currentRoundIndex] = 20;
        });
        
        // Second pass: validate all scores are in proper range
        for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
            const score = this.scores[playerIndex][currentRoundIndex];
            
            // Skip eliminated players
            if (this.isPlayerEliminated(playerIndex)) {
                continue;
            }
            
            if (score !== 'R') {
                // Check if numeric score is in valid range (2-80)
                const numScore = parseInt(score);
                if (isNaN(numScore) || numScore < 2 || numScore > 80) {
                    invalidPlayers.push(this.players[playerIndex]);
                }
            }
        }
        
        // Check if there are any active players left
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            return {
                valid: false,
                message: 'Game Over! Only one player remaining or all players eliminated.'
            };
        }
        
        // Check for invalid score ranges
        if (invalidPlayers.length > 0) {
            return {
                valid: false,
                message: `Invalid scores for: ${invalidPlayers.join(', ')}. Use 2-80 or R for winner.`
            };
        }
        
        return { valid: true };
    }

    // UI Utilities
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
    }

    autoScrollToLatest() {
        const container = document.querySelector('.scrollable-container');
        if (container) {
            setTimeout(() => {
                container.scrollLeft = container.scrollWidth - container.clientWidth;
            }, 100);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Add show class after a small delay for animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 400);
            }
        }, 4000);
    }

    // PWA Install Prompt
    setupInstallPrompt() {
        let deferredPrompt;
        const installPrompt = document.getElementById('install-prompt');
        const installBtn = document.getElementById('install-btn');
        const dismissBtn = document.getElementById('dismiss-install');

        // Show install prompt when available
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Check if user has dismissed before
            if (!localStorage.getItem('install-dismissed')) {
                installPrompt.classList.remove('hidden');
            }
        });

        // Install button click
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showNotification('App installed successfully!', 'success');
                }
                
                deferredPrompt = null;
                installPrompt.classList.add('hidden');
            }
        });

        // Dismiss button click
        dismissBtn.addEventListener('click', () => {
            installPrompt.classList.add('hidden');
            localStorage.setItem('install-dismissed', 'true');
        });

        // Hide prompt if already installed
        window.addEventListener('appinstalled', () => {
            installPrompt.classList.add('hidden');
            this.showNotification('App installed successfully!', 'success');
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RummyTracker();
});

// Handle page visibility changes (for PWA)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // App became visible - could refresh data if needed
        console.log('App became visible');
    }
});
