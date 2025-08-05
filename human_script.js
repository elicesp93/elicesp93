// ========================================
// HUMAN_SCRIPT.JS - LÓGICA DEL JUGADOR HUMANO
// ========================================

console.log('👤 human_script.js cargado');

class HumanPlayerRules {
    constructor(gameRules) {
        this.gameRules = gameRules;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        this.exchangeData = null;
        this.originalCuchicheosCard = null; // ✅ NUEVO: Para guardar la carta original de Cuchicheos
    }

    // ========================================
    // MANEJO DE CARTAS PARA HUMANOS
    // ========================================

    playCard(cardIndex) {
        // ✅ NUEVO: Validar que solo el jugador actual pueda jugar
        if (!this.gameRules.validatePlayerAction(this.gameRules.currentPlayer)) {
            return;
        }
        
        if (this.gameRules.gamePhase !== 'play' || (this.gameRules.hasPlayed && !this.gameRules.librosMode)) {
            return;
        }

        const player = this.gameRules.players[this.gameRules.currentPlayer];
        const card = player.hand[cardIndex];

        if (!card) {
            return false;
        }

        // ✅ SIMPLIFICADO: Solo mostrar carta jugada
        console.log(`🎯 Jugador ${this.gameRules.currentPlayer + 1} jugó: "${card.name}"`);

        // ✅ NUEVO: Registrar la carta jugada por el humano
        if (window.game && window.game.logCardPlay) {
            window.game.logCardPlay(card.name);
        }

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

        this.currentCardIndex = cardIndex;
        this.executeCardEffect(card, cardIndex);

        const requiresInteraction = ['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos', 'caballo', 'insula', 'barbas', 'palo', 'balsamo', 'libros'].includes(card.type);

        if (!requiresInteraction) {
            if (player.hand[cardIndex] === card) {
                player.hand.splice(cardIndex, 1);
                this.gameRules.discardPile.push(card);
            }
            this.gameRules.hasPlayed = true;
            
            // ✅ CORREGIDO: Final automático del turno en modo Solo y IA para cartas sin interacción, pero NO en modo libros
            if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                setTimeout(() => {
                    if (window.game && window.game.updateDisplay) {
                        window.game.updateDisplay();
                    }
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                // Resetear modo libros después de jugar la carta adicional
                this.gameRules.librosMode = false;
                // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            }
        }
    }

    showPlayOptions(cardIndex) {
        this.currentCardIndex = cardIndex;
        const card = this.gameRules.players[this.gameRules.currentPlayer].hand[cardIndex];
        
        if (card.category === 'complemento') {
            this.addEquipment(card.type);
            this.finishCardPlay(cardIndex);
        } else if (card.category === 'sabotaje') {
            this.executeCardEffect(card, cardIndex);
        } else if (card.category === 'doble-accion') {
            this.showProtectionOrStealModal(card, cardIndex);
        } else if (card.category === 'proteccion') {
            this.useBalsamo(cardIndex);
        } else {
            this.playCardToDiscard(cardIndex);
        }
    }

    finishCardPlay(cardIndex) {
        const card = this.currentCard;
        if (!card) return;

        console.log(`🎯 HUMANO FINISHING CARD PLAY: ${card.name} (tipo: ${card.type})`);
        this.executeCardEffect(card, cardIndex);
    }

    // ========================================
    // EFECTOS DE CARTAS PARA HUMANOS
    // ========================================

    executeCardEffect(card, cardIndex) {
        console.log(`🎯 HUMANO EJECUTANDO EFECTO: ${card.name} (${card.category})`);
        
        switch (card.type) {
            case 'rocin':
            case 'lanza':
            case 'yelmo':
            case 'escudero':
                this.addEquipment(card.type);
                break;
            case 'flaqueza':
            case 'duelo':
            case 'bacia':
            case 'pies':
            case 'doncella':
            case 'princesa':
            case 'cuchicheos':
                this.showPlayerSelectModal(card, cardIndex);
                break;
            case 'caballo':
            case 'insula':
            case 'barbas':
            case 'palo':
                this.showProtectionOrStealModal(card, cardIndex);
                break;
            case 'balsamo':
                this.useBalsamo(cardIndex);
                break;
            case 'molino':
                this.activateMolino();
                break;
            case 'vuelta':
                this.vueltaACasa();
                break;
            case 'libros':
                this.useLibros(cardIndex);
                break;
        }
    }

    addEquipment(equipmentType) {
        const success = this.gameRules.addEquipment(equipmentType);
        
        // ✅ CORREGIDO: Remover la carta de complemento de la mano (se equipa, no se descarta)
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
            const playedCard = player.hand[this.currentCardIndex];
            console.log(`[DEBUG] addEquipment HUMANO: Equipando "${playedCard.name}" como ${equipmentType}. Mano antes: ${player.hand.length} cartas`);
            
            player.hand.splice(this.currentCardIndex, 1);
            console.log(`[DEBUG] addEquipment HUMANO: "${playedCard.name}" removida de la mano. Mano después: ${player.hand.length} cartas`);
            
            if (success) {
                console.log(`✅ CARTA EQUIPADA: ${this.gameRules.getEquipmentName(equipmentType)} removida de la mano`);
            } else {
                // Si ya estaba equipado, la carta jugada va al descarte
                this.gameRules.discardPile.push(playedCard);
                console.log(`[DEBUG] addEquipment HUMANO: "${playedCard.name}" añadida al descarte por duplicado. Descarte: ${this.gameRules.discardPile.length} cartas`);
                console.log(`🗑️ HUMANO descartó automáticamente ${playedCard.name} por duplicado al jugarla`);
            }
        }
        
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        if (success) {
            console.log(`🔧 HUMANO equipó: ${this.gameRules.getEquipmentName(equipmentType)}`);
        } else {
            console.log(`🔧 HUMANO ya tenía: ${this.gameRules.getEquipmentName(equipmentType)}`);
        }
        
        // ✅ CORREGIDO: Actualizar visualización inmediatamente
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ NUEVO: Verificar victoria inmediata después de equipar
        if (success && this.gameRules.checkVictory()) {
            console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} ha reunido todos los complementos`);
            if (window.game && window.game.handleVictory) {
                window.game.handleVictory();
            }
            return; // ✅ CORREGIDO: Detener ejecución inmediatamente después de la victoria
        }
        
        // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
        if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
            console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de equipar`);
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
            console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
            // Resetear modo libros después de jugar la carta adicional
            this.gameRules.librosMode = false;
            // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        }
    }

    // ========================================
    // MODALES Y SELECCIÓN PARA HUMANOS
    // ========================================

    showPlayerSelectModal(card, cardIndex) {
        this.currentCard = card;
        this.currentCardIndex = cardIndex;
        
        console.log(`👥 HUMANO MOSTRANDO SELECCIÓN DE JUGADOR: ${card.name} - Índice: ${cardIndex}`);
        console.log(`👥 HUMANO MOSTRANDO SELECCIÓN DE JUGADOR: Modo de juego: ${this.gameRules.gameMode}`);
        
        // ✅ CORREGIDO: Verificar que el elemento existe antes de acceder
        const playerSelectModal = document.getElementById('player-select-modal');
        if (!playerSelectModal) {
            console.log(`❌ ERROR: Elemento player-select-modal no encontrado en el DOM`);
            console.log(`❌ ERROR: Creando modal dinámicamente`);
            
            // Crear el modal dinámicamente si no existe
            const modal = document.createElement('div');
            modal.id = 'player-select-modal';
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.style.zIndex = '9999';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Selecciona un jugador objetivo</h3>
                    <div class="player-options">
                        ${this.gameRules.players.slice(0, this.gameRules.playerCount).map((player, index) => 
                            index !== this.gameRules.currentPlayer 
                                ? `<button class="player-option" data-player="${index + 1}">Jugador ${index + 1}</button>`
                                : ''
                        ).join('')}
                    </div>
                    <button class="modal-close">Cancelar</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
                    // Configurar event listeners
        modal.querySelectorAll('.player-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedPlayer = e.target.dataset.player;
                this.handlePlayerSelection(selectedPlayer);
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // ✅ CORREGIDO: Restaurar visibilidad de botones cuando se cierre el modal
        const restoreButtons = () => {
            const existingModal = document.getElementById('player-select-modal');
            if (existingModal) {
                const buttons = existingModal.querySelectorAll('.player-option');
                buttons.forEach(button => {
                    button.style.display = 'block';
                });
            }
        };
        
        // Restaurar botones cuando se cierre el modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                restoreButtons();
            }
        });
            
            console.log(`✅ Modal de selección de jugador creado dinámicamente`);
            console.log(`[DEBUG] Número de jugadores en la partida: `, this.gameRules.playerCount);
            console.log(`[DEBUG] Número de botones de jugador en el modal: `, modal.querySelectorAll('.player-option').length);
            return;
        }
        
        if (card.type === 'steal' || ['caballo', 'insula', 'barbas', 'palo'].includes(card.type)) {
            this.showStealPlayerModal(card, cardIndex);
        } else {
            // ✅ CORREGIDO: Filtrar el jugador actual en el modal existente
            const currentPlayerButtons = playerSelectModal.querySelectorAll('.player-option');
            currentPlayerButtons.forEach((button, index) => {
                const playerNumber = parseInt(button.dataset.player);
                const shouldShow = playerNumber !== this.gameRules.currentPlayer + 1;
                button.style.display = shouldShow ? 'block' : 'none';
                
                if (!shouldShow) {
                    console.log(`👥 HUMANO MOSTRANDO SELECCIÓN DE JUGADOR: Ocultando Jugador ${playerNumber} (jugador actual)`);
                }
            });
            
            playerSelectModal.style.display = 'block';
        }
    }

    showStealPlayerModal(card, cardIndex) {
        console.log(`🎯 HUMANO CREANDO MODAL DE ROBO: ${card.name} - Índice: ${cardIndex}`);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const availablePlayers = this.gameRules.players.slice(0, this.gameRules.playerCount).filter((player, index) => 
            index !== this.gameRules.currentPlayer && player.equipment[card.target]
        );
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>¿De qué jugador robar ${this.gameRules.getEquipmentName(card.target)}?</h3>
                <div class="player-options">
                    ${this.gameRules.players.slice(0, this.gameRules.playerCount).map((player, index) => 
                        index !== this.gameRules.currentPlayer && player.equipment[card.target] 
                            ? `<button class="player-option" data-player="${index + 1}">Jugador ${index + 1}</button>`
                            : ''
                    ).join('')}
                </div>
                <button class="modal-close">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.player-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedPlayer = e.target.dataset.player;
                this.currentCardIndex = cardIndex;
                this.handlePlayerSelection(selectedPlayer);
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    handlePlayerSelection(playerId) {
        console.log(`🎯 HUMANO HANDLE PLAYER SELECTION: Jugador ${playerId} seleccionado`);
        
        const card = this.currentCard;
        if (!card) return;

        // ✅ NUEVO: Registrar la acción del humano con el jugador objetivo
        if (window.game && window.game.logCardPlay) {
            window.game.logCardPlay(card.name, parseInt(playerId) - 1, card.type);
        }

        if (['caballo', 'insula', 'barbas', 'palo'].includes(card.type)) {
            console.log(`🔄 HUMANO Ejecutando robo directo: ${card.target} del Jugador ${playerId}`);
            this.stealEquipment(parseInt(playerId) - 1, card.target);
            return;
        }

        if (['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos'].includes(card.type)) {
            console.log(`⚔️ HUMANO Ejecutando sabotaje directo: ${card.name} contra Jugador ${playerId}`);
            this.executeSabotageDirectly(card, parseInt(playerId) - 1);
            return;
        }

        this.executeCardEffect(card, this.currentCardIndex);
    }

    executeSabotageDirectly(card, targetPlayerId) {
        console.log(`⚔️ EXECUTE_SABOTAGE_DIRECTLY INICIADO - ${card.name} contra Jugador ${targetPlayerId + 1}`);
        console.log(`⚔️ Tipo de carta: ${card.type}`);
        console.log(`⚔️ Jugador objetivo: ${targetPlayerId}`);
        
        if (card.type === 'bacia') {
            console.log(`🎯 BACIA: Verificando estado del yelmo del Jugador ${targetPlayerId + 1}`);
            const targetPlayer = this.gameRules.players[targetPlayerId];
            console.log(`🎯 BACIA: Yelmo actual: ${targetPlayer.equipment.yelmo ? targetPlayer.equipment.yelmo.name : 'NO TIENE'}`);
            console.log(`🎯 BACIA: Yelmo protegido: ${targetPlayer.equipment.yelmo?.protected || false}`);
        }
        
        switch (card.type) {
            case 'flaqueza':
                this.gameRules.removeEquipment(targetPlayerId, 'rocin');
                break;
            case 'duelo':
                this.gameRules.removeEquipment(targetPlayerId, 'lanza');
                break;
            case 'bacia':
                console.log(`🎯 BACIA: Llamando removeEquipment(${targetPlayerId}, 'yelmo')`);
                const result = this.gameRules.removeEquipment(targetPlayerId, 'yelmo');
                console.log(`🎯 BACIA: Resultado de removeEquipment: ${result}`);
                break;
            case 'pies':
                this.gameRules.removeEquipment(targetPlayerId, 'escudero');
                break;
            case 'doncella':
                // ✅ CORREGIDO: Doncella en apuros hace que el jugador pierda su próximo turno
                this.gameRules.players[targetPlayerId].skipped = true;
                console.log(`⏰ DONCELLA: Jugador ${targetPlayerId + 1} perderá su próximo turno`);
                // ✅ CORREGIDO: Usar window.game.updateStatus en lugar de this.gameRules.updateStatus
                if (window.game && window.game.updateStatus) {
                    window.game.updateStatus(`Jugador ${targetPlayerId + 1} perderá su próximo turno`);
                }
                break;
            case 'princesa':
                this.vueltaACasaForPlayer(targetPlayerId);
                break;
            case 'cuchicheos':
                console.log(`🗣️ CUCHICHEOS: Iniciando intercambio con Jugador ${targetPlayerId + 1}`);
                console.log(`🗣️ CUCHICHEOS: Carta a guardar:`, card);
                console.log(`🗣️ CUCHICHEOS: this.originalCuchicheosCard antes:`, this.originalCuchicheosCard);
                // ✅ NUEVO: Guardar la carta original de Cuchicheos para poder recuperarla si se cancela
                this.originalCuchicheosCard = { ...card }; // Copia profunda de la carta
                console.log(`🗣️ CUCHICHEOS: Carta original guardada:`, this.originalCuchicheosCard);
                console.log(`🗣️ CUCHICHEOS: this.originalCuchicheosCard después:`, this.originalCuchicheosCard);
                this.exchangeCards(targetPlayerId);
                break;
        }
        
        if (card.type === 'bacia') {
            console.log(`🎯 BACIA: Después de removeEquipment`);
            const targetPlayer = this.gameRules.players[targetPlayerId];
            console.log(`🎯 BACIA: Yelmo después: ${targetPlayer.equipment.yelmo ? targetPlayer.equipment.yelmo.name : 'NO TIENE'}`);
            console.log(`🎯 BACIA: Pila de descarte: ${this.gameRules.discardPile.length} cartas`);
        }
        
        // Para cuchicheos, el descarte y finalización se maneja en executeExchange
        if (card.type !== 'cuchicheos') {
            console.log(`⚔️ EXECUTE_SABOTAGE_DIRECTLY: Llamando discardCurrentCard()`);
            this.discardCurrentCard();
            
            console.log(`⚔️ EXECUTE_SABOTAGE_DIRECTLY: Después de discardCurrentCard - hasPlayed=${this.gameRules.hasPlayed}, gameMode=${this.gameRules.gameMode}, librosMode=${this.gameRules.librosMode}`);
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ❌ PROBLEMA: Esta lógica de endTurn() es REDUNDANTE porque discardCurrentCard() ya la maneja
            // ✅ CORREGIDO: Eliminamos esta lógica duplicada
            console.log(`⚔️ EXECUTE_SABOTAGE_DIRECTLY: NO llamando endTurn() aquí porque discardCurrentCard() ya lo maneja`);
        } else {
            console.log(`🗣️ CUCHICHEOS: Descarte y finalización se manejarán en executeExchange`);
        }
    }

    showProtectionOrStealModal(card, cardIndex) {
        this.currentCard = card;
        this.currentCardIndex = cardIndex;
        
        console.log(`🔄 HUMANO MOSTRANDO OPCIONES DOBLE ACCIÓN: ${card.name} - Índice: ${cardIndex}`);
        console.log(`🔍 [DEBUG] showProtectionOrStealModal - Carta: ${card.name}, Target: ${card.target}, Índice: ${cardIndex}`);
        
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const hasEquipment = !!currentPlayer.equipment[card.target]; // ✅ CORREGIDO: Convertir a booleano
        
        const playersWithEquipment = this.gameRules.players.slice(0, this.gameRules.playerCount).filter((player, index) => 
            index !== this.gameRules.currentPlayer && player.equipment[card.target]
        );
        
        const canProtect = hasEquipment;
        const canSteal = playersWithEquipment.length > 0;
        
        console.log(`🔍 [DEBUG] showProtectionOrStealModal - Puede proteger: ${canProtect}, Puede robar: ${canSteal}`);
        console.log(`🔍 [DEBUG] showProtectionOrStealModal - Jugadores con equipamiento: ${playersWithEquipment.length}`);
        console.log(`🔍 [DEBUG] showProtectionOrStealModal - hasEquipment: ${hasEquipment}, equipment[${card.target}]: ${currentPlayer.equipment[card.target]?.name || 'null'}`);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        let optionsHTML = '';
        
        const protectDisabled = canProtect ? '' : 'disabled';
        const protectClass = canProtect ? 'protection-option' : 'protection-option disabled';
        optionsHTML += `<button class="${protectClass}" data-action="protect" ${protectDisabled}>Proteger mi ${this.gameRules.getEquipmentName(card.target)}</button>`;
        
        const stealDisabled = canSteal ? '' : 'disabled';
        const stealClass = canSteal ? 'steal-option' : 'steal-option disabled';
        optionsHTML += `<button class="${stealClass}" data-action="steal" ${stealDisabled}>Robar ${this.gameRules.getEquipmentName(card.target)} de otro jugador</button>`;
        
        optionsHTML += `<button class="discard-option" data-action="discard">Desechar carta</button>`;
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${card.name}</h3>
                <div class="action-options">
                    ${optionsHTML}
                </div>
                <button class="modal-close">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.protection-option')?.addEventListener('click', (e) => {
            if (e.target.disabled) return;
            console.log(`🛡️ [DEBUG] showProtectionOrStealModal - Opción PROTEGER seleccionada`);
            console.log(`🔍 [DEBUG] showProtectionOrStealModal - Llamando protectEquipment(${card.target})`);
            this.protectEquipment(card.target);
            console.log(`🔍 [DEBUG] showProtectionOrStealModal - protectEquipment completado`);
            
            // ✅ CORREGIDO: Las cartas de doble acción NO se descartan al proteger
            // Solo se descartan cuando se ataca a esa protección
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            console.log(`🔍 [DEBUG] showProtectionOrStealModal - Estado después de proteger: hasPlayed=${this.gameRules.hasPlayed}, currentCardIndex=${this.currentCardIndex}`);
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.steal-option')?.addEventListener('click', (e) => {
            if (e.target.disabled) return;
            console.log(`🔄 [DEBUG] showProtectionOrStealModal - Opción ROBAR seleccionada`);
            this.showPlayerSelectModal(card, cardIndex);
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.discard-option')?.addEventListener('click', () => {
            console.log(`🗑️ [DEBUG] showProtectionOrStealModal - Opción DESCARTAR seleccionada`);
            this.discardCurrentCard();
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // ========================================
    // CARTAS ESPECÍFICAS PARA HUMANOS
    // ========================================

    useBalsamo(cardIndex) {
        console.log(`🛡️ [DEBUG] useBalsamo INICIADO - Índice: ${cardIndex}`);
        this.currentCardIndex = cardIndex;
        this.showProtectionSelectionModal();
    }

    showProtectionSelectionModal() {
        console.log(`🛡️ [DEBUG] showProtectionSelectionModal INICIADO - currentCardIndex: ${this.currentCardIndex}`);
        
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const equipmentToProtect = Object.keys(currentPlayer.equipment).filter(
            equipmentType => currentPlayer.equipment[equipmentType] && !currentPlayer.equipment[equipmentType].protected
        );

        console.log(`🔍 [DEBUG] showProtectionSelectionModal - Equipamiento disponible para proteger: ${equipmentToProtect.length}`);
        equipmentToProtect.forEach(equipment => {
            console.log(`🔍 [DEBUG] showProtectionSelectionModal - Equipamiento: ${equipment} = ${currentPlayer.equipment[equipment]?.name || 'null'}`);
        });

        if (equipmentToProtect.length === 0) {
            // ✅ CORREGIDO: Si no hay equipamiento para proteger, descartar la carta
            console.log(`⚠️ No hay equipamiento para proteger, descartando carta de protección`);
            console.log(`🔍 [DEBUG] showProtectionSelectionModal - Llamando discardCurrentCard()`);
            this.discardCurrentCard();
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>¿Qué equipamiento proteger?</h3>
                <div class="protection-options">
                    ${equipmentToProtect.map(equipmentType => 
                        `<button class="protection-option" data-equipment="${equipmentType}">${this.gameRules.getEquipmentName(equipmentType)}</button>`
                    ).join('')}
                </div>
                <button class="modal-close">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.protection-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const equipmentType = e.target.dataset.equipment;
                this.applyProtection(equipmentType);
                // ✅ CORREGIDO: No llamar discardCurrentCard() aquí porque applyProtection ya maneja la carta
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    applyProtection(equipmentType) {
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        if (player.equipment[equipmentType]) {
            // ✅ CORREGIDO: La carta de protección pasa de la mano a la zona de equipamiento
            if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
                const protectionCard = player.hand.splice(this.currentCardIndex, 1)[0];
                console.log(`[DEBUG] applyProtection HUMANO: Protección aplicada: ${protectionCard.name} sobre ${equipmentType}. Mano antes: ${player.hand.length + 1} cartas, Mano después: ${player.hand.length} cartas`);
                
                // Añadir la carta de protección encima del equipamiento
                player.equipment[equipmentType].protected = true;
                player.equipment[equipmentType].protectionCard = protectionCard;
                console.log(`🛡️ CARTA DE PROTECCIÓN EQUIPADA: ${protectionCard.name} sobre ${this.gameRules.getEquipmentName(equipmentType)}`);
            }
            
            console.log(`🛡️ HUMANO protegió su ${this.gameRules.getEquipmentName(equipmentType)}`);
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
            if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de proteger`);
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                // Resetear modo libros después de jugar la carta adicional
                this.gameRules.librosMode = false;
                // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            }
        }
    }

    protectEquipment(equipmentType) {
        console.log(`🛡️ [DEBUG] protectEquipment INICIADO - equipmentType: ${equipmentType}, currentCardIndex: ${this.currentCardIndex}`);
        
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        if (player.equipment[equipmentType]) {
            console.log(`🔍 [DEBUG] protectEquipment - Equipamiento encontrado: ${player.equipment[equipmentType].name}`);
            
            // ✅ CORREGIDO: Guardar la carta de doble acción como protectionCard
            if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
                const protectionCard = player.hand.splice(this.currentCardIndex, 1)[0];
                console.log(`[DEBUG] protectEquipment HUMANO: Protección aplicada: ${protectionCard.name} sobre ${equipmentType}. Mano antes: ${player.hand.length + 1} cartas, Mano después: ${player.hand.length} cartas`);
                
                player.equipment[equipmentType].protected = true;
                player.equipment[equipmentType].protectionCard = protectionCard;
                console.log(`🛡️ CARTA DE DOBLE ACCIÓN EQUIPADA COMO PROTECCIÓN: ${protectionCard.name} sobre ${this.gameRules.getEquipmentName(equipmentType)}`);
                console.log(`🔍 [DEBUG] protectEquipment - Carta equipada como protección: ${protectionCard.name}`);
            } else {
                console.log(`❌ [DEBUG] protectEquipment - Índice inválido: ${this.currentCardIndex}, longitud mano: ${player.hand.length}`);
                player.equipment[equipmentType].protected = true;
                console.log(`🛡️ HUMANO protegió su ${this.gameRules.getEquipmentName(equipmentType)} (sin carta de protección)`);
            }
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
            if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de proteger con doble acción`);
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                // Resetear modo libros después de jugar la carta adicional
                this.gameRules.librosMode = false;
                // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            }
        }
        
        console.log(`✅ [DEBUG] protectEquipment COMPLETADO - hasPlayed=${this.gameRules.hasPlayed}, currentCardIndex=${this.currentCardIndex}`);
    }

    stealEquipment(targetPlayerId, equipmentType) {
        const targetPlayer = this.gameRules.players[targetPlayerId];
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        
        console.log(`🔄 HUMANO INICIANDO ROBO: ${equipmentType} del Jugador ${targetPlayerId + 1}`);
        
        if (targetPlayer.equipment[equipmentType]) {
            if (targetPlayer.equipment[equipmentType].protected) {
                console.log(`🛡️ EQUIPAMIENTO PROTEGIDO: ${equipmentType} del Jugador ${targetPlayerId + 1} está protegido`);
                
                // ✅ CORREGIDO: Descartar la carta de protección cuando se consume
                const protectionCard = targetPlayer.equipment[equipmentType].protectionCard;
                if (protectionCard) {
                    this.gameRules.discardPile.push(protectionCard);
                    console.log(`🗑️ CARTA DE PROTECCIÓN DESCARTADA: ${protectionCard.name} va al descarte`);
                }
                
                targetPlayer.equipment[equipmentType].protected = false;
                targetPlayer.equipment[equipmentType].protectionCard = null;
                
                this.discardCurrentCard();
                this.gameRules.hasPlayed = true;
                this.currentCard = null;
                this.currentCardIndex = undefined;
                
                // ✅ CORREGIDO: Actualizar visualización inmediatamente
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                
                // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
                if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                    console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de consumir protección`);
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                    console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                    // Resetear modo libros después de jugar la carta adicional
                    this.gameRules.librosMode = false;
                    // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                }
                return;
            }
            
            const stolenEquipment = targetPlayer.equipment[equipmentType];
            console.log(`[DEBUG] stealEquipment HUMANO: Robando "${stolenEquipment.name}" del Jugador ${targetPlayerId + 1}. Equipamiento antes: ${JSON.stringify(stolenEquipment)}`);
            
            targetPlayer.equipment[equipmentType] = null;
            
            console.log(`✅ HUMANO EQUIPAMIENTO ROBADO: ${stolenEquipment.name} del Jugador ${targetPlayerId + 1}`);
            
            if (!currentPlayer.equipment[equipmentType]) {
                currentPlayer.equipment[equipmentType] = stolenEquipment;
                console.log(`[DEBUG] stealEquipment HUMANO: "${stolenEquipment.name}" equipado automáticamente al Jugador ${this.gameRules.currentPlayer + 1}`);
                console.log(`🔧 HUMANO EQUIPANDO AUTOMÁTICAMENTE: ${stolenEquipment.name}`);
                
                this.discardCurrentCard();
                this.gameRules.hasPlayed = true;
                this.currentCard = null;
                this.currentCardIndex = undefined;
                
                // ✅ CORREGIDO: Actualizar visualización inmediatamente
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                
                // ✅ NUEVO: Verificar victoria inmediata después de robar equipamiento
                if (this.gameRules.molinoActive) {
                    if (this.gameRules.checkVictoryAfterMolino()) {
                        console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} ha reunido todos los complementos (durante molino activo)`);
                        if (window.game && window.game.handleVictory) {
                            window.game.handleVictory();
                        }
                        return;
                    }
                } else {
                    if (this.gameRules.checkVictory()) {
                        console.log(`🏆 ¡VICTORIA! Jugador ${this.gameRules.currentPlayer + 1} ha reunido todos los complementos`);
                        if (window.game && window.game.handleVictory) {
                            window.game.handleVictory();
                        }
                        return;
                    }
                }
                
                // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
                if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                    console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de robar`);
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                    console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                    // Resetear modo libros después de jugar la carta adicional
                    this.gameRules.librosMode = false;
                    // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                }
            } else {
                // Si ya tienes ese complemento, va directo al descarte
                this.gameRules.discardPile.push(stolenEquipment);
                console.log(`🗑️ HUMANO descartó automáticamente ${stolenEquipment.name} por duplicado`);
                this.discardCurrentCard();
                this.gameRules.hasPlayed = true;
                this.currentCard = null;
                this.currentCardIndex = undefined;
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                    console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente tras descarte por duplicado`);
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                    console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                    this.gameRules.librosMode = false;
                    setTimeout(() => {
                        if (window.game && window.game.endTurn) {
                            window.game.endTurn();
                        }
                    }, 1000);
                }
                return;
            }
        } else {
            console.log(`❌ HUMANO NO HAY EQUIPAMIENTO PARA ROBAR: ${equipmentType} del Jugador ${targetPlayerId + 1}`);
            this.discardCurrentCard();
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
            if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de intento de robo fallido`);
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                // Resetear modo libros después de jugar la carta adicional
                this.gameRules.librosMode = false;
                // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                setTimeout(() => {
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            }
        }
    }

    showDestinationModal(equipment) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>¿Dónde colocar ${equipment.name}?</h3>
                <div class="destination-options">
                    <button class="destination-option" data-destination="my-equipment">Mi equipamiento</button>
                    <button class="destination-option" data-destination="other-equipment">Equipamiento de otro</button>
                    <button class="destination-option" data-destination="my-hand">Mi mano</button>
                    <button class="destination-option" data-destination="discard">Descartar</button>
                </div>
                <button class="modal-close">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.destination-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const destination = e.target.dataset.destination;
                this.handleDestinationSelection(destination, equipment);
                document.body.removeChild(modal);
            });
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    handleDestinationSelection(destination, equipment) {
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        
        switch (destination) {
            case 'my-equipment':
                currentPlayer.equipment[equipment.type] = equipment;
                console.log(`🔧 HUMANO reemplazó su equipamiento con ${equipment.name}`);
                
                // ✅ CORREGIDO: Actualizar visualización inmediatamente
                if (window.game && window.game.updateDisplay) {
                    window.game.updateDisplay();
                }
                break;
            case 'other-equipment':
                this.showStealPlayerModal(equipment, this.currentCardIndex);
                return;
            case 'my-hand':
                currentPlayer.hand.push(equipment);
                console.log(`📋 HUMANO añadió ${equipment.name} a su mano`);
                break;
            case 'discard':
                this.gameRules.discardPile.push(equipment);
                console.log(`🗑️ HUMANO descartó ${equipment.name}`);
                break;
        }
        
        // ✅ CORREGIDO: Establecer hasPlayed = true y limpiar estado de carta antes de finalizar turno
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
        if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
            console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de seleccionar destino`);
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
            console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
            // Resetear modo libros después de jugar la carta adicional
            this.gameRules.librosMode = false;
            // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        }
    }

    // ========================================
    // CARTAS DE EVENTO PARA HUMANOS
    // ========================================

    activateMolino() {
        this.gameRules.molinoActive = true;
        this.gameRules.molinoTurns = this.gameRules.playerCount; // 1 ronda completa (según número de jugadores)
        this.gameRules.molinoPlayer = this.gameRules.currentPlayer;
        console.log(`🌪️ HUMANO activó Molino de viento`);
        
        // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
        if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
            console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de activar molino`);
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
            console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
            // Resetear modo libros después de jugar la carta adicional
            this.gameRules.librosMode = false;
            // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
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

        // ✅ CORREGIDO: Repartir cartas solo a los jugadores activos según playerCount
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

        console.log(`🏠 HUMANO ejecutó Vuelta a casa`);
        
        // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
        if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
            console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de vuelta a casa`);
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
            console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
            // Resetear modo libros después de jugar la carta adicional
            this.gameRules.librosMode = false;
            // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
            setTimeout(() => {
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        }
    }

    vueltaACasaForPlayer(playerId) {
        const player = this.gameRules.players[playerId];
        
        // ✅ CORREGIDO: Las cartas descartadas van a la pila de descartes
        const discardedCards = [...player.hand];
        player.hand = [];
        
        // Añadir las cartas descartadas a la pila de descartes
        discardedCards.forEach(card => {
            this.gameRules.discardPile.push(card);
        });
        
        console.log(`🗑️ DONCELLA/PRINCESA: ${discardedCards.length} cartas descartadas del Jugador ${playerId + 1} van al descarte`);
        console.log(`🗑️ Cartas descartadas: ${discardedCards.map(c => c.name).join(', ')}`);

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

        console.log(`🏠 HUMANO envió Jugador ${playerId + 1} a casa`);
    }

    useLibros(cardIndex) {
        console.log(`📚 HUMANO usando Libros de caballería`);
        
        // Descartar la carta "Libros de caballería"
        const card = this.gameRules.players[this.gameRules.currentPlayer].hand[cardIndex];
        this.gameRules.players[this.gameRules.currentPlayer].hand.splice(cardIndex, 1);
        this.gameRules.discardPile.push(card);
        
        // ✅ CORREGIDO: Buscar y recibir la carta de complemento que más arriba esté en el mazo
        let complementoCard = null;
        let complementoIndex = -1;
        
        // Buscar desde la parte superior del mazo hacia abajo
        for (let i = this.gameRules.deck.length - 1; i >= 0; i--) {
            const deckCard = this.gameRules.deck[i];
            if (deckCard.category === 'complemento') {
                complementoCard = deckCard;
                complementoIndex = i;
                break;
            }
        }
        
        if (complementoCard) {
            // Remover la carta de complemento del mazo
            this.gameRules.deck.splice(complementoIndex, 1);
            // Añadirla a la mano del jugador
            this.gameRules.players[this.gameRules.currentPlayer].hand.push(complementoCard);
            console.log(`📚 HUMANO recibió carta de complemento: ${complementoCard.name}`);
        } else {
            console.log(`📚 HUMANO: No se encontraron cartas de complemento en el mazo`);
        }
        
        // Activar modo libros para permitir jugar otra carta
        this.gameRules.librosMode = true;
        this.gameRules.hasPlayed = false; // Permitir jugar otra carta
        
        console.log(`📚 HUMANO activó modo libros - puede jugar una carta adicional`);
        
        // ✅ CORREGIDO: Actualizar visualización inmediatamente
        if (window.game && window.game.updateDisplay) {
            window.game.updateDisplay();
        }
        
        // ✅ CORREGIDO: NO finalizar automáticamente el turno en modo Solo
        // El jugador debe poder jugar la carta adicional que recibió
        console.log(`📚 MODO SOLO: Turno NO finaliza automáticamente - jugador puede jugar carta adicional`);
    }

    // ========================================
    // INTERCAMBIO DE CARTAS PARA HUMANOS
    // ========================================

    exchangeCards(targetPlayerId) {
        console.log(`🔄 EXCHANGE_CARDS INICIADO - Jugador ${this.gameRules.currentPlayer + 1} ↔ Jugador ${targetPlayerId + 1}`);
        console.log(`🔄 EXCHANGE_CARDS - Estado actual: hasPlayed=${this.gameRules.hasPlayed}, gameMode=${this.gameRules.gameMode}`);
        
        // ✅ CORREGIDO: Verificar que el jugador objetivo existe y está activo
        if (targetPlayerId < 0 || targetPlayerId >= this.gameRules.playerCount) {
            console.log(`❌ EXCHANGE_CARDS - Jugador objetivo inválido o inactivo: ${targetPlayerId} (playerCount: ${this.gameRules.playerCount})`);
            return;
        }
        
        // Verificar que el jugador actual tiene cartas para intercambiar
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const availableCards = currentPlayer.hand.filter(card => card.type !== 'cuchicheos');
        
        console.log(`🔄 EXCHANGE_CARDS - Cartas disponibles del jugador actual: ${availableCards.map(c => c.name).join(', ')}`);
        
        if (availableCards.length === 0) {
            console.log(`❌ EXCHANGE_CARDS - No hay cartas disponibles para intercambiar`);
            return;
        }
        
        this.showExchangeCardsModal(targetPlayerId);
    }

    showExchangeCardsModal(targetPlayerId) {
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const targetPlayer = this.gameRules.players[targetPlayerId];
        
        console.log(`🔄 SHOW_EXCHANGE_MODAL INICIADO - Jugador ${this.gameRules.currentPlayer + 1} ↔ Jugador ${targetPlayerId + 1}`);
        console.log(`🔄 SHOW_EXCHANGE_MODAL - Mano del jugador actual: ${currentPlayer.hand.map(c => c.name).join(', ')}`);
        console.log(`🔄 SHOW_EXCHANGE_MODAL - Mano del jugador objetivo: ${targetPlayer.hand.map(c => c.name).join(', ')}`);
        console.log(`🔄 SHOW_EXCHANGE_MODAL - Carta actual: ${this.currentCard ? this.currentCard.name : 'NONE'}`);
        console.log(`🔄 SHOW_EXCHANGE_MODAL - Índice carta actual: ${this.currentCardIndex}`);
        console.log(`🔄 SHOW_EXCHANGE_MODAL - this.originalCuchicheosCard:`, this.originalCuchicheosCard);
        
        // Verificar que ambos jugadores tienen cartas
        if (currentPlayer.hand.length === 0) {
            console.log(`❌ SHOW_EXCHANGE_MODAL - Jugador actual no tiene cartas`);
            return;
        }
        
        if (targetPlayer.hand.length === 0) {
            console.log(`❌ SHOW_EXCHANGE_MODAL - Jugador objetivo no tiene cartas`);
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        console.log(`🔄 SHOW_EXCHANGE_MODAL: Modal creado con display=${modal.style.display}, zIndex=${modal.style.zIndex}`);
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; margin: 5% auto; max-height: 90vh; overflow-y: auto;">
                <h3>Intercambiar cartas con Jugador ${targetPlayerId + 1}</h3>
                
                <div style="display: flex; gap: 20px; margin: 20px 0;">
                    <div style="flex: 1; border-radius: 8px; padding: 15px; background: #ffffff33;">
                        <h4 style="margin-top: 0; color: #ddd; margin-bottom: .5rem; text-align: center;">Tu mano (Jugador ${this.gameRules.currentPlayer + 1}):</h4>
                        <div id="current-player-cards" style="display: flex; flex-direction: column; gap: 10px;">
                            ${currentPlayer.hand.map((card, index) => {
                                // ✅ CORREGIDO: Solo ocultar la carta que se está jugando (la que se descartará)
                                // Buscar la carta "Cuchicheos de ventero" que se está jugando actualmente
                                const isCurrentCuchicheos = card.type === 'cuchicheos' && 
                                    this.currentCard && 
                                    this.currentCard.type === 'cuchicheos' && 
                                    this.currentCardIndex === index;
                                
                                if (isCurrentCuchicheos) {
                                    console.log(`🔄 SHOW_EXCHANGE_MODAL: Ocultando carta cuchicheos que se está jugando (índice ${index})`);
                                    return '';
                                }
                                
                                return `
                                    <button class="player-option" data-card-index="${index}" data-player="current" style="text-align: left; padding: 12px; border: 2px solid #8B4513; border-radius: 6px; background: #ffffff33; cursor: pointer; transition: all 0.3s ease;">
                                        [${this.gameRules.getTypeLetter(card.category)}] ${card.name}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div style="flex: 1; border-radius: 8px; padding: 15px; background: #ffffff33;">
                        <h4 style="margin-top: 0; color: #ddd; margin-bottom: .5rem; text-align: center;">Mano del Jugador ${targetPlayerId + 1}:</h4>
                        <div id="target-player-cards" style="display: flex; flex-direction: column; gap: 10px;">
                            ${targetPlayer.hand.map((card, index) => `
                                <button class="player-option" data-card-index="${index}" data-player="target" style="text-align: left; padding: 12px; border: 2px solid #8B4513; border-radius: 6px; background: #ffffff33; cursor: pointer; transition: all 0.3s ease;">
                                    [${this.gameRules.getTypeLetter(card.category)}] ${card.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #ffffff22; border-radius: 8px;">
                    <p style="margin: 0 0 10px 0;"><strong>Instrucciones:</strong> Primero selecciona una carta de tu mano, luego una carta del jugador objetivo.</p>
                    <p style="color: #fff; font-size: 0.9em; margin: 0;"><em>Nota: La carta "Cuchicheos de ventero" que estás jugando no aparece en la lista porque se descartará al final de la acción.</em></p>
                    <div id="exchange-status" style="margin: 10px 0; padding: 10px; background: #e8f5e8; border-radius: 5px; display: none; border: 1px solid #4caf50;"></div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button class="modal-close" style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;" onclick="game.closeExchangeModal(false, true)">
                        ❌ Cancelar
                    </button>
                    <button id="accept-exchange" class="modal-close" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; display: none;" onclick="game.acceptExchange()">
                        ✅ Aceptar Intercambio
                    </button>
                </div>
            </div>
        `;
        
        console.log(`🔄 SHOW_EXCHANGE_MODAL: Añadiendo modal al DOM`);
        document.body.appendChild(modal);
        
        console.log(`🔄 SHOW_EXCHANGE_MODAL: Configurando exchangeData`);
        this.exchangeData = {
            targetPlayerId: targetPlayerId,
            selectedCurrentCard: null,
            selectedTargetCard: null,
            modal: modal
        };
        
        console.log(`🔄 SHOW_EXCHANGE_MODAL: Configurando event listeners`);
        modal.querySelectorAll('.player-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const cardIndex = parseInt(e.target.dataset.cardIndex);
                const player = e.target.dataset.player;
                
                // Remover selección previa del mismo tipo
                modal.querySelectorAll(`[data-player="${player}"]`).forEach(btn => {
                    btn.style.background = '#ecf0f1';
                    btn.style.borderColor = player === 'current' ? '#3498db' : '#e74c3c';
                    btn.style.color = '#2c3e50';
                });
                
                // Resaltar la carta seleccionada
                e.target.style.background = player === 'current' ? '#3498db' : '#e74c3c';
                e.target.style.color = 'white';
                e.target.style.borderColor = player === 'current' ? '#2980b9' : '#c0392b';
                
                this.handleExchangeCardSelection(cardIndex, player);
            });
        });
        
        console.log(`🔄 SHOW_EXCHANGE_MODAL: Modal de intercambio mostrado`);
        
        // Verificar que el modal está visible y que game.acceptExchange está disponible
        setTimeout(() => {
            const visibleModals = document.querySelectorAll('.modal[style*="display: block"]');
            console.log(`🔄 SHOW_EXCHANGE_MODAL: Modales visibles en DOM: ${visibleModals.length}`);
            if (visibleModals.length === 0) {
                console.log(`❌ SHOW_EXCHANGE_MODAL: ERROR - Modal no está visible en el DOM`);
            } else {
                console.log(`✅ SHOW_EXCHANGE_MODAL: Modal visible en el DOM`);
            }
            
            // Verificar que game.acceptExchange está disponible
            console.log(`🔄 SHOW_EXCHANGE_MODAL: window.game existe: ${window.game ? 'SÍ' : 'NO'}`);
            console.log(`🔄 SHOW_EXCHANGE_MODAL: window.game.acceptExchange existe: ${window.game && window.game.acceptExchange ? 'SÍ' : 'NO'}`);
            
            // Verificar que el botón accept-exchange existe en el modal
            const acceptButton = modal.querySelector('#accept-exchange');
            console.log(`🔄 SHOW_EXCHANGE_MODAL: Botón accept-exchange en modal: ${acceptButton ? 'SÍ' : 'NO'}`);
            if (acceptButton) {
                console.log(`🔄 SHOW_EXCHANGE_MODAL: Botón onclick: ${acceptButton.onclick}`);
                console.log(`🔄 SHOW_EXCHANGE_MODAL: Botón display: ${acceptButton.style.display}`);
            }
        }, 100);
    }

    handleExchangeCardSelection(cardIndex, player) {
        console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Índice: ${cardIndex}, Jugador: ${player}`);
        console.log(`🔄 HANDLE_EXCHANGE_SELECTION - exchangeData actual:`, this.exchangeData);
        
        const exchangeStatus = document.getElementById('exchange-status');
        
        if (player === 'current') {
            this.exchangeData.selectedCurrentCard = cardIndex;
            const card = this.gameRules.players[this.gameRules.currentPlayer].hand[cardIndex];
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Carta seleccionada del jugador actual: ${card.name}`);
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Mano completa del jugador actual: ${this.gameRules.players[this.gameRules.currentPlayer].hand.map(c => c.name).join(', ')}`);
            
            exchangeStatus.innerHTML = `✅ Seleccionaste: [${this.gameRules.getTypeLetter(card.category)}] ${card.name}`;
            exchangeStatus.style.display = 'block';
            exchangeStatus.style.background = '#d4edda';
            exchangeStatus.style.color = '#155724';
        } else if (player === 'target') {
            this.exchangeData.selectedTargetCard = cardIndex;
            const card = this.gameRules.players[this.exchangeData.targetPlayerId].hand[cardIndex];
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Carta seleccionada del jugador objetivo: ${card.name}`);
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Mano completa del jugador objetivo: ${this.gameRules.players[this.exchangeData.targetPlayerId].hand.map(c => c.name).join(', ')}`);
            
            exchangeStatus.innerHTML += `<br>✅ Seleccionaste del Jugador ${this.exchangeData.targetPlayerId + 1}: [${this.gameRules.getTypeLetter(card.category)}] ${card.name}`;
            exchangeStatus.style.background = '#d1ecf1';
            exchangeStatus.style.color = '#0c5460';
        }
        
        console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Estado después de selección: currentCard=${this.exchangeData.selectedCurrentCard}, targetCard=${this.exchangeData.selectedTargetCard}`);
        console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Ambas cartas seleccionadas: ${this.exchangeData.selectedCurrentCard !== null && this.exchangeData.selectedTargetCard !== null ? 'SÍ' : 'NO'}`);
        
        if (this.exchangeData.selectedCurrentCard !== null && this.exchangeData.selectedTargetCard !== null) {
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Ambas cartas seleccionadas, mostrando botón aceptar`);
            
            // Mostrar el botón de aceptar
            const acceptButton = document.getElementById('accept-exchange');
            console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Botón aceptar encontrado: ${acceptButton ? 'SÍ' : 'NO'}`);
            if (acceptButton) {
                console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Display anterior: ${acceptButton.style.display}`);
                acceptButton.style.display = 'inline-block';
                console.log(`🔄 HANDLE_EXCHANGE_SELECTION - Display nuevo: ${acceptButton.style.display}`);
            } else {
                console.log(`❌ HANDLE_EXCHANGE_SELECTION - ERROR: No se encontró el botón accept-exchange`);
            }
            
            // Actualizar el estado para mostrar que está listo
            exchangeStatus.innerHTML += `<br><strong>✅ Intercambio listo! Haz clic en "Aceptar Intercambio" para confirmar.</strong>`;
            exchangeStatus.style.background = '#d4edda';
            exchangeStatus.style.color = '#155724';
        }
    }

    executeExchange(keepCuchicheos = false, closeModal = true) {
        console.log(`🔄 EXECUTE_EXCHANGE INICIADO - keepCuchicheos: ${keepCuchicheos}, closeModal: ${closeModal}`);
        
        if (!this.exchangeData) {
            console.log(`❌ EXECUTE_EXCHANGE - No hay datos de intercambio`);
            return;
        }
        
        const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
        const targetPlayer = this.gameRules.players[this.exchangeData.targetPlayerId];
        
        console.log(`🔄 EXECUTE_EXCHANGE - Jugador actual: ${this.gameRules.currentPlayer + 1}, Jugador objetivo: ${this.exchangeData.targetPlayerId + 1}`);
        console.log(`🔄 EXECUTE_EXCHANGE - Índices: currentCard=${this.exchangeData.selectedCurrentCard}, targetCard=${this.exchangeData.selectedTargetCard}`);
        
        // Verificar que los índices son válidos
        if (this.exchangeData.selectedCurrentCard < 0 || this.exchangeData.selectedCurrentCard >= currentPlayer.hand.length) {
            console.log(`❌ EXECUTE_EXCHANGE - Índice de carta actual inválido: ${this.exchangeData.selectedCurrentCard}`);
            return;
        }
        
        if (this.exchangeData.selectedTargetCard < 0 || this.exchangeData.selectedTargetCard >= targetPlayer.hand.length) {
            console.log(`❌ EXECUTE_EXCHANGE - Índice de carta objetivo inválido: ${this.exchangeData.selectedTargetCard}`);
            return;
        }
        
        const currentCard = currentPlayer.hand[this.exchangeData.selectedCurrentCard];
        const targetCard = targetPlayer.hand[this.exchangeData.selectedTargetCard];
        
        console.log(`🔄 EXECUTE_EXCHANGE - Cartas a intercambiar: "${currentCard.name}" ↔ "${targetCard.name}"`);
        console.log(`🔄 EXECUTE_EXCHANGE - Mano del jugador actual antes: ${currentPlayer.hand.map(c => c.name).join(', ')}`);
        console.log(`🔄 EXECUTE_EXCHANGE - Mano del jugador objetivo antes: ${targetPlayer.hand.map(c => c.name).join(', ')}`);
        
        // Realizar el intercambio
        currentPlayer.hand[this.exchangeData.selectedCurrentCard] = targetCard;
        targetPlayer.hand[this.exchangeData.selectedTargetCard] = currentCard;
        
        console.log(`🔄 EXECUTE_EXCHANGE - Intercambio realizado`);
        console.log(`🔄 EXECUTE_EXCHANGE - Mano del jugador actual después: ${currentPlayer.hand.map(c => c.name).join(', ')}`);
        console.log(`🔄 EXECUTE_EXCHANGE - Mano del jugador objetivo después: ${targetPlayer.hand.map(c => c.name).join(', ')}`);
        
        // Descartar la carta "Cuchicheos de Ventero" solo si no se debe mantener
        if (!keepCuchicheos) {
            const cuchicheosIndex = currentPlayer.hand.findIndex(card => card.type === 'cuchicheos');
            if (cuchicheosIndex !== -1) {
                const cuchicheosCard = currentPlayer.hand.splice(cuchicheosIndex, 1)[0];
                this.gameRules.discardPile.push(cuchicheosCard);
                console.log(`🗑️ EXECUTE_EXCHANGE - Cuchicheos descartado: ${cuchicheosCard.name}`);
            } else {
                console.log(`⚠️ EXECUTE_EXCHANGE - No se encontró Cuchicheos para descartar`);
            }
        } else {
            console.log(`🔄 EXECUTE_EXCHANGE - Manteniendo Cuchicheos en la mano`);
        }
        
        console.log(`🔄 EXECUTE_EXCHANGE - Configurando estado del juego`);
        
        this.gameRules.hasPlayed = true;
        this.currentCard = null;
        this.currentCardIndex = undefined;
        
        console.log(`🔄 EXECUTE_EXCHANGE - Estado configurado: hasPlayed=${this.gameRules.hasPlayed}, gameMode=${this.gameRules.gameMode}, librosMode=${this.gameRules.librosMode}`);
        
        // ✅ CORREGIDO: Actualizar visualización inmediatamente
        if (window.game && window.game.updateDisplay) {
            console.log(`🔄 EXECUTE_EXCHANGE - Actualizando visualización`);
            window.game.updateDisplay();
        }
        
        // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
        if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
            console.log(`🔄 EXECUTE_EXCHANGE - MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de intercambio`);
            setTimeout(() => {
                console.log(`🔄 EXECUTE_EXCHANGE - Ejecutando endTurn() desde intercambio`);
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
            console.log(`🔄 EXECUTE_EXCHANGE - MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
            // Resetear modo libros después de jugar la carta adicional
            this.gameRules.librosMode = false;
            // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
            setTimeout(() => {
                console.log(`🔄 EXECUTE_EXCHANGE - Ejecutando endTurn() después de resetear modo libros`);
                if (window.game && window.game.endTurn) {
                    window.game.endTurn();
                }
            }, 1000);
        }
        
        console.log(`🔄 EXECUTE_EXCHANGE - Limpiando datos de intercambio`);
        console.log(`🔄 EXECUTE_EXCHANGE - exchangeData antes de limpiar:`, this.exchangeData);
        console.log(`🔄 EXECUTE_EXCHANGE - closeModal: ${closeModal}`);
        
        // ✅ CORREGIDO: Cerrar el modal ANTES de limpiar exchangeData
        if (closeModal) {
            console.log(`🔄 EXECUTE_EXCHANGE - Llamando a closeExchangeModal(true)`);
            this.closeExchangeModal(true); // true = saltar lógica de intercambio
        }
        
        // ✅ CORREGIDO: Limpiar datos DESPUÉS de cerrar el modal
        console.log(`🔄 EXECUTE_EXCHANGE: Limpiando datos de intercambio`);
        console.log(`🔄 EXECUTE_EXCHANGE: this.originalCuchicheosCard antes de limpiar:`, this.originalCuchicheosCard);
        this.exchangeData = null;
        this.originalCuchicheosCard = null; // ✅ NUEVO: Limpiar la carta original guardada cuando se complete el intercambio
        console.log(`🔄 EXECUTE_EXCHANGE - exchangeData después de limpiar:`, this.exchangeData);
        console.log(`🔄 EXECUTE_EXCHANGE: this.originalCuchicheosCard después de limpiar:`, this.originalCuchicheosCard);
        
        // ✅ NUEVO: Verificación final de modales
        setTimeout(() => {
            const remainingModals = document.querySelectorAll('.modal[style*="display: block"]');
            console.log(`🔄 EXECUTE_EXCHANGE - Verificación final: Modales restantes: ${remainingModals.length}`);
            if (remainingModals.length > 0) {
                console.log(`🔄 EXECUTE_EXCHANGE - Limpiando modales restantes automáticamente`);
                remainingModals.forEach((modal, index) => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                        console.log(`🔄 EXECUTE_EXCHANGE - Modal restante ${index + 1} removido automáticamente`);
                    }
                });
            }
        }, 100);
        
        console.log(`🔄 EXECUTE_EXCHANGE - COMPLETADO`);
    }

    closeExchangeModal(skipExchangeLogic = false, isCancelling = false) {
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: Cerrando modal de intercambio - skipExchangeLogic: ${skipExchangeLogic}, isCancelling: ${isCancelling}`);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: this.exchangeData:`, this.exchangeData);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: this.exchangeData?.modal:`, this.exchangeData?.modal);
        
        // ✅ CORREGIDO: Buscar el modal directamente en el DOM si no está en exchangeData
        let modalToRemove = null;
        
        if (this.exchangeData && this.exchangeData.modal) {
            modalToRemove = this.exchangeData.modal;
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modal encontrado en exchangeData`);
        } else {
            // Buscar el modal en el DOM
            const visibleModals = document.querySelectorAll('.modal[style*="display: block"]');
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modales visibles en DOM:`, visibleModals);
            if (visibleModals.length > 0) {
                modalToRemove = visibleModals[0];
                console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modal encontrado en DOM`);
            }
        }
        
        // Verificar estado del DOM antes de remover
        const modalsBefore = document.querySelectorAll('.modal[style*="display: block"]');
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modales en DOM antes de remover: ${modalsBefore.length}`);
        
        // Remover el modal si se encontró
        if (modalToRemove && modalToRemove.parentNode) {
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Removiendo modal del DOM:`, modalToRemove);
            modalToRemove.parentNode.removeChild(modalToRemove);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modal removido del DOM exitosamente`);
        } else {
            console.log(`⚠️ CLOSE_EXCHANGE_MODAL: No se encontró modal para remover`);
            console.log(`⚠️ CLOSE_EXCHANGE_MODAL: modalToRemove:`, modalToRemove);
            console.log(`⚠️ CLOSE_EXCHANGE_MODAL: modalToRemove?.parentNode:`, modalToRemove?.parentNode);
        }
        
        // Verificar estado del DOM después de remover
        const modalsAfter = document.querySelectorAll('.modal[style*="display: block"]');
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modales en DOM después de remover: ${modalsAfter.length}`);
        
        // ✅ NUEVO: Si quedan modales, cerrarlos también
        if (modalsAfter.length > 0) {
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Cerrando modales restantes: ${modalsAfter.length}`);
            modalsAfter.forEach((modal, index) => {
                console.log(`🔄 CLOSE_EXCHANGE_MODAL: Cerrando modal restante ${index + 1}:`, modal);
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    console.log(`�� CLOSE_EXCHANGE_MODAL: Modal restante ${index + 1} removido`);
                }
            });
            
            // Verificar estado final
            const modalsFinal = document.querySelectorAll('.modal[style*="display: block"]');
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modales en DOM después de cerrar todos: ${modalsFinal.length}`);
        }
        
        // Solo ejecutar intercambio si ambas cartas fueron seleccionadas Y no se solicita saltar la lógica Y NO se está cancelando
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: Verificando condiciones para intercambio:`);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: - skipExchangeLogic: ${skipExchangeLogic}`);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: - isCancelling: ${isCancelling}`);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: - this.exchangeData existe: ${this.exchangeData ? 'SÍ' : 'NO'}`);
        if (this.exchangeData) {
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - selectedCurrentCard: ${this.exchangeData.selectedCurrentCard}`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - selectedTargetCard: ${this.exchangeData.selectedTargetCard}`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - Ambas cartas seleccionadas: ${this.exchangeData.selectedCurrentCard !== null && this.exchangeData.selectedTargetCard !== null ? 'SÍ' : 'NO'}`);
        }
        
        if (!skipExchangeLogic && !isCancelling && this.exchangeData && 
            this.exchangeData.selectedCurrentCard !== null && 
            this.exchangeData.selectedTargetCard !== null) {
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Ambas cartas seleccionadas Y NO cancelando, ejecutando intercambio`);
            this.executeExchange(true, false); // true = mantener Cuchicheos, false = no cerrar modal
        } else if (!skipExchangeLogic || isCancelling) {
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Intercambio cancelado - skipExchangeLogic=${skipExchangeLogic}, isCancelling=${isCancelling}`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Estado de exchangeData al cancelar:`, this.exchangeData);
            
            // ✅ CORREGIDO: Usar la carta original guardada para recuperar "Cuchicheos de Ventero"
            const currentPlayer = this.gameRules.players[this.gameRules.currentPlayer];
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Mano del jugador actual antes de recuperar: ${currentPlayer.hand.map(c => c.name).join(', ')}`);
            
            if (this.originalCuchicheosCard) {
                console.log(`🔄 CLOSE_EXCHANGE_MODAL: Carta original guardada encontrada:`, this.originalCuchicheosCard);
                // Buscar si la carta ya está en la mano (por si acaso)
                const existingIndex = currentPlayer.hand.findIndex(card => card.type === 'cuchicheos');
                console.log(`🔄 CLOSE_EXCHANGE_MODAL: Índice de Cuchicheos existente en mano: ${existingIndex}`);
                if (existingIndex === -1) {
                    // Añadir la carta original de vuelta a la mano
                    currentPlayer.hand.push(this.originalCuchicheosCard);
                    console.log(`🔄 CLOSE_EXCHANGE_MODAL: Carta original "Cuchicheos de Ventero" recuperada:`, this.originalCuchicheosCard);
                    console.log(`🔄 CLOSE_EXCHANGE_MODAL: Mano del jugador después de recuperar: ${currentPlayer.hand.map(c => c.name).join(', ')}`);
                } else {
                    console.log(`🔄 CLOSE_EXCHANGE_MODAL: Carta "Cuchicheos de Ventero" ya está en la mano en índice ${existingIndex}`);
                }
            } else {
                console.log(`⚠️ CLOSE_EXCHANGE_MODAL: No se encontró carta original de Cuchicheos guardada`);
                console.log(`⚠️ CLOSE_EXCHANGE_MODAL: this.originalCuchicheosCard:`, this.originalCuchicheosCard);
            }
            
            // Resetear el estado del juego si se cancela
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Estado del juego antes de resetear:`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - hasPlayed: ${this.gameRules.hasPlayed}`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - currentCard:`, this.currentCard);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - currentCardIndex: ${this.currentCardIndex}`);
            
            this.gameRules.hasPlayed = false;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            this.originalCuchicheosCard = null; // Limpiar la carta original guardada
            
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: Estado del juego reseteado - hasPlayed=false, NO pasando turno`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - hasPlayed después: ${this.gameRules.hasPlayed}`);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - currentCard después:`, this.currentCard);
            console.log(`🔄 CLOSE_EXCHANGE_MODAL: - currentCardIndex después: ${this.currentCardIndex}`);
            
            // Actualizar visualización
            if (window.game && window.game.updateDisplay) {
                console.log(`🔄 CLOSE_EXCHANGE_MODAL: Llamando a updateDisplay`);
                window.game.updateDisplay();
            } else {
                console.log(`⚠️ CLOSE_EXCHANGE_MODAL: window.game.updateDisplay no disponible`);
            }
        }
        
        this.exchangeData = null;
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: exchangeData limpiado`);
        console.log(`🔄 CLOSE_EXCHANGE_MODAL: Modal cerrado - FUNCIÓN COMPLETADA`);
    }

    // ========================================
    // UTILIDADES PARA HUMANOS
    // ========================================

    discardCurrentCard() {
        console.log(`🗑️ DISCARD_CURRENT_CARD INICIADO - Jugador: ${this.gameRules.currentPlayer + 1}, Índice: ${this.currentCardIndex}`);
        console.log(`🔍 [DEBUG] discardCurrentCard - Estado antes: hasPlayed=${this.gameRules.hasPlayed}, gameMode=${this.gameRules.gameMode}, librosMode=${this.gameRules.librosMode}`);
        
        const player = this.gameRules.players[this.gameRules.currentPlayer];
        
        if (this.currentCardIndex === undefined || this.currentCardIndex === null) {
            console.log(`❌ DISCARD_CURRENT_CARD - Índice inválido, saliendo`);
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            return;
        }
        
        if (this.currentCardIndex >= 0 && this.currentCardIndex < player.hand.length) {
            const card = player.hand[this.currentCardIndex];
            console.log(`[DEBUG] discardCurrentCard HUMANO: Jugador ${this.gameRules.currentPlayer + 1}, Índice: ${this.currentCardIndex}, Carta: "${card.name}", Mano antes: ${player.hand.length} cartas`);
            
            player.hand.splice(this.currentCardIndex, 1);
            this.gameRules.discardPile.push(card);
            
            console.log(`[DEBUG] discardCurrentCard HUMANO: "${card.name}" añadida al descarte. Mano después: ${player.hand.length} cartas, Descarte: ${this.gameRules.discardPile.length} cartas`);
            console.log(`🗑️ HUMANO DESCARTÓ CARTA: ${card.name}`);
            
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
            
            console.log(`🗑️ DISCARD_CURRENT_CARD - Estado después de descartar: hasPlayed=${this.gameRules.hasPlayed}, gameMode=${this.gameRules.gameMode}, librosMode=${this.gameRules.librosMode}`);
            
            // ✅ CORREGIDO: Actualizar visualización inmediatamente
            if (window.game && window.game.updateDisplay) {
                window.game.updateDisplay();
            }
            
            // ✅ CORREGIDO: Final automático del turno en modo Solo y IA, pero NO en modo libros
            if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && !this.gameRules.librosMode) {
                console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Finalizando turno automáticamente después de descartar carta`);
                setTimeout(() => {
                    console.log(`🔄 MODO ${this.gameRules.gameMode.toUpperCase()}: Ejecutando endTurn() desde discardCurrentCard`);
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else if ((this.gameRules.gameMode === 'solo' || this.gameRules.gameMode === 'ai') && this.gameRules.librosMode) {
                console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Turno NO finaliza automáticamente - modo libros activo`);
                // Resetear modo libros después de jugar la carta adicional
                this.gameRules.librosMode = false;
                // ✅ CORREGIDO: Finalizar automáticamente el turno después de resetear modo libros
                setTimeout(() => {
                    console.log(`📚 MODO ${this.gameRules.gameMode.toUpperCase()} + LIBROS: Ejecutando endTurn() después de resetear modo libros`);
                    if (window.game && window.game.endTurn) {
                        window.game.endTurn();
                    }
                }, 1000);
            } else {
                console.log(`ℹ️ DISCARD_CURRENT_CARD - No es modo solo/IA o modo libros activo, NO finalizando turno automáticamente`);
            }
        } else {
            console.log(`❌ DISCARD_CURRENT_CARD - Índice fuera de rango: ${this.currentCardIndex}, longitud mano: ${player.hand.length}`);
            this.gameRules.hasPlayed = true;
            this.currentCard = null;
            this.currentCardIndex = undefined;
        }
        
        console.log(`✅ [DEBUG] discardCurrentCard COMPLETADO - hasPlayed=${this.gameRules.hasPlayed}, currentCardIndex=${this.currentCardIndex}`);
    }

    closeAllModals() {
        console.log(`🔄 CLOSE_ALL_MODALS: Cerrando todos los modales`);
        
        if (this.currentCard && this.currentCardIndex !== undefined) {
            const requiresInteraction = ['flaqueza', 'duelo', 'bacia', 'pies', 'doncella', 'princesa', 'cuchicheos', 'caballo', 'insula', 'barbas', 'palo', 'balsamo', 'libros'].includes(this.currentCard.type);
            
            if (requiresInteraction) {
                this.gameRules.hasPlayed = false;
            }
        }
        
        // NO cerrar el modal de intercambio si está activo
        if (this.exchangeData && this.exchangeData.modal) {
            console.log(`🔄 CLOSE_ALL_MODALS: Modal de intercambio activo, NO cerrando`);
            return;
        }
        
        // ✅ CORREGIDO: Restaurar visibilidad de botones en modal de selección de jugador
        const playerSelectModal = document.getElementById('player-select-modal');
        if (playerSelectModal) {
            const buttons = playerSelectModal.querySelectorAll('.player-option');
            buttons.forEach(button => {
                button.style.display = 'block';
            });
            console.log(`🔄 CLOSE_ALL_MODALS: Botones de selección de jugador restaurados`);
        }
        
        console.log(`🔄 CLOSE_ALL_MODALS: Cerrando modales normales`);
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        const dynamicModals = document.querySelectorAll('.modal[style*="display: block"]');
        dynamicModals.forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        console.log(`🔄 CLOSE_ALL_MODALS: Modales cerrados`);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HumanPlayerRules;
} 