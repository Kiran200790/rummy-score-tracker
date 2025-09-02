// Rummy Score Tracker PWA - Main Application Logic

class RummyTracker {
    constructor() {
        this.players = [];
        this.scores = [];
        this.currentRound = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePlayerInputs();
        this.setupInstallPrompt();
        this.handleShortcuts();
        this.setupIOSScrollHandling();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Setup section
        document.getElementById('player-count').addEventListener('change', () => this.updatePlayerInputs());
        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        // Game section
        document.getElementById('add-round').addEventListener('click', () => this.addRound());
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
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

        for (let i = 1; i <= count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i} Name`;
            input.id = `player-${i}`;
            input.required = true;
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
        this.currentRound = 1;

        this.showSection('game-section');
        this.addRound();
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
        this.autoScrollToLatest();
        
        // Check for eliminations at the start of new rounds
        this.checkAndHandleEliminations();
        
        if (this.currentRound > 2) {
            this.showNotification('Round completed! Starting new round.', 'success');
        }
    }

    newGame() {
        if (confirm('Start a new game? Current progress will be lost.')) {
            this.showSection('setup-section');
            this.players = [];
            this.scores = [];
            this.currentRound = 1;
        }
    }

    // Game Board Management
    updateGameBoard() {
        this.updatePlayersColumn();
        this.updateRoundsGrid();
        this.updateTotalsColumn();
        this.updateRoundInfo();
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
            const isDanger = total >= 200 && total < 250;
            const isEliminated = total >= 250;
            
            let cellClass = 'player-cell';
            if (isEliminated) {
                cellClass += ' eliminated';
            } else if (isDanger) {
                cellClass += ' danger';
            }
            
            const displayName = isEliminated ? `${name} (OUT)` : name;
            const cell = this.createTableCell(displayName, cellClass);
            container.appendChild(cell);
        });
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

        // Player totals
        this.players.forEach((_, index) => {
            const total = this.getTotalScore(index);
            const isDanger = total >= 200 && total < 250;
            const isEliminated = total >= 250;
            
            let cellClass = 'total-cell';
            if (isEliminated) {
                cellClass += ' eliminated';
            } else if (isDanger) {
                cellClass += ' danger';
            }
            
            const displayTotal = isEliminated ? 'OUT' : total;
            const cell = this.createTableCell(displayTotal, cellClass);
            container.appendChild(cell);
        });
    }

    updateRoundInfo() {
        document.getElementById('current-round').textContent = this.currentRound - 1;
    }

    createTableCell(content, className) {
        const cell = document.createElement('div');
        cell.className = `table-cell ${className}`;
        cell.textContent = content;
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
                emptyPlayers.push(this.players[playerIndex]);
            } else if (score === 'R') {
                rCount++;
            } else {
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
        
        // Check for empty scores (only for active players)
        if (emptyPlayers.length > 0) {
            return {
                valid: false,
                message: `Please enter scores for: ${emptyPlayers.join(', ')}`
            };
        }
        
        // Check for invalid score ranges
        if (invalidPlayers.length > 0) {
            return {
                valid: false,
                message: `Invalid scores for: ${invalidPlayers.join(', ')}. Use 2-80 or R for winner.`
            };
        }
        
        // Check for exactly one winner (among active players)
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

    // iOS Safari header scroll fix
    setupIOSScrollHandling() {
        // Detect iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isIOS || isSafari) {
            // Prevent elastic scrolling from affecting header
            let lastScrollTop = 0;
            let scrollTimeout;
            
            const header = document.querySelector('.app-header');
            if (header) {
                // Force hardware acceleration
                header.style.transform = 'translateZ(0)';
                header.style.willChange = 'transform';
            }
            
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Clear previous timeout
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                
                // Ensure header stays fixed during scroll
                if (header) {
                    header.style.transform = 'translateZ(0)';
                }
                
                // Debounce scroll end
                scrollTimeout = setTimeout(() => {
                    // Scroll ended - ensure header is properly positioned
                    if (header) {
                        header.style.transform = 'translateZ(0)';
                    }
                }, 150);
                
                lastScrollTop = scrollTop;
            }, { passive: true });
            
            // Handle orientation changes
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    // Force recalculation after orientation change
                    if (header) {
                        header.style.transform = 'translateZ(0)';
                    }
                    window.scrollTo(0, window.scrollY);
                }, 100);
            });
            
            // Handle resize events (for when keyboard appears)
            window.addEventListener('resize', () => {
                if (header) {
                    header.style.transform = 'translateZ(0)';
                }
            });
        }
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
