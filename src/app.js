/**
 * FitPulse - PWA Native Vanilla JS Engine
 * Versión 1: Arquitectura Completa Offline-First
 * - Perfiles Dinámicos & Temas (Diego/Alexandra, Modo Claro/Oscuro)
 * - Catálogo Extensible (20+ Ejercicios + Creación)
 * - Periodización & Bloques de Entrenamiento (Target Series x Reps)
 * - UI de Combate con Steppers Grid Anti-Desbordamiento & Autoguardado
 * - Modo Descarga (-20%) & Tracker de PR (1RM Epley)
 * - Pantalla de Victoria & Exportación CSV/JSON
 */

// ==========================================================================
// 1. Constantes y Claves de LocalStorage
// ==========================================================================

const STORAGE_KEYS = {
  PERFIL: 'fitpulse_perfil_activo',
  TEMA_MODO: 'fitpulse_tema_modo',
  EJERCICIOS: 'fitpulse_ejercicios',
  PROGRAMA_BLOQUE: 'fitpulse_programa_bloque',
  SESION_ACTIVA: 'fitpulse_sesion_activa',
  HISTORIAL: 'fitpulse_historial_sesiones',
  PRS: 'fitpulse_prs_records'
};

// Perfiles base predefinidos (Cero datos quemados)
const PERFILES_PREDEFINIDOS = {
  diego: {
    nombre: 'Diego',
    emoji_avatar: '🦍',
    color_tema: '#34C759' // Verde Apple
  },
  alexandra: {
    nombre: 'Alexandra',
    emoji_avatar: '🔥',
    color_tema: '#FF2D55' // Rosa iOS
  }
};

const AVATAR_EMOJIS = ['🦍', '⚡', '🔥', '🦾', '🥇', '🏋️‍♂️', '🎯', '🥊'];

const THEME_COLORS = [
  { name: 'Verde Mint', hex: '#34C759' },
  { name: 'Rosa iOS', hex: '#FF2D55' },
  { name: 'Azul Apple', hex: '#007AFF' },
  { name: 'Naranja Fitness', hex: '#FF9500' },
  { name: 'Rojo Fuego', hex: '#FF3B30' },
  { name: 'Púrpura iOS', hex: '#AF52DE' },
  { name: 'Índigo', hex: '#5856D6' },
  { name: 'Grafito', hex: '#1C1C1E' }
];

// Catálogo Semilla Científico Respaldado por Biomecánica (8 Ejercicios Base)
const CATALOGO_SEMILLA_CIENTIFICO = [
  {
    id: 'hip_thrust',
    nombre: 'Empuje de Cadera (Hip Thrust)',
    grupo: 'Glúteos',
    categoria: 'gluteos',
    musculoPrincipal: 'Glúteo Mayor',
    ultimaVez: { peso: 90.0, reps: 10 },
    pasos: [
      'Apoya la espalda alta en el banco a la altura de las escápulas.',
      'Coloca la barra acolchada sobre el pliegue de la cadera.',
      'Extiende la cadera empujando con los talones hasta alineación neutra y aprieta 1s arriba.'
    ],
    claves: [
      'Mentón pegado al pecho y mirada al frente para proteger la zona lumbar.',
      'Tibias totalmente verticales en el punto de máxima extensión.'
    ]
  },
  {
    id: 'step_down',
    nombre: 'Bajada de Cajón (Step-down)',
    grupo: 'Glúteos',
    categoria: 'gluteos',
    musculoPrincipal: 'Glúteo Medio & Cuádriceps',
    ultimaVez: { peso: 15.0, reps: 12 },
    pasos: [
      'Párate de lado sobre un cajón o step estable con una pierna en el aire.',
      'Desciende controlando la flexión de la pierna de apoyo llevando la cadera atrás.',
      'Toca suavemente el talón en el suelo sin rebotar y vuelve a extender.'
    ],
    claves: [
      'Control excéntrico de 3 segundos en el descenso.',
      'La rodilla debe seguir la línea del segundo dedo del pie sin colapsar en valgo.'
    ]
  },
  {
    id: 'sentadilla_bulgara',
    nombre: 'Sentadilla Búlgara',
    grupo: 'Piernas',
    categoria: 'piernas',
    musculoPrincipal: 'Cuádriceps & Glúteo Mayor',
    ultimaVez: { peso: 20.0, reps: 10 },
    pasos: [
      'Coloca el empeine del pie trasero sobre un banco a la altura de la rodilla.',
      'Baja flexionando la rodilla delantera hasta que el muslo quede paralelo al suelo.',
      'Empuja fuerte el piso con el mediopié delantero para volver arriba.'
    ],
    claves: [
      'Torso ligeramente inclinado hacia adelante para mayor activación de glúteo.',
      'El 85% del peso recae sobre la pierna delantera.'
    ]
  },
  {
    id: 'rdl',
    nombre: 'Peso Muerto Rumano (RDL)',
    grupo: 'Piernas',
    categoria: 'piernas',
    musculoPrincipal: 'Isquiosurales & Glúteos',
    ultimaVez: { peso: 75.0, reps: 8 },
    pasos: [
      'De pie con barra o mancuernas al frente de los muslos, rodillas semi-flexionadas.',
      'Empuja la cadera hacia atrás manteniendo la columna neutra.',
      'Baja hasta sentir tensión en isquiosurales y extiende con contracción glútea.'
    ],
    claves: [
      'La barra o carga debe rozar las piernas durante todo el recorrido.',
      'Bisagra de cadera pura, sin flexionar más las rodillas.'
    ]
  },
  {
    id: 'elevaciones_laterales_escapular',
    nombre: 'Elevaciones Laterales (Plano Escapular)',
    grupo: 'Hombros',
    categoria: 'hombros',
    musculoPrincipal: 'Deltoides Lateral',
    ultimaVez: { peso: 10.0, reps: 15 },
    pasos: [
      'Torso inclinado 10° hacia adelante con mancuernas a los costados.',
      'Eleva los brazos en un ángulo de 30° respecto al plano coronal (en "V").',
      'Llega hasta la altura de los hombros con una pausa de 1 segundo arriba.'
    ],
    claves: [
      'El plano escapular elimina el pinzamiento subacromial.',
      'Cero impulso con balanceo de piernas o espalda.'
    ]
  },
  {
    id: 'jalon_pecho_neutro',
    nombre: 'Jalón al Pecho (Agarre Neutro)',
    grupo: 'Espalda',
    categoria: 'espalda',
    musculoPrincipal: 'Dorsal Ancho & Bíceps',
    ultimaVez: { peso: 55.0, reps: 10 },
    pasos: [
      'Sujeta el agarre neutro con palmas enfrentadas.',
      'Inicia el movimiento deprimiendo escápulas y llevando los codos hacia las costillas.',
      'Tracciona hasta la parte superior del esternón con el pecho erguido.'
    ],
    claves: [
      'Mantén los codos orientados hacia abajo y pegados.',
      'Controla el retorno permitiendo un estiramiento dorsal completo.'
    ]
  },
  {
    id: 'remo_apoyo_pecho',
    nombre: 'Remo con Apoyo en Pecho',
    grupo: 'Espalda',
    categoria: 'espalda',
    musculoPrincipal: 'Espalda Media & Romboides',
    ultimaVez: { peso: 40.0, reps: 12 },
    pasos: [
      'Ajusta el banco a 30°-45° y apoya el esternón en el respaldo.',
      'Toma las mancuernas o manerales y tracciona llevando los codos hacia atrás.',
      'Junta las escápulas al final del recorrido y desciende en 2 segundos.'
    ],
    claves: [
      'El apoyo en pecho elimina la fatiga y compensación en la zona lumbar.',
      'Enfócate en mover los codos y retraer las escápulas.'
    ]
  },
  {
    id: 'press_inclinado_30',
    nombre: 'Press Inclinado con Mancuernas (30°)',
    grupo: 'Pecho',
    categoria: 'pecho',
    musculoPrincipal: 'Pectoral Mayor (Haz Clavicular)',
    ultimaVez: { peso: 24.0, reps: 10 },
    pasos: [
      'Ajusta el banco a exactamente 30° de inclinación.',
      'Posiciona las mancuernas sobre la parte superior del pecho con escápulas fijas.',
      'Empuja en trayectoria convergente sin chocar las mancuernas arriba.'
    ],
    claves: [
      'La inclinación a 30° maximiza el haz clavicular sin sobrecargar el hombro anterior.',
      'Codos a unos 60° respecto al torso durante el descenso.'
    ]
  }
];

// ==========================================================================
// 2. LocalStorage Helpers
// ==========================================================================

function cargarPerfil() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERFIL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.nombre) {
        return {
          nombre: parsed.nombre,
          emoji_avatar: parsed.emoji_avatar || '🦍',
          color_tema: parsed.color_tema || '#34C759'
        };
      }
    }
  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
  const inicial = { ...PERFILES_PREDEFINIDOS.diego };
  guardarPerfil(inicial);
  return inicial;
}

function guardarPerfil(perfil) {
  try {
    localStorage.setItem(STORAGE_KEYS.PERFIL, JSON.stringify(perfil));
  } catch (err) {
    console.error('Error guardando perfil:', err);
  }
}

function cargarTemaModo() {
  return localStorage.getItem(STORAGE_KEYS.TEMA_MODO) || 'auto';
}

function guardarTemaModo(modo) {
  localStorage.setItem(STORAGE_KEYS.TEMA_MODO, modo);
}

function cargarEjercicios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EJERCICIOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Si contiene datos de prueba antiguos (ej. press_banca o más de 8 sin ser de la lista científica)
        const tienePruebaAntigua = parsed.some(e => e.id === 'press_banca' || e.nombre === 'Press de Banca con Barra');
        if (!tienePruebaAntigua) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error cargando ejercicios:', err);
  }
  // Inyección de catálogo semilla científico sin duplicados
  guardarEjercicios(CATALOGO_SEMILLA_CIENTIFICO);
  return [...CATALOGO_SEMILLA_CIENTIFICO];
}

function guardarEjercicios(ejercicios) {
  try {
    localStorage.setItem(STORAGE_KEYS.EJERCICIOS, JSON.stringify(ejercicios));
  } catch (err) {
    console.error('Error guardando ejercicios:', err);
  }
}

function cargarProgramaBloque() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAMA_BLOQUE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.dias) {
        const tieneEjAntiguos = Object.values(parsed.dias).some(d =>
          d.ejercicios && d.ejercicios.some(e => e.ejercicioId === 'press_banca' || e.ejercicioId === 'sentadilla_barra')
        );
        if (!tieneEjAntiguos) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Error cargando programa de bloque:', err);
  }

  // Generar bloque inicial por defecto (vigente por 8 semanas) con catálogo biomecánico
  const hoy = new Date();
  const inicio = new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fin = new Date(hoy.getTime() + 45 * 24 * 60 * 60 * 1000);

  const bloqueInicial = {
    id: 'bloque_' + Date.now(),
    nombrePrograma: 'Mesociclo Hipertrofia Científica',
    fecha_inicio: inicio.toISOString().split('T')[0],
    fecha_fin: fin.toISOString().split('T')[0],
    dias: {
      0: { esDescanso: true, titulo: 'Descanso Total', ejercicios: [] },
      1: {
        esDescanso: false,
        titulo: 'Torso: Empuje & Tracción',
        ejercicios: [
          { ejercicioId: 'press_inclinado_30', seriesTarget: 4, repsTarget: '8-10' },
          { ejercicioId: 'jalon_pecho_neutro', seriesTarget: 4, repsTarget: '8-10' },
          { ejercicioId: 'remo_apoyo_pecho', seriesTarget: 3, repsTarget: '10-12' },
          { ejercicioId: 'elevaciones_laterales_escapular', seriesTarget: 3, repsTarget: '12-15' }
        ]
      },
      2: {
        esDescanso: false,
        titulo: 'Piernas & Glúteos',
        ejercicios: [
          { ejercicioId: 'hip_thrust', seriesTarget: 4, repsTarget: '8-10' },
          { ejercicioId: 'sentadilla_bulgara', seriesTarget: 4, repsTarget: '8-10' },
          { ejercicioId: 'rdl', seriesTarget: 3, repsTarget: '8-10' },
          { ejercicioId: 'step_down', seriesTarget: 3, repsTarget: '12-15' }
        ]
      },
      3: { esDescanso: true, titulo: 'Recuperación Activa', ejercicios: [] },
      4: {
        esDescanso: false,
        titulo: 'Torso: Hipertrofia Escapular',
        ejercicios: [
          { ejercicioId: 'remo_apoyo_pecho', seriesTarget: 4, repsTarget: '10-12' },
          { ejercicioId: 'press_inclinado_30', seriesTarget: 4, repsTarget: '10-12' },
          { ejercicioId: 'jalon_pecho_neutro', seriesTarget: 3, repsTarget: '10-12' },
          { ejercicioId: 'elevaciones_laterales_escapular', seriesTarget: 4, repsTarget: '15' }
        ]
      },
      5: {
        esDescanso: false,
        titulo: 'Cadena Posterior & Glúteo',
        ejercicios: [
          { ejercicioId: 'rdl', seriesTarget: 4, repsTarget: '8-10' },
          { ejercicioId: 'hip_thrust', seriesTarget: 4, repsTarget: '10-12' },
          { ejercicioId: 'sentadilla_bulgara', seriesTarget: 3, repsTarget: '10' },
          { ejercicioId: 'step_down', seriesTarget: 3, repsTarget: '12' }
        ]
      },
      6: { esDescanso: true, titulo: 'Descanso de Fin de Semana', ejercicios: [] }
    }
  };

  guardarProgramaBloque(bloqueInicial);
  return bloqueInicial;
}

function guardarProgramaBloque(bloque) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRAMA_BLOQUE, JSON.stringify(bloque));
  } catch (err) {
    console.error('Error guardando bloque:', err);
  }
}

function cargarSesionActiva() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESION_ACTIVA);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error cargando sesion activa:', err);
  }
  return null;
}

function guardarSesionActiva(sesion) {
  try {
    if (!sesion) {
      localStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESION_ACTIVA, JSON.stringify(sesion));
      mostrarIndicadorAutoguardado();
    }
  } catch (err) {
    console.error('Error guardando sesion activa:', err);
  }
}

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORIAL);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error cargando historial:', err);
  }
  return [];
}

function guardarHistorial(historial) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial));
  } catch (err) {
    console.error('Error guardando historial:', err);
  }
}

function cargarPRs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error cargando PRs:', err);
  }
  return {};
}

function guardarPRs(prs) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(prs));
  } catch (err) {
    console.error('Error guardando PRs:', err);
  }
}

// ==========================================================================
// 3. Utilidades Puras (UUID, 1RM Epley, Colores, Fecha)
// ==========================================================================

function generarUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Fórmula 1RM de Epley: Peso * (1 + (Reps / 30))
 */
function calcular1RM(peso, reps) {
  const p = parseFloat(peso) || 0;
  const r = parseInt(reps, 10) || 0;
  if (p <= 0 || r <= 0) return 0;
  if (r === 1) return p;
  return Math.round((p * (1 + r / 30)) * 10) / 10;
}

function hexToRgb(hex) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

function aplicarColorTema(colorHex) {
  if (!colorHex) return;
  const root = document.documentElement;
  const rgbValues = hexToRgb(colorHex);
  root.style.setProperty('--primary-color', colorHex);
  root.style.setProperty('--primary-rgb', rgbValues);
}

function aplicarModoTema(modo) {
  const root = document.documentElement;
  if (modo === 'claro') {
    root.setAttribute('data-theme', 'claro');
  } else if (modo === 'oscuro') {
    root.setAttribute('data-theme', 'oscuro');
  } else {
    root.removeAttribute('data-theme'); // Auto
  }
}

function generarSaludo(nombre) {
  const hora = new Date().getHours();
  let saludoPrefijo = 'Hola';
  if (hora >= 5 && hora < 12) saludoPrefijo = 'Buenos días';
  else if (hora >= 12 && hora < 20) saludoPrefijo = 'Buenas tardes';
  else saludoPrefijo = 'Buenas noches';
  return `${saludoPrefijo}, ${nombre}`;
}

function obtenerFechaFormateada() {
  const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
  const fechaStr = new Date().toLocaleDateString('es-ES', opciones);
  return fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
}

function formatearNumero(num) {
  return new Intl.NumberFormat('es-ES').format(num);
}

// ==========================================================================
// 4. Estado Global en Memoria
// ==========================================================================

let perfilActivo = cargarPerfil();
let temaModo = cargarTemaModo();
let catalogoEjercicios = cargarEjercicios();
let bloqueActivo = cargarProgramaBloque();
let sesionActiva = cargarSesionActiva();
let recordsPR = cargarPRs();
let diaEditorActivo = 1; // 1 = Lunes por defecto
let indiceEjercicioActivo = 0; // Índice temporal para la navegación de la rutina activa
let cronometroInterval = null;
let ejercicioModalActivo = null;

// ==========================================================================
// 5. Inicialización de la Interfaz & Perfil
// ==========================================================================

function sincronizarPerfilUI() {
  aplicarColorTema(perfilActivo.color_tema);
  aplicarModoTema(temaModo);

  // Saludo dinámico
  const saludoElem = document.getElementById('saludo-texto');
  if (saludoElem) {
    const hora = new Date().getHours();
    let saludoPrefijo = 'Hola';
    if (hora >= 5 && hora < 12) saludoPrefijo = 'Buenos días';
    else if (hora >= 12 && hora < 20) saludoPrefijo = 'Buenas tardes';
    else saludoPrefijo = 'Buenas noches';

    saludoElem.innerHTML = `${saludoPrefijo}, <span class="user-highlight">${perfilActivo.nombre}</span>`;
  }

  // Header meta & avatar
  const fechaElem = document.getElementById('fecha-header');
  if (fechaElem) fechaElem.textContent = obtenerFechaFormateada();

  const avatarCircle = document.getElementById('avatar-circle');
  const avatarName = document.getElementById('avatar-name');
  if (avatarCircle) avatarCircle.textContent = perfilActivo.emoji_avatar || '🦍';
  if (avatarName) avatarName.textContent = perfilActivo.nombre;

  // Profile View
  const profileAvatar = document.getElementById('profile-card-avatar');
  const profileName = document.getElementById('profile-card-name');
  const inputNombre = document.getElementById('input-perfil-nombre');

  if (profileAvatar) profileAvatar.textContent = perfilActivo.emoji_avatar || '🦍';
  if (profileName) profileName.textContent = perfilActivo.nombre;
  if (inputNombre && document.activeElement !== inputNombre) {
    inputNombre.value = perfilActivo.nombre;
  }

  // Botones Atletas Rápidos (Diego / Alexandra)
  const btnDiego = document.getElementById('btn-perfil-diego');
  const btnAlexandra = document.getElementById('btn-perfil-alexandra');
  if (btnDiego && btnAlexandra) {
    if (perfilActivo.nombre.toLowerCase() === 'diego') {
      btnDiego.classList.add('active');
      btnAlexandra.classList.remove('active');
    } else if (perfilActivo.nombre.toLowerCase() === 'alexandra') {
      btnAlexandra.classList.add('active');
      btnDiego.classList.remove('active');
    } else {
      btnDiego.classList.remove('active');
      btnAlexandra.classList.remove('active');
    }
  }

  // Theme selector buttons
  const themeBtns = document.querySelectorAll('.theme-mode-btn');
  themeBtns.forEach(btn => {
    if (btn.getAttribute('data-theme') === temaModo) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderizarSelectorEmojis();
  renderizarSwatchesColores();
  renderizarEstadisticasPerfil();
  renderizarDiarioEntrenamientos();
}

function renderizarSelectorEmojis() {
  const container = document.getElementById('avatar-emojis-selector');
  if (!container) return;

  container.innerHTML = '';
  AVATAR_EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-emoji-btn ${emoji === perfilActivo.emoji_avatar ? 'selected' : ''}`;
    btn.textContent = emoji;
    btn.setAttribute('aria-label', `Emoji ${emoji}`);
    btn.addEventListener('click', () => {
      perfilActivo.emoji_avatar = emoji;
      guardarPerfil(perfilActivo);
      sincronizarPerfilUI();
      mostrarToast(`Avatar actualizado: ${emoji}`);
    });
    container.appendChild(btn);
  });
}

function renderizarSwatchesColores() {
  const container = document.getElementById('color-swatches-container');
  if (!container) return;

  container.innerHTML = '';
  THEME_COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `color-swatch-btn ${c.hex.toLowerCase() === perfilActivo.color_tema.toLowerCase() ? 'selected' : ''}`;
    btn.style.backgroundColor = c.hex;
    btn.setAttribute('data-color', c.hex);
    btn.setAttribute('aria-label', c.name);
    btn.addEventListener('click', () => {
      perfilActivo.color_tema = c.hex;
      guardarPerfil(perfilActivo);
      sincronizarPerfilUI();
      mostrarToast(`Color de tema: ${c.name}`);
    });
    container.appendChild(btn);
  });
}

function renderizarEstadisticasPerfil() {
  const historial = cargarHistorial();
  const prs = cargarPRs();
  const statSesiones = document.getElementById('stat-sesiones-count');
  const statTonelaje = document.getElementById('stat-tonelaje-acumulado');
  const statPrs = document.getElementById('stat-prs-count');

  if (statSesiones) statSesiones.textContent = historial.length;
  if (statTonelaje) {
    const totalKg = historial.reduce((sum, s) => sum + (s.tonelajeEfectivo || 0), 0);
    statTonelaje.textContent = `${(totalKg / 1000).toFixed(1)} t`;
  }
  if (statPrs) {
    statPrs.textContent = Object.keys(prs).length;
  }
}

// ==========================================================================
// 6. Renderizado Inteligente de Inicio (Periodización & Bloque Activo)
// ==========================================================================

function verificarBloqueActivo() {
  if (!bloqueActivo || !bloqueActivo.fecha_inicio || !bloqueActivo.fecha_fin) {
    return { activo: false, motivo: 'no_existe' };
  }
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hoyStr = `${d.getFullYear()}-${mes}-${dia}`;
  
  if (hoyStr < bloqueActivo.fecha_inicio || hoyStr > bloqueActivo.fecha_fin) {
    return { activo: false, motivo: 'fuera_de_fecha' };
  }
  return { activo: true, bloque: bloqueActivo };
}

function renderizarInicioInteligente() {
  const heroCard = document.getElementById('hero-card-container');
  const emptyState = document.getElementById('empty-state-bloque');
  const valTonelaje = document.getElementById('val-tonelaje-anterior');
  const quickFechas = document.getElementById('quick-fechas-bloque');
  const badgeBloque = document.getElementById('badge-nombre-bloque');

  // Tonelaje Anterior (de series efectivas de la última sesión)
  const historial = cargarHistorial();
  if (valTonelaje) {
    if (historial.length > 0) {
      const ultima = historial[historial.length - 1];
      valTonelaje.textContent = `${formatearNumero(ultima.tonelajeEfectivo || 0)} kg`;
    } else {
      valTonelaje.textContent = '0 kg';
    }
  }

  const estadoBloque = verificarBloqueActivo();

  if (badgeBloque && bloqueActivo) {
    badgeBloque.textContent = bloqueActivo.nombrePrograma || 'Periodización';
  }
  if (quickFechas && bloqueActivo) {
    quickFechas.textContent = `${bloqueActivo.fecha_inicio || ''} al ${bloqueActivo.fecha_fin || ''}`;
  }

  if (!estadoBloque.activo) {
    // Fuera de fecha o sin bloque -> Renderizar Empty State
    if (heroCard) heroCard.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  // Dentro del rango de fechas -> Leer día de la semana (0-6)
  if (emptyState) emptyState.classList.add('hidden');
  if (heroCard) heroCard.classList.remove('hidden');

  const diaSemanaHoy = new Date().getDay(); // 0 = Dom, 1 = Lun...
  const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaConfig = bloqueActivo.dias[diaSemanaHoy] || { esDescanso: true, titulo: 'Descanso', ejercicios: [] };

  const heroTitulo = document.getElementById('hero-rutina-titulo');
  const heroSubtitulo = document.getElementById('hero-rutina-subtitulo');
  const heroDayTag = document.getElementById('hero-day-indicator');
  const valCount = document.getElementById('val-ejercicios-count');
  const container = document.getElementById('exercise-preview-container');
  const btnIniciarTexto = document.getElementById('btn-iniciar-texto');

  if (heroDayTag) heroDayTag.textContent = `${diasNombres[diaSemanaHoy]}`;
  if (heroTitulo) heroTitulo.textContent = diaConfig.titulo || 'Sesión Programada';

  if (diaConfig.esDescanso) {
    if (heroSubtitulo) heroSubtitulo.textContent = 'Día de descanso programado en tu bloque.';
    if (valCount) valCount.textContent = '0';
    if (container) {
      container.innerHTML = `
        <div class="empty-series-msg">
          🛌 Día de recuperación activa. El descanso construye músculo.
        </div>
      `;
    }
    if (btnIniciarTexto) btnIniciarTexto.textContent = 'Entrenamiento Libre';
  } else {
    if (heroSubtitulo) heroSubtitulo.textContent = `${bloqueActivo.nombrePrograma} • ${diaConfig.ejercicios.length} ejercicios`;
    if (valCount) valCount.textContent = diaConfig.ejercicios.length;

    if (container) {
      container.innerHTML = '';
      if (diaConfig.ejercicios.length === 0) {
        container.innerHTML = `<div class="empty-series-msg">Hoy es <strong>${diasNombres[diaSemanaHoy]}</strong>. No has asignado ejercicios para hoy en tu plan. Pulsa 'Editar Bloque' y añádelos a la pestaña correspondiente.</div>`;
      } else {
        diaConfig.ejercicios.forEach((item, idx) => {
          const ej = catalogoEjercicios.find(e => e.id === item.ejercicioId) || { nombre: item.ejercicioId };
          const div = document.createElement('div');
          div.className = 'exercise-preview-item';
          div.innerHTML = `
            <div class="exercise-info">
              <span class="exercise-index">${idx + 1}</span>
              <span class="exercise-name">${ej.nombre}</span>
            </div>
            <span class="exercise-detail">${item.seriesTarget} series × ${item.repsTarget}</span>
          `;
          container.appendChild(div);
        });
      }
    }

    if (btnIniciarTexto) {
      btnIniciarTexto.textContent = sesionActiva ? 'Continuar Entrenamiento' : 'Iniciar Entrenamiento';
    }
  }
}

// ==========================================================================
// 7. Catálogo Extensible (Renderizado & Añadir Ejercicio)
// ==========================================================================

function renderizarCatalogo(filtro = 'todos') {
  const container = document.getElementById('exercise-master-list');
  if (!container) return;

  container.innerHTML = '';
  const ejerciciosFiltrados = filtro === 'todos'
    ? catalogoEjercicios
    : catalogoEjercicios.filter(e => e.categoria.toLowerCase() === filtro.toLowerCase());

  if (ejerciciosFiltrados.length === 0) {
    container.innerHTML = `<div class="empty-series-msg">No hay ejercicios en esta categoría. Pulsa '+ Añadir' arriba.</div>`;
    return;
  }

  ejerciciosFiltrados.forEach(ej => {
    const prRecord = recordsPR[ej.id];
    const card = document.createElement('article');
    card.className = 'exercise-master-card';
    card.innerHTML = `
      <div class="master-card-top">
        <div class="master-card-info">
          <h4>${ej.nombre}</h4>
          <p>Músculo: <strong>${ej.musculoPrincipal || ej.categoria}</strong></p>
        </div>
        <span class="exercise-category-pill">${ej.categoria}</span>
      </div>
      <div class="master-card-actions">
        <span class="master-card-meta">
          ${prRecord ? `🔥 1RM: ${prRecord.peso1RM} kg` : `Últ: ${ej.ultimaVez ? ej.ultimaVez.peso + 'kg × ' + ej.ultimaVez.reps : '--'}`}
        </span>
        <button type="button" class="btn-ver-tecnica" data-id="${ej.id}">
          Ver Técnica
        </button>
      </div>
    `;

    card.querySelector('.btn-ver-tecnica').addEventListener('click', () => {
      abrirModalTecnica(ej);
    });

    container.appendChild(card);
  });
}

function abrirModalNuevoEjercicio() {
  const modal = document.getElementById('modal-nuevo-ejercicio');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function cerrarModalNuevoEjercicio() {
  const modal = document.getElementById('modal-nuevo-ejercicio');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function registrarNuevoEjercicio(e) {
  e.preventDefault();
  const inputNombre = document.getElementById('input-nuevo-ej-nombre');
  const selectCat = document.getElementById('select-nuevo-ej-categoria');
  const inputPeso = document.getElementById('input-nuevo-ej-peso-ref');
  const inputReps = document.getElementById('input-nuevo-ej-reps-ref');

  const nombre = inputNombre.value.trim();
  const categoria = selectCat.value;
  const peso = parseFloat(inputPeso.value) || 20;
  const reps = parseInt(inputReps.value, 10) || 10;

  if (!nombre) return;

  const nuevoEj = {
    id: 'ej_' + Date.now(),
    nombre: nombre,
    categoria: categoria,
    musculoPrincipal: categoria.charAt(0).toUpperCase() + categoria.slice(1),
    ultimaVez: { peso: peso, reps: reps },
    pasos: ['Ejecución biomecánica estricta.', 'Control de la fase excéntrica en 2 segundos.', 'Máxima contracción sin inercia.'],
    claves: ['Mantén la columna en posición neutra.', 'Respira de forma controlada.']
  };

  // Push al array local y guardar en LocalStorage
  catalogoEjercicios.push(nuevoEj);
  guardarEjercicios(catalogoEjercicios);

  cerrarModalNuevoEjercicio();
  inputNombre.value = '';
  renderizarCatalogo('todos');
  mostrarToast(`✓ Ejercicio "${nombre}" añadido al catálogo`);
}

// Modal Ver Técnica
function abrirModalTecnica(ejercicio) {
  ejercicioModalActivo = ejercicio;
  const modal = document.getElementById('modal-tecnica');
  if (!modal) return;

  document.getElementById('modal-ejercicio-cat').textContent = ejercicio.categoria.toUpperCase();
  document.getElementById('modal-ejercicio-nombre').textContent = ejercicio.nombre;
  document.getElementById('modal-musculo-principal').textContent = ejercicio.musculoPrincipal || ejercicio.categoria;

  const prRecord = recordsPR[ejercicio.id];
  document.getElementById('modal-1rm-record').textContent = prRecord ? `${prRecord.peso1RM} kg` : 'Sin récord';

  const pasosList = document.getElementById('modal-pasos-lista');
  pasosList.innerHTML = '';
  (ejercicio.pasos || ['Ejecución estricta.', 'Mantén la tensión en el músculo objetivo.']).forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    pasosList.appendChild(li);
  });

  const clavesList = document.getElementById('modal-claves-lista');
  clavesList.innerHTML = '';
  (ejercicio.claves || ['Control postural seguro.']).forEach(c => {
    const li = document.createElement('li');
    li.textContent = c;
    clavesList.appendChild(li);
  });

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarModalTecnica() {
  const modal = document.getElementById('modal-tecnica');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ==========================================================================
// 8. Periodización (Constructor de Bloque)
// ==========================================================================

function abrirModalPeriodizacion() {
  const modal = document.getElementById('modal-periodizacion');
  if (!modal) return;

  document.getElementById('input-bloque-nombre').value = bloqueActivo.nombrePrograma || '';
  document.getElementById('input-bloque-fecha-inicio').value = bloqueActivo.fecha_inicio || '';
  document.getElementById('input-bloque-fecha-fin').value = bloqueActivo.fecha_fin || '';

  const diaActual = new Date().getDay();
  diaEditorActivo = diaActual;
  seleccionarDiaPeriodizacion(diaActual);

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarModalPeriodizacion() {
  const modal = document.getElementById('modal-periodizacion');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function seleccionarDiaPeriodizacion(diaNum) {
  diaEditorActivo = diaNum;
  const diasNombres = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

  document.querySelectorAll('.day-tab').forEach(tab => {
    if (parseInt(tab.getAttribute('data-day'), 10) === diaNum) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  const configDia = bloqueActivo.dias[diaNum] || { esDescanso: false, titulo: '', ejercicios: [] };

  document.getElementById('lbl-nombre-dia-activo').textContent = diasNombres[diaNum];
  document.getElementById('lbl-estado-dia-activo').textContent = configDia.esDescanso ? 'Día de Descanso' : 'Día de Entrenamiento';
  document.getElementById('btn-toggle-descanso-dia').textContent = configDia.esDescanso ? 'Hacer Entreno' : 'Hacer Descanso';
  document.getElementById('input-dia-titulo').value = configDia.titulo || '';

  // Renderizado condicional según estado de descanso
  const seccionTitulo = document.getElementById('seccion-titulo-dia');
  const seccionEjercicios = document.getElementById('seccion-ejercicios-dia');

  if (configDia.esDescanso) {
    if (seccionTitulo) seccionTitulo.classList.add('hidden');
    if (seccionEjercicios) seccionEjercicios.classList.add('hidden');
  } else {
    if (seccionTitulo) seccionTitulo.classList.remove('hidden');
    if (seccionEjercicios) seccionEjercicios.classList.remove('hidden');
  }

  renderizarEjerciciosDiaPeriodizacion(configDia.ejercicios || []);
}

function renderizarEjerciciosDiaPeriodizacion(ejercicios) {
  const container = document.getElementById('lista-ejercicios-dia');
  if (!container) return;

  container.innerHTML = '';
  if (ejercicios.length === 0) {
    container.innerHTML = `<div class="empty-series-msg">Sin ejercicios asignados a este día.</div>`;
    return;
  }

  ejercicios.forEach((item, index) => {
    const ej = catalogoEjercicios.find(e => e.id === item.ejercicioId) || { nombre: item.ejercicioId };
    const row = document.createElement('div');
    row.className = 'assigned-exercise-item';
    row.innerHTML = `
      <div>
        <strong>${ej.nombre}</strong>
      </div>
      <div class="meta-row">
        <span class="target-badge">${item.seriesTarget}s × ${item.repsTarget}r</span>
        <button type="button" class="btn-remove-assigned" data-index="${index}" aria-label="Eliminar">✕</button>
      </div>
    `;

    row.querySelector('.btn-remove-assigned').addEventListener('click', () => {
      bloqueActivo.dias[diaEditorActivo].ejercicios.splice(index, 1);
      renderizarEjerciciosDiaPeriodizacion(bloqueActivo.dias[diaEditorActivo].ejercicios);
    });

    container.appendChild(row);
  });
}

function abrirSelectorEjerciciosDia() {
  const modal = document.getElementById('modal-selector-catalogo');
  const container = document.getElementById('lista-opciones-ejercicios');
  const inputSearch = document.getElementById('input-buscar-ejercicio-selector');
  if (!modal || !container) return;

  function renderOpciones(query = '') {
    container.innerHTML = '';
    const q = query.toLowerCase();
    const filtrados = catalogoEjercicios.filter(e => e.nombre.toLowerCase().includes(q) || e.categoria.toLowerCase().includes(q));

    filtrados.forEach(ej => {
      const item = document.createElement('div');
      item.className = 'picker-exercise-item';
      item.innerHTML = `
        <div>
          <strong>${ej.nombre}</strong>
          <small style="display:block; color:var(--text-secondary);">${ej.categoria.toUpperCase()}</small>
        </div>
        <span class="catalog-card-badge">+ Asignar</span>
      `;
      item.addEventListener('click', () => {
        if (!bloqueActivo.dias[diaEditorActivo]) {
          bloqueActivo.dias[diaEditorActivo] = { esDescanso: false, titulo: 'Sesión', ejercicios: [] };
        }
        bloqueActivo.dias[diaEditorActivo].ejercicios.push({
          ejercicioId: ej.id,
          seriesTarget: 4,
          repsTarget: '8-10'
        });
        cerrarSelectorEjerciciosDia();
        renderizarEjerciciosDiaPeriodizacion(bloqueActivo.dias[diaEditorActivo].ejercicios);
      });
      container.appendChild(item);
    });
  }

  if (inputSearch) {
    inputSearch.value = '';
    inputSearch.oninput = (e) => renderOpciones(e.target.value);
  }

  renderOpciones();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarSelectorEjerciciosDia() {
  const modal = document.getElementById('modal-selector-catalogo');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function guardarBloquePeriodizacion(e) {
  e.preventDefault();
  const nombre = document.getElementById('input-bloque-nombre').value.trim();
  const inicio = document.getElementById('input-bloque-fecha-inicio').value;
  const fin = document.getElementById('input-bloque-fecha-fin').value;

  if (!nombre || !inicio || !fin) {
    mostrarToast('Por favor completa todos los campos del bloque');
    return;
  }

  // Guardar título del día activo
  const tituloDia = document.getElementById('input-dia-titulo').value.trim();
  if (bloqueActivo.dias[diaEditorActivo]) {
    if (bloqueActivo.dias[diaEditorActivo].esDescanso) {
      bloqueActivo.dias[diaEditorActivo].titulo = 'Descanso';
      bloqueActivo.dias[diaEditorActivo].ejercicios = [];
    } else {
      bloqueActivo.dias[diaEditorActivo].titulo = tituloDia || 'Entrenamiento';
    }
  }

  bloqueActivo.nombrePrograma = nombre;
  bloqueActivo.fecha_inicio = inicio;
  bloqueActivo.fecha_fin = fin;

  guardarProgramaBloque(bloqueActivo);
  cerrarModalPeriodizacion();
  renderizarInicioInteligente();
  mostrarToast('✓ Programa de bloque guardado con éxito');
}

// ==========================================================================
// 9. UI de Combate (Sesión Activa, Modo Descarga & Tracker de PR)
// ==========================================================================

function obtenerEjerciciosRutinaHoy() {
  const diaSemanaHoy = new Date().getDay();
  const diaConfig = bloqueActivo?.dias ? bloqueActivo.dias[diaSemanaHoy] : null;

  if (diaConfig && !diaConfig.esDescanso && Array.isArray(diaConfig.ejercicios) && diaConfig.ejercicios.length > 0) {
    return diaConfig.ejercicios.map(item => item.ejercicioId);
  }
  return catalogoEjercicios.map(e => e.id);
}

function iniciarEntrenamiento(ejercicioInicialId = null) {
  const rutinaEjercicios = obtenerEjerciciosRutinaHoy();

  if (!sesionActiva) {
    const uuid = generarUUID();
    let idxInicial = 0;
    if (ejercicioInicialId) {
      const pos = rutinaEjercicios.indexOf(ejercicioInicialId);
      idxInicial = pos >= 0 ? pos : 0;
    }

    indiceEjercicioActivo = idxInicial;
    const exId = rutinaEjercicios[indiceEjercicioActivo] || catalogoEjercicios[0].id;
    const diaSemanaHoy = new Date().getDay();
    const diaConfig = bloqueActivo?.dias ? bloqueActivo.dias[diaSemanaHoy] : null;

    sesionActiva = {
      id: uuid,
      startedAt: Date.now(),
      nombreRutina: (diaConfig && !diaConfig.esDescanso && diaConfig.titulo) ? diaConfig.titulo : 'Entrenamiento Activo',
      ejerciciosRutinaIds: rutinaEjercicios,
      indiceEjercicioActivo: indiceEjercicioActivo,
      ejercicioActualId: exId,
      modoDescarga: false,
      series: [], // Array de series registradas
      prsObtenidosEnSesion: 0,
      borradorActual: { peso: '', reps: '', rir: '', esCalentamiento: false }
    };
    guardarSesionActiva(sesionActiva);
    mostrarToast('⚡ Sesión iniciada con éxito');
  } else {
    if (!Array.isArray(sesionActiva.ejerciciosRutinaIds) || sesionActiva.ejerciciosRutinaIds.length === 0) {
      sesionActiva.ejerciciosRutinaIds = rutinaEjercicios;
    }

    if (ejercicioInicialId) {
      const pos = sesionActiva.ejerciciosRutinaIds.indexOf(ejercicioInicialId);
      indiceEjercicioActivo = pos >= 0 ? pos : 0;
    } else if (typeof sesionActiva.indiceEjercicioActivo === 'number') {
      indiceEjercicioActivo = sesionActiva.indiceEjercicioActivo;
    } else {
      const pos = sesionActiva.ejerciciosRutinaIds.indexOf(sesionActiva.ejercicioActualId);
      indiceEjercicioActivo = pos >= 0 ? pos : 0;
    }

    sesionActiva.indiceEjercicioActivo = indiceEjercicioActivo;
    sesionActiva.ejercicioActualId = sesionActiva.ejerciciosRutinaIds[indiceEjercicioActivo] || catalogoEjercicios[0].id;
    guardarSesionActiva(sesionActiva);
  }

  mostrarVistaCombate();
}

function mostrarVistaCombate() {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-tab-item').forEach(t => t.classList.remove('active'));

  const combatView = document.getElementById('view-sesion');
  if (combatView) combatView.classList.add('active');

  iniciarCronometro();

  const toggleDeload = document.getElementById('toggle-modo-descarga');
  if (toggleDeload && sesionActiva) {
    toggleDeload.checked = !!sesionActiva.modoDescarga;
  }

  // Cargar ejercicio activo por índice del array de rutina
  cargarEjercicioPorIndice(indiceEjercicioActivo);
  actualizarBannerSesionActiva();
}

function cargarEjercicioPorIndice(index) {
  if (!sesionActiva) return;

  const listaIds = (Array.isArray(sesionActiva.ejerciciosRutinaIds) && sesionActiva.ejerciciosRutinaIds.length > 0)
    ? sesionActiva.ejerciciosRutinaIds
    : catalogoEjercicios.map(e => e.id);

  if (index < 0) index = 0;
  if (index >= listaIds.length) index = listaIds.length - 1;
  indiceEjercicioActivo = index;

  const ejercicioId = listaIds[indiceEjercicioActivo];
  sesionActiva.indiceEjercicioActivo = indiceEjercicioActivo;
  sesionActiva.ejercicioActualId = ejercicioId;
  guardarSesionActiva(sesionActiva);

  cargarEjercicioEnCombate(ejercicioId);
  actualizarControlesNavegacionCombate(listaIds.length);
}

function actualizarControlesNavegacionCombate(totalEjercicios) {
  const btnAnterior = document.getElementById('btn-ejercicio-anterior');
  const btnSiguiente = document.getElementById('btn-ejercicio-siguiente');
  const btnTerminar = document.getElementById('btn-ejercicio-terminar');
  const navCounter = document.getElementById('combat-nav-counter');
  const flowStepIndex = document.getElementById('combat-step-index');
  const flowDotsContainer = document.getElementById('combat-flow-dots');

  const esPrimero = indiceEjercicioActivo === 0;
  const esUltimo = indiceEjercicioActivo >= totalEjercicios - 1;

  // Botón Anterior: si el índice es 0, oculta o deshabilita
  if (btnAnterior) {
    if (esPrimero) {
      btnAnterior.disabled = true;
      btnAnterior.classList.add('disabled');
      btnAnterior.style.visibility = 'hidden';
    } else {
      btnAnterior.disabled = false;
      btnAnterior.classList.remove('disabled');
      btnAnterior.style.visibility = 'visible';
    }
  }

  // Botón Siguiente / Terminar: al llegar al último elemento, desaparece Siguiente y da paso a Terminar Sesión
  if (btnSiguiente && btnTerminar) {
    if (esUltimo) {
      btnSiguiente.classList.add('hidden');
      btnTerminar.classList.remove('hidden');
    } else {
      btnSiguiente.classList.remove('hidden');
      btnTerminar.classList.add('hidden');
    }
  }

  if (navCounter) {
    navCounter.textContent = `${indiceEjercicioActivo + 1} / ${totalEjercicios}`;
  }
  if (flowStepIndex) {
    flowStepIndex.textContent = `Ejercicio ${indiceEjercicioActivo + 1} de ${totalEjercicios}`;
  }

  if (flowDotsContainer) {
    flowDotsContainer.innerHTML = '';
    for (let i = 0; i < totalEjercicios; i++) {
      const dot = document.createElement('span');
      let statusClass = '';
      if (i === indiceEjercicioActivo) statusClass = 'active';
      else if (i < indiceEjercicioActivo) statusClass = 'completed';
      dot.className = `flow-dot ${statusClass}`;
      flowDotsContainer.appendChild(dot);
    }
  }
}

function cargarEjercicioEnCombate(ejercicioId) {
  const ejercicio = catalogoEjercicios.find(e => e.id === ejercicioId) || catalogoEjercicios[0];
  if (!ejercicio) return;

  if (sesionActiva) {
    sesionActiva.ejercicioActualId = ejercicio.id;
    guardarSesionActiva(sesionActiva);
  }

  document.getElementById('combat-exercise-name').textContent = ejercicio.nombre;
  document.getElementById('combat-exercise-tag').textContent = ejercicio.categoria;

  // LÓGICA DE MODO DESCARGA EN GHOST TEXT
  actualizarGhostTextCombate(ejercicio);

  // Restaurar borrador de inputs
  const inputPeso = document.getElementById('input-peso');
  const inputReps = document.getElementById('input-reps');
  const inputRir = document.getElementById('input-rir');
  const toggleWarmup = document.getElementById('toggle-calentamiento');

  if (sesionActiva && sesionActiva.borradorActual) {
    inputPeso.value = sesionActiva.borradorActual.peso || '';
    inputReps.value = sesionActiva.borradorActual.reps || '';
    inputRir.value = sesionActiva.borradorActual.rir || '';
    toggleWarmup.checked = !!sesionActiva.borradorActual.esCalentamiento;
  }

  const btnTecnica = document.getElementById('btn-combat-ver-tecnica');
  if (btnTecnica) {
    btnTecnica.onclick = () => abrirModalTecnica(ejercicio);
  }

  renderizarSeriesCombate(ejercicio.id);
  actualizarMetricasEnVivoCombate();
}

function actualizarGhostTextCombate(ejercicio) {
  const ghostTextBanner = document.getElementById('ghost-reference-text');
  const ghostDeloadTag = document.getElementById('ghost-deload-tag');
  const ghostHintPeso = document.getElementById('ghost-hint-peso');
  const ghostHintReps = document.getElementById('ghost-hint-reps');
  const inputPeso = document.getElementById('input-peso');
  const inputReps = document.getElementById('input-reps');

  const ultPeso = ejercicio.ultimaVez ? ejercicio.ultimaVez.peso : 20.0;
  const ultReps = ejercicio.ultimaVez ? ejercicio.ultimaVez.reps : 10;

  const esDeload = sesionActiva && sesionActiva.modoDescarga;
  const pesoAjustado = esDeload ? Math.round((ultPeso * 0.8) * 10) / 10 : ultPeso;

  if (ghostDeloadTag) {
    if (esDeload) ghostDeloadTag.classList.remove('hidden');
    else ghostDeloadTag.classList.add('hidden');
  }

  const ghostString = esDeload
    ? `Descarga (-20%): ${pesoAjustado.toFixed(1)} kg × ${ultReps} reps`
    : `Última vez: ${ultPeso.toFixed(1)} kg × ${ultReps} reps`;

  if (ghostTextBanner) ghostTextBanner.textContent = ghostString;
  if (ghostHintPeso) ghostHintPeso.textContent = `Últ: ${pesoAjustado.toFixed(1)} kg`;
  if (ghostHintReps) ghostHintReps.textContent = `Últ: ${ultReps} reps`;

  if (inputPeso && !inputPeso.value) inputPeso.placeholder = pesoAjustado;
  if (inputReps && !inputReps.value) inputReps.placeholder = ultReps;
}

function renderizarSeriesCombate(ejercicioId) {
  const container = document.getElementById('combat-series-list');
  const lblNumeroSerie = document.getElementById('lbl-numero-serie');
  if (!container) return;

  const seriesEjercicio = sesionActiva ? sesionActiva.series.filter(s => s.ejercicioId === ejercicioId) : [];

  if (lblNumeroSerie) {
    lblNumeroSerie.textContent = `Serie ${seriesEjercicio.length + 1}`;
  }

  if (seriesEjercicio.length === 0) {
    container.innerHTML = `<div class="empty-series-msg">No hay series registradas en este ejercicio.</div>`;
    return;
  }

  container.innerHTML = '';
  seriesEjercicio.forEach((serie, idx) => {
    const row = document.createElement('div');
    row.className = `recorded-set-row ${serie.esCalentamiento ? 'warmup-row' : ''}`;
    row.innerHTML = `
      <div class="set-index-col">
        <span>S${idx + 1}</span>
        ${serie.esCalentamiento ? '<span class="badge-warmup">W</span>' : ''}
      </div>
      <div class="set-load-col">
        <strong>${serie.peso} kg</strong> × ${serie.reps}
        ${serie.pr1RM ? `<small style="display:block; color:var(--primary-color); font-size:10px;">1RM: ${serie.pr1RM}kg</small>` : ''}
      </div>
      <div class="set-rir-col">
        ${serie.rir !== '' ? `RIR ${serie.rir}` : '-'}
      </div>
      <div class="set-action-col">
        <button type="button" class="btn-delete-set" data-serie-id="${serie.id}" aria-label="Eliminar serie" title="Eliminar serie">✕</button>
      </div>
    `;

    const btnDelete = row.querySelector('.btn-delete-set');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        if (!sesionActiva || !Array.isArray(sesionActiva.series)) return;
        const indice = sesionActiva.series.findIndex(s => s.id === serie.id);
        if (indice !== -1) {
          sesionActiva.series.splice(indice, 1);
          guardarSesionActiva(sesionActiva);
          renderizarSeriesCombate(ejercicioId);
          actualizarMetricasEnVivoCombate();
          mostrarToast('Serie eliminada');
        }
      });
    }

    container.appendChild(row);
  });
}

function calcularTonelajeEfectivo(series) {
  if (!Array.isArray(series)) return 0;
  // Solo series donde Calentamiento sea false
  return series
    .filter(s => !s.esCalentamiento)
    .reduce((total, s) => total + (parseFloat(s.peso) || 0) * (parseInt(s.reps, 10) || 0), 0);
}

function actualizarMetricasEnVivoCombate() {
  if (!sesionActiva) return;
  const liveTonnage = document.getElementById('combat-live-tonnage');
  const effectiveSets = document.getElementById('combat-effective-sets');

  const tonelaje = calcularTonelajeEfectivo(sesionActiva.series);
  const seriesEfectivasCount = sesionActiva.series.filter(s => !s.esCalentamiento).length;

  if (liveTonnage) liveTonnage.textContent = `${formatearNumero(tonelaje)} kg`;
  if (effectiveSets) effectiveSets.textContent = seriesEfectivasCount;

  actualizarBannerSesionActiva();
}

function mostrarIndicadorAutoguardado() {
  const indicator = document.getElementById('autosave-indicator');
  if (!indicator) return;
  indicator.classList.add('saving');
  clearTimeout(window._autosaveTimeout);
  window._autosaveTimeout = setTimeout(() => {
    indicator.classList.remove('saving');
  }, 800);
}

// Configurar Autoguardado Asíncrono en inputs
function configurarAutoguardadoReactivo() {
  const inputPeso = document.getElementById('input-peso');
  const inputReps = document.getElementById('input-reps');
  const inputRir = document.getElementById('input-rir');
  const toggleWarmup = document.getElementById('toggle-calentamiento');

  function guardarBorrador() {
    if (!sesionActiva) return;
    sesionActiva.borradorActual = {
      peso: inputPeso.value,
      reps: inputReps.value,
      rir: inputRir.value,
      esCalentamiento: toggleWarmup.checked
    };
    guardarSesionActiva(sesionActiva);
  }

  [inputPeso, inputReps, inputRir].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', guardarBorrador);
      inp.addEventListener('change', guardarBorrador);
    }
  });

  if (toggleWarmup) {
    toggleWarmup.addEventListener('change', guardarBorrador);
  }

  // Steppers rápidos (-2.5, +2.5, -1, +1)
  document.querySelectorAll('.btn-stepper').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const step = parseFloat(btn.getAttribute('data-step')) || 0;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      let valActual = parseFloat(targetInput.value);
      if (isNaN(valActual)) valActual = parseFloat(targetInput.placeholder) || 0;

      let nuevoVal = Math.max(0, valActual + step);
      targetInput.value = step % 1 === 0 ? Math.round(nuevoVal) : nuevoVal.toFixed(1);

      guardarBorrador();
      if ('vibrate' in navigator) {
        try { navigator.vibrate(15); } catch (_) {}
      }
    });
  });

  // Toggle Modo Descarga
  const toggleDeload = document.getElementById('toggle-modo-descarga');
  if (toggleDeload) {
    toggleDeload.addEventListener('change', (e) => {
      if (sesionActiva) {
        sesionActiva.modoDescarga = e.target.checked;
        guardarSesionActiva(sesionActiva);
        const ej = catalogoEjercicios.find(x => x.id === sesionActiva.ejercicioActualId);
        if (ej) actualizarGhostTextCombate(ej);
        mostrarToast(e.target.checked ? 'Modo Descarga Activado (-20% cargas)' : 'Modo Descarga Desactivado');
      }
    });
  }

  // Botón Registrar Serie
  const btnAgregar = document.getElementById('btn-agregar-serie');
  if (btnAgregar) btnAgregar.addEventListener('click', registrarSerieActual);
}

// Registrar serie actual y verificar Tracker de PR (1RM)
function registrarSerieActual() {
  if (!sesionActiva) return;

  const inputPeso = document.getElementById('input-peso');
  const inputReps = document.getElementById('input-reps');
  const inputRir = document.getElementById('input-rir');
  const toggleWarmup = document.getElementById('toggle-calentamiento');

  let peso = parseFloat(inputPeso.value);
  let reps = parseInt(inputReps.value, 10);

  if (isNaN(peso)) peso = parseFloat(inputPeso.placeholder) || 0;
  if (isNaN(reps)) reps = parseInt(inputReps.placeholder, 10) || 8;

  const rir = inputRir.value !== '' ? parseInt(inputRir.value, 10) : '';
  const esCalentamiento = toggleWarmup.checked;

  let prCalculado = null;
  let esNuevoRecord = false;

  // Si es serie efectiva (esCalentamiento === false), calcular 1RM
  if (!esCalentamiento) {
    prCalculado = calcular1RM(peso, reps);
    const ejercicioId = sesionActiva.ejercicioActualId;
    const recordAnterior = recordsPR[ejercicioId] ? recordsPR[ejercicioId].peso1RM : 0;

    if (prCalculado > recordAnterior) {
      esNuevoRecord = true;
      recordsPR[ejercicioId] = {
        peso1RM: prCalculado,
        pesoSerie: peso,
        repsSerie: reps,
        fecha: Date.now()
      };
      guardarPRs(recordsPR);
      sesionActiva.prsObtenidosEnSesion = (sesionActiva.prsObtenidosEnSesion || 0) + 1;

      // Micro-animación de Badge de PR
      mostrarMicroAnimacionPR(prCalculado);
    }
  }

  const nuevaSerie = {
    id: generarUUID(),
    ejercicioId: sesionActiva.ejercicioActualId,
    timestamp: Date.now(),
    peso: peso,
    reps: reps,
    rir: rir,
    esCalentamiento: esCalentamiento,
    pr1RM: prCalculado
  };

  sesionActiva.series.push(nuevaSerie);

  // Actualizar última vez en el catálogo local
  const ej = catalogoEjercicios.find(e => e.id === sesionActiva.ejercicioActualId);
  if (ej && !esCalentamiento) {
    ej.ultimaVez = { peso: peso, reps: reps };
    guardarEjercicios(catalogoEjercicios);
  }

  // Limpiar borrador temporal
  sesionActiva.borradorActual = {
    peso: peso.toString(),
    reps: reps.toString(),
    rir: '',
    esCalentamiento: false
  };

  toggleWarmup.checked = false;
  inputRir.value = '';

  guardarSesionActiva(sesionActiva);
  renderizarSeriesCombate(sesionActiva.ejercicioActualId);
  actualizarMetricasEnVivoCombate();

  // Iniciar cronómetro de descanso automático (90s)
  iniciarCronometroDescanso(90);

  if (!esNuevoRecord) {
    mostrarToast(`✓ Serie: ${peso}kg × ${reps} reps`);
  }
}

function mostrarMicroAnimacionPR(nuevoPR) {
  const badge = document.getElementById('badge-nuevo-pr');
  const text = document.getElementById('pr-badge-text');
  if (!badge) return;

  text.textContent = `¡Nuevo Récord PR! 1RM Estimado: ${nuevoPR} kg`;
  badge.classList.remove('hidden');

  if ('vibrate' in navigator) {
    try { navigator.vibrate([40, 60, 40]); } catch (_) {}
  }

  clearTimeout(window._prTimeout);
  window._prTimeout = setTimeout(() => {
    badge.classList.add('hidden');
  }, 4000);
}

function eliminarSerie(serieId) {
  if (!sesionActiva || !Array.isArray(sesionActiva.series)) return;
  const index = sesionActiva.series.findIndex(s => s.id === serieId);
  if (index !== -1) {
    sesionActiva.series.splice(index, 1);
    guardarSesionActiva(sesionActiva);
    renderizarSeriesCombate(sesionActiva.ejercicioActualId);
    actualizarMetricasEnVivoCombate();
    mostrarToast('Serie eliminada');
  }
}

// ==========================================================================
// 10. Pantalla de Victoria & Finalización de Sesión
// ==========================================================================

function finalizarEntrenamiento() {
  if (!sesionActiva) return;

  const seriesTotales = sesionActiva.series;
  if (seriesTotales.length === 0) {
    if (confirm('No has registrado series. ¿Deseas descartar la sesión?')) {
      descartarSesion();
    }
    return;
  }

  const tonelajeEfectivo = calcularTonelajeEfectivo(seriesTotales);
  const seriesEfectivas = seriesTotales.filter(s => !s.esCalentamiento);
  const duracionMin = Math.max(1, Math.round((Date.now() - sesionActiva.startedAt) / 60000));
  const prsCount = sesionActiva.prsObtenidosEnSesion || 0;

  const sesionCompletada = {
    id: sesionActiva.id,
    fecha: Date.now(),
    nombreRutina: sesionActiva.nombreRutina,
    tonelajeEfectivo: tonelajeEfectivo,
    totalSeries: seriesTotales.length,
    seriesEfectivasCount: seriesEfectivas.length,
    duracionMin: duracionMin,
    series: seriesTotales
  };

  // Guardar en historial
  const historial = cargarHistorial();
  historial.push(sesionCompletada);
  guardarHistorial(historial);

  // Limpiar sesión activa
  sesionActiva = null;
  guardarSesionActiva(null);
  detenerCronometro();
  detenerCronometroDescanso();
  indiceEjercicioActivo = 0;

  // Actualizar diario de entrenamiento
  renderizarDiarioEntrenamientos();

  // Mostrar Pantalla de Victoria
  abrirPantallaVictoria({
    rutinaNombre: sesionCompletada.nombreRutina,
    tonelaje: tonelajeEfectivo,
    duracion: duracionMin,
    seriesEfectivas: seriesEfectivas.length,
    prsCount: prsCount
  });
}

function abrirPantallaVictoria({ rutinaNombre, tonelaje, duracion, seriesEfectivas, prsCount }) {
  const modal = document.getElementById('modal-victoria');
  if (!modal) return;

  document.getElementById('victory-routine-name').textContent = rutinaNombre || 'Entrenamiento del Día';
  document.getElementById('victory-tonnage').textContent = `${formatearNumero(tonelaje)} kg`;
  document.getElementById('victory-duration').textContent = `${duracion} min`;
  document.getElementById('victory-sets').textContent = seriesEfectivas;
  document.getElementById('victory-prs').textContent = prsCount;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if ('vibrate' in navigator) {
    try { navigator.vibrate([80, 50, 80, 50, 120]); } catch (_) {}
  }
}

function cerrarPantallaVictoria() {
  const modal = document.getElementById('modal-victoria');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  renderizarInicioInteligente();
  sincronizarPerfilUI();
  actualizarBannerSesionActiva();
  cambiarTab('inicio');
}

function descartarSesion() {
  const confirmado = confirm('¿Seguro que deseas descartar esta sesión? Los datos no se guardarán');
  if (!confirmado) return;

  sesionActiva = null;
  localStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
  guardarSesionActiva(null);
  detenerCronometro();
  detenerCronometroDescanso();
  indiceEjercicioActivo = 0;

  // Ocultar vista de sesión activa
  const viewSesion = document.getElementById('view-sesion');
  if (viewSesion) {
    viewSesion.classList.remove('active');
  }

  // Volver a renderizar la pantalla de 'Inicio'
  cambiarTab('inicio');
  renderizarInicioInteligente();
  actualizarBannerSesionActiva();
  mostrarToast('Entrenamiento descartado');
}

function iniciarCronometro() {
  if (cronometroInterval) clearInterval(cronometroInterval);

  function tick() {
    if (!sesionActiva) return;
    const elapsedSegundos = Math.floor((Date.now() - sesionActiva.startedAt) / 1000);
    const mins = String(Math.floor(elapsedSegundos / 60)).padStart(2, '0');
    const secs = String(elapsedSegundos % 60).padStart(2, '0');
    const timerElem = document.getElementById('chronometer-text');
    if (timerElem) timerElem.textContent = `${mins}:${secs}`;
  }

  tick();
  cronometroInterval = setInterval(tick, 1000);
}

function detenerCronometro() {
  if (cronometroInterval) {
    clearInterval(cronometroInterval);
    cronometroInterval = null;
  }
}

// ==========================================================================
// Cronómetro de Descanso Automático (90s con vibración)
// ==========================================================================
let descansoInterval = null;
let descansoSegundosRestantes = 90;

function iniciarCronometroDescanso(duracionSegundos = 90) {
  if (descansoInterval) {
    clearInterval(descansoInterval);
    descansoInterval = null;
  }

  const timerEl = document.getElementById('rest-timer-floating');
  const displayEl = document.getElementById('rest-timer-display');
  if (!timerEl) return;

  descansoSegundosRestantes = duracionSegundos;
  timerEl.classList.remove('hidden');
  timerEl.style.display = 'flex';

  const actualizarTexto = () => {
    const mins = String(Math.floor(descansoSegundosRestantes / 60)).padStart(2, '0');
    const secs = String(descansoSegundosRestantes % 60).padStart(2, '0');
    if (displayEl) displayEl.textContent = `${mins}:${secs}`;
  };

  actualizarTexto();

  descansoInterval = setInterval(() => {
    descansoSegundosRestantes--;
    if (descansoSegundosRestantes <= 0) {
      clearInterval(descansoInterval);
      descansoInterval = null;
      if (displayEl) displayEl.textContent = '00:00';
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([500, 200, 500]);
        } catch (_) {}
      }
      setTimeout(() => {
        detenerCronometroDescanso();
      }, 1000);
    } else {
      actualizarTexto();
    }
  }, 1000);
}

function detenerCronometroDescanso() {
  if (descansoInterval) {
    clearInterval(descansoInterval);
    descansoInterval = null;
  }
  const timerEl = document.getElementById('rest-timer-floating');
  if (timerEl) {
    timerEl.classList.add('hidden');
    timerEl.style.display = 'none';
  }
}

function actualizarBannerSesionActiva() {
  const banner = document.getElementById('banner-sesion-activa');
  if (!banner) return;

  if (sesionActiva) {
    banner.classList.remove('hidden');
    const mins = Math.floor((Date.now() - sesionActiva.startedAt) / 60000);
    const tonelaje = calcularTonelajeEfectivo(sesionActiva.series);
    const seriesCount = sesionActiva.series.length;

    const tiempoElem = document.getElementById('banner-sesion-tiempo');
    if (tiempoElem) {
      tiempoElem.textContent = `⏱️ ${mins} min • ${seriesCount} series • ${formatearNumero(tonelaje)} kg efectivo`;
    }
  } else {
    banner.classList.add('hidden');
  }
}

// ==========================================================================
// 11. Diario de Entrenamiento (Historial & Acordeón Nativo)
// ==========================================================================

function agruparSesionesHistorial() {
  const rawHistorial = cargarHistorial();
  if (!Array.isArray(rawHistorial) || rawHistorial.length === 0) {
    return [];
  }

  // Agrupador por UUID de cada sesión
  const mapaSesiones = new Map();

  rawHistorial.forEach(item => {
    // Si el item es un objeto de sesión con array interno de series
    if (item.series && Array.isArray(item.series)) {
      const sesionId = item.id || item.sesionId || generarUUID();
      if (!mapaSesiones.has(sesionId)) {
        mapaSesiones.set(sesionId, {
          id: sesionId,
          fecha: item.fecha || item.timestamp || Date.now(),
          nombreRutina: item.nombreRutina || 'Entrenamiento Registrado',
          tonelajeTotal: item.tonelajeEfectivo ?? item.tonelajeTotal ?? calcularTonelajeEfectivo(item.series),
          series: [...item.series]
        });
      } else {
        const sesionExistente = mapaSesiones.get(sesionId);
        sesionExistente.series.push(...item.series);
        sesionExistente.tonelajeTotal = calcularTonelajeEfectivo(sesionExistente.series);
      }
    } else {
      // Si el historial estuviese guardado como series sueltas con identificador de sesión
      const sesionId = item.sesionId || item.sessionId || item.sesion_uuid || item.id || 'sesion_general';
      if (!mapaSesiones.has(sesionId)) {
        mapaSesiones.set(sesionId, {
          id: sesionId,
          fecha: item.fecha || item.timestamp || Date.now(),
          nombreRutina: item.nombreRutina || item.rutina || 'Entrenamiento Registrado',
          tonelajeTotal: 0,
          series: []
        });
      }
      const sesion = mapaSesiones.get(sesionId);
      sesion.series.push(item);
      if (!item.esCalentamiento) {
        sesion.tonelajeTotal += (parseFloat(item.peso) || 0) * (parseInt(item.reps, 10) || 0);
      }
      if (item.fecha && (!sesion.fecha || item.fecha > sesion.fecha)) {
        sesion.fecha = item.fecha;
      }
    }
  });

  // Convertir a array y ordenar cronológicamente de más reciente a más antigua
  const sesionesAgrupadas = Array.from(mapaSesiones.values());
  sesionesAgrupadas.sort((a, b) => {
    const timeA = new Date(a.fecha).getTime();
    const timeB = new Date(b.fecha).getTime();
    return timeB - timeA;
  });

  return sesionesAgrupadas;
}

function abrirModalHistorial() {
  const modal = document.getElementById('modal-historial');
  if (!modal) return;
  renderizarDiarioEntrenamientos();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarModalHistorial() {
  const modal = document.getElementById('modal-historial');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function renderizarDiarioEntrenamientos() {
  const container = document.getElementById('diary-sessions-list');
  const countBadge = document.getElementById('diary-sesiones-count');
  if (!container) return;

  const sesiones = agruparSesionesHistorial();

  if (countBadge) {
    countBadge.textContent = sesiones.length;
  }

  container.innerHTML = '';

  if (sesiones.length === 0) {
    container.innerHTML = `
      <div class="diary-empty-state">
        <p class="diary-empty-text">Aún no hay entrenamientos registrados</p>
      </div>
    `;
    return;
  }

  sesiones.forEach(sesion => {
    const fechaObj = new Date(sesion.fecha);
    const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);

    // Agrupar series por ejercicio con formato limpio "Ejercicio: Peso x Reps"
    const seriesPorEjercicio = new Map();
    sesion.series.forEach(s => {
      const ej = catalogoEjercicios.find(e => e.id === s.ejercicioId) || { nombre: s.ejercicioNombre || s.ejercicioId || 'Ejercicio' };
      const nombreEj = ej.nombre;
      if (!seriesPorEjercicio.has(nombreEj)) {
        seriesPorEjercicio.set(nombreEj, []);
      }
      seriesPorEjercicio.get(nombreEj).push(`${s.peso}kg × ${s.reps}${s.esCalentamiento ? ' (Calent.)' : ''}`);
    });

    // Construir tarjeta de acordeón con <details> y <summary> nativos
    const card = document.createElement('details');
    card.className = 'diary-session-card';

    let ejerciciosHTML = '';
    seriesPorEjercicio.forEach((seriesList, nombreEj) => {
      ejerciciosHTML += `
        <div class="diary-exercise-row">
          <span class="diary-exercise-name">${nombreEj}:</span>
          <span class="diary-exercise-sets">${seriesList.join(', ')}</span>
        </div>
      `;
    });

    // Nombres únicos de los ejercicios realizados en esa sesión
    const ejerciciosNombres = Array.from(
      new Set(
        sesion.series.map(s => {
          const ej = catalogoEjercicios.find(e => e.id === s.ejercicioId);
          return ej ? ej.nombre : (s.ejercicioNombre || s.ejercicioId || 'Ejercicio');
        })
      )
    );

    const listaEjerciciosResumenHTML = ejerciciosNombres.length > 0
      ? `<div class="diary-summary-exercises" style="margin-top: 6px; display: flex; flex-direction: column; gap: 2px;">
          ${ejerciciosNombres.map(nombre => `<span class="diary-summary-ej-name" style="font-size: 12px; color: var(--text-secondary); line-height: 1.3;">- ${nombre}</span>`).join('')}
        </div>`
      : '';

    card.innerHTML = `
      <summary class="diary-session-summary">
        <div class="diary-summary-main">
          <span class="diary-session-date">${fechaFormateada}</span>
          <h5 class="diary-session-name">${sesion.nombreRutina}</h5>
          ${listaEjerciciosResumenHTML}
        </div>
        <div class="diary-summary-tonnage">
          <span class="diary-tonnage-val">${formatearNumero(sesion.tonelajeTotal)} kg</span>
          <span class="diary-tonnage-lbl">Tonelaje</span>
        </div>
        <span class="diary-accordion-arrow">▼</span>
      </summary>
      <div class="diary-session-details">
        <div class="diary-exercises-list">
          ${ejerciciosHTML || '<p class="diary-empty-text">Sin series registradas</p>'}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==========================================================================
// 12. Persistencia & Exportación (Backup JSON, Restaurar JSON, Exportar CSV)
// ==========================================================================

function exportarHistorialCSV() {
  const historial = cargarHistorial();
  if (historial.length === 0) {
    mostrarToast('No hay sesiones registradas en el historial para exportar');
    return;
  }

  // Encabezados requeridos para análisis de IA externa
  let csvContent = 'Fecha,Ejercicio,Peso,Reps,RIR,Es_Calentamiento\n';

  historial.forEach(sesion => {
    const fechaISO = new Date(sesion.fecha).toISOString().split('T')[0];
    sesion.series.forEach(s => {
      const ej = catalogoEjercicios.find(e => e.id === s.ejercicioId) || { nombre: s.ejercicioId };
      const nombreLimpio = `"${ej.nombre.replace(/"/g, '""')}"`;
      const peso = s.peso || 0;
      const reps = s.reps || 0;
      const rir = s.rir !== '' ? s.rir : '';
      const calentamiento = s.esCalentamiento ? 'true' : 'false';

      csvContent += `${fechaISO},${nombreLimpio},${peso},${reps},${rir},${calentamiento}\n`;
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse_series_ia_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarToast('✓ CSV descargado listo para IA');
}

function backupCompletoJSON() {
  const backupData = {
    perfil: cargarPerfil(),
    temaModo: cargarTemaModo(),
    ejercicios: cargarEjercicios(),
    programaBloque: cargarProgramaBloque(),
    historial: cargarHistorial(),
    prs: cargarPRs(),
    exportadoEl: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarToast('✓ Backup JSON descargado con éxito');
}

function restaurarDesdeJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && typeof parsed === 'object') {
        if (parsed.perfil) guardarPerfil(parsed.perfil);
        if (parsed.temaModo) guardarTemaModo(parsed.temaModo);
        if (Array.isArray(parsed.ejercicios)) guardarEjercicios(parsed.ejercicios);
        if (parsed.programaBloque) guardarProgramaBloque(parsed.programaBloque);
        if (Array.isArray(parsed.historial)) guardarHistorial(parsed.historial);
        if (parsed.prs) guardarPRs(parsed.prs);

        // Recargar estado
        perfilActivo = cargarPerfil();
        temaModo = cargarTemaModo();
        catalogoEjercicios = cargarEjercicios();
        bloqueActivo = cargarProgramaBloque();
        recordsPR = cargarPRs();

        sincronizarPerfilUI();
        renderizarInicioInteligente();
        renderizarCatalogo('todos');
        mostrarToast('✓ Base de datos restaurada correctamente');
      }
    } catch (err) {
      console.error('Error al restaurar JSON:', err);
      mostrarToast('Archivo JSON no válido o corrupto');
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 12. Navegación & Toast
// ==========================================================================

function cambiarTab(tabId) {
  const navTabs = document.querySelectorAll('.nav-tab-item');
  const viewSections = document.querySelectorAll('.view-section');

  navTabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  viewSections.forEach(sec => {
    if (sec.id === `view-${tabId}`) sec.classList.add('active');
    else sec.classList.remove('active');
  });

  if (tabId === 'perfil') {
    sincronizarPerfilUI();
  } else if (tabId === 'inicio') {
    renderizarInicioInteligente();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('ios-toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = mensaje;
  toast.classList.add('show');

  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// ==========================================================================
// 13. Inicialización del DOM y Escuchadores
// ==========================================================================

function inicializarApp() {
  sincronizarPerfilUI();
  renderizarInicioInteligente();
  renderizarCatalogo('todos');
  configurarAutoguardadoReactivo();
  actualizarBannerSesionActiva();

  if (sesionActiva) {
    iniciarCronometro();
  }

  // Navegación Bottom Bar
  document.querySelectorAll('.nav-tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      cambiarTab(tab.getAttribute('data-tab'));
    });
  });

  // Botón Avatar -> Perfil
  const profilePillBtn = document.getElementById('btn-header-profile');
  if (profilePillBtn) {
    profilePillBtn.addEventListener('click', () => cambiarTab('perfil'));
  }

  // Atletas Rápidos (Diego / Alexandra)
  const btnDiego = document.getElementById('btn-perfil-diego');
  if (btnDiego) {
    btnDiego.addEventListener('click', () => {
      perfilActivo = { ...PERFILES_PREDEFINIDOS.diego };
      guardarPerfil(perfilActivo);
      sincronizarPerfilUI();
      mostrarToast('Atleta: Diego (Tema Verde)');
    });
  }

  const btnAlexandra = document.getElementById('btn-perfil-alexandra');
  if (btnAlexandra) {
    btnAlexandra.addEventListener('click', () => {
      perfilActivo = { ...PERFILES_PREDEFINIDOS.alexandra };
      guardarPerfil(perfilActivo);
      sincronizarPerfilUI();
      mostrarToast('Atleta: Alexandra (Tema Rosa)');
    });
  }

  // Selector Tema Claro / Oscuro / Auto
  document.querySelectorAll('.theme-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modo = btn.getAttribute('data-theme');
      temaModo = modo;
      guardarTemaModo(modo);
      sincronizarPerfilUI();
      mostrarToast(`Tema: ${modo.toUpperCase()}`);
    });
  });

  // Filtros del Catálogo
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderizarCatalogo(chip.getAttribute('data-filter') || 'todos');
    });
  });

  // Modal Añadir Ejercicio
  const btnAbrirNuevoEj = document.getElementById('btn-abrir-modal-nuevo-ejercicio');
  const btnCerrarNuevoEj = document.getElementById('btn-cerrar-modal-nuevo-ej');
  const formNuevoEj = document.getElementById('form-nuevo-ejercicio');
  if (btnAbrirNuevoEj) btnAbrirNuevoEj.addEventListener('click', abrirModalNuevoEjercicio);
  if (btnCerrarNuevoEj) btnCerrarNuevoEj.addEventListener('click', cerrarModalNuevoEjercicio);
  if (formNuevoEj) formNuevoEj.addEventListener('submit', registrarNuevoEjercicio);

  // Periodización
  const btnAbrirPeriodizacion = document.getElementById('btn-abrir-periodizacion');
  const btnCrearPrimerBloque = document.getElementById('btn-crear-primer-bloque');
  const btnCerrarPeriodizacion = document.getElementById('btn-cerrar-modal-periodizacion');
  const formBloque = document.getElementById('form-bloque-periodizacion');

  if (btnAbrirPeriodizacion) btnAbrirPeriodizacion.addEventListener('click', abrirModalPeriodizacion);
  if (btnCrearPrimerBloque) btnCrearPrimerBloque.addEventListener('click', abrirModalPeriodizacion);
  if (btnCerrarPeriodizacion) btnCerrarPeriodizacion.addEventListener('click', cerrarModalPeriodizacion);
  if (formBloque) formBloque.addEventListener('submit', guardarBloquePeriodizacion);

  // Tabs de Días en el Constructor
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const diaNum = parseInt(tab.getAttribute('data-day'), 10);
      seleccionarDiaPeriodizacion(diaNum);
    });
  });

  // Toggle Descanso / Entreno del día en Periodización
  const btnToggleDescanso = document.getElementById('btn-toggle-descanso-dia');
  if (btnToggleDescanso) {
    btnToggleDescanso.addEventListener('click', () => {
      if (!bloqueActivo.dias[diaEditorActivo]) {
        bloqueActivo.dias[diaEditorActivo] = { esDescanso: false, titulo: 'Sesión', ejercicios: [] };
      }
      bloqueActivo.dias[diaEditorActivo].esDescanso = !bloqueActivo.dias[diaEditorActivo].esDescanso;

      const seccionTitulo = document.getElementById('seccion-titulo-dia');
      const seccionEjercicios = document.getElementById('seccion-ejercicios-dia');

      if (bloqueActivo.dias[diaEditorActivo].esDescanso) {
        bloqueActivo.dias[diaEditorActivo].ejercicios = [];
        bloqueActivo.dias[diaEditorActivo].titulo = 'Descanso';
        if (seccionTitulo) seccionTitulo.classList.add('hidden');
        if (seccionEjercicios) seccionEjercicios.classList.add('hidden');
      } else {
        if (seccionTitulo) seccionTitulo.classList.remove('hidden');
        if (seccionEjercicios) seccionEjercicios.classList.remove('hidden');
      }

      seleccionarDiaPeriodizacion(diaEditorActivo);
    });
  }

  // Selector de ejercicios para el día
  const btnAbrirSelectorDia = document.getElementById('btn-abrir-selector-ejercicios-dia');
  const btnCerrarSelectorDia = document.getElementById('btn-cerrar-modal-selector');
  if (btnAbrirSelectorDia) btnAbrirSelectorDia.addEventListener('click', abrirSelectorEjerciciosDia);
  if (btnCerrarSelectorDia) btnCerrarSelectorDia.addEventListener('click', cerrarSelectorEjerciciosDia);

  // Modal Técnica
  const btnCerrarModalTecnica = document.getElementById('btn-cerrar-modal');
  const modalTecnica = document.getElementById('modal-tecnica');
  if (btnCerrarModalTecnica) btnCerrarModalTecnica.addEventListener('click', cerrarModalTecnica);
  if (modalTecnica) {
    modalTecnica.addEventListener('click', (e) => {
      if (e.target === modalTecnica) cerrarModalTecnica();
    });
  }

  const btnEntrenarDesdeModal = document.getElementById('btn-modal-entrenar-ahora');
  if (btnEntrenarDesdeModal) {
    btnEntrenarDesdeModal.addEventListener('click', () => {
      cerrarModalTecnica();
      iniciarEntrenamiento(ejercicioModalActivo ? ejercicioModalActivo.id : null);
    });
  }

  // Modal Historial de Entrenamientos
  const btnAbrirHistorial = document.getElementById('btn-abrir-modal-historial');
  const btnCerrarHistorial = document.getElementById('btn-cerrar-modal-historial');
  const modalHistorial = document.getElementById('modal-historial');
  if (btnAbrirHistorial) btnAbrirHistorial.addEventListener('click', abrirModalHistorial);
  if (btnCerrarHistorial) btnCerrarHistorial.addEventListener('click', cerrarModalHistorial);
  if (modalHistorial) {
    modalHistorial.addEventListener('click', (e) => {
      if (e.target === modalHistorial) cerrarModalHistorial();
    });
  }

  // Iniciar / Continuar Entrenamiento
  const btnIniciar = document.getElementById('btn-iniciar-entrenamiento');
  if (btnIniciar) btnIniciar.addEventListener('click', () => iniciarEntrenamiento());

  const btnReanudar = document.getElementById('btn-banner-reanudar');
  if (btnReanudar) btnReanudar.addEventListener('click', mostrarVistaCombate);

  // Vista de Combate
  const btnMinimizar = document.getElementById('btn-minimizar-sesion');
  if (btnMinimizar) {
    btnMinimizar.addEventListener('click', () => {
      cambiarTab('inicio');
      actualizarBannerSesionActiva();
    });
  }

  const btnFinalizar = document.getElementById('btn-finalizar-sesion');
  if (btnFinalizar) btnFinalizar.addEventListener('click', finalizarEntrenamiento);

  const btnCancelar = document.getElementById('btn-cancelar-sesion');
  if (btnCancelar) btnCancelar.addEventListener('click', descartarSesion);

  const btnCerrarRestTimer = document.getElementById('btn-cerrar-rest-timer');
  if (btnCerrarRestTimer) btnCerrarRestTimer.addEventListener('click', detenerCronometroDescanso);

  // Navegación de Ejercicios en Sesión Activa (< Anterior / Siguiente > / Terminar)
  const btnEjercicioAnt = document.getElementById('btn-ejercicio-anterior');
  if (btnEjercicioAnt) {
    btnEjercicioAnt.addEventListener('click', () => {
      if (indiceEjercicioActivo > 0) {
        indiceEjercicioActivo--;
        cargarEjercicioPorIndice(indiceEjercicioActivo);
      }
    });
  }

  const btnEjercicioSig = document.getElementById('btn-ejercicio-siguiente');
  if (btnEjercicioSig) {
    btnEjercicioSig.addEventListener('click', () => {
      const listaIds = (sesionActiva && Array.isArray(sesionActiva.ejerciciosRutinaIds) && sesionActiva.ejerciciosRutinaIds.length > 0)
        ? sesionActiva.ejerciciosRutinaIds
        : catalogoEjercicios.map(e => e.id);

      if (indiceEjercicioActivo < listaIds.length - 1) {
        indiceEjercicioActivo++;
        cargarEjercicioPorIndice(indiceEjercicioActivo);
      }
    });
  }

  const btnEjercicioTerm = document.getElementById('btn-ejercicio-terminar');
  if (btnEjercicioTerm) {
    btnEjercicioTerm.addEventListener('click', finalizarEntrenamiento);
  }

  // Modal Victoria
  const btnCerrarVictoria = document.getElementById('btn-cerrar-victoria');
  if (btnCerrarVictoria) btnCerrarVictoria.addEventListener('click', cerrarPantallaVictoria);

  // Herramientas de Datos (CSV / JSON)
  const btnExportCSV = document.getElementById('btn-export-csv');
  if (btnExportCSV) btnExportCSV.addEventListener('click', exportarHistorialCSV);

  const btnBackupJSON = document.getElementById('btn-backup-json');
  if (btnBackupJSON) btnBackupJSON.addEventListener('click', backupCompletoJSON);

  const btnRestoreTrigger = document.getElementById('btn-restore-json-trigger');
  const fileRestoreInput = document.getElementById('file-restore-json');
  if (btnRestoreTrigger && fileRestoreInput) {
    btnRestoreTrigger.addEventListener('click', () => fileRestoreInput.click());
    fileRestoreInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        restaurarDesdeJSON(e.target.files[0]);
      }
    });
  }

  // Guardado de nombre perfil
  const formPerfil = document.getElementById('form-perfil');
  const inputNombre = document.getElementById('input-perfil-nombre');
  if (formPerfil && inputNombre) {
    formPerfil.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = inputNombre.value.trim();
      if (n) {
        perfilActivo.nombre = n;
        guardarPerfil(perfilActivo);
        sincronizarPerfilUI();
        mostrarToast('Nombre guardado');
      }
    });
    inputNombre.addEventListener('blur', () => {
      const n = inputNombre.value.trim();
      if (n && n !== perfilActivo.nombre) {
        perfilActivo.nombre = n;
        guardarPerfil(perfilActivo);
        sincronizarPerfilUI();
      }
    });
  }

  // Reset perfil
  const btnReset = document.getElementById('btn-reset-perfil');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      perfilActivo = { ...PERFILES_PREDEFINIDOS.diego };
      guardarPerfil(perfilActivo);
      sincronizarPerfilUI();
      mostrarToast('Perfil restaurado a Diego (Verde)');
    });
  }
}

// Iniciar aplicación
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
  inicializarApp();
}

// Exposición en window para pruebas en consola
window.FitPulse = {
  getPerfil: () => perfilActivo,
  getBloque: () => bloqueActivo,
  getSesion: () => sesionActiva,
  getCatalogo: () => catalogoEjercicios,
  getPRs: () => recordsPR,
  exportarHistorialCSV,
  backupCompletoJSON,
  iniciarEntrenamiento,
  finalizarEntrenamiento
};

(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .catch((err) => console.error('Error al registrar Service Worker:', err));
  }
})();
