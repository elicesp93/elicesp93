# Caballero Hidalgo - Juego de Mesa

Un juego de cartas inspirado en las aventuras del Quijote, donde los jugadores compiten por equipar a su caballero con los mejores complementos mientras intentan desequipar a sus oponentes.

## 🎮 Cómo Jugar

### Objetivo
Ser el primer caballero hidalgo en derrotar al gigante reuniendo los cuatro complementos esenciales: Rocín, Lanza, Yelmo y Escudero. Para ganar, debes tener todos los complementos Y el gigante debe estar en estado de gigante (no en estado de molino).

### Preparación
1. Abre el archivo `index.html` en tu navegador web
2. El juego se inicia automáticamente con 4 jugadores
3. Cada jugador recibe 3 cartas iniciales

### Tipos de Cartas

#### 🟠 Cartas de Complemento del Hidalgo (Fondo Coral)
- **Rocín**: Añade un caballo a tu equipamiento
- **Lanza**: Añade una lanza a tu equipamiento  
- **Yelmo**: Añade un yelmo a tu equipamiento
- **Escudero**: Añade un escudero a tu equipamiento

#### ⚪ Cartas de Sabotaje (Fondo Gris Claro)
- **Flaqueza y mala traza**: Descarta la carta de rocín de algún jugador
- **Duelo con vizcaíno**: Descarta la carta de lanza de algún jugador
- **Bacía de barbero**: Descarta la carta de yelmo de algún jugador
- **Pies a tierra**: Descarta la carta de escudero de algún jugador

#### 🔵 Cartas de Doble Acción (Fondo Azul Claro)
- **A caballo regalado…**: Protege tu caballo o roba uno de otro jugador
- **Oferta de ínsula**: Protege tu escudero o roba uno de otro jugador
- **Cuando las barbas veas cortar…**: Protege tu yelmo o roba uno de otro jugador
- **De tal palo, tal astilla**: Protege tu lanza o roba una de otro jugador

#### 🛡️ Carta de Protección (Fondo Azul Claro)
- **Bálsamo de Fierabrás**: Protege cualquiera de los complementos ante un ataque

#### 🎭 Cartas de Evento (Fondo Azul Claro) - Solo se pueden jugar en pila de descarte
- **Doncella en apuros**: Hace que el jugador seleccionado pierda un turno
- **Molino de viento**: Activa el efecto del molino durante 2 rondas
- **Vuelta a casa**: Todos los jugadores descartan sus cartas y reciben nuevas
- **Libros de caballería**: Busca una carta de equipamiento en el mazo
- **Princesa Micomicona**: Envía a casa a un jugador (descarta y recibe nuevas cartas)
- **Cuchicheos de ventero**: Selecciona un jugador, ve sus cartas y elige una para intercambiar con una de las tuyas

### Mecánicas del Juego

#### Turno de un Jugador
1. **Robar una carta** (obligatorio): Haz clic en "Robar Carta" o en el mazo
2. **Jugar una carta** (obligatorio): Haz clic en cualquier carta de tu mano para jugarla
3. **Terminar turno**: Haz clic en "Terminar Turno"

**Nota**: Debes robar una carta y jugar una carta antes de poder terminar tu turno.

#### Efectos Especiales
- **Molino de viento**: Cuando está activo, los gigantes se transforman en molinos
- **Turnos saltados**: Los jugadores afectados por "Doncella en apuros" pierden su turno
- **Protección**: El "Bálsamo de Fierabrás" puede proteger equipamiento de ataques

### Controles
- **Robar Carta**: Obtiene una carta del mazo
- **Terminar Turno**: Pasa el turno al siguiente jugador
- **Nuevo Juego**: Reinicia la partida

### Estrategia
- **Equípate primero**: Consigue los complementos básicos antes de atacar
- **Protege tu equipamiento**: Usa cartas de protección cuando sea necesario
- **Interfiere con oponentes**: Usa cartas de ataque para desequipar a otros
- **Gestiona tu mano**: Mantén un balance entre equipamiento y cartas de acción

### Victoria
El primer jugador que reúna los cuatro complementos del hidalgo (Rocín, Lanza, Yelmo y Escudero) Y el gigante esté en estado de gigante (no en estado de molino) gana la partida.

## 🎨 Diseño de Cartas
- **Proporción**: 2:3 (80px x 120px)
- **Colores de fondo**:
  - Complemento del hidalgo: Coral
  - Sabotaje: Gris claro
  - Doble acción, Protección, Evento: Azul claro

## 📊 Composición del Mazo
- **Total de cartas**: 45 cartas
- **Complemento del hidalgo**: 16 cartas (4 de cada tipo)
- **Sabotaje**: 8 cartas (2 de cada tipo)
- **Doble acción**: 8 cartas (2 de cada tipo)
- **Protección**: 2 cartas
- **Evento**: 11 cartas (mezcla de 1-2 de cada tipo)

## 🚀 Cómo Ejecutar
1. Descarga todos los archivos en una carpeta
2. Abre `index.html` en tu navegador web
3. ¡Disfruta del juego!

## 📁 Archivos del Proyecto
- `index.html` - Interfaz principal del juego
- `styles.css` - Estilos y diseño visual
- `script.js` - Lógica del juego y mecánicas
- `README.md` - Este archivo de instrucciones

¡Que disfrutes de las aventuras del Caballero Hidalgo! 