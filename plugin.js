// Abrir el panel lateral del plugin
penpot.ui.open('Nano Banana AI', 'index.html', {
  width: 320,
  height: 440
});

// Escuchar eventos enviados desde la interfaz web (index.html)
penpot.ui.on('message', async (message) => {
  if (message.type === 'create-image') {
    try {
      const uint8Array = new Uint8Array(message.buffer);

      // Cargar los bytes de la imagen a los activos multimedia de Penpot
      const media = await penpot.uploadMedia('nano-banana.png', uint8Array);

      // Definir dimensiones según la proporción seleccionada
      let width = 512;
      let height = 512;

      if (message.aspectRatio === '16:9') {
        width = 800;
        height = 450;
      } else if (message.aspectRatio === '9:16') {
        width = 450;
        height = 800;
      }

      // Crear un rectángulo en el lienzo
      const rect = penpot.createRectangle();
      rect.name = `Nano Banana: ${message.prompt.substring(0, 24)}`;
      rect.resize(width, height);

      // Ubicar en el centro del viewport actual
      if (penpot.viewport && penpot.viewport.center) {
        rect.x = penpot.viewport.center.x - width / 2;
        rect.y = penpot.viewport.center.y - height / 2;
      }

      // Asignar la imagen cargada como relleno del objeto
      rect.fills = [
        {
          fillImage: media
        }
      ];

      // Dejar la figura seleccionada
      penpot.selection = [rect];

    } catch (error) {
      console.error('Error insertando la imagen en Penpot:', error);
    }
  }
});