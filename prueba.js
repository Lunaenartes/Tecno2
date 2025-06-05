let mascara1, mascara2, mascara3;
let capaLineas1, capaLineas2, capaLineas3;

let opacidad3 = 255;

let tonosFondo = [0, 320, 280, 300, 340]; // Solo tonos rojo, rosado, violeta, fucsia
let indiceTonoFondo = 0;
let tonoFondo = tonosFondo[0]; // Inicializa el fondo

// SONIDO
// variables de CONFIGURACIÓN
let microfono; // variable para el micrófono
let fft; // variable para el FFT (Transformada Rápida de Fourier)
let nivelMicrofono = 0; // nivel de volumen

let AMP_MIN = 0.01;
let AMP_MAX = 0.4; // Ajusta el rango de amplitud

// variables para el cambio brusco de frecuencia
let frecuenciaAnterior = 0; // Para guardar la frecuencia anterior
let umbralCambioFrecuencia = 1000; // Umbral de cambio brusco en Hz

let framesConSonido = 0; // Cuenta los frames con sonido
let velocidadRotacion = 0;     // Velocidad de rotación


function preload() {
  mascara1 = loadImage('mask1.png');  // Máscara grande
  mascara2 = loadImage('mask2.png');  // Máscara mediana
  mascara3 = loadImage('mask3.png');  // Máscara pequeña
} 


function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  colorMode(HSB, 360, 100, 100); // Usa HSB para los colores de fondo

  // Gráficos con tamaño original de cada máscara
  capaLineas1 = createGraphics(mascara1.width, mascara1.height);
  capaLineas3 = createGraphics(mascara3.width, mascara3.height);

  // inicializar micrófono
  microfono = new p5.AudioIn();
  microfono.start();
  fft = new p5.FFT();
  fft.setInput(microfono);
}

function draw() {
  // obtener nivel de volumen del micrófono
  nivelMicrofono = microfono.getLevel();

  // Ajusta el rango si es necesario
  let volumenSimulado = constrain(map(nivelMicrofono, 0, AMP_MIN, 0, AMP_MAX), 0, 1);
  let alturaLinea = map(volumenSimulado, 0, 1, 50, 300);

  // Frecuencia
  let espectro = fft.analyze();
  let indicePico = espectro.indexOf(max(espectro));
  let nyquist = sampleRate() / 2;
  let frecuencia = map(indicePico, 0, espectro.length, 0, nyquist);

  // CAMBIO DE FONDO POR CAMBIO BRUSCO DE FRECUENCIA
  if (abs(frecuencia - frecuenciaAnterior) > umbralCambioFrecuencia) {
    indiceTonoFondo = (indiceTonoFondo + 1) % tonosFondo.length;
    tonoFondo = tonosFondo[indiceTonoFondo];
  }
  frecuenciaAnterior = frecuencia;

  // Fondo: transición SOLO entre rojo, rosado y violeta
  let colorFondo = color(tonoFondo, 70, 40);
  background(colorFondo);

  // CONTROL POR VOLUMEN
  // Calcula un valor de 0 a 1 según el volumen
  let volumenNormalizado = constrain(map(nivelMicrofono, 0, AMP_MIN, 0, 1), 0, 1);

  // --- Máscara 1 ---
  let x1 = (width - mascara1.width) / 2;
  let y1 = (height - mascara1.height) / 2;

  capaLineas1.clear();
  capaLineas1.stroke(0);
  capaLineas1.strokeWeight(3);

  // El espaciado va de 40 (pocas líneas, volumen bajo) a 5 (muchas líneas, volumen alto)
  let espaciado1 = map(volumenNormalizado, 0, 1, 40, 5);

 capaLineas1.push();
  capaLineas1.translate(mascara1.width / 2, mascara1.height / 2);

  // Gira si la frecuencia es mayor a 400 Hz
  if (frecuencia > 400) {
    let angulo = frameCount * 0.01;
    capaLineas1.rotate(angulo);
  }

  capaLineas1.translate(-mascara1.width / 2, -mascara1.height / 2);

  for (let x = 0; x <= mascara1.width; x += espaciado1) {
    capaLineas1.line(x, 0, x, mascara1.height);
  }
  capaLineas1.pop();

  let lineasMascara1 = capaLineas1.get();
  lineasMascara1.mask(mascara1);
  image(lineasMascara1, x1, y1);

  // --- Máscara 2 ---
  // El tamaño va de 100 a 500 (ancho) y de 100 a 300 (alto) según el volumen
  let ancho2 = map(volumenNormalizado, 0, 1, 100, 500);
  let alto2 = map(volumenNormalizado, 0, 1, 100, 300);

  let mascara2Redimensionada = mascara2.get();
  mascara2Redimensionada.resize(ancho2, alto2);

  if (!capaLineas2 || capaLineas2.width !== ancho2 || capaLineas2.height !== alto2) {
    capaLineas2 = createGraphics(ancho2, alto2);
  }
  capaLineas2.clear();
  capaLineas2.stroke(0);
  capaLineas2.strokeWeight(2);
  let espaciado2 = 5;
  for (let x = 0; x <= ancho2; x += espaciado2) {
    capaLineas2.line(x, 0, x, alto2);
  }
  let lineasMascara2 = capaLineas2.get();
  lineasMascara2.mask(mascara2Redimensionada);

  let x2 = (width - ancho2) / 2;
  let y2 = (height - alto2) / 2;
  image(lineasMascara2, x2, y2);

  // --- Máscara 3 ---
  // Normaliza la frecuencia entre 0 y 1 (ajusta el rango según tu necesidad)
  let frecuenciaNormalizada = constrain(map(frecuencia, 100, 4000, 0, 1), 0, 1);

  // Tamaño de la máscara 3 según la frecuencia
  let ancho3 = map(frecuenciaNormalizada, 0, 1, 100, mascara3.width * 1.5);
  let alto3 = map(frecuenciaNormalizada, 0, 1, 100, mascara3.height * 1.5);

  // Opacidad de la máscara 3 según la frecuencia (más agudo, más opaco)
  opacidad3 = map(frecuenciaNormalizada, 0, 1, 80, 255);

  let mascara3Redimensionada = mascara3.get();
  mascara3Redimensionada.resize(ancho3, alto3);

  if (!capaLineas3 || capaLineas3.width !== ancho3 || capaLineas3.height !== alto3) {
    capaLineas3 = createGraphics(ancho3, alto3);
  }
  capaLineas3.clear();
  capaLineas3.stroke(0, opacidad3);
  capaLineas3.strokeWeight(1);
  let espaciado3 = 2;
  for (let x = 0; x <= ancho3; x += espaciado3) {
    capaLineas3.line(x, 0, x, alto3);
  }
  let lineasMascara3 = capaLineas3.get();
  lineasMascara3.mask(mascara3Redimensionada);

  let x3 = (width - ancho3) / 2;
  let y3 = (height - alto3) / 2;
  image(lineasMascara3, x3, y3);

  // Visualización simple
  textSize(26);
  text('Frecuencia dominante: ' + nf(frecuencia, 0, 2) + ' Hz', 10, 20);
  text('Volumen: ' + nf(nivelMicrofono, 0, 3), 10, 40);

  let tipoSonido = "";
  if (frecuencia < 250) {
    tipoSonido = "Grave";
  } else if (frecuencia > 2000) {
    tipoSonido = "Agudo";
  } else {
    tipoSonido = "Medio";
  }
  text('Tipo de sonido: ' + tipoSonido, 10, 60);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}