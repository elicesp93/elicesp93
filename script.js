//Traer tarjeta explicativa al frente en cómo jugar
const cards = document.querySelectorAll('.row-cards .info-card');

cards.forEach((card, index) => {
  card.addEventListener('click', () => {
    // Reset z-index de todas
    cards.forEach(c => c.style.zIndex = 1);
    // Eleva la tarjeta clicada
    card.style.zIndex = 10;
  });
});



// Animación revelación progresiva
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
      console.log(entry);
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
    console.log('JSON loaded successfully:', frases);
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
  
  console.log('DOM loaded, cards found:', cartas.length);
  console.log('Desktop visualizador:', visualizador);
  console.log('Mobile visualizador:', visualizadorMobile);
  console.log('Initial screen width:', window.innerWidth);
  console.log('Is mobile?', window.matchMedia('(max-width: 900px)').matches);

  // Función compartida para mostrar el contenido
  const mostrarContenido = (tipo) => {
    console.log('Showing content for type:', tipo);
    console.log('Current frases data:', frases);
    
    // Determinar qué visualizador usar basado en el tamaño de pantalla
    const targetVisualizador = window.matchMedia('(max-width: 900px)').matches ? visualizadorMobile : visualizador;
    console.log('Using visualizador:', targetVisualizador);
    
    if (tipo === 'insights') {
      // Combinar todos los insights de ambas categorías
      const todosLosInsights = [
        ...frases.insights.find(cat => cat['is-insight']).insights,
        ...frases.insights.find(cat => !cat['is-insight']).insights
      ];
      
      console.log('Combined insights:', todosLosInsights);
      
      if (todosLosInsights && todosLosInsights.length > 0) {
        const aleatoria = todosLosInsights[Math.floor(Math.random() * todosLosInsights.length)];
        console.log('Selected random insight:', aleatoria);
        
        const content = `
          <span class="chip-card distinctive-insight">Insight</span>
          <p style="margin: 0;">${aleatoria.frase}</p>
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
        console.log('Setting content to:', content);
        
        targetVisualizador.innerHTML = content;
        targetVisualizador.style.display = 'flex';
        console.log('Visualizador after update:', targetVisualizador.innerHTML);
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
      
      console.log('Combined retos:', todosLosRetos);
      
      if (todosLosRetos && todosLosRetos.length > 0) {
        const aleatoria = todosLosRetos[Math.floor(Math.random() * todosLosRetos.length)];
        console.log('Selected random reto:', aleatoria);
        
        const content = `
          <span class="chip-card distinctive-reto">Reto</span>
          <p style="margin: 0;"><strong>${aleatoria.tipo}</strong></p>
          <p style="margin: 0;">${aleatoria.frase}</p>
          ${aleatoria.autor ? `<p class="autor">- ${aleatoria.autor}</p>` : ''}
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
        console.log('Setting content to:', content);
        
        targetVisualizador.innerHTML = content;
        targetVisualizador.style.display = 'flex';
        console.log('Visualizador after update:', targetVisualizador.innerHTML);
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

    console.log(`Card ${index} type:`, tipo);

    // Función para manejar la interacción con la carta
    const handleCardInteraction = (event) => {
      event.preventDefault(); // Prevent default behavior
      event.stopPropagation(); // Stop event bubbling
      
      console.log('Card clicked/tapped');
      console.log('Event type:', event.type);
      console.log('Screen width at click:', window.innerWidth);
      console.log('Is mobile at click?', window.matchMedia('(max-width: 900px)').matches);
      
      if (!jsonCargado) {
        console.log('JSON not loaded yet');
        return;
      }
      
      // Verificar si es una pantalla móvil
      if (window.matchMedia('(max-width: 900px)').matches) {
        console.log('Mobile detected, showing content');
        mostrarContenido(tipo);
      } else {
        console.log('Desktop detected, not showing content on click');
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
      console.log(`Card ${index} drag enabled`);
      card.draggable = true;
      
      card.addEventListener('dragstart', e => {
        console.log('Drag started');
        if (!jsonCargado) {
          console.log('JSON not loaded, preventing drag');
          e.preventDefault();
          return;
        }
        
        e.dataTransfer.setData('text/plain', tipo);
        card.classList.add('dragging');
      });
      
      card.addEventListener('dragend', () => {
        console.log('Drag ended');
        card.classList.remove('dragging');
      });
    } else {
      console.log(`Card ${index} drag disabled`);
      card.draggable = false;
    }
  });

  // Add window resize listener to track screen size changes
  window.addEventListener('resize', () => {
    console.log('Window resized');
    console.log('New screen width:', window.innerWidth);
    console.log('Is mobile after resize?', window.matchMedia('(max-width: 900px)').matches);
  });
});

// // Añadir estilos de ayuda visual en caso de que no estén en tu CSS
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