//Traer tarjeta explicativa al frente en cómo jugar
const cards = document.querySelectorAll('.row-cards .info-card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    // Detectar el número de la tarjeta (e.g., "info-card-1" -> 1)
    const cardNumber = parseInt(card.id.split('-').pop());
    
    // Calcular el z-index para cada tarjeta basado en la tarjeta clicada
    cards.forEach((c) => {
      const currentCardNumber = parseInt(c.id.split('-').pop());
      let zIndex;
   
      if (currentCardNumber === cardNumber) {
        zIndex = 10;
      } else if (currentCardNumber < cardNumber) {
        zIndex = 10 - (cardNumber - currentCardNumber);
      } else {
        zIndex = 10 - (currentCardNumber - cardNumber);
      }
      
      zIndex = Math.max(6, zIndex);
      
      c.style.zIndex = zIndex;
    });
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
  
  // Función para el countdown
  const startCountdown = (visualizador) => {
    let timeLeft = 60; // 1 minute in seconds
    const countdownElement = document.createElement('div');
    countdownElement.className = 'countdown-timer timer';
    countdownElement.textContent = '01:00';
    
    // Eliminar Timer / cuenta atrás anterior
    const existingTimer = visualizador.querySelector('.timer');
    if (existingTimer) {
      existingTimer.remove();
    }
    
    visualizador.appendChild(countdownElement);
    
    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 10) {
        countdownElement.classList.add('warning');
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        countdownElement.textContent = 'TIEMPO';
        countdownElement.classList.remove('warning');
        countdownElement.classList.add('finished');
      }
      timeLeft--;
    }, 1000);
  };

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
        startCountdown(targetVisualizador);
      } else {
        targetVisualizador.innerHTML = '<p>No hay frases de insights disponibles.</p>';
        startCountdown(targetVisualizador);
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
        startCountdown(targetVisualizador);
      } else {
        targetVisualizador.innerHTML = '<p>No hay frases de retos disponibles.</p>';
        startCountdown(targetVisualizador);
      }
    } else {
      targetVisualizador.innerHTML = `<p>Tipo desconocido: "${tipo}"</p>`;
      startCountdown(targetVisualizador);
    }
  };
  
  // Permitir soltar sobre el visualizador (solo para desktop)
  if (visualizador) {
    visualizador.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      visualizador.classList.add('drag-over');
    });
    
    visualizador.addEventListener('dragleave', e => {
      e.preventDefault();
      e.stopPropagation();
      visualizador.classList.remove('drag-over');
    });
    
    visualizador.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      visualizador.classList.remove('drag-over');
      
      const tipo = e.dataTransfer.getData('text/plain');
      if (tipo) {
        mostrarContenido(tipo);
      }
    });
  }
  
  // Asignar tipo de carta al arrastrar y manejar clicks
  cartas.forEach((card) => {
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
      event.preventDefault();
      event.stopPropagation();
      
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
        if (visualizador) {
          visualizador.classList.remove('drag-over');
        }
      });
    } else {
      card.draggable = false;
    }
  });
});