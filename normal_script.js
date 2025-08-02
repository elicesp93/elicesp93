// ========================================
// NORMAL_SCRIPT.JS - FUNCIONES GENÉRICAS
// ========================================

class NormalGameRules {
    constructor() {
        this.players = [
            { id: 1, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 2, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 3, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 4, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false }
        ];
        this.currentPlayer = 0;
        this.deck = [];
        this.discardPile = [];
        this.turn = 1;
        this.molinoActive = false;
        this.molinoTurns = 0;
        this.molinoPlayer = -1;
        this.gamePhase = 'draw';
        this.hasDrawn = false;
        this.hasPlayed = false;
        this.gameMode = null;
        this.aiSelectionHandled = false;
        this.librosMode = false;
        
        this.initializeDeck();
    }

    // ========================================
    // INICIALIZACIÓN Y CONFIGURACIÓN
    // ========================================

    initializeDeck() {
        this.deck = [];
        
        const cardDefinitions = [
            // Cartas de complemento (fondo verde)
            { name: "Rocín", type: "rocin", category: "complemento", count: 5 },
            { name: "Yelmo", type: "yelmo", category: "complemento", count: 5 },
            { name: "Lanza", type: "lanza", category: "complemento", count: 5 },
            { name: "Escudero", type: "escudero", category: "complemento", count: 5 },

            // Cartas de sabotaje (fondo rojo)
            { name: "Flaqueza y mala traza", type: "flaqueza", category: "sabotaje", target: "rocin", count: 2 },
            { name: "Duelo con vizcaíno", type: "duelo", category: "sabotaje", target: "lanza", count: 2 },
            { name: "Bacía de barbero", type: "bacia", category: "sabotaje", target: "yelmo", count: 2 },
            { name: "Pies a tierra", type: "pies", category: "sabotaje", target: "escudero", count: 2 },

            // Cartas de evento y acción
            { name: "Doncella en apuros", type: "doncella", category: "evento", count: 2 },
            { name: "Molino de viento", type: "molino", category: "evento", count: 2 },
            { name: "Vuelta a casa", type: "vuelta", category: "evento", count: 1 },
            { name: "Bálsamo de Fierabrás", type: "balsamo", category: "proteccion", count: 2 },
            { name: "A caballo regalado…", type: "caballo", category: "doble-accion", target: "rocin", count: 3 },
            { name: "Oferta de ínsula", type: "insula", category: "doble-accion", target: "escudero", count: 3 },
            { name: "Cuando las barbas veas cortar…", type: "barbas", category: "doble-accion", target: "yelmo", count: 3 },
            { name: "De tal palo, tal astilla", type: "palo", category: "doble-accion", target: "lanza", count: 3 },
            { name: "Libros de caballería", type: "libros", category: "evento", count: 1 },
            { name: "Princesa Micomicona", type: "princesa", category: "evento", count: 2 },
            { name: "Cuchicheos de ventero", type: "cuchicheos", category: "evento", count: 2 }
        ];

        cardDefinitions.forEach(cardDef => {
            for (let i = 0; i < cardDef.count; i++) {
                this.deck.push({
                    id: `${cardDef.type}-${i}`,
                    name: cardDef.name,
                    type: cardDef.type,
                    category: cardDef.category,
                    target: cardDef.target || null
                });
            }
        });
    }

    setPlayerCount(count) {
        console.log(`🎮 Configurando ${count} jugadores`);
        
        // Limpiar manos y equipamiento de todos los jugadores
        this.players.forEach((player, index) => {
            player.hand = [];
            player.equipment = { rocin: null, lanza: null, yelmo: null, escudero: null };
            player.skipped = false;
        });
        
        // Configurar el número de jugadores activos
        this.playerCount = count;
        
        // Ocultar jugadores no utilizados en la interfaz
        for (let i = 1; i <= 4; i++) {
            const playerElement = document.getElementById(`player${i}`);
            if (playerElement) {
                if (i <= count) {
                    playerElement.style.display = 'block';
                } else {
                    playerElement.style.display = 'none';
                }
            }
        }
        
        console.log(`🎮 ${count} jugadores configurados correctamente`);
    }

    setGameMode(mode) {
        console.log(`🎮 Configurando modo de juego: ${mode}`);
        this.gameMode = mode;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealInitialCards() {
        console.log(`🎮 Repartiendo cartas aleatorias a ${this.playerCount} jugadores`);
        
        // Repartir 3 cartas aleatorias a cada jugador
        for (let i = 0; i < 3; i++) {
            for (let playerIndex = 0; playerIndex < this.playerCount; playerIndex++) {
                if (this.deck.length > 0) {
                    this.players[playerIndex].hand.push(this.deck.pop());
                }
            }
        }
        
        console.log(`🎮 Reparto completado. Cartas en manos:`);
        for (let i = 0; i < this.playerCount; i++) {
            console.log(`🎮 Jugador ${i + 1}: ${this.players[i].hand.length} cartas`);
        }
    }

    // ========================================
    // FUNCIONES DE JUEGO BÁSICAS
    // ========================================

    drawCard() {
        if (this.players[this.currentPlayer].skipped) {
            console.log(`⏰ Jugador ${this.currentPlayer + 1} está saltado, pasando al siguiente turno`);
            this.players[this.currentPlayer].skipped = false;
            this.endTurn();
            return;
        }

        if (this.gamePhase !== 'draw' || this.hasDrawn) {
            return;
        }

        if (this.deck.length === 0) {
            this.reshuffleDiscard();
        }

        if (this.deck.length > 0) {
            const card = this.deck.pop();
            const player = this.players[this.currentPlayer];
            
            console.log(`[DEBUG] drawCard: Jugador ${this.currentPlayer + 1} robando "${card.name}". Mano antes: ${player.hand.length} cartas, mazo: ${this.deck.length + 1} cartas`);
            
            player.hand.push(card);
            this.hasDrawn = true;
            this.gamePhase = 'play';
            
            console.log(`[DEBUG] drawCard: Jugador ${this.currentPlayer + 1} robó "${card.name}". Mano después: ${player.hand.length} cartas, mazo: ${this.deck.length} cartas`);
            
            return card;
        }
        
        return null;
    }

    reshuffleDiscard() {
        if (this.discardPile.length > 1) {
            const lastCard = this.discardPile[this.discardPile.length - 1];
            const cardsToShuffle = this.discardPile.slice(0, -1);
            
            this.deck = [...cardsToShuffle];
            this.shuffleDeck();
            this.discardPile = [lastCard];
        }
    }

    endTurn() {
        if (!this.hasDrawn || !this.hasPlayed) {
            return false;
        }

        const previousPlayer = this.currentPlayer;
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
        this.turn++;

        if (this.players[this.currentPlayer].skipped) {
            console.log(`⏭️ Jugador ${this.currentPlayer + 1} está saltado, saltando turno`);
            this.players[this.currentPlayer].skipped = false;
            this.endTurn();
            return true;
        }

        if (this.molinoActive && this.currentPlayer === this.molinoPlayer) {
            console.log(`🌪️ Molino activo para jugador ${this.currentPlayer + 1}, turnos restantes: ${this.molinoTurns}`);
            this.molinoTurns--;
            if (this.molinoTurns <= 0) {
                console.log(`🌪️ Molino terminado`);
                this.molinoActive = false;
                this.molinoPlayer = -1;
            }
        }

        this.gamePhase = 'draw';
        this.hasDrawn = false;
        this.hasPlayed = false;
        this.librosMode = false;
        this.aiSelectionHandled = false;

        return true;
    }

    // ========================================
    // REGLAS DE EQUIPAMIENTO
    // ========================================

    addEquipment(equipmentType) {
        const player = this.players[this.currentPlayer];
        
        if (player.equipment[equipmentType]) {
            return false;
        }
        
        // Buscar la carta correspondiente en la mano del jugador
        const cardIndex = player.hand.findIndex(card => card.type === equipmentType);
        if (cardIndex !== -1) {
            const card = player.hand[cardIndex];
            player.equipment[equipmentType] = card;
            return true;
        }
        
        return false;
    }

    removeEquipment(playerId, equipmentType) {
        const player = this.players[playerId];
        
        if (!player.equipment[equipmentType]) {
            return false;
        }
        
        if (player.equipment[equipmentType].protected) {
            console.log(`🛡️ Equipamiento protegido: ${equipmentType} del Jugador ${playerId + 1}`);
            
            // ✅ CORREGIDO: Manejar la carta de protección cuando se consume
            const protectionCard = player.equipment[equipmentType].protectionCard;
            if (protectionCard) {
                this.discardPile.push(protectionCard);
                console.log(`🗑️ PROTECCIÓN CONSUMIDA: ${protectionCard.name} va al descarte`);
            }
            
            player.equipment[equipmentType].protected = false;
            player.equipment[equipmentType].protectionCard = null; // Remover la carta de protección
            return false;
        }
        
        const removedCard = player.equipment[equipmentType];
        console.log(`[DEBUG] removeEquipment: Quitando ${equipmentType} de Jugador ${playerId + 1}. Equipamiento antes: ${JSON.stringify(removedCard)}`);
        
        player.equipment[equipmentType] = null;
        this.discardPile.push(removedCard);
        
        console.log(`🗑️ Equipamiento removido: ${removedCard.name} del Jugador ${playerId + 1}`);
        console.log(`[DEBUG] removeEquipment: ${removedCard.name} añadido al descarte. Descarte: ${this.discardPile.length} cartas`);
        return true;
    }

    getEquipmentName(type) {
        const names = {
            rocin: "Rocín",
            lanza: "Lanza",
            yelmo: "Yelmo",
            escudero: "Escudero"
        };
        return names[type] || type;
    }

    // ========================================
    // REGLAS DE VICTORIA
    // ========================================

    checkVictory() {
        const player = this.players[this.currentPlayer];
        const hasAllEquipment = player.equipment.rocin && 
                               player.equipment.lanza && 
                               player.equipment.yelmo && 
                               player.equipment.escudero;
        
        return hasAllEquipment && !this.molinoActive;
    }

    checkVictoryAfterMolino() {
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            const hasAllEquipment = player.equipment.rocin && 
                                   player.equipment.lanza && 
                                   player.equipment.yelmo && 
                                   player.equipment.escudero;
            
            if (hasAllEquipment) {
                this.currentPlayer = i;
                return true;
            }
        }
        return false;
    }

    // ========================================
    // UTILIDADES
    // ========================================

    getTypeLetter(category) {
        const letters = {
            'complemento': 'C',
            'sabotaje': 'S',
            'doble-accion': 'D',
            'evento': 'E',
            'proteccion': 'P'
        };
        return letters[category] || '?';
    }

    discardCard(cardIndex) {
        const player = this.players[this.currentPlayer];
        if (cardIndex >= 0 && cardIndex < player.hand.length) {
            const card = player.hand.splice(cardIndex, 1)[0];
            this.discardPile.push(card);
            return card;
        }
        return null;
    }

    // ========================================
    // RESET Y NUEVO JUEGO
    // ========================================

    resetGame() {
        // Preservar playerCount y gameMode
        const currentPlayerCount = this.playerCount || 4;
        const currentGameMode = this.gameMode;
        
        this.players = [
            { id: 1, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 2, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 3, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false },
            { id: 4, hand: [], equipment: { rocin: null, lanza: null, yelmo: null, escudero: null }, skipped: false }
        ];
        this.currentPlayer = 0;
        this.turn = 1;
        this.molinoActive = false;
        this.molinoTurns = 0;
        this.molinoPlayer = -1;
        this.gamePhase = 'draw';
        this.hasDrawn = false;
        this.hasPlayed = false;
        this.aiSelectionHandled = false;
        this.librosMode = false;
        
        // Restaurar playerCount y gameMode
        this.playerCount = currentPlayerCount;
        this.gameMode = currentGameMode;
        
        // Limpiar el descarte antes de inicializar el nuevo mazo
        this.discardPile = [];
        
        this.initializeDeck();
        this.shuffleDeck();
        this.dealInitialCards();
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NormalGameRules;
} 