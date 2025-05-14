//Traer tarjeta explicativa al frente en cómo jugar
const cards = document.querySelectorAll('.row-cards .info-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    // Get the card number from its ID (e.g., "info-card-1" -> 1)
    const cardNumber = parseInt(card.id.split('-').pop());
    console.log('\n=== Card Clicked: Card ' + cardNumber + ' ===');
    
    // Calculate z-index for each card based on the clicked card
    cards.forEach((c) => {
      const currentCardNumber = parseInt(c.id.split('-').pop());
      let zIndex;
   
      if (currentCardNumber === cardNumber) {
        zIndex = 10; // Clicked card
      } else if (currentCardNumber < cardNumber) {
        // Cards before the clicked card
        zIndex = 10 - (cardNumber - currentCardNumber);
      } else {
        // Cards after the clicked card
        zIndex = 10 - (currentCardNumber - cardNumber);
      }
      
      // Ensure minimum z-index of 6
      zIndex = Math.max(6, zIndex);
      
      const oldZIndex = c.style.zIndex;
      c.style.zIndex = zIndex;
      console.log(`Card ${currentCardNumber}: z-index changed from ${oldZIndex} to ${zIndex}`);
    });

    // Log the final z-index distribution
    console.log('\nZ-Index Distribution:');
    console.log('-------------------');
    cards.forEach((c) => {
      const currentCardNumber = parseInt(c.id.split('-').pop());
      console.log(`Card ${currentCardNumber}: z-index ${c.style.zIndex}`);
    });
    console.log('-------------------\n');
  });
});

// Animación revelación progresiva
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
      if (entry.isIntersecting) {
          entry.target.classList.add('show');
      } else {
          entry.target.classList.remove('show');
      }
  });
});

const hiddenElements = document.querySelectorAll('.progr-disc');
hiddenElements.forEach((el) => observer.observe(el));

// Seleccionar carta
// Objeto para guardar las frases del JSON
let frases = {
  insights: [],
  retos: []
};

// Variable para rastrear si el JSON se ha cargado
let jsonCargado = false;

// Cargar el JSON
fetch('frases.json')
  .then(res => res.json())
  .then(data => {
    frases = data;
    jsonCargado = true;
  })
  .catch(err => {
    console.error('Error loading JSON:', err);
  });

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const zonaInteractiva = document.querySelector('.zona-interactiva');
  const visualizador = document.querySelector('.zona-interactiva .visualizador');
  const visualizadorMobile = document.querySelector('.zona-interactiva-mobile .visualizador');
  const cartas = document.querySelectorAll('.card-draggable');
  
  // Función compartida para mostrar el contenido
  const mostrarContenido = (tipo) => {
    // Determinar qué visualizador usar basado en el tamaño de pantalla
    const targetVisualizador = window.matchMedia('(max-width: 900px)').matches ? visualizadorMobile : visualizador;
    
    if (tipo === 'insights') {
      // Combinar todos los insights de ambas categorías
      const todosLosInsights = [
        ...frases.insights.find(cat => cat['is-insight']).insights,
        ...frases.insights.find(cat => !cat['is-insight']).insights
      ];
      
      if (todosLosInsights && todosLosInsights.length > 0) {
        const aleatoria = todosLosInsights[Math.floor(Math.random() * todosLosInsights.length)];
        
        const content = `
          <span class="chip-card distinctive-insight">Insight</span>
          <p style="margin: 0;">${aleatoria.frase}</p>
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
        
        targetVisualizador.innerHTML = content;
        targetVisualizador.style.display = 'flex';
      } else {
        targetVisualizador.innerHTML = '<p>No hay frases de insights disponibles.</p>';
      }
    } else if (tipo === 'retos') {
      // Combinar todos los retos de todas las categorías
      const todosLosRetos = frases.retos.reduce((acc, categoria) => {
        return [...acc, ...categoria.retos.map(reto => ({
          ...reto,
          tipo: categoria.tipo
        }))];
      }, []);
      
      if (todosLosRetos && todosLosRetos.length > 0) {
        const aleatoria = todosLosRetos[Math.floor(Math.random() * todosLosRetos.length)];
        
        const content = `
          <span class="chip-card distinctive-reto">Reto</span>
          <p style="margin: 0;"><strong>${aleatoria.tipo}</strong></p>
          <p style="margin: 0;">${aleatoria.frase}</p>
          ${aleatoria.autor ? `<p class="autor">- ${aleatoria.autor}</p>` : ''}
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
        
        targetVisualizador.innerHTML = content;
        targetVisualizador.style.display = 'flex';
      } else {
        targetVisualizador.innerHTML = '<p>No hay frases de retos disponibles.</p>';
      }
    } else {
      targetVisualizador.innerHTML = `<p>Tipo desconocido: "${tipo}"</p>`;
    }
  };
  
  // Permitir soltar sobre el visualizador (solo para desktop)
  zonaInteractiva.addEventListener('dragover', e => {
    e.preventDefault();
    zonaInteractiva.classList.add('drag-over');
  });
  
  zonaInteractiva.addEventListener('dragleave', () => {
    zonaInteractiva.classList.remove('drag-over');
  });
  
  // Al soltar, mostrar frase correspondiente (solo para desktop)
  zonaInteractiva.addEventListener('drop', e => {
    e.preventDefault();
    zonaInteractiva.classList.remove('drag-over');
    
    const tipo = e.dataTransfer.getData('text/plain');
    mostrarContenido(tipo);
  });
  
  // Asignar tipo de carta al arrastrar y manejar clicks
  cartas.forEach((card, index) => {
    // Determinar el tipo basado en la clase del contenedor padre
    const parentElement = card.closest('.mazo');
    let tipo = '';
    
    if (parentElement && parentElement.classList.contains('type-insight')) {
      tipo = 'insights';
    } else if (parentElement && parentElement.classList.contains('type-reto')) {
      tipo = 'retos';
    }

    // Función para manejar la interacción con la carta
    const handleCardInteraction = (event) => {
      event.preventDefault(); // Prevent default behavior
      event.stopPropagation(); // Stop event bubbling
      
      if (!jsonCargado) {
        return;
      }
      
      // Verificar si es una pantalla móvil
      if (window.matchMedia('(max-width: 900px)').matches) {
        mostrarContenido(tipo);
      }
    };

    // Evento de click para todas las pantallas
    card.addEventListener('click', handleCardInteraction);
    card.addEventListener('touchend', handleCardInteraction);
    
    // Prevent focus and keyboard
    card.setAttribute('tabindex', '-1');
    card.style.outline = 'none';
    
    // Solo habilitar drag and drop en pantallas grandes
    if (window.matchMedia('(min-width: 901px)').matches) {
      card.draggable = true;
      
      card.addEventListener('dragstart', e => {
        if (!jsonCargado) {
          e.preventDefault();
          return;
        }
        
        e.dataTransfer.setData('text/plain', tipo);
        card.classList.add('dragging');
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    } else {
      card.draggable = false;
    }
  });
});

// Añadir estilos de ayuda visual en caso de que no estén en tu CSS
const style = document.createElement('style');
style.textContent = `
  .visualizador.drag-over {
    background-color: rgba(0, 150, 255, 0.1);
    border: 2px dashed #0095ff;
  }
  .card-draggable.dragging {
    opacity: 0.7;
  }
  @media (max-width: 900px) {
    .card-draggable {
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
  }
`;
document.head.appendChild(style);