// ========================================
// AIPLAYER_SCRIPT.JS - LÓGICA DE LA INTELIGENCIA ARTIFICIAL
// ========================================

console.log('🤖 aiplayer_script.js cargado');

class AIPlayerRules {
    constructor(gameRules) {
        this.gameRules = gameRules;
        this.currentCard = null;
        this.currentCardIndex = undefined;
    }

    // ========================================
    // TURNO DE IA
    // ========================================

    async playAITurn() {
        // ✅ NUEVO: Iniciar el turno si no está en progreso
        if (!this.gameRules.turnInProgress) {
            this.gameRules.startTurn();
        }

        if (!this.isAIPlayer(this.gameRules.currentPlayer)) {
            return;
        }

        console.log(`🤖 Turno de IA: Jugador ${this.gameRules.currentPlayer + 1}`);
        
        // ✅ NUEVO: Mostrar estado detallado del turno de IA
        if (window.game && window.game.showTurnStatus) {
            window.game.showTurnStatus();
        }
        
        // ✅ NUEVO: Recuento de cartas al inicio del turno
        this.showCardCount();
        
        this.gameRules.aiSelectionHandled = false;
        
        // ✅ ELIMINADO: Delay inicial del turno para que la IA robe más rápido

        // Fase 1: Robar carta
        if (!this.gameRules.hasDrawn && !this.gameRules.librosMode) {
            console.log(`🤖 IA robando carta...`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) está robando una carta...`);
            }
            this.gameRules.drawCard();
            // ✅ MEJORADO: Aumentar tiempo para que se vea la acción
            await this.delay(3000);
        }

        // Fase 2: Jugar carta
        if ((this.gameRules.hasDrawn || this.gameRules.librosMode) && !this.gameRules.hasPlayed) {
            console.log(`🤖 IA jugando carta...`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) está evaluando sus cartas...`);
            }
            await this.delay(2000);
            this.playAICard();
            
            const currentCard = this.currentCard;
            if (currentCard && ['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos', 'caballo', 'insula', 'barbas', 'palo', 'balsamo'].includes(currentCard.type)) {
                console.log(`🤖 IA esperando resolución de carta interactiva: ${currentCard.name}`);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) está resolviendo: ${currentCard.name}...`);
                }
                await this.delay(5000);
            } else {
                // ✅ MEJORADO: Mostrar mensaje visual al jugador con acción específica
                if (window.game && window.game.updateStatus) {
                    const currentCard = this.currentCard;
                    if (currentCard) {
                        window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) jugó: ${currentCard.name}`);
                    } else {
                        window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) completó su turno`);
                    }
                }
                await this.delay(3000);
            }
        }
        
        console.log(`🔍 DEBUG: Condiciones para terminar turno: hasDrawn=${this.gameRules.hasDrawn}, librosMode=${this.gameRules.librosMode}, hasPlayed=${this.gameRules.hasPlayed}, aiSelectionHandled=${this.gameRules.aiSelectionHandled}, isAI=${this.isAIPlayer(this.gameRules.currentPlayer)}`);
        
        // ✅ CORREGIDO: Simplificar la lógica de finalización del turno
        // Si el jugador ha robado y jugado, o está en modo libros y ha jugado, terminar el turno
        if (((this.gameRules.hasDrawn || this.gameRules.librosMode) && this.gameRules.hasPlayed) || 
            (this.gameRules.hasDrawn && this.gameRules.players[this.gameRules.currentPlayer].hand.length === 0)) {
            console.log(`🤖 IA terminando turno...`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) terminó su turno...`);
            }
            await this.delay(2000);
            if (window.game && window.game.endTurn) {
                window.game.endTurn();
            }
        } else {
            console.log(`🔍 DEBUG: IA no puede terminar turno aún - hasDrawn: ${this.gameRules.hasDrawn}, librosMode: ${this.gameRules.librosMode}, hasPlayed: ${this.gameRules.hasPlayed}, handLength: ${this.gameRules.players[this.gameRules.currentPlayer].hand.length}`);
        }
    }

    playAICard() {
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const hand = player.hand;

        if (hand.length === 0) {
            console.log(`🤖 IA no tiene cartas para jugar`);
            // ✅ CORREGIDO: Si no tiene cartas, marcar como que ya jugó para poder terminar el turno
            this.gameRules.hasPlayed = true;
            return;
        }

        console.log(`🔍 IA evaluando estratégicamente las cartas...`);
        
        let bestCardIndex = 0;
        let bestValue = -1;
        
        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            const value = this.evaluateCardValue(card, player);
            
            console.log(`🤖 IA: ${card.name} = valor ${value}`);
            
            if (value > bestValue) {
                bestValue = value;
                bestCardIndex = i;
            }
        }

        console.log(`🤖 IA seleccionó estratégicamente: ${hand[bestCardIndex].name} (valor: ${bestValue})`);
        
        // ✅ NUEVO: Registrar la carta jugada por la IA
        if (window.game && window.game.logCardPlay) {
            window.game.logCardPlay(hand[bestCardIndex].name);
        }
        
        this.playCard(bestCardIndex);
    }

    playCard(cardIndex) {
        console.log(`🔍 [DEBUG] playCard INICIADO - Índice: ${cardIndex}, Fase: ${this.gameRules.gamePhase}, hasPlayed: ${this.gameRules.hasPlayed}, librosMode: ${this.gameRules.librosMode}`);
        
        // ✅ NUEVO: Validar que solo el jugador actual pueda jugar
        if (!this.gameRules.validatePlayerAction(this.gameRules.currentPlayer)) {
            console.log(`❌ playCard RECHAZADO - No es el turno del jugador`);
            return false;
        }
        
        if (this.gameRules.gamePhase !== 'play' || (this.gameRules.hasPlayed && !this.gameRules.librosMode)) {
            return false;
        }

        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const card = player.hand[cardIndex];

        if (!card) return false;

        console.log(`🤖 IA JUGANDO CARTA: ${card.name} (${card.category}) - Índice: ${cardIndex}`);

        if (card.category === 'evento') {
            this.playCardToDiscard(cardIndex);
        } else {
            this.showPlayOptions(cardIndex);
        }
        return true;
    }

    playCardToDiscard(cardIndex) {
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const card = player.hand[cardIndex];

        console.log(`📤 IA DESCARTANDO CARTA: ${card.name} - Índice: ${cardIndex}`);

        this.currentCardIndex = cardIndex;
        this.executeCardEffect(card, cardIndex);

        const requiresInteraction = ['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos', 'caballo', 'insula', 'barbas', 'palo', 'libros'].includes(card.type);

        console.log(`🔍 DEBUG: playCardToDiscard - requiresInteraction=${requiresInteraction}, card.type=${card.type}`);

        if (!requiresInteraction) {
            if (player.hand[cardIndex] === card) {
                player.hand.splice(cardIndex, 1);
                this.gameRules.discardPile.push(card);
            }
            this.gameRules.hasPlayed = true;
        } else {
            console.log(`🔍 DEBUG: Carta requiere interacción, NO removiendo de mano aún`);
        }
    }

    showPlayOptions(cardIndex) {
        this.currentCardIndex = cardIndex;
        const card = this.gameRules.players[this.gameRules.currentPlayer].hand[cardIndex];
        
        console.log(`⚙️ IA OPCIONES DE JUEGO: ${card.name} (${card.category}) - Índice: ${cardIndex}`);
        
        if (card.category === 'complemento') {
            this.addEquipment(card.type);
            this.finishCardPlay(cardIndex);
        } else if (card.category === 'sabotaje') {
            this.executeCardEffect(card, cardIndex);
        } else if (card.category === 'doble-accion') {
            // ✅ NUEVO: Manejar cartas de doble-acción directamente
            this.handleDobleAccionCard(card, cardIndex);
        } else if (card.category === 'proteccion') {
            // ✅ CORREGIDO: Las cartas de protección se manejan directamente, no a través de executeCardEffect
            this.useBalsamo(cardIndex);
        } else {
            this.playCardToDiscard(cardIndex);
        }
    }

    finishCardPlay(cardIndex) {
        const card = this.currentCard;
        if (!card) return;

        console.log(`🎯 IA FINISHING CARD PLAY: ${card.name} (tipo: ${card.type})`);
        this.executeCardEffect(card, cardIndex);
    }

    // ========================================
    // EFECTOS DE CARTAS PARA IA
    // ========================================

    executeCardEffect(card, cardIndex) {
        console.log(`🎯 IA EJECUTANDO EFECTO: ${card.name} (${card.category})`);
        
        const requiresInteraction = ['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos', 'caballo', 'insula', 'barbas', 'palo', 'libros'].includes(card.type);
        
        if (requiresInteraction) {
            if (!this.gameRules.aiSelectionHandled) {
                this.gameRules.aiSelectionHandled = true;
                
                // ✅ CORREGIDO: Para cartas de sabotaje, procesar inmediatamente
                if (['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos'].includes(card.type)) {
                    console.log(`⚔️ SABOTAJE INMEDIATO: Procesando ${card.name} antes del cambio de turno`);
                    this.handleSabotageImmediately(card, cardIndex);
                } else {
                    // ✅ MEJORADO: Solo usar setTimeout para cartas que no son sabotaje
                    setTimeout(() => this.handleAISelection(card, cardIndex), 2000);
                }
            }
        } else {
            switch (card.type) {
                case 'molino':
                    this.activateMolino();
                    break;
                case 'vuelta':
                    this.vueltaACasa();
                    break;
                default:
                    // ✅ CORREGIDO: Para cualquier otra carta que no requiera interacción, marcar como jugada
                    console.log(`🤖 IA: Carta sin interacción procesada: ${card.name}`);
                    this.gameRules.hasPlayed = true;
                    break;
            }
        }
    }

    // ✅ NUEVO: Función para procesar sabotajes inmediatamente
    handleSabotageImmediately(card, cardIndex) {
        console.log(`⚔️ SABOTAJE INMEDIATO: ${card.name} (tipo: ${card.type})`);
        
        // ✅ MEJORADO: Mostrar mensaje visual al jugador
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) está resolviendo: ${card.name}...`);
        }
        
        let targetPlayer;
        
        if (['flaqueza', 'duelo', 'bacia', 'pies'].includes(card.type)) {
            targetPlayer = this.findStrongestPlayer();
            console.log(`🤖 IA ATACANDO AL MÁS FUERTE: Jugador ${targetPlayer + 1} (${card.name})`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) ataca al más fuerte: Jugador ${targetPlayer + 1} con ${card.name}`);
            }
        } else if (card.type === 'doncella') {
            targetPlayer = this.findStrongestPlayer();
            console.log(`🤖 IA RETRASANDO AL MÁS FUERTE: Jugador ${targetPlayer + 1} (Doncella)`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) retrasa al más fuerte: Jugador ${targetPlayer + 1} con Doncella en apuros`);
            }
        } else if (card.type === 'princesa') {
            targetPlayer = this.findStrongestPlayer();
            console.log(`🤖 IA ENVIANDO A CASA AL MÁS FUERTE: Jugador ${targetPlayer + 1} (Princesa)`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) envía a casa al más fuerte: Jugador ${targetPlayer + 1} con Princesa Micomicona`);
            }
        } else if (card.type === 'cuchicheos') {
            targetPlayer = this.findWeakestPlayer();
            console.log(`🎯 IA INTERCAMBIANDO CON EL MÁS DÉBIL: Jugador ${targetPlayer + 1} (Cuchicheos)`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) intercambia con el más débil: Jugador ${targetPlayer + 1} con Cuchicheos de ventero`);
            }
        }
        
        // ✅ CORREGIDO: Procesar el efecto inmediatamente
        this.handleAIPlayerSelection(targetPlayer + 1, card);
        
        // ✅ CORREGIDO: Marcar como jugado después de procesar
        this.gameRules.hasPlayed = true;
        this.gameRules.aiSelectionHandled = false;
        
        console.log(`⚔️ SABOTAJE INMEDIATO: ${card.name} procesado completamente`);
        
        // ✅ NUEVO: Terminar el turno automáticamente después de procesar el sabotaje
        if (this.isAIPlayer(this.gameRules.currentPlayer)) {
            console.log(`⚔️ SABOTAJE INMEDIATO: Terminando turno automáticamente después de procesar ${card.name}`);
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 2000);
        }
    }

    async handleAISelection(card, cardIndex) {
        console.log(`🔍 IA handleAISelection iniciado para ${card.name} (tipo: ${card.type})`);
        
        // ✅ MEJORADO: Mostrar mensaje visual al jugador
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) está resolviendo: ${card.name}...`);
        }
        
        this.gameRules.hasPlayed = true;
        
        if (['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos'].includes(card.type)) {
            let targetPlayer;
            
            if (['flaqueza', 'duelo', 'bacia', 'pies'].includes(card.type)) {
                targetPlayer = this.findStrongestPlayer();
                console.log(`🤖 IA ATACANDO AL MÁS FUERTE: Jugador ${targetPlayer + 1} (${card.name})`);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) ataca al más fuerte: Jugador ${targetPlayer + 1} con ${card.name}`);
                }
            } else if (card.type === 'doncella') {
                targetPlayer = this.findStrongestPlayer();
                console.log(`🤖 IA RETRASANDO AL MÁS FUERTE: Jugador ${targetPlayer + 1} (Doncella)`);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) retrasa al más fuerte: Jugador ${targetPlayer + 1} con Doncella en apuros`);
                }
            } else if (card.type === 'princesa') {
                targetPlayer = this.findStrongestPlayer();
                console.log(`🤖 IA ENVIANDO A CASA AL MÁS FUERTE: Jugador ${targetPlayer + 1} (Princesa)`);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) envía a casa al más fuerte: Jugador ${targetPlayer + 1} con Princesa Micomicona`);
                }
            } else if (card.type === 'cuchicheos') {
                targetPlayer = this.findWeakestPlayer();
                console.log(`🎯 IA INTERCAMBIANDO CON EL MÁS DÉBIL: Jugador ${targetPlayer + 1} (Cuchicheos)`);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) intercambia con el más débil: Jugador ${targetPlayer + 1} con Cuchicheos de ventero`);
                }
            }
            
            // ✅ MEJORADO: Añadir delay para que se vea la acción
            await this.delay(3000);
            
            this.handleAIPlayerSelection(targetPlayer + 1, card);
            this.gameRules.aiSelectionHandled = false;
            
            if (this.isAIPlayer(this.gameRules.currentPlayer) && card.type !== 'cuchicheos') {
                console.log(`🤖 IA: Turno completado, listo para finalizar`);
            }
        } else if (card.type === 'balsamo') {
            // ✅ CORREGIDO: Las cartas de protección ya se manejan en showPlayOptions, no aquí
            console.log(`🤖 IA: Bálsamo de Fierabrás ya procesado en showPlayOptions`);
            
            this.gameRules.aiSelectionHandled = false;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                console.log(`🤖 IA: Turno completado, listo para finalizar`);
            }
        } else if (['caballo', 'insula', 'barbas', 'palo'].includes(card.type)) {
            // ✅ CORREGIDO: Las cartas de doble-acción ya se manejan en handleDobleAccionCard, no aquí
            console.log(`🤖 IA: Carta de doble-acción ya procesada en handleDobleAccionCard`);
            
            this.gameRules.hasPlayed = true;
            this.gameRules.aiSelectionHandled = false;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            if (this.isAIPlayer(this.gameRules.currentPlayer)) {
                console.log(`🤖 IA: Turno completado, listo para finalizar`);
            }
        } else if (card.type === 'libros') {
            console.log(`📚 IA usando Libros de caballería`);
            // ✅ MEJORADO: Mostrar mensaje visual al jugador
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) usa Libros de caballería para jugar una carta adicional`);
            }
            this.useLibros(cardIndex);
            this.gameRules.aiSelectionHandled = false;
            this.currentCard = null;
            this.currentCardIndex = undefined;
        }
    }

    handleAIPlayerSelection(playerId, card) {
        // ✅ NUEVO: Guardar el jugador actual antes de procesar
        const originalPlayer = this.gameRules.currentPlayer;
        
        console.log(`🎯 IA PROCESANDO SELECCIÓN: ${card.name} contra Jugador ${playerId}`);
        
        // ✅ NUEVO: Registrar la acción de la IA con el jugador objetivo
        if (window.game && window.game.logCardPlay) {
            window.game.logCardPlay(card.name, parseInt(playerId) - 1, card.type);
        }

        switch (card.type) {
            case 'flaqueza':
                this.gameRules.removeEquipment(parseInt(playerId) - 1, 'rocin');
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) quitó el Rocín del Jugador ${playerId} con Flaqueza y mala traza!`);
                }
                break;
            case 'duelo':
                this.gameRules.removeEquipment(parseInt(playerId) - 1, 'lanza');
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) quitó la Lanza del Jugador ${playerId} con Duelo con vizcaíno!`);
                }
                break;
            case 'bacia':
                this.gameRules.removeEquipment(parseInt(playerId) - 1, 'yelmo');
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) quitó el Yelmo del Jugador ${playerId} con Bacía de barbero!`);
                }
                break;
            case 'pies':
                this.gameRules.removeEquipment(parseInt(playerId) - 1, 'escudero');
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) quitó el Escudero del Jugador ${playerId} con Pies a tierra!`);
                }
                break;
            case 'doncella':
                this.gameRules.players[parseInt(playerId) - 1].skipped = true;
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) hizo que el Jugador ${playerId} pierda su próximo turno con Doncella en apuros!`);
                }
                break;
            case 'princesa':
                this.vueltaACasaForPlayer(parseInt(playerId) - 1);
                // ✅ MEJORADO: Mostrar mensaje visual al jugador
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) envió al Jugador ${playerId} a casa con Princesa Micomicona!`);
                }
                break;
            case 'cuchicheos':
                this.exchangeCards(parseInt(playerId) - 1);
                break;
            case 'caballo':
            case 'insula':
            case 'barbas':
            case 'palo':
                this.stealEquipment(parseInt(playerId) - 1, card.target);
                return;
        }

        // ✅ CORREGIDO: Para todas las cartas, procesar el descarte y finalización
        console.log(`🔍 DEBUG: Antes de discardCurrentCard - currentCardIndex=${this.currentCardIndex}, currentCard=${this.currentCard ? this.currentCard.name : 'null'}`);
        
        // ✅ NUEVO: Para cuchicheos, el descarte se maneja en executeAIExchange
        if (card.type !== 'cuchicheos') {
            // ✅ NUEVO: Usar el jugador original para descartar
            this.discardCurrentCard(originalPlayer);
        }
        
        this.gameRules.hasPlayed = true;
        this.gameRules.aiSelectionHandled = false;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        console.log(`🔍 DEBUG: Estado después de procesar ${card.name}: hasDrawn=${this.gameRules.hasDrawn}, hasPlayed=${this.gameRules.hasPlayed}, aiSelectionHandled=${this.gameRules.aiSelectionHandled}`);
        
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ CORREGIDO: Solo finalizar turno automáticamente si NO es un sabotaje procesado inmediatamente
        // Los sabotajes ya se procesan en handleSabotageImmediately, no aquí
        if (this.isAIPlayer(this.gameRules.currentPlayer) && !['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos'].includes(card.type)) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
            // ✅ CORREGIDO: Finalizar turno automáticamente después de procesar carta
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 2000);
        }
    }

    // ========================================
    // CARTAS ESPECÍFICAS PARA IA
    // ========================================

    addEquipment(equipmentType) {
        const success = this.gameRules.addEquipment(equipmentType);
        
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
            const card = player.hand[this.currentCardIndex];
            console.log(`[DEBUG] addEquipment IA: Equipando "${card.name}" como ${equipmentType}. Mano antes: ${player.hand.length} cartas`);
            
            player.hand.splice(this.currentCardIndex, 1);
            console.log(`[DEBUG] addEquipment IA: "${card.name}" removida de la mano. Mano después: ${player.hand.length} cartas`);
            console.log(`✅ CARTA EQUIPADA: ${this.gameRules.getEquipmentName(equipmentType)} removida de la mano`);
        }
        
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        if (success) {
            console.log(`🔧 IA equipó: ${this.gameRules.getEquipmentName(equipmentType)}`);
            // ✅ MEJORADO: Mostrar mensaje específico de equipamiento
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) equipó: ${this.gameRules.getEquipmentName(equipmentType)}`);
            }
        } else {
            console.log(`🔧 IA ya tenía: ${this.gameRules.getEquipmentName(equipmentType)}`);
            // ✅ MEJORADO: Mostrar mensaje cuando ya tiene el equipamiento
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) ya tenía: ${this.gameRules.getEquipmentName(equipmentType)}`);
            }
        }
        
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ NUEVO: Verificar victoria inmediata después de equipar
        if (success && this.gameRules.checkVictory()) {
            console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} (IA) ha reunido todos los complementos`);
            if (window.game && window.game.handleVictory) {
                window.game.handleVictory();
            }
            return;
        }
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
            // ✅ CORREGIDO: Finalizar turno automáticamente después de equipar
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 2000);
        }
    }

    applyProtection(equipmentType) {
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        if (player.equipment[equipmentType]) {
            if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
                const protectionCard = player.hand.splice(this.currentCardIndex, 1)[0];
                console.log(`[DEBUG] applyProtection IA: Protección aplicada: ${protectionCard.name} sobre ${equipmentType}. Mano antes: ${player.hand.length + 1} cartas, Mano después: ${player.hand.length} cartas`);
                
                player.equipment[equipmentType].protected = true;
                player.equipment[equipmentType].protectionCard = protectionCard;
                console.log(`🛡️ CARTA DE PROTECCIÓN EQUIPADA: ${protectionCard.name} sobre ${this.gameRules.getEquipmentName(equipmentType)}`);
            }
            
            console.log(`🛡️ IA protegió su ${this.gameRules.getEquipmentName(equipmentType)}`);
            // ✅ MEJORADO: Mostrar mensaje específico de protección
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) protegió su: ${this.gameRules.getEquipmentName(equipmentType)}`);
            }
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ NUEVO: Final automático del turno para IA
            if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
                console.log(`🤖 IA: Turno completado, listo para finalizar`);
                // ✅ CORREGIDO: Finalizar turno automáticamente después de proteger
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 2000);
            }
        }
    }

    // ✅ NUEVO: Función para manejar cartas de doble-acción
    handleDobleAccionCard(card, cardIndex) {
        console.log(`🔄 IA manejando carta de doble-acción: ${card.name}`);
        
        const choice = this.decideDobleAccionStrategy(card);
        
        if (choice === 'protect') {
            const player = this.gameRules.players[this.gameRules.currentPlayer];
            const equipmentTypes = ['rocin', 'lanza', 'yelmo', 'escudero'];
            let bestEquipment = 'rocin';
            let bestValue = 0;
            
            for (const equipment of equipmentTypes) {
                if (player.equipment[equipment]) {
                    const otherPlayersWithSame = this.findPlayerWithEquipment(equipment);
                    const value = otherPlayersWithSame !== -1 ? 2 : 1;
                    if (value > bestValue) {
                        bestValue = value;
                        bestEquipment = equipment;
                    }
                }
            }
            
            console.log(`🤖 IA protegiendo estratégicamente: ${bestEquipment}`);
            // ✅ MEJORADO: Mostrar mensaje específico de protección estratégica
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) protegiendo estratégicamente: ${this.gameRules.getEquipmentName(bestEquipment)}`);
            }
            this.applyProtection(bestEquipment);
        } else {
            const targetPlayer = this.findStrongestPlayer();
            console.log(`🤖 IA robando estratégicamente del más fuerte: Jugador ${targetPlayer + 1}`);
            // ✅ MEJORADO: Mostrar mensaje específico de robo estratégico
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) robando estratégicamente del más fuerte: Jugador ${targetPlayer + 1}`);
            }
            
            // Determinar qué equipamiento robar basado en el tipo de carta
            let equipmentToSteal = 'rocin';
            if (card.type === 'caballo') equipmentToSteal = 'rocin';
            else if (card.type === 'insula') equipmentToSteal = 'lanza';
            else if (card.type === 'barbas') equipmentToSteal = 'yelmo';
            else if (card.type === 'palo') equipmentToSteal = 'escudero';
            
            this.stealEquipment(targetPlayer, equipmentToSteal);
        }
    }

    // ✅ NUEVO: Función para usar Bálsamo de Fierabrás
    useBalsamo(cardIndex) {
        console.log(`🛡️ IA usando Bálsamo de Fierabrás`);
        
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const equipmentTypes = ['rocin', 'lanza', 'yelmo', 'escudero'];
        let bestEquipment = 'rocin';
        let bestValue = 0;
        
        // Encontrar el mejor equipamiento para proteger
        for (const equipment of equipmentTypes) {
            if (player.equipment[equipment]) {
                const otherPlayersWithSame = this.findPlayerWithEquipment(equipment);
                const value = otherPlayersWithSame !== -1 ? 2 : 1;
                if (value > bestValue) {
                    bestValue = value;
                    bestEquipment = equipment;
                }
            }
        }
        
        console.log(`🤖 IA protegiendo estratégicamente: ${bestEquipment}`);
        // ✅ MEJORADO: Mostrar mensaje específico de protección estratégica
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) protegiendo estratégicamente: ${this.gameRules.getEquipmentName(bestEquipment)}`);
        }
        this.applyProtection(bestEquipment);
    }

    stealEquipment(targetPlayerId, equipmentType) {
        const targetPlayer = this.gameRules.players[targetPlayerId];
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        
        console.log(`🔄 IA INICIANDO ROBO: ${equipmentType} del Jugador ${targetPlayerId + 1}`);
        
        if (targetPlayer.equipment[equipmentType]) {
            if (targetPlayer.equipment[equipmentType].protected) {
                console.log(`🛡️ EQUIPAMIENTO PROTEGIDO: ${equipmentType} del Jugador ${targetPlayerId + 1} está protegido`);
                // ✅ MEJORADO: Mostrar mensaje específico de protección
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) intentó robar ${this.gameRules.getEquipmentName(equipmentType)} pero estaba protegido`);
                }
                targetPlayer.equipment[equipmentType].protected = false;
                
                this.discardCurrentCard();
                this.gameRules.hasPlayed = true;
                this.currentCard = null;
                this.currentCardIndex = undefined;
                
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                
                // ✅ NUEVO: Final automático del turno para IA
                if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
                    console.log(`🤖 IA: Turno completado, listo para finalizar`);
                }
                return;
            }
            
            const stolenEquipment = targetPlayer.equipment[equipmentType];
            console.log(`[DEBUG] stealEquipment IA: Robando "${stolenEquipment.name}" del Jugador ${targetPlayerId + 1}. Equipamiento antes: ${JSON.stringify(stolenEquipment)}`);
            
            targetPlayer.equipment[equipmentType] = null;
            
            console.log(`✅ IA EQUIPAMIENTO ROBADO: ${stolenEquipment.name} del Jugador ${targetPlayerId + 1}`);
            
            if (!currentPlayer.equipment[equipmentType]) {
                currentPlayer.equipment[equipmentType] = stolenEquipment;
                console.log(`[DEBUG] stealEquipment IA: "${stolenEquipment.name}" equipado automáticamente al Jugador ${this.gameRules.currentPlayer + 1}`);
                console.log(`🔧 IA EQUIPANDO AUTOMÁTICAMENTE: ${stolenEquipment.name}`);
                // ✅ MEJORADO: Mostrar mensaje específico de robo y equipamiento
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) robó y equipó: ${stolenEquipment.name}`);
                }
                
                this.discardCurrentCard();
                this.gameRules.hasPlayed = true;
                this.currentCard = null;
                this.currentCardIndex = undefined;
                
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                
                // ✅ NUEVO: Final automático del turno para IA
                if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
                    console.log(`🤖 IA: Turno completado, listo para finalizar`);
                }
            } else {
                console.log(`[DEBUG] stealEquipment IA: Jugador ${this.gameRules.currentPlayer + 1} ya tiene ${equipmentType}, mostrando modal de destino`);
                this.showDestinationModal(stolenEquipment);
            }
        } else {
            console.log(`❌ IA NO HAY EQUIPAMIENTO PARA ROBAR: ${equipmentType} del Jugador ${targetPlayerId + 1}`);
            // ✅ MEJORADO: Mostrar mensaje específico cuando no hay equipamiento
            if (window.game && window.game.updateStatus) {
                window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) intentó robar ${this.gameRules.getEquipmentName(equipmentType)} pero no lo encontró`);
            }
            this.discardCurrentCard();
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ NUEVO: Final automático del turno para IA
            if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
                console.log(`🤖 IA: Turno completado, listo para finalizar`);
            }
        }
    }

    showDestinationModal(equipment) {
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        
        currentPlayer.equipment[equipment.type] = equipment;
                        console.log(`🔧 IA reemplazó su equipamiento con ${equipment.name}`);
                // ✅ MEJORADO: Mostrar mensaje específico de reemplazo
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) reemplazó su equipamiento con: ${equipment.name}`);
                }
        
        this.discardCurrentCard();
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
        }
    }

    activateMolino() {
        this.gameRules.molinoActive = true;
        this.gameRules.molinoTurns = 4; // Una ronda completa (4 jugadores)
        this.gameRules.molinoPlayer = this.gameRules.currentPlayer;
        console.log(`🌪️ IA activó Molino de viento`);
        // ✅ MEJORADO: Mostrar mensaje específico de evento
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) activó: Molino de viento`);
        }
        
        // ✅ CORREGIDO: Marcar como que ya jugó la carta
        this.gameRules.hasPlayed = true;
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
        }
    }

    vueltaACasa() {
        // ✅ CORREGIDO: Las cartas descartadas van a la pila de descartes
        const allDiscardedCards = [];
        this.gameRules.players.forEach(player => {
            const discardedCards = [...player.hand];
            player.hand = [];
            allDiscardedCards.push(...discardedCards);
        });
        
        // Añadir todas las cartas descartadas a la pila de descartes
        allDiscardedCards.forEach(card => {
            this.gameRules.discardPile.push(card);
        });
        
        console.log(`🗑️ VUELTA A CASA: ${allDiscardedCards.length} cartas descartadas de todos los jugadores van al descarte`);
        console.log(`🗑️ Cartas descartadas: ${allDiscardedCards.map(c => c.name).join(', ')}`);

        const cardsPerPlayer = Math.min(3, Math.floor(this.gameRules.deck.length / this.gameRules.playerCount));
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            for (let j = 0; j < this.gameRules.playerCount; j++) {
                if (this.gameRules.deck.length > 0) {
                    this.gameRules.players[j].hand.push(this.gameRules.deck.pop());
                }
            }
        }
        
        if (cardsPerPlayer < 3 && this.gameRules.discardPile.length > 1) {
            this.gameRules.reshuffleDiscard();
            
            const remainingCards = 3 - cardsPerPlayer;
            for (let i = 0; i < remainingCards; i++) {
                if (this.gameRules.deck.length >= this.gameRules.playerCount) {
                    for (let j = 0; j < this.gameRules.playerCount; j++) {
                        if (this.gameRules.deck.length > 0) {
                            this.gameRules.players[j].hand.push(this.gameRules.deck.pop());
                        }
                    }
                }
            }
        }

        console.log(`🏠 IA ejecutó Vuelta a casa`);
        // ✅ MEJORADO: Mostrar mensaje específico de evento
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) ejecutó: Vuelta a casa`);
        }
        
        // ✅ CORREGIDO: Marcar como que ya jugó la carta
        this.gameRules.hasPlayed = true;
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
        }
    }

    vueltaACasaForPlayer(playerId) {
        const player = this.gameRules.players[playerId];
        
        const discardedCards = [...player.hand];
        player.hand = [];
        
        discardedCards.forEach(card => {
            this.gameRules.discardPile.push(card);
        });
        
        console.log(`🗑️ DONCELLA/PRINCESA: ${discardedCards.length} cartas descartadas del Jugador ${playerId + 1} van al descarte`);

        const cardsToDeal = Math.min(3, this.gameRules.deck.length);
        
        for (let i = 0; i < cardsToDeal; i++) {
            if (this.gameRules.deck.length > 0) {
                player.hand.push(this.gameRules.deck.pop());
            }
        }
        
        if (cardsToDeal < 3 && this.gameRules.discardPile.length > 1) {
            this.gameRules.reshuffleDiscard();
            
            const remainingCards = 3 - cardsToDeal;
            for (let i = 0; i < remainingCards; i++) {
                if (this.gameRules.deck.length > 0) {
                    player.hand.push(this.gameRules.deck.pop());
                }
            }
        }

        console.log(`🏠 IA envió Jugador ${playerId + 1} a casa`);
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
        }
    }

    useLibros(cardIndex) {
        console.log(`📚 IA usando Libros de caballería`);
        
        const card = this.gameRules.players[this.gameRules.currentPlayer].hand[cardIndex];
        this.gameRules.players[this.gameRules.currentPlayer].hand.splice(cardIndex, 1);
        this.gameRules.discardPile.push(card);
        
        // ✅ CORREGIDO: Para la IA, usar Libros es como jugar una carta normal
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        console.log(`📚 IA usó Libros de caballería - turno completado`);
        // ✅ MEJORADO: Mostrar mensaje específico de evento
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) usó: Libros de caballería`);
        }
        
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ NUEVO: Final automático del turno para IA
        if (this.gameRules.hasPlayed && !this.gameRules.librosMode) {
            console.log(`🤖 IA: Turno completado, listo para finalizar`);
        }
    }

    // ========================================
    // INTERCAMBIO DE CARTAS PARA IA
    // ========================================

    exchangeCards(targetPlayerId) {
        console.log(`🤖 IA ejecutando intercambio automático con Jugador ${targetPlayerId + 1}`);
        this.executeAIExchange(targetPlayerId);
    }

    executeAIExchange(targetPlayerId) {
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const targetPlayer = this.gameRules.players[targetPlayerId];
        
        console.log(`🤖 IA: Seleccionando cartas para intercambio inteligente`);
        
        const availableCurrentCards = currentPlayer.hand.filter(card => card.type !== 'cuchicheos');
        const availableTargetCards = targetPlayer.hand;
        
        if (availableCurrentCards.length === 0 || availableTargetCards.length === 0) {
            console.log(`🤖 IA: No hay cartas disponibles para intercambiar`);
            return;
        }
        
        let worstCurrentIndex = 0;
        let worstCurrentValue = 999;
        
        for (let i = 0; i < availableCurrentCards.length; i++) {
            const value = this.evaluateCardValue(availableCurrentCards[i], currentPlayer);
            if (value < worstCurrentValue) {
                worstCurrentValue = value;
                worstCurrentIndex = i;
            }
        }
        
        let bestTargetIndex = 0;
        let bestTargetValue = -1;
        
        for (let i = 0; i < availableTargetCards.length; i++) {
            const value = this.evaluateCardValue(availableTargetCards[i], currentPlayer);
            if (value > bestTargetValue) {
                bestTargetValue = value;
                bestTargetIndex = i;
            }
        }
        
        const selectedCurrentCard = availableCurrentCards[worstCurrentIndex];
        const selectedTargetCard = availableTargetCards[bestTargetIndex];
        
        const realCurrentIndex = currentPlayer.hand.findIndex(card => card === selectedCurrentCard);
        const realTargetIndex = targetPlayer.hand.findIndex(card => card === selectedTargetCard);
        
        console.log(`🤖 IA: Intercambiando "${selectedCurrentCard.name}" (valor: ${worstCurrentValue}) por "${selectedTargetCard.name}" (valor: ${bestTargetValue})`);
        // ✅ MEJORADO: Mostrar mensaje específico de intercambio
        if (window.game && window.game.updateStatus) {
            window.game.updateStatus(`🤖 IA (Jugador ${this.gameRules.currentPlayer + 1}) intercambió: "${selectedCurrentCard.name}" por "${selectedTargetCard.name}"`);
        }
        
        currentPlayer.hand[realCurrentIndex] = selectedTargetCard;
        targetPlayer.hand[realTargetIndex] = selectedCurrentCard;
        
        const cuchicheosIndex = currentPlayer.hand.findIndex(card => card.type === 'cuchicheos');
        if (cuchicheosIndex !== -1) {
            const cuchicheosCard = currentPlayer.hand.splice(cuchicheosIndex, 1)[0];
            this.gameRules.discardPile.push(cuchicheosCard);
            console.log(`🗑️ IA: Carta "Cuchicheos de ventero" descartada después del intercambio`);
        }
        
        // ✅ CORREGIDO: No llamar a discardCurrentCard() para cuchicheos
        // La carta ya fue descartada arriba
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ CORREGIDO: La finalización del turno se maneja en handleSabotageImmediately
        // No es necesario finalizar aquí para cuchicheos
    }

    // ========================================
    // ESTRATEGIA Y EVALUACIÓN PARA IA
    // ========================================

    decideDobleAccionStrategy(card) {
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const equipmentCount = Object.values(player.equipment).filter(Boolean).length;
        
        if (equipmentCount <= 1) {
            return 'steal';
        }
        
        if (equipmentCount >= 3) {
            return 'protect';
        }
        
        return Math.random() < 0.7 ? 'steal' : 'protect';
    }

    evaluatePlayerStrength(playerId) {
        const player = this.gameRules.players[playerId];
        let strength = 0;
        
        if (player.equipment.rocin) strength += 1;
        if (player.equipment.lanza) strength += 1;
        if (player.equipment.yelmo) strength += 1;
        if (player.equipment.escudero) strength += 1;
        
        const equipmentCount = Object.values(player.equipment).filter(Boolean).length;
        if (equipmentCount >= 3) strength += 2;
        if (equipmentCount === 4) strength += 3;
        
        return strength;
    }

    findStrongestPlayer(excludeCurrentPlayer = true) {
        let strongestPlayer = -1;
        let maxStrength = -1;
        
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            if (excludeCurrentPlayer && i === this.gameRules.currentPlayer) continue;
            const strength = this.evaluatePlayerStrength(i);
            if (strength > maxStrength) {
                maxStrength = strength;
                strongestPlayer = i;
            }
        }
        
        return strongestPlayer;
    }

    findWeakestPlayer(excludeCurrentPlayer = true) {
        let weakestPlayer = -1;
        let minStrength = 999;
        
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            if (excludeCurrentPlayer && i === this.gameRules.currentPlayer) continue;
            const strength = this.evaluatePlayerStrength(i);
            if (strength < minStrength) {
                minStrength = strength;
                weakestPlayer = i;
            }
        }
        
        return weakestPlayer;
    }

    findPlayerWithEquipment(equipmentType, excludeCurrentPlayer = true) {
        for (let i = 0; i < this.gameRules.playerCount; i++) {
            if (excludeCurrentPlayer && i === this.gameRules.currentPlayer) continue;
            if (this.gameRules.players[i].equipment[equipmentType]) {
                return i;
            }
        }
        return -1;
    }

    evaluateCardValue(card, player) {
        let value = 0;
        
        switch (card.category) {
            case 'complemento':
                if (!player.equipment[card.type]) {
                    value += 100;
                } else {
                    value += 10;
                }
                break;
            case 'sabotaje':
                value += 80;
                break;
            case 'evento':
                value += 70;
                break;
            case 'doble-accion':
                value += 60;
                break;
            case 'proteccion':
                value += 40;
                break;
        }
        
        switch (card.type) {
            case 'libros':
                value += 50;
                break;
            case 'molino':
                value += 30;
                break;
            case 'balsamo':
                const equipmentCount = Object.values(player.equipment).filter(Boolean).length;
                value += equipmentCount * 20;
                break;
        }
        
        return value;
    }

    // ========================================
    // UTILIDADES PARA IA
    // ========================================

    isAIPlayer(playerIndex) {
        return this.gameRules.gameMode === 'ai' && playerIndex > 0 && playerIndex < this.gameRules.playerCount;
    }

    discardCurrentCard(playerIndex = null) {
        // ✅ NUEVO: Usar el jugador especificado o el actual
        const player = this.gameRules.players[playerIndex !== null ? playerIndex : this.gameRules.currentPlayer];
        const playerId = playerIndex !== null ? playerIndex : this.gameRules.currentPlayer;
        
        console.log(`🔍 DEBUG: discardCurrentCard - currentCardIndex=${this.currentCardIndex}, hand.length=${player.hand.length}`);
        
        if (this.currentCardIndex === undefined || this.currentCardIndex === null) {
            console.log(`🔍 DEBUG: currentCardIndex es undefined/null, solo marcando hasPlayed=true`);
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            return;
        }
        
        if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
            const card = player.hand[this.currentCardIndex];
            console.log(`[DEBUG] discardCurrentCard IA: Jugador ${playerId + 1}, Índice: ${this.currentCardIndex}, Carta: "${card.name}", Mano antes: ${player.hand.length} cartas`);
            
            player.hand.splice(this.currentCardIndex, 1);
            this.gameRules.discardPile.push(card);
            
            console.log(`[DEBUG] discardCurrentCard IA: "${card.name}" añadida al descarte. Mano después: ${player.hand.length} cartas, Descarte: ${this.gameRules.discardPile.length} cartas`);
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
        } else {
            console.log(`[DEBUG] discardCurrentCard IA: Índice inválido ${this.currentCardIndex}, solo marcando hasPlayed=true`);
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        
        console.log(`📊 CONTEO DE CARTAS (Turno IA):`);
        console.log(`  📋 En manos: ${totalHandCount} cartas`);
        console.log(`  🛡️ Equipadas: ${totalEquipmentCount} cartas`);
        console.log(`  🃏 En mazo: ${deckCount} cartas`);
        console.log(`  🗑️ En descarte: ${discardCount} cartas`);
        console.log(`  📈 TOTAL: ${total}/52 cartas`);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlayerRules;
} 