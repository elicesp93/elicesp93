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
  })
  .catch(err => {});

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const visualizador = document.querySelector('.visualizador');
  const cartas = document.querySelectorAll('.card-draggable');
  
  // Permitir soltar sobre el visualizador
  visualizador.addEventListener('dragover', e => {
    e.preventDefault();
    // Añadir clase visual para indicar que se puede soltar
    visualizador.classList.add('drag-over');
  });
  
  visualizador.addEventListener('dragleave', () => {
    // Quitar la clase visual cuando sale del área
    visualizador.classList.remove('drag-over');
  });
  
  // Al soltar, mostrar frase correspondiente
  visualizador.addEventListener('drop', e => {
    e.preventDefault();
    visualizador.classList.remove('drag-over');
    
    const tipo = e.dataTransfer.getData('text/plain');
    
    // Mostrar las frases disponibles
    if (tipo === 'insights') {
      const seleccionadas = frases.insights;
      if (seleccionadas && seleccionadas.length > 0) {
        const aleatoria = seleccionadas[Math.floor(Math.random() * seleccionadas.length)];
        visualizador.innerHTML = `
          <p style="margin: 0;">${aleatoria.frase}</p>
          <a href="${aleatoria.recurso}" target="_blank">Ver recurso</a>
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
      } else {
        visualizador.innerHTML = '<p>No hay frases de insights disponibles.</p>';
      }
    } else if (tipo === 'retos') {
      const seleccionadas = frases.retos;
      if (seleccionadas && seleccionadas.length > 0) {
        const aleatoria = seleccionadas[Math.floor(Math.random() * seleccionadas.length)];
        visualizador.innerHTML = `
          <p style="margin: 0;">${aleatoria.frase}</p>
          <a href="${aleatoria.recurso}" target="_blank">Ver recurso</a>
          <img src="recursos/ic_card_ih.svg" alt="Insight Hunters" id="ic_card_ih">
        `;
      } else {
        visualizador.innerHTML = '<p>No hay frases de retos disponibles.</p>';
      }
    } else {
      visualizador.innerHTML = `<p>Tipo desconocido: "${tipo}"</p>`;
    }
  });
  
  // Asignar tipo de carta al arrastrar
  cartas.forEach(card => {
    // Asegurar que las cartas son arrastrables
    card.draggable = true;
    
    card.addEventListener('dragstart', e => {
      if (!jsonCargado) {
        e.preventDefault();
        return;
      }
      
      // Determinar el tipo basado en la clase del contenedor padre
      let tipo = '';
      const parentElement = card.closest('.mazo');
      
      if (parentElement && parentElement.classList.contains('type-insight')) {
        tipo = 'insights';
      } else if (parentElement && parentElement.classList.contains('type-reto')) {
        tipo = 'retos';
      }
      
      e.dataTransfer.setData('text/plain', tipo);
      
      // Añadir clase visual para indicar que se está arrastrando
      card.classList.add('dragging');
    });
    
    card.addEventListener('dragend', () => {
      // Quitar clase visual cuando termina el arrastre
      card.classList.remove('dragging');
    });
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
`;
document.head.appendChild(style);
