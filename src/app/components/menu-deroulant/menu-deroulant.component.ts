import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // Importa MatButtonToggleModule
/*Strutura de datos */
import { pregRespMod } from '@models/pregRespMod.model';
import { categoriasMod } from '@models/categoriasMod.model';
import { subCatMod } from '@models/subCatMod.model';
/*datos */
import { categorias } from '@data/categorias';
import { subCategoriasDetalles } from '@data/subCategoriasDetalles';
import { preguntasRespuestas } from '@data/pregunta-respuestas/';

@Component({
  selector: 'app-menu-deroulant',
  standalone: true,
  imports: [MatListModule, MatButtonModule, CommonModule, MatButtonToggleModule], // Agrega MatButtonToggleModule aquí
  templateUrl: './menu-deroulant.component.html',
  styleUrl: './menu-deroulant.component.css'
})
export class MenuDeroulantComponent implements OnInit, OnDestroy {
  // Referencias a elementos del DOM para control de clics fuera de botones (para cerrar interfaz)
  // Se ha añadido 'botonLeerVozAlta' a la lista para que los clics en este botón no cierren la ventana.
  @ViewChildren('botonCategorias, botonSubCategorias, botonPregResp, respTexto, botonLeerVozAlta') private excludeButtons!: QueryList<ElementRef>;

  // Referencia al contenedor de subcategorías para el scroll en móviles
  @ViewChild('subCategoryContainer') subCategoryContainer!: ElementRef;

  // Bandera para detectar si la pantalla es de tamaño móvil
  isMobile: boolean = false;

  // Datos cargados desde archivos externos
  todasLasCategorias: categoriasMod[] = categorias;
  todosLosDetallesDeSubCategorias: subCatMod[] = subCategoriasDetalles;
  todasLasPreguntasRespuestas: pregRespMod[] = preguntasRespuestas;

  // Variables de estado para controlar la interfaz de usuario
  categoriaPrincipalActiva: string | null = null; // Nombre de la categoría principal seleccionada
  subCategoriasAMostrar: subCatMod[] = []; // Subcategorías filtradas para la segunda columna
  subCategoriaActiva: string | null = null; // Código de la subcategoría activa
  preguntasAMostrar: pregRespMod[] = []; // Preguntas/respuestas filtradas
  preguntaActiva: string | null = null; // Pregunta activa (para mostrar su respuesta)
  respuestaSeleccionada: string | null = null; // Respuesta actual mostrándose

  // Propiedad para almacenar la instancia de SpeechSynthesisUtterance
  private synth: SpeechSynthesisUtterance | null = null;
  // Propiedades para controlar el estado de la lectura en voz alta y el contenido actual
  currentPlayingQuestion: string | null = null; // Hecho público para acceso en el HTML
  currentPlayingAnswer: string | null = null;   // Hecho público para acceso en el HTML
  _window: Window = window;

  constructor() {
    // Inicializa el tamaño de pantalla al cargar el componente
    this.checkScreenSize();
    console.log('Constructor: isMobile inicializado a', this.isMobile);
  }

  ngOnInit(): void {
    // ngOnInit se ejecuta después del constructor. Útil para lógica de inicialización adicional.
  }

  /**
   * Ciclo de vida del componente: se ejecuta cuando el componente va a ser destruido.
   * Se utiliza para detener cualquier síntesis de voz en curso.
   */
  ngOnDestroy(): void {
    this.detenerLectura(); // Asegura que la lectura se detenga al destruir el componente
  }

  // --- Manejo de Eventos del Navegador ---

  // Escucha cambios en el tamaño de la ventana para actualizar `isMobile`
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    console.log('Window resized: isMobile actualizado a', this.isMobile);
  }

  // Escucha clics en el documento para cerrar la interfaz si se hace clic fuera de los botones
  @HostListener('document:click', ['$event'])
  onClickDoc(event: MouseEvent): void {
    // Esta lógica solo se activa si hay una categoría principal activa (es decir, la interfaz está expandida)
    if (this.categoriaPrincipalActiva != null) {
      const clickedElement = event.target as HTMLElement;
      let isClickInsideExcludedButton = false;

      // Itera sobre todos los botones/elementos que deberían mantener la interfaz abierta
      this.excludeButtons.forEach(buttonRef => {
        if (buttonRef.nativeElement.contains(clickedElement)) {
          isClickInsideExcludedButton = true;
          // Si el clic está dentro de uno de estos elementos, no necesitamos seguir verificando
          return;
        }
      });

      // Si el clic no fue dentro de ninguno de los elementos "excluidos", cierra la interfaz
      if (!isClickInsideExcludedButton) {
        this.cerrarVentana(); // Usa la función de cierre limpia
      }
    }
  }

  // --- Lógica de Navegación y Estado ---

  // Maneja el clic en un botón de categoría principal (Nivel 1)
  onClickCategoriaPrincipal(nombreCategoria: string): void {
    let categoriaSeleccionada: any;
    if (this.categoriaPrincipalActiva === nombreCategoria) {
      // Si se hizo click en la misma categoría activa, la desactiva (cierra toda la interfaz)
      this.cerrarVentana();
    } else {
      // Activa la nueva categoría principal y reinicia estados de subniveles
      this.categoriaPrincipalActiva = nombreCategoria;
      this.subCategoriaActiva = null;
      this.preguntasAMostrar = [];
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
      this.detenerLectura(); // Detener lectura al cambiar de categoría

      // Filtra y carga las subcategorías correspondientes a la categoría seleccionada
      categoriaSeleccionada = this.todasLasCategorias.find(cat => cat.nombre === nombreCategoria);
      if (categoriaSeleccionada) {
        this.subCategoriasAMostrar = this.todosLosDetallesDeSubCategorias.filter(subCat =>
          categoriaSeleccionada.subCategorias.includes(subCat.codigo)
        );
      } else {
        this.subCategoriasAMostrar = [];
      }
      // *** Lógica de desplazamiento automático para móviles ***
      if (this.isMobile) {
        // Un pequeño retardo para asegurar que el DOM se haya actualizado y el elemento sea visible
        setTimeout(() => {
          if (this.subCategoryContainer && this.subCategoryContainer.nativeElement) {
            this.subCategoryContainer.nativeElement.scrollIntoView({
              behavior: 'smooth', // Animación suave
              block: 'start'       // Alinea el inicio del elemento con el inicio del viewport
            });
          } else {
            console.warn('Scroll: subCategoryContainer.nativeElement NO ENCONTRADO para scrolling.');
          }
        }, 100); // 100ms de retardo
      }
    }
  }

  // Maneja el clic en un botón de subcategoría (Nivel 2)
  onClickSubCategoria(codigoSubCategoria: string): void {
    if (this.subCategoriaActiva === codigoSubCategoria) {
      // Si se hizo click en la misma subcategoría activa, la desactiva
      this.subCategoriaActiva = null;
      this.preguntasAMostrar = [];
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
    } else {
      // Activa la nueva subcategoría y reinicia estados de preguntas
      this.subCategoriaActiva = codigoSubCategoria;
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
      this.detenerLectura(); // Detener lectura al cambiar de subcategoría

      // Filtra las preguntas/respuestas basándose en el código de la subcategoría activa
      this.preguntasAMostrar = this.todasLasPreguntasRespuestas.filter(pr =>
        pr.codigo === codigoSubCategoria
      );
    }
  }

  // Maneja el clic en un botón de pregunta (Nivel 3)
  onClickPregunta(pregunta: string): void {
    if (this.preguntaActiva === pregunta) {
      // Si se hizo click en la misma pregunta activa, la desactiva
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
    } else {
      // Activa la nueva pregunta y busca su respuesta
      this.preguntaActiva = pregunta;
      const pregResp = this.preguntasAMostrar.find(pr => pr.pregunta === pregunta);
      this.respuestaSeleccionada = pregResp ? pregResp.respuesta : null;
      this.detenerLectura(); // Detener lectura al seleccionar una nueva pregunta
    }
  }

  // --- Funciones de Verificación de Estado (para aplicar clases CSS) ---

  esCategoriaPrincipalActiva(nombreCategoria: string): boolean {
    return this.categoriaPrincipalActiva === nombreCategoria;
  }

  esSubCategoriaActiva(codigoSubCategoria: string): boolean {
    return this.subCategoriaActiva === codigoSubCategoria;
  }

  esPreguntaActiva(pregunta: string): boolean {
    return this.preguntaActiva === pregunta;
  }

  // --- Función para cerrar/resetear toda la interfaz ---
  cerrarVentana(): void {
    this.categoriaPrincipalActiva = null;
    this.subCategoriaActiva = null;
    this.preguntaActiva = null;
    this.respuestaSeleccionada = null;
    this.subCategoriasAMostrar = []; // Limpia las subcategorías
    this.preguntasAMostrar = []; // Limpia las preguntas
    this.detenerLectura(); // Detener lectura al cerrar la ventana
  }

  // --- Función principal para verificar el tamaño de la pantalla ---
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  /**
   * Lee en voz alta la pregunta y la respuesta proporcionadas utilizando la Web Speech API.
   * Si ya está leyendo el mismo contenido, detiene la lectura.
   * @param pregunta El texto de la pregunta a leer.
   * @param respuesta El texto de la respuesta a leer.
   */
  leerPreguntaRespuesta(pregunta: string, respuesta: string): void {
    const textoCompleto = `Pregunta: ${pregunta}. Respuesta: ${respuesta}.`;

    // Si ya está leyendo y es el mismo contenido, detener la lectura actual.
    if (!!(window.speechSynthesis.speaking) &&
      this.currentPlayingQuestion === pregunta &&
      this.currentPlayingAnswer === respuesta) {
      this.detenerLectura();
      return; // Salir después de detener.
    }

    // Detener cualquier lectura anterior si no es la misma o no está leyendo.
    this.detenerLectura();

    // Verifica si la API de síntesis de voz es compatible con el navegador.
    if ('speechSynthesis' in window) {
      this.synth = new SpeechSynthesisUtterance(textoCompleto);

      // Configura el idioma a español. Puedes ajustar esto según tus necesidades (ej. 'es-MX', 'es-AR').
      this.synth.lang = 'es-ES';

      // Opcional: Configura la velocidad (rate) y el tono (pitch) de la voz.
      this.synth.rate = 1; // Velocidad normal (1 es el valor predeterminado)
      this.synth.pitch = 1; // Tono normal (1 es el valor predeterminado)

      // Evento que se dispara cuando la lectura comienza.
      this.synth.onstart = () => {
        console.log('Comenzando a leer en voz alta...');
        this.currentPlayingQuestion = pregunta; // Almacenar la pregunta actual
        this.currentPlayingAnswer = respuesta;   // Almacenar la respuesta actual
      };

      // Evento que se dispara cuando la lectura finaliza.
      this.synth.onend = () => {
        console.log('Lectura finalizada.');
        this.synth = null; // Limpia la referencia al objeto de síntesis una vez que ha terminado.
        this.currentPlayingQuestion = null; // Limpiar la pregunta actual
        this.currentPlayingAnswer = null;   // Limpiar la respuesta actual
      };

      // Evento que se dispara si ocurre un error durante la síntesis de voz.
      this.synth.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('Error en la síntesis de voz:', event.error);
        this.synth = null; // Limpia la referencia en caso de error.
        this.currentPlayingQuestion = null; // Limpiar la pregunta actual
        this.currentPlayingAnswer = null;   // Limpiar la respuesta actual
        // Se ha reemplazado la alerta por un mensaje en consola.
        console.error('Hubo un error al intentar leer en voz alta. Tu navegador podría no soportarlo o haber un problema.');
      };

      // Inicia la lectura del texto.
      window.speechSynthesis.speak(this.synth);
    }
  }

  /**
   * Detiene cualquier lectura de Text-to-Speech que esté en curso.
   */
  detenerLectura(): void {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Cancela la síntesis de voz actual.
    }
    this.synth = null; // Asegura que la referencia al objeto de síntesis se limpie.
    this.currentPlayingQuestion = null; // Limpiar la pregunta actual
    this.currentPlayingAnswer = null;   // Limpiar la respuesta actual
  }
  getButtonText(pregunta: string, respuesta: string): string {
    if (this._window.speechSynthesis.speaking &&
      this.currentPlayingQuestion !== pregunta &&
      this.currentPlayingAnswer !== respuesta) {
      return 'Detener lectura';
    }
    return 'Leer en voz alta';
  } // Agregado OnDestroy
}
