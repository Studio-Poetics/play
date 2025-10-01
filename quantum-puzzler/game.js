class QuantumPuzzler {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 40;
        this.gridWidth = 20;
        this.gridHeight = 15;

        // Game State
        this.currentLevel = 0;
        this.currentDimension = 0; // 0 = Alpha, 1 = Beta
        this.player = { x: 0, y: 0 };
        this.moves = 0;
        this.dimensionShifts = 0;
        this.totalMoves = 0;
        this.totalShifts = 0;
        this.isMoving = false;
        this.gameComplete = false;

        // Enhanced Quantum Mechanics
        this.quantumState = 'collapsed'; // 'collapsed', 'superposition', 'entangled'
        this.superpositionTimer = 0;
        this.maxSuperpositionTime = 3000; // 3 seconds
        this.moveHistory = [];
        this.maxUndoSteps = 3;
        this.achievements = new Set();
        this.gameMode = 'normal'; // 'normal', 'casual', 'challenge'

        // Particle System
        this.particles = [];
        this.maxParticles = 50;

        // Animation
        this.animationTime = 0;
        this.pulsePhase = 0;
        this.shakeIntensity = 0;
        this.dimensionTransition = 0;

        // Audio Context (for sound effects)
        this.audioContext = null;
        this.initAudio();

        this.levels = this.createLevels();
        this.initGame();
        // Make canvas focusable
        this.canvas.tabIndex = 0;
        this.canvas.focus();

        this.bindEvents();
        this.setupDifficultyModes();
        this.gameLoop();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playSound(frequency, duration = 100, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    // Quantum Mechanics Methods
    enterSuperposition() {
        if (this.quantumState === 'collapsed') {
            this.quantumState = 'superposition';
            this.superpositionTimer = 0;
            this.createParticleEffect(this.player.x, this.player.y, '#ffff00', 20);
            this.playSound(800, 300, 'sine');
        }
    }

    collapseSuperposition() {
        if (this.quantumState === 'superposition') {
            this.quantumState = 'collapsed';
            this.superpositionTimer = 0;
            this.createParticleEffect(this.player.x, this.player.y, '#00ffff', 15);
            this.playSound(600, 200, 'triangle');
        }
    }

    saveGameState() {
        if (this.moveHistory.length >= this.maxUndoSteps) {
            this.moveHistory.shift();
        }

        this.moveHistory.push({
            player: { ...this.player },
            currentDimension: this.currentDimension,
            moves: this.moves,
            dimensionShifts: this.dimensionShifts,
            level: JSON.parse(JSON.stringify(this.levels[this.currentLevel]))
        });
    }

    undoMove() {
        if (this.moveHistory.length === 0 || this.isMoving) return;

        const previousState = this.moveHistory.pop();
        this.player = { ...previousState.player };
        this.currentDimension = previousState.currentDimension;
        this.moves = previousState.moves;
        this.dimensionShifts = previousState.dimensionShifts;
        this.levels[this.currentLevel] = JSON.parse(JSON.stringify(previousState.level));

        this.playSound(400, 150, 'sawtooth');
        this.updateUI();
    }

    createParticleEffect(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                decay: 0.02,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkAchievements() {
        // Speed runner achievement
        if (this.moves <= 5 && !this.achievements.has('speedrunner')) {
            this.achievements.add('speedrunner');
            this.showAchievement('Speed Runner', 'Complete a level in 5 moves or less');
        }

        // Dimension master achievement
        if (this.dimensionShifts >= 10 && !this.achievements.has('dimensionmaster')) {
            this.achievements.add('dimensionmaster');
            this.showAchievement('Dimension Master', 'Use 10+ dimension shifts in one level');
        }

        // Perfectionist achievement
        if (this.moves === this.getOptimalMoves() && !this.achievements.has('perfectionist')) {
            this.achievements.add('perfectionist');
            this.showAchievement('Perfectionist', 'Complete level with optimal moves');
        }
    }

    showAchievement(title, description) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-description">${description}</div>
            </div>
        `;

        document.body.appendChild(notification);
        this.playSound(1200, 500, 'sine');

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    getOptimalMoves() {
        // Simplified optimal move calculation
        const level = this.levels[this.currentLevel];
        return Math.abs(level.start.x - level.alpha.goal.x) + Math.abs(level.start.y - level.alpha.goal.y);
    }

    setupDifficultyModes() {
        // Difficulty mode adjustments
        switch (this.gameMode) {
            case 'casual':
                this.maxUndoSteps = 10;
                this.maxSuperpositionTime = 5000;
                break;
            case 'challenge':
                this.maxUndoSteps = 1;
                this.maxSuperpositionTime = 1500;
                break;
            case 'zen':
                this.maxUndoSteps = Infinity;
                this.maxSuperpositionTime = Infinity;
                break;
            default: // normal
                this.maxUndoSteps = 3;
                this.maxSuperpositionTime = 3000;
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.setupDifficultyModes();
        this.updateModeDisplay();
    }

    updateModeDisplay() {
        const modeColors = {
            'casual': '#00ff00',
            'normal': '#00ffff',
            'challenge': '#ff8800',
            'zen': '#ff00ff'
        };

        // Update UI to show current mode
        document.getElementById('dimensionDisplay').style.borderColor = modeColors[this.gameMode] || '#00ffff';
    }

    // Accessibility features
    announceToScreenReader(message) {
        // Create a live region for screen readers
        let announcer = document.getElementById('screenReaderAnnouncer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'screenReaderAnnouncer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';
            document.body.appendChild(announcer);
        }

        announcer.textContent = message;
    }

    getPositionDescription(x, y) {
        const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
        return `${columns[x] || x} ${y + 1}`;
    }

    describePuzzleState() {
        const dimension = this.getCurrentDimension();
        const playerPos = this.getPositionDescription(this.player.x, this.player.y);
        const goalPos = this.getPositionDescription(dimension.goal.x, dimension.goal.y);
        const dimName = this.currentDimension === 0 ? 'Alpha' : 'Beta';

        return `Player at ${playerPos}, Goal at ${goalPos}, ${dimName} dimension, Level ${this.currentLevel + 1}, ${this.moves} moves`;
    }

    createLevels() {
        return [
            // Level 1: Basic Movement
            {
                name: "Quantum Initialization",
                difficulty: 1,
                mechanics: ['movement'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}
                    ],
                    goal: {x: 5, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}
                    ],
                    goal: {x: 5, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 2: Simple Dimension Shift
            {
                name: "Dimensional Gateway",
                difficulty: 2,
                mechanics: ['movement', 'dimension_shift'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}
                    ],
                    goal: {x: 6, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 6, y: 7}
                    ],
                    goal: {x: 6, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 3: Vertical Navigation
            {
                name: "Quantum Elevation",
                difficulty: 2,
                mechanics: ['movement', 'dimension_shift'],
                alpha: {
                    platforms: [
                        {x: 2, y: 10}, {x: 2, y: 9}, {x: 2, y: 8}, {x: 2, y: 7}, {x: 2, y: 6},
                        {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}
                    ],
                    goal: {x: 5, y: 6}
                },
                beta: {
                    platforms: [
                        {x: 2, y: 10}, {x: 3, y: 9}, {x: 4, y: 8}, {x: 5, y: 7}, {x: 5, y: 6}
                    ],
                    goal: {x: 5, y: 6}
                },
                start: {x: 2, y: 10}
            },

            // Level 4: Portals Introduction
            {
                name: "Quantum Tunneling",
                difficulty: 3,
                mechanics: ['movement', 'dimension_shift', 'portals'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}
                    ],
                    portals: [
                        {from: {x: 2, y: 7}, to: {x: 8, y: 7}}
                    ],
                    goal: {x: 9, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7},
                        {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}
                    ],
                    goal: {x: 9, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 5: Quantum Gates
            {
                name: "Logic Gates",
                difficulty: 3,
                mechanics: ['movement', 'dimension_shift', 'gates', 'switches'],
                alpha: {
                    platforms: [
                        {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8},
                        {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6},
                        {x: 3, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}
                    ],
                    gates: [
                        {x: 4, y: 7, active: false}
                    ],
                    switches: [
                        {x: 3, y: 8, gateIndex: 0}
                    ],
                    goal: {x: 7, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8},
                        {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6},
                        {x: 3, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}
                    ],
                    gates: [
                        {x: 4, y: 7, active: false}
                    ],
                    switches: [
                        {x: 3, y: 6, gateIndex: 0}
                    ],
                    goal: {x: 7, y: 7}
                },
                start: {x: 1, y: 8}
            },

            // Level 6: Complex Navigation
            {
                name: "Entanglement Matrix",
                difficulty: 4,
                mechanics: ['movement', 'dimension_shift', 'portals', 'gates', 'switches'],
                alpha: {
                    platforms: [
                        {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10},
                        {x: 1, y: 9}, {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8},
                        {x: 5, y: 9}, {x: 6, y: 9}, {x: 7, y: 9}
                    ],
                    portals: [
                        {from: {x: 3, y: 10}, to: {x: 5, y: 9}}
                    ],
                    gates: [
                        {x: 4, y: 8, active: false}
                    ],
                    switches: [
                        {x: 1, y: 10, gateIndex: 0}
                    ],
                    goal: {x: 7, y: 9}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10},
                        {x: 1, y: 9}, {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8},
                        {x: 5, y: 9}, {x: 6, y: 9}, {x: 7, y: 9}
                    ],
                    goal: {x: 7, y: 9}
                },
                start: {x: 1, y: 8}
            },

            // Level 7: Master Challenge
            {
                name: "Quantum Mastery",
                difficulty: 5,
                mechanics: ['movement', 'dimension_shift', 'portals', 'gates', 'switches'],
                alpha: {
                    platforms: [
                        {x: 1, y: 12}, {x: 2, y: 12},
                        {x: 1, y: 10}, {x: 2, y: 10}, {x: 3, y: 10},
                        {x: 5, y: 8}, {x: 6, y: 8}, {x: 7, y: 8},
                        {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}
                    ],
                    portals: [
                        {from: {x: 3, y: 10}, to: {x: 9, y: 6}}
                    ],
                    gates: [
                        {x: 4, y: 8, active: false},
                        {x: 8, y: 6, active: false}
                    ],
                    switches: [
                        {x: 2, y: 12, gateIndex: 0},
                        {x: 7, y: 8, gateIndex: 1}
                    ],
                    goal: {x: 11, y: 6}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 12}, {x: 2, y: 12}, {x: 3, y: 12},
                        {x: 3, y: 11}, {x: 3, y: 10},
                        {x: 4, y: 8}, {x: 5, y: 8}, {x: 6, y: 8}, {x: 7, y: 8},
                        {x: 8, y: 6}, {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}
                    ],
                    gates: [
                        {x: 4, y: 8, active: false},
                        {x: 8, y: 6, active: false}
                    ],
                    switches: [
                        {x: 3, y: 12, gateIndex: 0},
                        {x: 6, y: 8, gateIndex: 1}
                    ],
                    goal: {x: 11, y: 6}
                },
                start: {x: 1, y: 12}
            },

            // Level 8: Quantum Mirrors
            {
                name: "Mirror Dimensions",
                difficulty: 4,
                mechanics: ['movement', 'dimension_shift', 'mirrors'],
                alpha: {
                    platforms: [
                        {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8},
                        {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7},
                        {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}
                    ],
                    mirrors: [
                        {x: 5, y: 7, direction: 'vertical'}
                    ],
                    goal: {x: 8, y: 6}
                },
                beta: {
                    platforms: [
                        {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8},
                        {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7},
                        {x: 6, y: 6}, {x: 7, y: 6}, {x: 8, y: 6}
                    ],
                    mirrors: [
                        {x: 5, y: 7, direction: 'vertical'}
                    ],
                    goal: {x: 8, y: 6}
                },
                start: {x: 2, y: 8}
            },

            // Level 9: Phase Shifters
            {
                name: "Phase Reality",
                difficulty: 4,
                mechanics: ['movement', 'dimension_shift', 'phase_shifters'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}
                    ],
                    phaseShifters: [
                        {x: 4, y: 7, state: 'alpha'},
                        {x: 5, y: 7, state: 'beta'},
                        {x: 6, y: 7, state: 'alpha'}
                    ],
                    goal: {x: 9, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 7, y: 7}, {x: 8, y: 7}, {x: 9, y: 7}
                    ],
                    phaseShifters: [
                        {x: 4, y: 7, state: 'beta'},
                        {x: 5, y: 7, state: 'alpha'},
                        {x: 6, y: 7, state: 'beta'}
                    ],
                    goal: {x: 9, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 10: Quantum Locks
            {
                name: "Temporal Locks",
                difficulty: 5,
                mechanics: ['movement', 'dimension_shift', 'quantum_locks'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    quantumLocks: [
                        {x: 4, y: 7, sequence: [0, 1, 0], currentStep: 0, unlocked: false},
                        {x: 5, y: 7, sequence: [1, 0, 1], currentStep: 0, unlocked: false},
                        {x: 6, y: 7, sequence: [0, 0, 1], currentStep: 0, unlocked: false},
                        {x: 7, y: 7, sequence: [1, 1, 0], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 10, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    quantumLocks: [
                        {x: 4, y: 7, sequence: [0, 1, 0], currentStep: 0, unlocked: false},
                        {x: 5, y: 7, sequence: [1, 0, 1], currentStep: 0, unlocked: false},
                        {x: 6, y: 7, sequence: [0, 0, 1], currentStep: 0, unlocked: false},
                        {x: 7, y: 7, sequence: [1, 1, 0], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 10, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 11: Combined Mechanics
            {
                name: "Quantum Synthesis",
                difficulty: 5,
                mechanics: ['movement', 'dimension_shift', 'portals', 'gates', 'switches', 'mirrors'],
                alpha: {
                    platforms: [
                        {x: 1, y: 9}, {x: 2, y: 9}, {x: 3, y: 9},
                        {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    portals: [
                        {from: {x: 3, y: 9}, to: {x: 8, y: 7}}
                    ],
                    mirrors: [
                        {x: 6, y: 7, direction: 'vertical'}
                    ],
                    gates: [
                        {x: 9, y: 7, active: false}
                    ],
                    switches: [
                        {x: 1, y: 5, gateIndex: 0}
                    ],
                    goal: {x: 10, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 9}, {x: 2, y: 9}, {x: 3, y: 9},
                        {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    mirrors: [
                        {x: 6, y: 7, direction: 'vertical'}
                    ],
                    gates: [
                        {x: 9, y: 7, active: false}
                    ],
                    switches: [
                        {x: 4, y: 5, gateIndex: 0}
                    ],
                    goal: {x: 10, y: 7}
                },
                start: {x: 1, y: 9}
            },

            // Level 12: Temporal Maze
            {
                name: "Temporal Paradox",
                difficulty: 6,
                mechanics: ['movement', 'dimension_shift', 'quantum_locks', 'phase_shifters'],
                alpha: {
                    platforms: [
                        {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8},
                        {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    phaseShifters: [
                        {x: 6, y: 8, state: 'alpha'},
                        {x: 6, y: 6, state: 'beta'},
                        {x: 7, y: 7, state: 'alpha'}
                    ],
                    quantumLocks: [
                        {x: 8, y: 7, sequence: [0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 10, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8},
                        {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
                        {x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}
                    ],
                    phaseShifters: [
                        {x: 6, y: 8, state: 'beta'},
                        {x: 6, y: 6, state: 'alpha'},
                        {x: 7, y: 7, state: 'beta'}
                    ],
                    quantumLocks: [
                        {x: 8, y: 7, sequence: [0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 10, y: 7}
                },
                start: {x: 2, y: 8}
            },

            // Level 13: Mirror Labyrinth
            {
                name: "Reflection Matrix",
                difficulty: 6,
                mechanics: ['movement', 'dimension_shift', 'mirrors', 'portals'],
                alpha: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 5, y: 10}, {x: 6, y: 10},
                        {x: 5, y: 4}, {x: 6, y: 4},
                        {x: 8, y: 7}, {x: 10, y: 7}, {x: 11, y: 7}, {x: 12, y: 7}
                    ],
                    mirrors: [
                        {x: 3, y: 7, direction: 'vertical'},
                        {x: 8, y: 7, direction: 'vertical'}
                    ],
                    portals: [
                        {from: {x: 6, y: 10}, to: {x: 5, y: 4}}
                    ],
                    goal: {x: 12, y: 7}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                        {x: 15, y: 10}, {x: 16, y: 10},
                        {x: 15, y: 4}, {x: 16, y: 4},
                        {x: 8, y: 7}, {x: 18, y: 7}, {x: 19, y: 7}
                    ],
                    mirrors: [
                        {x: 3, y: 7, direction: 'vertical'},
                        {x: 8, y: 7, direction: 'vertical'}
                    ],
                    portals: [
                        {from: {x: 16, y: 10}, to: {x: 15, y: 4}}
                    ],
                    goal: {x: 19, y: 7}
                },
                start: {x: 1, y: 7}
            },

            // Level 14: Master Sequence
            {
                name: "Quantum Symphony",
                difficulty: 7,
                mechanics: ['movement', 'dimension_shift', 'quantum_locks', 'gates', 'switches', 'portals'],
                alpha: {
                    platforms: [
                        {x: 1, y: 12}, {x: 2, y: 12}, {x: 3, y: 12},
                        {x: 1, y: 8}, {x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8},
                        {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
                        {x: 7, y: 6}, {x: 8, y: 6}, {x: 9, y: 6},
                        {x: 12, y: 8}, {x: 13, y: 8}, {x: 14, y: 8}
                    ],
                    portals: [
                        {from: {x: 4, y: 8}, to: {x: 7, y: 6}}
                    ],
                    gates: [
                        {x: 8, y: 10, active: false},
                        {x: 12, y: 8, active: false}
                    ],
                    switches: [
                        {x: 3, y: 12, gateIndex: 0},
                        {x: 9, y: 6, gateIndex: 1}
                    ],
                    quantumLocks: [
                        {x: 13, y: 8, sequence: [1, 0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 14, y: 8}
                },
                beta: {
                    platforms: [
                        {x: 1, y: 12}, {x: 2, y: 12}, {x: 3, y: 12}, {x: 4, y: 12},
                        {x: 4, y: 11}, {x: 4, y: 10}, {x: 4, y: 9}, {x: 4, y: 8},
                        {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10}, {x: 10, y: 10},
                        {x: 10, y: 9}, {x: 10, y: 8}, {x: 10, y: 7}, {x: 10, y: 6},
                        {x: 7, y: 6}, {x: 8, y: 6}, {x: 9, y: 6},
                        {x: 12, y: 8}, {x: 13, y: 8}, {x: 14, y: 8}
                    ],
                    gates: [
                        {x: 8, y: 10, active: false},
                        {x: 12, y: 8, active: false}
                    ],
                    switches: [
                        {x: 4, y: 12, gateIndex: 0},
                        {x: 10, y: 6, gateIndex: 1}
                    ],
                    quantumLocks: [
                        {x: 13, y: 8, sequence: [1, 0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 14, y: 8}
                },
                start: {x: 1, y: 12}
            },

            // Level 15: Ultimate Challenge
            {
                name: "Quantum Singularity",
                difficulty: 8,
                mechanics: ['movement', 'dimension_shift', 'portals', 'gates', 'switches', 'mirrors', 'phase_shifters', 'quantum_locks'],
                alpha: {
                    platforms: [
                        {x: 2, y: 14}, {x: 3, y: 14}, {x: 4, y: 14},
                        {x: 2, y: 13}, {x: 2, y: 12}, {x: 3, y: 12}, {x: 4, y: 12},
                        {x: 6, y: 10}, {x: 7, y: 11}, {x: 8, y: 11}, {x: 9, y: 11},
                        {x: 7, y: 9}, {x: 8, y: 9}, {x: 9, y: 9},
                        {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7}, {x: 15, y: 6},
                        {x: 17, y: 5}, {x: 18, y: 5}, {x: 19, y: 5}
                    ],
                    portals: [
                        {from: {x: 4, y: 12}, to: {x: 7, y: 11}},
                        {from: {x: 9, y: 9}, to: {x: 17, y: 5}}
                    ],
                    mirrors: [
                        {x: 6, y: 10, direction: 'vertical'},
                        {x: 15, y: 6, direction: 'vertical'}
                    ],
                    gates: [
                        {x: 8, y: 11, active: false},
                        {x: 13, y: 7, active: false},
                        {x: 18, y: 5, active: false}
                    ],
                    switches: [
                        {x: 2, y: 14, gateIndex: 0},
                        {x: 8, y: 9, gateIndex: 1},
                        {x: 14, y: 7, gateIndex: 2}
                    ],
                    phaseShifters: [
                        {x: 12, y: 7, state: 'alpha'}
                    ],
                    quantumLocks: [
                        {x: 17, y: 5, sequence: [0, 1, 0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 19, y: 5}
                },
                beta: {
                    platforms: [
                        {x: 2, y: 14}, {x: 3, y: 14}, {x: 4, y: 14}, {x: 5, y: 14},
                        {x: 5, y: 13}, {x: 5, y: 12},
                        {x: 2, y: 13}, {x: 2, y: 12}, {x: 3, y: 12}, {x: 4, y: 12},
                        {x: 6, y: 10}, {x: 11, y: 11}, {x: 12, y: 11}, {x: 13, y: 11},
                        {x: 11, y: 9}, {x: 12, y: 9}, {x: 13, y: 9},
                        {x: 7, y: 11}, {x: 8, y: 11}, {x: 9, y: 11},
                        {x: 7, y: 9}, {x: 8, y: 9}, {x: 9, y: 9},
                        {x: 12, y: 7}, {x: 13, y: 7}, {x: 14, y: 7}, {x: 15, y: 6},
                        {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}
                    ],
                    portals: [
                        {from: {x: 5, y: 12}, to: {x: 11, y: 11}},
                        {from: {x: 13, y: 9}, to: {x: 1, y: 5}}
                    ],
                    mirrors: [
                        {x: 6, y: 10, direction: 'vertical'},
                        {x: 15, y: 6, direction: 'vertical'}
                    ],
                    gates: [
                        {x: 12, y: 11, active: false},
                        {x: 13, y: 7, active: false},
                        {x: 2, y: 5, active: false}
                    ],
                    switches: [
                        {x: 5, y: 14, gateIndex: 0},
                        {x: 12, y: 9, gateIndex: 1},
                        {x: 14, y: 7, gateIndex: 2}
                    ],
                    phaseShifters: [
                        {x: 12, y: 7, state: 'beta'}
                    ],
                    quantumLocks: [
                        {x: 1, y: 5, sequence: [0, 1, 0, 1, 0, 1], currentStep: 0, unlocked: false}
                    ],
                    goal: {x: 3, y: 5}
                },
                start: {x: 2, y: 14}
            }
        ];
    }

    // Advanced puzzle element handlers
    handleMirrors(x, y) {
        const dimension = this.getCurrentDimension();
        if (dimension.mirrors) {
            const mirror = dimension.mirrors.find(m => m.x === x && m.y === y);
            if (mirror) {
                // Mirror reflects player to opposite dimension at mirrored position
                if (mirror.direction === 'vertical') {
                    const mirroredX = (mirror.x * 2) - this.player.x;
                    if (mirroredX >= 0 && mirroredX < this.gridWidth) {
                        this.player.x = mirroredX;
                        this.shiftDimension();
                        this.createParticleEffect(this.player.x, this.player.y, '#ffffff', 20);
                        this.playSound(1000, 200, 'triangle');
                    }
                }
            }
        }
    }

    handlePhaseShifters(x, y) {
        const dimension = this.getCurrentDimension();
        if (dimension.phaseShifters) {
            const shifter = dimension.phaseShifters.find(s => s.x === x && s.y === y);
            if (shifter) {
                const currentDimName = this.currentDimension === 0 ? 'alpha' : 'beta';
                return shifter.state === currentDimName;
            }
        }
        return true;
    }

    handleQuantumLocks(x, y) {
        const level = this.levels[this.currentLevel];
        const dimension = this.getCurrentDimension();

        if (dimension.quantumLocks) {
            const lock = dimension.quantumLocks.find(l => l.x === x && l.y === y);
            if (lock && !lock.unlocked) {
                const expectedDimension = lock.sequence[lock.currentStep];
                if (this.currentDimension === expectedDimension) {
                    lock.currentStep++;
                    this.createParticleEffect(x, y, '#00ff00', 10);
                    this.playSound(800 + lock.currentStep * 100, 150, 'sine');

                    if (lock.currentStep >= lock.sequence.length) {
                        lock.unlocked = true;
                        this.createParticleEffect(x, y, '#ffff00', 25);
                        this.playSound(1200, 300, 'sine');
                    }
                } else {
                    // Wrong dimension - reset lock
                    lock.currentStep = 0;
                    this.createParticleEffect(x, y, '#ff0000', 15);
                    this.playSound(300, 200, 'square');
                }
            }

            return lock ? lock.unlocked : true;
        }
        return true;
    }

    initGame() {
        this.loadLevel(this.currentLevel);
        this.updateUI();
    }

    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.gameComplete = true;
            this.showGameComplete();
            return;
        }

        const level = this.levels[levelIndex];
        this.player = { ...level.start };
        this.moves = 0;
        this.dimensionShifts = 0;
        this.currentDimension = 0;
        this.moveHistory = []; // Clear undo history for new level

        // Initialize gates
        ['alpha', 'beta'].forEach(dim => {
            if (level[dim].gates) {
                level[dim].gates.forEach(gate => gate.active = false);
            }
        });

        // Initialize quantum locks
        ['alpha', 'beta'].forEach(dim => {
            if (level[dim].quantumLocks) {
                level[dim].quantumLocks.forEach(lock => {
                    lock.currentStep = 0;
                    lock.unlocked = false;
                });
            }
        });

        this.updateUI();
    }

    getCurrentDimension() {
        const level = this.levels[this.currentLevel];
        return level[this.currentDimension === 0 ? 'alpha' : 'beta'];
    }

    isValidPosition(x, y) {
        const dimension = this.getCurrentDimension();

        // Check platforms
        const onPlatform = dimension.platforms.some(p => p.x === x && p.y === y);
        if (onPlatform) return true;

        // Check active gates
        if (dimension.gates) {
            const onGate = dimension.gates.some(gate => gate.x === x && gate.y === y && gate.active);
            if (onGate) return true;
        }

        // Check phase shifters
        if (dimension.phaseShifters) {
            const shifter = dimension.phaseShifters.find(s => s.x === x && s.y === y);
            if (shifter) {
                const currentDimName = this.currentDimension === 0 ? 'alpha' : 'beta';
                return shifter.state === currentDimName;
            }
        }

        // Check quantum locks
        if (dimension.quantumLocks) {
            const lock = dimension.quantumLocks.find(l => l.x === x && l.y === y);
            if (lock) {
                return lock.unlocked;
            }
        }

        return false;
    }

    handlePortals(x, y) {
        const dimension = this.getCurrentDimension();
        if (dimension.portals) {
            const portal = dimension.portals.find(p => p.from.x === x && p.from.y === y);
            if (portal) {
                this.playSound(800, 200, 'sine');
                return portal.to;
            }
        }
        return { x, y };
    }

    handleSwitches(x, y) {
        const level = this.levels[this.currentLevel];
        const dimension = this.getCurrentDimension();

        if (dimension.switches) {
            const switch_ = dimension.switches.find(s => s.x === x && s.y === y);
            if (switch_) {
                // Toggle gate in both dimensions
                ['alpha', 'beta'].forEach(dim => {
                    if (level[dim].gates && level[dim].gates[switch_.gateIndex]) {
                        level[dim].gates[switch_.gateIndex].active = !level[dim].gates[switch_.gateIndex].active;
                    }
                });
                this.playSound(1000, 150, 'square');
            }
        }
    }

    movePlayer(dx, dy) {
        if (this.isMoving) return;

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) return;

        // Save state before moving for undo functionality
        this.saveGameState();

        if (this.isValidPosition(newX, newY)) {
            this.isMoving = true;

            // Collapse superposition on movement
            if (this.quantumState === 'superposition') {
                this.collapseSuperposition();
            }

            this.player.x = newX;
            this.player.y = newY;
            this.moves++;
            this.totalMoves++;

            // Create movement particle effect
            this.createParticleEffect(this.player.x, this.player.y, '#ffffff', 5);

            // Handle portals
            const portalDestination = this.handlePortals(newX, newY);
            if (portalDestination.x !== newX || portalDestination.y !== newY) {
                this.player.x = portalDestination.x;
                this.player.y = portalDestination.y;
                this.createParticleEffect(this.player.x, this.player.y, '#ffff00', 15);
            }

            // Handle switches
            this.handleSwitches(this.player.x, this.player.y);

            // Handle mirrors
            this.handleMirrors(this.player.x, this.player.y);

            // Handle quantum locks
            this.handleQuantumLocks(this.player.x, this.player.y);

            this.playSound(440, 100, 'sine');

            // Check win condition
            const dimension = this.getCurrentDimension();
            if (this.player.x === dimension.goal.x && this.player.y === dimension.goal.y) {
                this.checkAchievements();
                this.announceToScreenReader(`Level ${this.currentLevel + 1} completed!`);
                setTimeout(() => this.levelComplete(), 300);
            }

            // Announce move for accessibility
            this.announceToScreenReader(`Moved to ${this.getPositionDescription(this.player.x, this.player.y)}`);

            setTimeout(() => {
                this.isMoving = false;
            }, 200);

            this.updateUI();
        } else {
            // Invalid move - create barrier effect
            this.shakeIntensity = 10;
            this.createParticleEffect(newX, newY, '#ff0000', 8);
            this.playSound(200, 100, 'square');
        }
    }

    shiftDimension() {
        this.saveGameState();

        this.currentDimension = 1 - this.currentDimension;
        this.dimensionShifts++;
        this.totalShifts++;

        // Enhanced dimension shift effects
        this.dimensionTransition = 1.0;
        this.createParticleEffect(this.player.x, this.player.y,
            this.currentDimension === 0 ? '#00ffff' : '#ff00ff', 25);

        this.playSound(600, 300, 'sawtooth');

        // Announce dimension shift for accessibility
        const newDimension = this.currentDimension === 0 ? 'Alpha' : 'Beta';
        this.announceToScreenReader(`Shifted to ${newDimension} dimension`);

        this.updateUI();

        // Check if player is still on valid platform after shift
        if (!this.isValidPosition(this.player.x, this.player.y)) {
            // If not valid, trigger quantum decoherence effect
            this.shakeIntensity = 15;
            this.createParticleEffect(this.player.x, this.player.y, '#ff0000', 20);
            this.playSound(300, 500, 'square');

            // Reset to level start after brief delay
            setTimeout(() => {
                this.resetLevel();
            }, 1000);
        }
    }

    resetLevel() {
        this.loadLevel(this.currentLevel);
        this.playSound(300, 200, 'triangle');
    }

    levelComplete() {
        this.playSound(880, 500, 'sine');
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalShifts').textContent = this.dimensionShifts;
        document.getElementById('levelCompleteModal').classList.add('active');

        // Focus the modal for keyboard navigation
        document.getElementById('levelCompleteModal').focus();
    }

    nextLevel() {
        this.currentLevel++;
        this.closeLevelCompleteModal();
        this.loadLevel(this.currentLevel);
    }

    retryLevel() {
        this.closeLevelCompleteModal();
        this.resetLevel();
    }

    closeLevelCompleteModal() {
        document.getElementById('levelCompleteModal').classList.remove('active');
        // Return focus to the game canvas
        this.canvas.focus();
    }

    closeGameCompleteModal() {
        document.getElementById('gameCompleteModal').classList.remove('active');
        // Return focus to the game canvas
        this.canvas.focus();
    }

    showGameComplete() {
        document.getElementById('totalMoves').textContent = this.totalMoves;
        document.getElementById('totalShifts').textContent = this.totalShifts;
        document.getElementById('gameCompleteModal').classList.add('active');

        // Focus the modal for keyboard navigation
        document.getElementById('gameCompleteModal').focus();
    }

    restartGame() {
        this.currentLevel = 0;
        this.totalMoves = 0;
        this.totalShifts = 0;
        this.gameComplete = false;
        this.closeGameCompleteModal();
        this.loadLevel(0);
    }

    updateUI() {
        document.getElementById('levelDisplay').textContent = String(this.currentLevel + 1).padStart(2, '0');
        document.getElementById('movesDisplay').textContent = String(this.moves).padStart(3, '0');

        const dimensionDisplay = document.getElementById('dimensionDisplay');
        dimensionDisplay.textContent = this.currentDimension === 0 ? 'ALPHA' : 'BETA';
        dimensionDisplay.className = `stat-value dimension-indicator ${this.currentDimension === 0 ? '' : 'beta'}`;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Handle modal keyboard navigation
            const levelCompleteModal = document.getElementById('levelCompleteModal');
            const gameCompleteModal = document.getElementById('gameCompleteModal');

            if (levelCompleteModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.nextLevel();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.closeLevelCompleteModal();
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        this.retryLevel();
                        break;
                }
                return;
            }

            if (gameCompleteModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Enter':
                    case 'Escape':
                        e.preventDefault();
                        this.restartGame();
                        break;
                }
                return;
            }

            // Regular game controls (only when modals are not active)
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    this.shiftDimension();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.resetLevel();
                    break;
                case 'u':
                case 'U':
                case 'z':
                case 'Z':
                    e.preventDefault();
                    this.undoMove();
                    break;
                case 'q':
                case 'Q':
                    e.preventDefault();
                    this.enterSuperposition();
                    break;
                case 'h':
                case 'H':
                case '?':
                    e.preventDefault();
                    this.announceToScreenReader(this.describePuzzleState());
                    break;
                case '1':
                    e.preventDefault();
                    this.setGameMode('casual');
                    break;
                case '2':
                    e.preventDefault();
                    this.setGameMode('normal');
                    break;
                case '3':
                    e.preventDefault();
                    this.setGameMode('challenge');
                    break;
                case '4':
                    e.preventDefault();
                    this.setGameMode('zen');
                    break;
            }
        });

        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('retryLevelBtn').addEventListener('click', () => this.retryLevel());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());

        // Touch controls for mobile
        let touchStartX, touchStartY;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            touchStartY = touch.clientY - rect.top;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (touchStartX === undefined) return;

            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchEndX = touch.clientX - rect.left;
            const touchEndY = touch.clientY - rect.top;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const minSwipeDistance = 30;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipeDistance) {
                    this.movePlayer(dx > 0 ? 1 : -1, 0);
                }
            } else {
                if (Math.abs(dy) > minSwipeDistance) {
                    this.movePlayer(0, dy > 0 ? 1 : -1);
                }
            }

            touchStartX = undefined;
            touchStartY = undefined;
        });

        // Double tap for dimension shift
        let lastTap = 0;
        this.canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                this.shiftDimension();
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake effect
        let shakeX = 0, shakeY = 0;
        if (this.shakeIntensity > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.9;
            if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
        }

        // Calculate offset to center the grid
        const offsetX = (this.canvas.width - this.gridWidth * this.gridSize) / 2 + shakeX;
        const offsetY = (this.canvas.height - this.gridHeight * this.gridSize) / 2 + shakeY;

        // Apply dimension transition effect
        if (this.dimensionTransition > 0) {
            this.ctx.globalAlpha = Math.abs(Math.sin(this.dimensionTransition * Math.PI * 4)) * 0.5 + 0.5;
            this.dimensionTransition -= 0.05;
            if (this.dimensionTransition < 0) this.dimensionTransition = 0;
        }

        const dimension = this.getCurrentDimension();
        const time = this.animationTime;

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + x * this.gridSize, offsetY);
            this.ctx.lineTo(offsetX + x * this.gridSize, offsetY + this.gridHeight * this.gridSize);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + y * this.gridSize);
            this.ctx.lineTo(offsetX + this.gridWidth * this.gridSize, offsetY + y * this.gridSize);
            this.ctx.stroke();
        }

        // Draw platforms
        this.ctx.strokeStyle = this.currentDimension === 0 ? '#00ffff' : '#ff00ff';
        this.ctx.lineWidth = 2;
        dimension.platforms.forEach(platform => {
            const x = offsetX + platform.x * this.gridSize;
            const y = offsetY + platform.y * this.gridSize;

            this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        });

        // Draw portals
        if (dimension.portals) {
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            dimension.portals.forEach(portal => {
                const pulse = Math.sin(time * 0.005) * 0.3 + 0.7;
                this.ctx.globalAlpha = pulse;

                [portal.from, portal.to].forEach(pos => {
                    const x = offsetX + pos.x * this.gridSize + this.gridSize / 2;
                    const y = offsetY + pos.y * this.gridSize + this.gridSize / 2;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.gridSize * 0.3, 0, Math.PI * 2);
                    this.ctx.stroke();
                });

                this.ctx.globalAlpha = 1;
            });
        }

        // Draw gates
        if (dimension.gates) {
            dimension.gates.forEach(gate => {
                const x = offsetX + gate.x * this.gridSize;
                const y = offsetY + gate.y * this.gridSize;

                this.ctx.strokeStyle = gate.active ? '#00ff00' : '#ff0000';
                this.ctx.lineWidth = 2;

                if (gate.active) {
                    this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                } else {
                    // Draw X pattern for inactive gate
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 5, y + 5);
                    this.ctx.lineTo(x + this.gridSize - 5, y + this.gridSize - 5);
                    this.ctx.moveTo(x + this.gridSize - 5, y + 5);
                    this.ctx.lineTo(x + 5, y + this.gridSize - 5);
                    this.ctx.stroke();
                }
            });
        }

        // Draw switches
        if (dimension.switches) {
            this.ctx.strokeStyle = '#ffaa00';
            this.ctx.lineWidth = 2;
            dimension.switches.forEach(switch_ => {
                const x = offsetX + switch_.x * this.gridSize + this.gridSize / 2;
                const y = offsetY + switch_.y * this.gridSize + this.gridSize / 2;

                this.ctx.beginPath();
                this.ctx.arc(x, y, this.gridSize * 0.2, 0, Math.PI * 2);
                this.ctx.stroke();

                // Draw inner circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.gridSize * 0.1, 0, Math.PI * 2);
                this.ctx.stroke();
            });
        }

        // Draw mirrors
        if (dimension.mirrors) {
            this.ctx.strokeStyle = '#cccccc';
            this.ctx.lineWidth = 4;
            dimension.mirrors.forEach(mirror => {
                const x = offsetX + mirror.x * this.gridSize + this.gridSize / 2;
                const y = offsetY + mirror.y * this.gridSize + this.gridSize / 2;

                if (mirror.direction === 'vertical') {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y - this.gridSize * 0.4);
                    this.ctx.lineTo(x, y + this.gridSize * 0.4);
                    this.ctx.stroke();
                }
            });
        }

        // Draw phase shifters
        if (dimension.phaseShifters) {
            dimension.phaseShifters.forEach(shifter => {
                const x = offsetX + shifter.x * this.gridSize;
                const y = offsetY + shifter.y * this.gridSize;
                const currentDimName = this.currentDimension === 0 ? 'alpha' : 'beta';
                const isActive = shifter.state === currentDimName;

                this.ctx.strokeStyle = isActive ? '#00ff00' : '#666666';
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = isActive ? 1 : 0.3;

                this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

                // Draw phase indicator
                this.ctx.strokeStyle = shifter.state === 'alpha' ? '#00ffff' : '#ff00ff';
                const centerX = x + this.gridSize / 2;
                const centerY = y + this.gridSize / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.gridSize * 0.15, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.globalAlpha = 1;
            });
        }

        // Draw quantum locks
        if (dimension.quantumLocks) {
            dimension.quantumLocks.forEach(lock => {
                const x = offsetX + lock.x * this.gridSize;
                const y = offsetY + lock.y * this.gridSize;
                const progress = lock.currentStep / lock.sequence.length;

                if (lock.unlocked) {
                    this.ctx.strokeStyle = '#00ff00';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                } else {
                    this.ctx.strokeStyle = '#ff0000';
                    this.ctx.lineWidth = 2;

                    // Draw lock symbol
                    const centerX = x + this.gridSize / 2;
                    const centerY = y + this.gridSize / 2;

                    // Lock body
                    this.ctx.strokeRect(
                        centerX - this.gridSize * 0.15,
                        centerY - this.gridSize * 0.1,
                        this.gridSize * 0.3,
                        this.gridSize * 0.2
                    );

                    // Lock shackle
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY - this.gridSize * 0.1, this.gridSize * 0.1, Math.PI, 0, false);
                    this.ctx.stroke();

                    // Progress indicator
                    if (progress > 0) {
                        this.ctx.strokeStyle = '#ffff00';
                        this.ctx.lineWidth = 1;
                        const progressWidth = (this.gridSize - 8) * progress;
                        this.ctx.strokeRect(x + 4, y + this.gridSize - 8, progressWidth, 4);
                    }
                }
            });
        }

        // Draw goal
        const goal = dimension.goal;
        const goalX = offsetX + goal.x * this.gridSize + this.gridSize / 2;
        const goalY = offsetY + goal.y * this.gridSize + this.gridSize / 2;

        const goalPulse = Math.sin(time * 0.008) * 0.5 + 0.5;
        this.ctx.strokeStyle = this.currentDimension === 0 ? '#00ffff' : '#ff00ff';
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = goalPulse + 0.3;

        this.ctx.beginPath();
        this.ctx.arc(goalX, goalY, this.gridSize * 0.4, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(goalX, goalY, this.gridSize * 0.2, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1;

        // Draw player
        const playerX = offsetX + this.player.x * this.gridSize + this.gridSize / 2;
        const playerY = offsetY + this.player.y * this.gridSize + this.gridSize / 2;

        const playerPulse = Math.sin(time * 0.01) * 0.2 + 0.8;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = playerPulse;

        // Draw wireframe cube
        const cubeSize = this.gridSize * 0.25;
        this.ctx.strokeRect(playerX - cubeSize, playerY - cubeSize, cubeSize * 2, cubeSize * 2);

        // Draw inner lines for 3D effect
        this.ctx.beginPath();
        this.ctx.moveTo(playerX - cubeSize, playerY - cubeSize);
        this.ctx.lineTo(playerX + cubeSize, playerY + cubeSize);
        this.ctx.moveTo(playerX + cubeSize, playerY - cubeSize);
        this.ctx.lineTo(playerX - cubeSize, playerY + cubeSize);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1;

        // Render superposition effect
        if (this.quantumState === 'superposition') {
            this.renderSuperpositionEffect(offsetX, offsetY);
        }

        // Render particles
        this.renderParticles(offsetX, offsetY);

        // Render UI overlays
        this.renderHUD();
    }

    renderSuperpositionEffect(offsetX, offsetY) {
        const alpha = Math.sin(this.animationTime * 0.01) * 0.3 + 0.7;
        this.ctx.globalAlpha = alpha;

        // Draw ghost player in opposite dimension
        const ghostDimension = this.currentDimension === 0 ? 1 : 0;
        const ghostColor = ghostDimension === 0 ? '#00ffff' : '#ff00ff';

        const playerX = offsetX + this.player.x * this.gridSize + this.gridSize / 2;
        const playerY = offsetY + this.player.y * this.gridSize + this.gridSize / 2;

        this.ctx.strokeStyle = ghostColor;
        this.ctx.lineWidth = 1;

        // Draw wireframe ghost cube
        const cubeSize = this.gridSize * 0.25;
        this.ctx.strokeRect(playerX - cubeSize, playerY - cubeSize, cubeSize * 2, cubeSize * 2);

        this.ctx.globalAlpha = 1;
    }

    renderParticles(offsetX, offsetY) {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(
                offsetX + particle.x,
                offsetY + particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderHUD() {
        // Render superposition timer
        if (this.quantumState === 'superposition') {
            const timerWidth = 200;
            const timerHeight = 10;
            const timerX = (this.canvas.width - timerWidth) / 2;
            const timerY = 20;

            const progress = this.superpositionTimer / this.maxSuperpositionTime;

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(timerX - 5, timerY - 5, timerWidth + 10, timerHeight + 10);

            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(timerX, timerY, timerWidth, timerHeight);

            this.ctx.fillStyle = progress > 0.7 ? '#ff0000' : '#ffff00';
            this.ctx.fillRect(timerX, timerY, timerWidth * progress, timerHeight);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('QUANTUM SUPERPOSITION', this.canvas.width / 2, timerY + 25);
        }

        // Render undo indicator
        if (this.moveHistory.length > 0) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            this.ctx.font = '10px Orbitron';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                `UNDO AVAILABLE (${this.moveHistory.length}/${this.maxUndoSteps})`,
                10,
                this.canvas.height - 10
            );
        }
    }

    gameLoop() {
        this.animationTime += 16;

        // Update superposition timer
        if (this.quantumState === 'superposition') {
            this.superpositionTimer += 16;
            if (this.superpositionTimer >= this.maxSuperpositionTime) {
                this.collapseSuperposition();
            }
        }

        // Update particles
        this.updateParticles();

        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Force mobile optimizations
    setupMobileOptimizations();

    const game = new QuantumPuzzler();

    // Mobile Controls Setup
    setupMobileControls(game);

    // Mobile Canvas Responsiveness
    setupMobileCanvas(game);
});

// Mobile Optimizations
function setupMobileOptimizations() {
    // Force landscape orientation on mobile
    if (window.innerWidth <= 768) {
        // Request landscape orientation
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                console.log('Orientation lock not supported');
            });
        }

        // Hide all desktop-only elements completely
        const desktopElements = document.querySelectorAll('.desktop-only, .instructions-sidebar');
        desktopElements.forEach(element => {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
        });

        // Show mobile elements
        const mobileElements = document.querySelectorAll('.mobile-only');
        mobileElements.forEach(element => {
            element.style.display = 'block';
            element.style.visibility = 'visible';
        });

        // Add mobile body class
        document.body.classList.add('mobile-game');
    }
}

// Mobile Canvas Responsiveness
function setupMobileCanvas(game) {
    const canvas = game.canvas;

    function resizeCanvas() {
        if (window.innerWidth <= 768) {
            // Mobile adjustments
            const container = document.querySelector('.game-viewport');
            if (container) {
                const rect = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                // Set display size
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';

                // Scale canvas for high DPI displays
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                // Scale drawing context
                game.ctx.scale(dpr, dpr);

                // Update game grid calculations for mobile
                const minDimension = Math.min(rect.width, rect.height);
                game.gridSize = Math.floor(minDimension / 20); // Adjust grid size for mobile
            }
        }
    }

    // Initial resize
    resizeCanvas();

    // Resize on orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });

    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
}

// Mobile Controls Handler
function setupMobileControls(game) {
    // Info Toggle
    const infoToggle = document.getElementById('infoToggle');
    const infoPanel = document.getElementById('mobileInfoPanel');

    if (infoToggle && infoPanel) {
        infoToggle.addEventListener('click', () => {
            infoPanel.classList.toggle('open');
        });

        // Close info panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!infoPanel.contains(e.target) && !infoToggle.contains(e.target)) {
                infoPanel.classList.remove('open');
            }
        });
    }

    // Touch Controls - Only D-Pad with Enhanced Mobile Support
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    console.log('Found D-pad buttons:', dpadButtons.length);

    // D-Pad Controls - Enhanced for mobile
    dpadButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.dataset.action);

        // Touch handling
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95)';
            console.log('Touch start:', button.dataset.action);
        }, { passive: false });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(1)';
            const action = button.dataset.action;
            console.log('Touch end - executing action:', action);
            handleMobileInput(game, action);
        }, { passive: false });

        // Click handling as fallback
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = button.dataset.action;
            console.log('Click - executing action:', action);
            handleMobileInput(game, action);
        });

        // Prevent context menu
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    });

    // Canvas Touch Controls - Simplified and passive
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;
    const canvas = document.getElementById('gameCanvas');

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const touchDuration = Date.now() - touchStartTime;
            const minSwipeDistance = 40;

            // Check for double tap (dimension shift)
            const currentTime = Date.now();
            const tapGap = currentTime - lastTapTime;

            if (tapGap < 500 && tapGap > 50 && touchDuration < 200) {
                // Double tap detected
                handleMobileInput(game, 'dimension');
                lastTapTime = 0; // Reset to prevent triple tap
                return;
            }
            lastTapTime = currentTime;

            // Check for swipe if touch was brief and moved enough
            if (touchDuration < 500 && (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance)) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        handleMobileInput(game, 'right');
                    } else {
                        handleMobileInput(game, 'left');
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        handleMobileInput(game, 'down');
                    } else {
                        handleMobileInput(game, 'up');
                    }
                }
            }
        }
    }, { passive: true });

    // Prevent context menu
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Prevent page scrolling/zooming on game area
    const gameContainer = document.querySelector('.game-container');
    gameContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// Handle Mobile Input - Enhanced with debugging
function handleMobileInput(game, action) {
    console.log('handleMobileInput called with action:', action);
    console.log('Game object:', game);
    console.log('Game movePlayer function:', typeof game.movePlayer);

    if (!game || typeof game.movePlayer !== 'function') {
        console.error('Game object or movePlayer function not available');
        return;
    }

    switch (action) {
        case 'up':
            console.log('Moving up');
            game.movePlayer(0, -1);
            break;
        case 'down':
            console.log('Moving down');
            game.movePlayer(0, 1);
            break;
        case 'left':
            console.log('Moving left');
            game.movePlayer(-1, 0);
            break;
        case 'right':
            console.log('Moving right');
            game.movePlayer(1, 0);
            break;
        default:
            console.warn('Unknown action:', action);
    }
}