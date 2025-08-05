// ========================================
// SCRIPT_MODULAR.JS - INTEGRACIÓN PRINCIPAL
// ========================================

console.log('🚀 script_modular.js cargado');

class CaballeroHidalgoGame {
    constructor() {
        console.log('🏗️ Inicializando CaballeroHidalgoGame...');
        
        try {
            // Inicializar las reglas base
            this.gameRules = new NormalGameRules();
            console.log('✅ NormalGameRules inicializado');
            
            // Inicializar reglas específicas para humanos e IA
            this.humanRules = new HumanPlayerRules(this.gameRules);
            this.aiRules = new AIPlayerRules(this.gameRules);
            console.log('✅ HumanPlayerRules y AIPlayerRules inicializados');
            
            // ✅ NUEVO: Contador de turnos
            this.turnCounter = 0;
            
            // Configurar el juego
            this.setupEventListeners();
            console.log('✅ Event listeners configurados');
            
            // Hacer accesible globalmente
            window.game = this;
            
            // Mostrar pantalla de selección de modo
            this.showGameModeSelection();
            console.log('✅ Pantalla de selección de modo mostrada');
            
        } catch (error) {
            console.error('❌ Error en constructor de CaballeroHidalgoGame:', error);
        }
    }

    // ========================================
    // CONFIGURACIÓN DE EVENTOS
    // ========================================

    setupEventListeners() {
        // Event listeners para selección de modo
        const soloModeBtn = document.getElementById('solo-mode');
        const aiModeBtn = document.getElementById('ai-mode');
        
        if (soloModeBtn) {
            soloModeBtn.addEventListener('click', () => {
                this.handleGameModeSelection('solo');
            });
        }
        
        if (aiModeBtn) {
            aiModeBtn.addEventListener('click', () => {
                this.handleGameModeSelection('ai');
            });
        }

        // Event listeners para selección de jugadores
        const playerCountBtns = document.querySelectorAll('.player-count-btn');
        
        playerCountBtns.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                this.handlePlayerCountSelection(e.target.dataset.players);
            });
        });

        // Botones principales
        const drawCardBtn = document.getElementById('draw-card-btn');
        const endTurnBtn = document.getElementById('end-turn-btn');
        const newGameBtn = document.getElementById('new-game');
        const forceAITurnBtn = document.getElementById('force-ai-turn');
        
        if (drawCardBtn) {
            drawCardBtn.addEventListener('click', () => {
                this.drawCard();
            });
        }
        
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => {
                this.endTurn();
            });
        }
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame(true);
            });
        }
        
        if (forceAITurnBtn) {
            forceAITurnBtn.addEventListener('click', () => {
                this.forceAITurn();
            });
        }

        // ✅ NUEVO: Mazo clickeable
        const deckElement = document.getElementById('deck');
        if (deckElement) {
            deckElement.addEventListener('click', () => {
                this.drawCard();
            });
        }
    }

    // ========================================
    // GESTIÓN DE INTERFAZ
    // ========================================

    showGameModeSelection() {
        console.log('🎯 showGameModeSelection() ejecutándose...');
        
        const gameModeSelection = document.getElementById('game-mode-selection');
        const gameContainer = document.getElementById('game-container');
        const playerCountSelection = document.getElementById('player-count-selection');
        
        console.log('🔍 Elementos encontrados:', {
            gameModeSelection: !!gameModeSelection,
            gameContainer: !!gameContainer,
            playerCountSelection: !!playerCountSelection
        });
        
        if (gameModeSelection) {
            gameModeSelection.style.display = 'flex';
            console.log('✅ Pantalla de selección de modo mostrada');
        } else {
            console.error('❌ No se encontró game-mode-selection');
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
        
        if (playerCountSelection) {
            playerCountSelection.style.display = 'none';
        }
    }

    handleGameModeSelection(mode) {
        console.log(`🎮 Modo seleccionado: ${mode}`);
        
        this.gameRules.setGameMode(mode);
        
        // Mostrar selector de jugadores en lugar de iniciar el juego directamente
        const playerCountSelection = document.getElementById('player-count-selection');
        if (playerCountSelection) {
            playerCountSelection.style.display = 'flex';
        }
        
        // Actualizar indicador de modo
        const indicator = document.getElementById('game-mode-indicator');
        if (indicator) {
            if (mode === 'solo') {
                indicator.textContent = '🎮 Modo Solo';
            } else {
                indicator.textContent = '🤖 Modo IA';
            }
        }
    }

    handlePlayerCountSelection(playerCount) {
        console.log(`🎮 ${playerCount} jugadores seleccionados`);
        
        // Configurar el número de jugadores
        this.gameRules.setPlayerCount(parseInt(playerCount));
        
        // Ocultar selector y mostrar el juego
        const gameModeSelection = document.getElementById('game-mode-selection');
        const gameContainer = document.getElementById('game-container');
        
        if (gameModeSelection) {
            gameModeSelection.style.display = 'none';
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'block';
        }
        
        // Iniciar el juego
        this.startNewGame(true);
    }

    // ========================================
    // GESTIÓN DE JUEGO
    // ========================================

    startNewGame(force = false) {
        console.log(`🎮 Iniciando nuevo juego... (force: ${force})`);
        
        // Verificar si el juego está realmente en progreso
        if (!force && (this.gameRules.players[0].hand.length > 0 || this.gameRules.turn > 1)) {
            this.showGameModeSelection();
            return;
        }
        
        // Ocultar el selector de jugadores antes de iniciar el juego
        const playerCountSelection = document.getElementById('player-count-selection');
        if (playerCountSelection) {
            playerCountSelection.style.display = 'none';
        }
        
        // ✅ NUEVO: Reiniciar contador de turnos
        this.turnCounter = 0;
        
        this.gameRules.resetGame();
        
        // ✅ NUEVO: Iniciar el primer turno
        this.gameRules.startTurn();
        
        this.updateDisplay();
        this.updateStatus("¡Nuevo juego iniciado! El Jugador 1 debe robar una carta.");
        
        // ✅ NUEVO: Reproducir sonido de notificación si el primer jugador es humano
        if (!this.isAIPlayer(this.gameRules.currentPlayer)) {
            this.playNotificationSound();
        }
        
        // Si es modo IA y el Jugador 1 es IA, ejecutar su turno
        if (this.gameRules.gameMode === 'ai' && this.isAIPlayer(this.gameRules.currentPlayer)) {
            console.log(`🤖 El Jugador 1 es IA, ejecutando turno automáticamente`);
            // ✅ MEJORADO: Aumentar tiempo para que el jugador vea el inicio del juego
            setTimeout(() => this.aiRules.playAITurn(), 3000);
        }
    }

    drawCard() {
        const card = this.gameRules.drawCard();
        if (card) {
            this.updateDisplay();
            
            // ✅ NUEVO: Verificar victoria después de robar (por si es equipamiento)
            if (this.gameRules.checkVictory()) {
                this.handleVictory();
                return;
            }
            
            this.updateStatus(`Jugador ${this.gameRules.currentPlayer + 1} robó: ${card.name}. Ahora debe jugar una carta.`);
            
            // Si es un jugador de IA, continuar con su turno
            if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                console.log(`🤖 Es turno de IA, ejecutando playAITurn`);
                // ✅ MEJORADO: Aumentar tiempo para que el jugador vea la carta robada
                setTimeout(() => this.aiRules.playAITurn(), 2000);
            }
        } else {
            this.updateStatus("No se puede robar una carta en este momento.");
        }
    }

    endTurn() {
        // ✅ NUEVO: Mostrar estado del turno actual antes de terminar
        this.showTurnStatus();
        
        const success = this.gameRules.endTurn();
        
        if (success) {
            // ✅ CORREGIDO: Incrementar contador de turnos ANTES de actualizar la pantalla
            this.turnCounter++;
            
            this.updateDisplay();
            
            // ✅ NUEVO: Verificar victoria después de actualizar la pantalla
            if (this.gameRules.checkVictory()) {
                this.handleVictory();
                return;
            }
            
            // ✅ NUEVO: Verificar victoria después del molino
            if (this.gameRules.checkVictoryAfterMolino()) {
                this.handleVictory();
                return;
            }
            
            this.updateStatus(`Turno del Jugador ${this.gameRules.currentPlayer + 1}. Debe robar una carta.`);
            
            // ✅ NUEVO: Reproducir sonido de notificación cuando es turno de un jugador humano
            if (!this.isAIPlayer(this.gameRules.currentPlayer)) {
                this.playNotificationSound();
            }
            
            // ✅ NUEVO: Recuento de cartas al inicio del turno
            if (!this.isAIPlayer(this.gameRules.currentPlayer)) {
                this.showCardCount();
            }
            
            // Si el nuevo jugador es IA, ejecutar su turno automáticamente
            if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                console.log(`🤖 El siguiente jugador es IA, ejecutando turno automáticamente`);
                // ✅ MEJORADO: Aumentar tiempo para que el jugador vea el cambio de turno
                setTimeout(() => this.aiRules.playAITurn(), 1000);
            }
        } else {
            this.updateStatus("Debes robar una carta y jugar una carta antes de terminar el turno.");
        }
    }

    // ========================================
    // GESTIÓN DE CARTAS
    // ========================================

    playCard(cardIndex) {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return this.aiRules.playCard(cardIndex);
        } else {
            return this.humanRules.playCard(cardIndex);
        }
    }

    handlePlayerSelection(playerId) {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            this.aiRules.handleAIPlayerSelection(playerId, this.humanRules.currentCard);
        } else {
            this.humanRules.handlePlayerSelection(playerId);
        }
        
        this.closeAllModals();
        this.updateDisplay();
        
        // ✅ NUEVO: Verificar victoria después de actualizar la pantalla
        if (this.gameRules.checkVictory()) {
            this.handleVictory();
            return; // ✅ CORREGIDO: Detener ejecución después de la victoria
        }
    }

    handleEquipmentSelection(equipmentType) {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        } else {
            this.humanRules.applyProtection(equipmentType);
        }
        
        this.closeAllModals();
        this.updateDisplay();
        
        // ✅ NUEVO: Verificar victoria después de actualizar la pantalla
        if (this.gameRules.checkVictory()) {
            this.handleVictory();
            return; // ✅ CORREGIDO: Detener ejecución después de la victoria
        }
    }

    handleDestinationSelection(destination) {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        } else {
            console.log(`Destino seleccionado: ${destination}`);
        }
        
        this.closeAllModals();
        this.updateDisplay();
    }

    // ========================================
    // GESTIÓN DE MODALES
    // ========================================

    closeAllModals() {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        }
        
        // Cerrar modales estáticos
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Cerrar modales dinámicos
        const dynamicModals = document.querySelectorAll('.modal[style*="display: block"]');
        dynamicModals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        this.updateDisplay();
    }

    closeExchangeModal(skipExchangeLogic = false, isCancelling = false) {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        }
        
        this.humanRules.closeExchangeModal(skipExchangeLogic, isCancelling);
        this.closeAllModals();
    }

    acceptExchange() {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        }
        
        this.humanRules.executeExchange(false, true);
        this.closeAllModals();
    }

    // ========================================
    // UTILIDADES
    // ========================================

    isAIPlayer(playerIndex) {
        const isAI = this.gameRules.gameMode === 'ai' && playerIndex > 0 && playerIndex < this.gameRules.playerCount;
        console.log(`🔍 Jugador ${playerIndex + 1}, gameMode: ${this.gameRules.gameMode}, playerCount: ${this.gameRules.playerCount}, isAI: ${isAI}`);
        return isAI;
    }

    // ========================================
    // GESTIÓN DE VICTORIA
    // ========================================

    handleVictory() {
        console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} ha ganado la partida`);
        
        // Mostrar el overlay de victoria
        const victoryOverlay = document.getElementById('victory-overlay');
        const victoryMessage = document.getElementById('victory-message');
        
        if (victoryOverlay && victoryMessage) {
            // Personalizar el mensaje según el jugador ganador
            const winnerName = this.isAIPlayer(this.gameRules.currentPlayer) ? 
                `Jugador ${this.gameRules.currentPlayer + 1} (IA)` : 
                `Jugador ${this.gameRules.currentPlayer + 1}`;
            
            victoryMessage.textContent = `¡${winnerName} ha reunido todos los complementos y ha derrotado al gigante!`;
            
            // Mostrar el overlay con animación
            victoryOverlay.style.display = 'flex';
            
            // Animar el modal
            const victoryModal = document.getElementById('victory-modal');
            if (victoryModal) {
                setTimeout(() => {
                    victoryModal.style.transform = 'scale(1)';
                }, 100);
            }
            
            // Configurar event listeners para los botones
            this.setupVictoryModalEvents();
        } else {
            console.error('❌ ERROR: No se encontraron elementos del modal de victoria');
        }
    }

    setupVictoryModalEvents() {
        // Botón "Jugar de Nuevo"
        const replayBtn = document.getElementById('victory-replay');
        if (replayBtn) {
            replayBtn.onclick = () => {
                this.hideVictoryModal();
                this.startNewGame(true);
            };
        }
        
        // Botón "Salir al Menú"
        const exitBtn = document.getElementById('victory-exit');
        if (exitBtn) {
            exitBtn.onclick = () => {
                this.hideVictoryModal();
                this.showGameModeSelection();
            };
        }
    }

    hideVictoryModal() {
        const victoryOverlay = document.getElementById('victory-overlay');
        const victoryModal = document.getElementById('victory-modal');
        
        if (victoryModal) {
            victoryModal.style.transform = 'scale(0.8)';
        }
        
        setTimeout(() => {
            if (victoryOverlay) {
                victoryOverlay.style.display = 'none';
            }
        }, 300);
    }

    // ========================================
    // ACTUALIZACIÓN DE INTERFAZ
    // ========================================

    updateDisplay() {
        // Actualizar información del juego
        const currentPlayerElement = document.getElementById('current-player');
        const turnCounterElement = document.getElementById('turn-counter');
        
        if (currentPlayerElement) {
            currentPlayerElement.textContent = `Jugador actual: ${this.gameRules.currentPlayer + 1}`;
        }
        
        if (turnCounterElement) {
            turnCounterElement.textContent = `Turno: ${this.gameRules.turn}`;
        }
        
        // Los contadores ahora se manejan en updateDeckDisplay() y updateDiscardPileDisplay()
        
        // ✅ CORREGIDO: Mostrar imagen del mazo
        this.updateDeckDisplay();
        
        // ✅ CORREGIDO: Mostrar imagen de la pila de descarte
        this.updateDiscardPileDisplay();
        
        // ✅ NUEVO: Mostrar/ocultar botones según el estado del juego
        const drawCardButton = document.getElementById('draw-card-btn');
        const endTurnButton = document.getElementById('end-turn-btn');
        const forceAITurnButton = document.getElementById('force-ai-turn');
        const newGameButton = document.getElementById('new-game');
        
        if (drawCardButton && endTurnButton && forceAITurnButton && newGameButton) {
            // Mostrar botones solo cuando el juego está activo
            const gameActive = this.gameRules.gameMode !== null;
            
            if (gameActive) {
                drawCardButton.style.display = 'inline-block';
                endTurnButton.style.display = 'inline-block';
                forceAITurnButton.style.display = 'inline-block';
                newGameButton.style.display = 'inline-block';
                
                // Deshabilitar botones cuando es turno de IA
                if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                    drawCardButton.disabled = true;
                    endTurnButton.disabled = true;
                    drawCardButton.style.opacity = '0.5';
                    endTurnButton.style.opacity = '0.5';
                    forceAITurnButton.disabled = false;
                    forceAITurnButton.style.opacity = '1';
                } else {
                    drawCardButton.disabled = false;
                    endTurnButton.disabled = false;
                    drawCardButton.style.opacity = '1';
                    endTurnButton.style.opacity = '1';
                    forceAITurnButton.disabled = true;
                    forceAITurnButton.style.opacity = '0.5';
                }
            } else {
                drawCardButton.style.display = 'none';
                endTurnButton.style.display = 'none';
                forceAITurnButton.style.display = 'none';
                newGameButton.style.display = 'none';
            }
        }
        
        // Mostrar indicación visual del molino activo
        const gameContainerElement = document.getElementById('game-container');
        if (this.gameRules.molinoActive) {
            gameContainerElement.classList.add('molino-active');
            let molinoIndicator = document.getElementById('molino-indicator');
            if (!molinoIndicator) {
                molinoIndicator = document.createElement('div');
                molinoIndicator.id = 'molino-indicator';
                molinoIndicator.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    font-weight: bold;
                    font-size: 16px;
                    z-index: 1000;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                `;
                molinoIndicator.textContent = `🌪️ Molino Activo (${this.gameRules.molinoTurns} turnos)`;
                document.body.appendChild(molinoIndicator);
            } else {
                molinoIndicator.textContent = `🌪️ Molino Activo (${this.gameRules.molinoTurns} turnos)`;
            }
        } else {
            gameContainerElement.classList.remove('molino-active');
            const molinoIndicator = document.getElementById('molino-indicator');
            if (molinoIndicator) {
                molinoIndicator.remove();
            }
        }
        
        // Actualizar jugadores
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            const player = this.gameRules.players[i];
            const playerElement = document.getElementById(`player${i + 1}`);
            
            if (playerElement) {
                // Actualizar estado activo
                playerElement.classList.remove('active', 'skipped');
                if (i === this.gameRules.currentPlayer) {
                    playerElement.classList.add('active');
                } else if (player.skipped) {
                    playerElement.classList.add('skipped');
                }
                
                // Actualizar equipamiento
                const equipmentTypes = ['rocin', 'lanza', 'yelmo', 'escudero'];
                equipmentTypes.forEach(type => {
                    const equipmentElement = document.getElementById(`player${i + 1}-${type}`);
                    if (equipmentElement) {
                        equipmentElement.classList.remove('has-equipment', 'protected');
                        if (player.equipment[type]) {
                            equipmentElement.classList.add('has-equipment');
                            if (player.equipment[type].protected) {
                                equipmentElement.classList.add('protected');
                            }
                        }
                    }
                });
                
                // Actualizar manos de todos los jugadores
                const handCardsMiniContainer = document.getElementById(`player${i + 1}-hand`);
                if (handCardsMiniContainer) {
                    handCardsMiniContainer.innerHTML = '';
                    
                    // ✅ CORREGIDO: Para jugadores IA, mostrar solo reversos de cartas
                    if (this.isAIPlayer(i)) {
                        // Mostrar reversos de cartas para IA (no se ven las cartas individuales)
                        for (let j = 0; j < player.hand.length; j++) {
                            const cardBackElement = createCardBackElement('hand-card-mini');
                            handCardsMiniContainer.appendChild(cardBackElement);
                        }
                    } else {
                        // Para jugador humano, mostrar cartas individuales
                        player.hand.forEach((card, cardIndex) => {
                            const cardElement = document.createElement('div');
                            cardElement.className = 'hand-card-mini';
                            
                            const cardImage = getCardImage(card.name);
                            
                            if (cardImage) {
                                const img = document.createElement('img');
                                img.src = cardImage;
                                img.alt = card.name;
                                img.className = 'card-image';
                                cardElement.appendChild(img);
                                cardElement.title = card.name;
                            } else {
                                cardElement.textContent = '?'; // Fallback for mini cards
                            }
                            
                            handCardsMiniContainer.appendChild(cardElement);
                        });
                    }
                }
            }
        }
        
        // ✅ NUEVO: Actualizar contenido de .player-table-row según el modo de juego
        this.updatePlayerTableRow();
        
        // ✅ NUEVO: Mostrar cartas en la mesa (últimas cartas jugadas)
        this.updateTableCards();
    }
    
    // ✅ NUEVO: Actualizar contenido de .player-table-row según el modo de juego
    updatePlayerTableRow() {
        const currentPlayerTitle = document.querySelector('.current-player-title');
        const handCardsContainer = document.querySelector('.hand-cards');
        const handTitle = document.querySelector('.hand-title');
        
        if (!currentPlayerTitle || !handCardsContainer || !handTitle) {
            console.error('❌ ERROR: No se encontraron elementos de .player-table-row');
            return;
        }
        
        // En modo solo, mostrar información del jugador actual
        if (this.gameRules.gameMode === 'solo') {
            const currentPlayer = this.gameRules.currentPlayer;
            const player = this.gameRules.players[currentPlayer];
            
            // Actualizar título
            currentPlayerTitle.textContent = `Jugador ${currentPlayer + 1} - Tu Mesa`;
            
            // Actualizar título de la mano
            handTitle.textContent = `Mano del Jugador ${currentPlayer + 1}`;
            
            // Actualizar cartas de la mano
            handCardsContainer.innerHTML = '';
            
            // Mostrar cartas con imágenes para el jugador actual
            player.hand.forEach((card, cardIndex) => {
                // Solo permitir clics en cartas si es turno del jugador
                const isClickable = (currentPlayer === this.gameRules.currentPlayer);
                const onClickHandler = isClickable ? () => this.playCard(cardIndex) : null;
                
                const cardElement = createCardElement(card, isClickable, onClickHandler, player.equipment);
                handCardsContainer.appendChild(cardElement);
            });
            
            // Actualizar equipo del jugador actual
            // Nota: Los elementos current-player-* no existen en el HTML actual
            // El equipamiento se muestra en la parte superior de la pantalla
            // y se actualiza automáticamente en updateDisplay()
            
        } else {
            // En modo IA, mantener comportamiento original (solo jugador 1)
            const player1 = this.gameRules.players[0];
            
            // Actualizar título
            currentPlayerTitle.textContent = 'Jugador 1 - Tu Mesa';
            
            // Actualizar título de la mano
            handTitle.textContent = 'Mano del Jugador';
            
            // Actualizar cartas de la mano
            handCardsContainer.innerHTML = '';
            
            // Mostrar cartas con imágenes para el jugador 1
            player1.hand.forEach((card, cardIndex) => {
                // Solo permitir clics en cartas si es turno del jugador 1 y no es IA
                const isClickable = (0 === this.gameRules.currentPlayer && !this.isAIPlayer(this.gameRules.currentPlayer));
                const onClickHandler = isClickable ? () => this.playCard(cardIndex) : null;
                
                const cardElement = createCardElement(card, isClickable, onClickHandler, player1.equipment);
                handCardsContainer.appendChild(cardElement);
            });
            
            // Actualizar equipo del jugador 1
            // Nota: Los elementos current-player-* no existen en el HTML actual
            // El equipamiento se muestra en la parte superior de la pantalla
            // y se actualiza automáticamente en updateDisplay()
        }
    }
    
    // ✅ CORREGIDO: Actualizar cartas en la mesa (equipamiento del jugador actual en modo solo)
    updateTableCards() {
        const tableCardsContainer = document.getElementById('table-cards');
        if (!tableCardsContainer) return;
        
        tableCardsContainer.innerHTML = '';
        
        // En modo solo, mostrar equipamiento del jugador actual
        // En modo IA, mostrar equipamiento del jugador 1
        const targetPlayer = this.gameRules.gameMode === 'solo' ? 
            this.gameRules.currentPlayer : 0;
        const player = this.gameRules.players[targetPlayer];
        
        const equippedCards = [];
        
        // Obtener todas las cartas equipadas
        Object.values(player.equipment).forEach(equipment => {
            if (equipment) {
                equippedCards.push(equipment);
                // Si hay carta de protección, agregarla también
                if (equipment.protectionCard) {
                    equippedCards.push(equipment.protectionCard);
                }
            }
        });
        
        if (equippedCards.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'No hay cartas equipadas';
            emptyMessage.style.cssText = `
                color: #8B4513;
                font-style: italic;
                text-align: center;
                width: 100%;
                padding: 20px;
            `;
            tableCardsContainer.appendChild(emptyMessage);
        } else {
            equippedCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'table-card';
                
                const cardImage = getCardImage(card.name);
                
                if (cardImage) {
                    const img = document.createElement('img');
                    img.src = cardImage;
                    img.alt = card.name;
                    img.className = 'card-image';
                    cardElement.appendChild(img);
                    cardElement.title = card.name;
                } else {
                    cardElement.textContent = card.name;
                }
                
                tableCardsContainer.appendChild(cardElement);
            });
        }
    }
    
    // ✅ NUEVA FUNCIÓN: Actualizar visualización del mazo
    updateDeckDisplay() {
        const deckElement = document.getElementById('deck');
        if (!deckElement) return;
        
        // Limpiar contenido anterior
        deckElement.innerHTML = '';
        
        // Agregar título
        const title = document.createElement('h3');
        title.textContent = 'Mazo';
        deckElement.appendChild(title);
        
        // Agregar imagen del reverso de carta
        const cardBackElement = createCardBackElement('deck-card');
        deckElement.appendChild(cardBackElement);
        
        // Agregar contador
        const countElement = document.createElement('div');
        countElement.className = 'deck-count';
        countElement.id = 'deck-count';
        countElement.textContent = this.gameRules.deck.length;
        deckElement.appendChild(countElement);
    }
    
    // ✅ NUEVA FUNCIÓN: Actualizar visualización de la pila de descarte
    updateDiscardPileDisplay() {
        const discardPileElement = document.getElementById('discard-pile');
        if (!discardPileElement) {
            console.log('❌ ERROR: Elemento discard-pile no encontrado');
            return;
        }
        
        // ✅ CORREGIDO: No limpiar todo el contenido, solo actualizar los elementos necesarios
        
        // Actualizar título (si no existe, crearlo)
        let title = discardPileElement.querySelector('h3');
        if (!title) {
            title = document.createElement('h3');
            title.textContent = 'Descarte';
            discardPileElement.appendChild(title);
        }
        
        // Actualizar contador (si no existe, crearlo)
        let countElement = document.getElementById('discard-count');
        if (!countElement) {
            countElement = document.createElement('div');
            countElement.className = 'discard-count';
            countElement.id = 'discard-count';
            discardPileElement.appendChild(countElement);
        }
        countElement.textContent = this.gameRules.discardPile.length;
        
        // ✅ NUEVO: Mostrar la última carta descartada en el elemento específico
        const lastDiscardedCardElement = document.getElementById('last-discarded-card');
        if (lastDiscardedCardElement) {
            lastDiscardedCardElement.innerHTML = '';
            
            console.log(`🔍 DEBUG: Pila de descartes tiene ${this.gameRules.discardPile.length} cartas`);
            
            if (this.gameRules.discardPile.length > 0) {
                const lastCard = this.gameRules.discardPile[this.gameRules.discardPile.length - 1];
                console.log(`🔍 DEBUG: Última carta descartada: ${lastCard.name}`);
                
                // Crear imagen de la carta
                const cardImage = document.createElement('img');
                cardImage.src = CARD_IMAGE_MAPPING[lastCard.name] || 'images/cartas/Carta_reverso.webp';
                cardImage.alt = lastCard.name;
                cardImage.title = lastCard.name;
                
                console.log(`🔍 DEBUG: Imagen de carta: ${cardImage.src}`);
                lastDiscardedCardElement.appendChild(cardImage);
            } else {
                // ✅ MEJORADO: Mostrar imagen del reverso de carta cuando no hay cartas
                console.log(`🔍 DEBUG: Mostrando imagen del reverso de carta`);
                const cardBackImage = document.createElement('img');
                cardBackImage.src = CARD_BACK_IMAGE;
                cardBackImage.alt = 'Reverso de carta';
                cardBackImage.title = 'Pila de descartes vacía';
                
                console.log(`🔍 DEBUG: Imagen del reverso: ${cardBackImage.src}`);
                lastDiscardedCardElement.appendChild(cardBackImage);
            }
        } else {
            console.log('❌ ERROR: Elemento last-discarded-card no encontrado');
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            // ✅ MEJORADO: Añadir animación y mejor visibilidad
            statusElement.style.opacity = '0';
            statusElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                statusElement.textContent = message;
                statusElement.style.opacity = '1';
                statusElement.style.transform = 'translateY(0)';
                
                // ✅ MEJORADO: Añadir clase especial para mensajes importantes
                if (message.includes('🤖') || message.includes('⏰') || message.includes('🏠')) {
                    statusElement.classList.add('important-message');
                    statusElement.style.fontWeight = 'bold';
                    statusElement.style.color = '#FFD700';
                    statusElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                } else {
                    statusElement.classList.remove('important-message');
                    statusElement.style.fontWeight = 'normal';
                    statusElement.style.color = '';
                    statusElement.style.textShadow = '';
                }
            }, 200);
        }
    }

    showCardCount() {
        let totalHandCount = 0;
        let totalEquipmentCount = 0;
        const handCounts = [];
        const equipmentCounts = [];
        
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            const player = this.gameRules.players[i];
            const playerHandCount = player.hand.length;
            let playerEquipmentCount = 0;
            
            handCounts.push(playerHandCount);
            totalHandCount += playerHandCount;
            
            // ✅ CORREGIDO: Contar equipamientos + cartas de protección
            Object.values(player.equipment).forEach(equipment => {
                if (equipment) {
                    playerEquipmentCount++; // Contar el equipamiento
                    if (equipment.protectionCard) {
                        playerEquipmentCount++; // Contar la carta de protección
                    }
                }
            });
            
            totalEquipmentCount += playerEquipmentCount;
            equipmentCounts.push(playerEquipmentCount);
        }
        
        const deckCount = this.gameRules.deck.length;
        const discardCount = this.gameRules.discardPile.length;
        const total = totalHandCount + totalEquipmentCount + deckCount + discardCount;
        
        // ✅ ELIMINADO: Logs de conteo de cartas para simplificar
    }

    // ✅ SIMPLIFICADO: Función para mostrar estado esencial del turno
    showTurnStatus() {
        const currentPlayer = this.gameRules.currentPlayer;
        const player = this.gameRules.players[currentPlayer];
        const isAI = this.isAIPlayer(currentPlayer);
        
        // ✅ SIMPLIFICADO: Solo información esencial
        console.log(`\n🔄 === TURNO ${this.gameRules.turn} ===`);
        console.log(`👤 Jugador ${currentPlayer + 1} ${isAI ? '(IA)' : '(Humano)'}`);
        
        // ✅ NUEVO: Mostrar si el jugador está saltado
        if (player.skipped) {
            console.log(`⏭️ JUGADOR SALTADO - No puede realizar acciones`);
            return;
        }
        
        console.log(`📋 Cartas en mano: ${player.hand.length}`);
        
        // Mostrar cartas en mano (solo si hay cartas)
        if (player.hand.length > 0) {
            console.log(`   🃏 Cartas: ${player.hand.map(card => `"${card.name}"`).join(', ')}`);
        }
    }

    // ✅ SIMPLIFICADO: Función para mostrar el estado de todos los jugadores
    showAllPlayersStatus() {
        // ✅ ELIMINADO: Logs detallados de todos los jugadores
        // Solo se mostrará información esencial cuando sea necesario
    }

    // ========================================
    // FUNCIÓN DE SONIDO
    // ========================================

    playNotificationSound() {
        try {
            console.log('🔊 Reproduciendo sonido de notificación para jugador humano');
            const audio = new Audio('sonido/notification_alert.mp3');
            audio.volume = 0.5; // Establecer volumen al 50%
            audio.play().catch(error => {
                console.log('🔇 No se pudo reproducir el sonido de notificación:', error);
            });
        } catch (error) {
            console.log('🔇 Error al cargar el archivo de sonido:', error);
        }
    }
}

// ✅ NUEVO: Crear instancia del juego cuando el DOM esté listo
console.log('🔄 script_modular.js terminado de cargar, esperando DOM...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, creando instancia del juego...');
    try {
        const game = new CaballeroHidalgoGame();
        console.log('🎮 Instancia del juego creada exitosamente:', game);
    } catch (error) {
        console.error('❌ Error al crear instancia del juego:', error);
    }
});