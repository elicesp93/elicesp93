// ========================================
// SCRIPT_MODULAR.JS - INTEGRACIÓN PRINCIPAL
// ========================================

class CaballeroHidalgoGame {
    constructor() {
        console.log('🏗️ Inicializando CaballeroHidalgoGame...');
        
        // Inicializar las reglas base
        this.gameRules = new NormalGameRules();
        
        // Inicializar reglas específicas para humanos e IA
        this.humanRules = new HumanPlayerRules(this.gameRules);
        this.aiRules = new AIPlayerRules(this.gameRules);
        
        // Configurar el juego
        this.setupEventListeners();
        
        // Hacer accesible globalmente
        window.game = this;
        
        // Mostrar pantalla de selección de modo
        this.showGameModeSelection();
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
        const gameModeSelection = document.getElementById('game-mode-selection');
        const gameContainer = document.getElementById('game-container');
        const playerCountSelection = document.getElementById('player-count-selection');
        
        if (gameModeSelection) {
            gameModeSelection.style.display = 'flex';
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
            playerCountSelection.style.display = 'block';
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
        
        this.gameRules.resetGame();
        this.updateDisplay();
        this.updateStatus("¡Nuevo juego iniciado! El Jugador 1 debe robar una carta.");
        
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
        const success = this.gameRules.endTurn();
        
        if (success) {
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
            
            // ✅ NUEVO: Recuento de cartas al inicio del turno
            if (!this.isAIPlayer(this.gameRules.currentPlayer)) {
                this.showCardCount();
            }
            
            // Si el nuevo jugador es IA, ejecutar su turno automáticamente
            if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                console.log(`🤖 El siguiente jugador es IA, ejecutando turno automáticamente`);
                // ✅ MEJORADO: Aumentar tiempo para que el jugador vea el cambio de turno
                setTimeout(() => this.aiRules.playAITurn(), 3000);
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
                molinoIndicator.textContent = `🌪️ Molino Activo (${this.gameRules.molinoTurns} rondas)`;
                document.body.appendChild(molinoIndicator);
            } else {
                molinoIndicator.textContent = `🌪️ Molino Activo (${this.gameRules.molinoTurns} rondas)`;
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
                
                // Actualizar mano y equipo del jugador actual (jugador 1)
                if (i === 0) { // Solo el jugador 1 (jugador actual) muestra cartas
                    // Actualizar cartas de la mano
                    const handCardsContainer = document.querySelector('.hand-cards');
                    if (handCardsContainer) {
                        handCardsContainer.innerHTML = '';
                        
                        // Mostrar cartas con imágenes para el jugador actual
                        player.hand.forEach((card, cardIndex) => {
                            // Solo permitir clics en cartas si es turno del jugador y no es IA
                            const isClickable = (i === this.gameRules.currentPlayer && !this.isAIPlayer(this.gameRules.currentPlayer));
                            const onClickHandler = isClickable ? () => this.playCard(cardIndex) : null;
                            
                            const cardElement = createCardElement(card, isClickable, onClickHandler, player.equipment);
                            handCardsContainer.appendChild(cardElement);
                        });
                    }
                    
                    // Actualizar equipo del jugador actual
                    const currentEquipmentTypes = ['rocin', 'lanza', 'yelmo', 'escudero'];
                    currentEquipmentTypes.forEach(type => {
                        const currentEquipmentElement = document.getElementById(`current-player-${type}`);
                        if (currentEquipmentElement) {
                            currentEquipmentElement.classList.remove('has-equipment', 'protected');
                            if (player.equipment[type]) {
                                currentEquipmentElement.classList.add('has-equipment');
                                if (player.equipment[type].protected) {
                                    currentEquipmentElement.classList.add('protected');
                                }
                            }
                        }
                    });
                }
            }
        }
        
        // ✅ NUEVO: Mostrar cartas en la mesa (últimas cartas jugadas)
        this.updateTableCards();
    }
    
    // ✅ CORREGIDO: Actualizar cartas en la mesa (equipamiento del jugador 1)
    updateTableCards() {
        const tableCardsContainer = document.getElementById('table-cards');
        if (!tableCardsContainer) return;
        
        tableCardsContainer.innerHTML = '';
        
        // Mostrar las cartas equipadas del jugador 1 (jugador humano)
        const player1 = this.gameRules.players[0];
        const equippedCards = [];
        
        // Obtener todas las cartas equipadas
        Object.values(player1.equipment).forEach(equipment => {
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
        // ✅ CORREGIDO: Contar cartas de TODOS los jugadores
        let totalHandCount = 0;
        let totalEquipmentCount = 0;
        
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            const player = this.gameRules.players[i];
            totalHandCount += player.hand.length;
            
            // ✅ CORREGIDO: Contar equipamientos + cartas de protección
            Object.values(player.equipment).forEach(equipment => {
                if (equipment) {
                    totalEquipmentCount++; // Contar el equipamiento
                    if (equipment.protectionCard) {
                        totalEquipmentCount++; // Contar la carta de protección
                    }
                }
            });
        }
        
        const deckCount = this.gameRules.deck.length;
        const discardCount = this.gameRules.discardPile.length;
        const total = totalHandCount + totalEquipmentCount + deckCount + discardCount;
        
        console.log(`📊 CONTEO DE CARTAS (Turno Humano):`);
        console.log(`  📋 En manos: ${totalHandCount} cartas`);
        console.log(`  🛡️ Equipadas: ${totalEquipmentCount} cartas`);
        console.log(`  🃏 En mazo: ${deckCount} cartas`);
        console.log(`  🗑️ En descarte: ${discardCount} cartas`);
        console.log(`  📈 TOTAL: ${total}/52 cartas`);
    }

    // ✅ NUEVO: Función para forzar el turno de la IA si se ha congelado
    forceAITurn() {
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            console.log(`🔄 Forzando turno de IA para Jugador ${this.gameRules.currentPlayer + 1}`);
            this.aiRules.playAITurn();
        }
    }

    // ✅ NUEVO: Función para manejar la victoria
    handleVictory() {
        console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} ha ganado la partida`);
        
        // Actualizar el estado del juego
        this.updateStatus(`¡Jugador ${this.gameRules.currentPlayer + 1} ha derrotado al gigante y ganado la partida!`);
        
        // Mostrar modal de victoria después de un pequeño delay
        setTimeout(() => {
            const overlay = document.getElementById('victory-overlay');
            const modal = document.getElementById('victory-modal');
            const message = document.getElementById('victory-message');
            
            if (overlay && modal && message) {
                // Mostrar overlay
                overlay.style.display = 'flex';
                setTimeout(() => {
                    overlay.style.background = 'rgba(0, 0, 0, 0.85)';
                    modal.style.transform = 'scale(1)';
                }, 10);
                
                // Actualizar mensaje
                message.textContent = `¡Jugador ${this.gameRules.currentPlayer + 1} ha derrotado al gigante y ganado la partida!`;
                
                // Bloquear interacción con el juego
                document.body.style.overflow = 'hidden';
                
                // Configurar botones
                this.setupVictoryButtons();
            }
        }, 500);
    }

    // ✅ NUEVO: Configurar botones del modal de victoria
    setupVictoryButtons() {
        const replayBtn = document.getElementById('victory-replay');
        const exitBtn = document.getElementById('victory-exit');
        const overlay = document.getElementById('victory-overlay');
        const modal = document.getElementById('victory-modal');
        
        if (replayBtn) {
            replayBtn.onclick = () => {
                this.hideVictoryModal();
                // Reiniciar juego con la misma configuración
                this.startNewGame(true);
            };
        }
        
        if (exitBtn) {
            exitBtn.onclick = () => {
                this.hideVictoryModal();
                // Volver al menú principal
                this.showGameModeSelection();
            };
        }
    }

    // ✅ NUEVO: Ocultar modal de victoria
    hideVictoryModal() {
        const overlay = document.getElementById('victory-overlay');
        const modal = document.getElementById('victory-modal');
        
        if (overlay && modal) {
            overlay.style.background = 'rgba(0, 0, 0, 0)';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new CaballeroHidalgoGame();
}); 