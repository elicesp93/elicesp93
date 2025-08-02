// ========================================
// TEST_DONCELLA.JS - SCRIPT DE PRUEBA PARA DONCELLA EN APUROS
// ========================================

console.log('🧪 test_doncella.js cargado - Iniciando prueba de Doncella en apuros');

// Función para esperar un tiempo específico
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal de prueba
async function testDoncellaApuros() {
    console.log('🎯 === INICIANDO PRUEBA DE DONCELLA EN APUROS ===');
    
    // Esperar a que el juego se inicialice
    await delay(2000);
    
    if (!window.game) {
        console.error('❌ ERROR: El juego no está inicializado');
        return;
    }
    
    console.log('✅ Juego detectado, iniciando prueba...');
    
    // Paso 1: Configurar modo IA automáticamente
    console.log('🎮 Paso 1: Configurando modo IA...');
    const aiBtn = document.getElementById('ai-mode');
    if (aiBtn) {
        aiBtn.click();
        console.log('✅ Modo IA seleccionado');
    } else {
        console.error('❌ ERROR: No se encontró el botón de modo IA');
        return;
    }
    
    await delay(1000);
    
    // Paso 2: Seleccionar 4 jugadores
    console.log('👥 Paso 2: Seleccionando 4 jugadores...');
    const player4Btn = document.querySelector('[data-players="4"]');
    if (player4Btn) {
        player4Btn.click();
        console.log('✅ 4 jugadores seleccionados');
    } else {
        console.error('❌ ERROR: No se encontró el botón de 4 jugadores');
        return;
    }
    
    await delay(2000);
    
    // Paso 3: Esperar a que el juego se inicie y sea turno del Jugador 2
    console.log('⏳ Paso 3: Esperando inicio del juego...');
    await delay(3000);
    
    // Paso 4: Verificar que el Jugador 2 tenga "Doncella en apuros"
    console.log('🔍 Paso 4: Verificando cartas del Jugador 2...');
    
    // Esperar a que sea turno del Jugador 2 (IA)
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
        if (window.game && window.game.gameRules && window.game.gameRules.currentPlayer === 1) {
            console.log('✅ Es turno del Jugador 2 (IA)');
            break;
        }
        
        console.log(`⏳ Esperando turno del Jugador 2... (intento ${attempts + 1}/${maxAttempts})`);
        await delay(2000);
        attempts++;
    }
    
    if (attempts >= maxAttempts) {
        console.error('❌ ERROR: No se pudo llegar al turno del Jugador 2');
        return;
    }
    
    // Paso 5: Forzar que el Jugador 2 tenga "Doncella en apuros"
    console.log('🎴 Paso 5: Forzando Doncella en apuros en mano del Jugador 2...');
    
    const player2 = window.game.gameRules.players[1];
    const doncellaCard = {
        name: "Doncella en apuros",
        type: "doncella",
        category: "evento",
        count: 2
    };
    
    // ✅ CORREGIDO: Reemplazar toda la mano del Jugador 2 con Doncella en apuros
    player2.hand = [doncellaCard];
    console.log('✅ Mano del Jugador 2 reemplazada con Doncella en apuros');
    console.log(`📋 Mano del Jugador 2: ${player2.hand.map(card => card.name).join(', ')}`);
    
    // Paso 6: Forzar que la IA juegue Doncella en apuros
    console.log('🎯 Paso 6: Forzando que la IA juegue Doncella en apuros...');
    
    // Simular que la IA roba una carta
    if (window.game.gameRules.hasDrawn === false) {
        console.log('🃏 Forzando robo de carta...');
        window.game.drawCard();
        await delay(1000);
    }
    
    // ✅ CORREGIDO: Forzar que la IA juegue la primera carta (Doncella en apuros)
    console.log('🎮 Forzando juego de Doncella en apuros...');
    
    // Interceptar la lógica de selección de cartas de la IA
    const originalEvaluateCardValue = window.game.aiRules.evaluateCardValue;
    window.game.aiRules.evaluateCardValue = function(card, player) {
        if (card.name === "Doncella en apuros") {
            console.log('🎯 FORZANDO: Doncella en apuros tiene valor máximo');
            return 999; // Valor máximo para forzar la selección
        }
        return originalEvaluateCardValue.call(this, card, player);
    };
    
    // Forzar que la IA juegue la primera carta
    window.game.aiRules.playCard(0);
    
    console.log('✅ Doncella en apuros jugada, esperando efectos...');
    
    // Paso 7: Observar los efectos
    console.log('👀 Paso 7: Observando efectos de Doncella en apuros...');
    await delay(5000);
    
    // Paso 8: Verificar el estado después de Doncella en apuros
    console.log('🔍 Paso 8: Verificando estado después de Doncella en apuros...');
    
    const player1 = window.game.gameRules.players[0];
    console.log(`📊 Estado del Jugador 1: skipped=${player1.skipped}`);
    console.log(`📊 Turno actual: ${window.game.gameRules.currentPlayer + 1}`);
    console.log(`📊 turnInProgress: ${window.game.gameRules.turnInProgress}`);
    console.log(`📊 hasDrawn: ${window.game.gameRules.hasDrawn}`);
    console.log(`📊 hasPlayed: ${window.game.gameRules.hasPlayed}`);
    
    // Paso 9: Esperar a que llegue el turno del Jugador 1
    console.log('⏳ Paso 9: Esperando turno del Jugador 1...');
    await delay(3000);
    
    console.log(`📊 Turno después de espera: ${window.game.gameRules.currentPlayer + 1}`);
    console.log(`📊 turnInProgress después de espera: ${window.game.gameRules.turnInProgress}`);
    
    // Paso 10: Verificar si el Jugador 1 se saltó correctamente
    if (window.game.gameRules.currentPlayer === 0) {
        console.log('❌ PROBLEMA: El Jugador 1 no se saltó correctamente');
        console.log('🔍 Verificando si está marcado como skipped...');
        console.log(`📊 Jugador 1 skipped: ${player1.skipped}`);
    } else {
        console.log('✅ ÉXITO: El Jugador 1 se saltó correctamente');
        console.log(`📊 Turno actual: Jugador ${window.game.gameRules.currentPlayer + 1}`);
    }
    
    // Restaurar la función original
    window.game.aiRules.evaluateCardValue = originalEvaluateCardValue;
    
    console.log('🎯 === PRUEBA DE DONCELLA EN APUROS COMPLETADA ===');
}

// Función para ejecutar la prueba cuando se presione una tecla específica
function setupTestTrigger() {
    document.addEventListener('keydown', function(event) {
        // Presionar 'T' para ejecutar la prueba
        if (event.key === 't' || event.key === 'T') {
            console.log('🎮 Tecla T presionada - Ejecutando prueba de Doncella en apuros');
            testDoncellaApuros();
        }
    });
    
    console.log('🎮 PRUEBA CONFIGURADA: Presiona "T" para ejecutar la prueba de Doncella en apuros');
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, configurando prueba de Doncella en apuros...');
    setupTestTrigger();
});

// También ejecutar si el script se carga después del DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTestTrigger);
} else {
    setupTestTrigger();
}

console.log('🧪 test_doncella.js configurado correctamente'); 