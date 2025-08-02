// ========================================
// CARD_IMAGES.JS - MAPEO DE IMÁGENES DE CARTAS
// ========================================

console.log('🃏 card_images.js cargado');

// Mapeo de nombres de cartas a rutas de imágenes
const CARD_IMAGE_MAPPING = {
    // Cartas de complemento
    "Rocín": "images/cartas/Carta_complemento_rocin.webp",
    "Yelmo": "images/cartas/Carta_complemento_yelmo.webp", 
    "Lanza": "images/cartas/Carta_complemento_lanza.webp",
    "Escudero": "images/cartas/Carta_complemento_escudero.webp",
    
    // Cartas de sabotaje
    "Flaqueza y mala traza": "images/cartas/Carta_sabotaje_mala.webp",
    "Duelo con vizcaíno": "images/cartas/Carta_sabotaje_duelo.webp",
    "Bacía de barbero": "images/cartas/Carta_sabotaje_bacia.webp",
    "Pies a tierra": "images/cartas/Carta_sabotaje_pies.webp",
    
    // Cartas de doble acción
    "A caballo regalado…": "images/cartas/Carta_doble_caballo.webp",
    "Oferta de ínsula": "images/cartas/Carta_doble_oferta.webp",
    "Cuando las barbas veas cortar…": "images/cartas/Carta_doble_barbas.webp",
    "De tal palo, tal astilla": "images/cartas/Carta_doble_palo.webp",
    
    // Cartas de evento
    "Doncella en apuros": "images/cartas/Carta_evento_doncella.webp",
    "Molino de viento": "images/cartas/Carta_evento_molino.webp",
    "Vuelta a casa": "images/cartas/Carta_evento_vuelta.webp",
    "Libros de caballería": "images/cartas/Carta_evento_libros.webp",
    "Princesa Micomicona": "images/cartas/Carta_evento_princesa.webp",
    "Cuchicheos de ventero": "images/cartas/Carta_evento_cuchicheos.webp",
    
    // Cartas de protección
    "Bálsamo de Fierabrás": "images/cartas/Carta_Proteccion_balsamo.webp"
};

// Imagen del reverso de la carta
const CARD_BACK_IMAGE = "images/cartas/Carta_atras.webp";

// Función para obtener la imagen de una carta
function getCardImage(cardName) {
    return CARD_IMAGE_MAPPING[cardName] || null;
}

// Función para crear un elemento de carta con imagen
function createCardElement(card, isClickable = true, onClickHandler = null, protectedEquipment = null) {
    const cardElement = document.createElement('div');
    cardElement.className = `hand-card ${card.category}-card`;
    
    // Verificar si es una carta de complemento y si el equipamiento correspondiente está protegido
    if (card.category === 'complemento' && protectedEquipment) {
        const equipmentType = getEquipmentTypeFromCard(card.name);
        if (equipmentType && protectedEquipment[equipmentType] && protectedEquipment[equipmentType].protected) {
            cardElement.classList.add('protected');
        }
    }
    
    const cardImage = getCardImage(card.name);
    
    if (cardImage) {
        // Crear imagen de la carta
        const img = document.createElement('img');
        img.src = cardImage;
        img.alt = card.name;
        img.className = 'card-image';
        cardElement.appendChild(img);
        
        // Agregar nombre de la carta como tooltip
        cardElement.title = card.name;
    } else {
        // Fallback: mostrar solo texto si no hay imagen
        cardElement.textContent = card.name;
    }
    
    // Configurar interactividad
    if (isClickable && onClickHandler) {
        cardElement.onclick = onClickHandler;
        cardElement.style.cursor = 'pointer';
    } else {
        cardElement.style.cursor = 'default';
    }
    
    return cardElement;
}

// Función auxiliar para obtener el tipo de equipamiento basado en el nombre de la carta
function getEquipmentTypeFromCard(cardName) {
    const equipmentMapping = {
        'Rocín': 'rocin',
        'Yelmo': 'yelmo',
        'Lanza': 'lanza',
        'Escudero': 'escudero'
    };
    return equipmentMapping[cardName] || null;
}

// Función para crear un elemento de carta con reverso (para mazo y manos de IA)
function createCardBackElement(className = 'hand-card') {
    const cardElement = document.createElement('div');
    cardElement.className = className;
    
    const img = document.createElement('img');
    img.src = CARD_BACK_IMAGE;
    img.alt = 'Reverso de carta';
    img.className = 'card-image';
    cardElement.appendChild(img);
    
    return cardElement;
} 