import { Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
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
  imports: [MatListModule, MatButtonModule, CommonModule],
  templateUrl: './menu-deroulant.component.html',
  styleUrl: './menu-deroulant.component.css'
})
export class MenuDeroulantComponent implements OnInit, OnDestroy {

  // Referencias a elementos del DOM para control de clics fuera de botones (para cerrar interfaz)
  @ViewChildren('botonCategorias, botonSubCategorias, botonPregResp, respTexto') private excludeButtons!: QueryList<ElementRef>;

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
  private synth: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Inicializa el tamaño de pantalla al cargar el componente
    this.checkScreenSize();
    console.log('Constructor: isMobile inicializado a', this.isMobile);
  }

  ngOnInit(): void {
    // ngOnInit se ejecuta después del constructor. Útil para lógica de inicialización adicional.
  }
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
              block: 'start'      // Alinea el inicio del elemento con el inicio del viewport
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
  }

  // --- Función principal para verificar el tamaño de la pantalla ---
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }
  leerPreguntaRespuesta(pregunta: string, respuesta: string): void {
    // Primero, detiene cualquier lectura anterior para evitar superposiciones.
    this.detenerLectura();

    // Verifica si la API de síntesis de voz es compatible con el navegador.
    if ('speechSynthesis' in window) {
      const textoCompleto = `Pregunta: ${pregunta}. Respuesta: ${respuesta}.`;
      this.synth = new SpeechSynthesisUtterance(textoCompleto);

      // Configura el idioma a español. Puedes ajustar esto según tus necesidades (ej. 'es-MX', 'es-AR').
      this.synth.lang = 'es-ES';

      // Opcional: Configura la velocidad (rate) y el tono (pitch) de la voz.
      this.synth.rate = 1; // Velocidad normal (1 es el valor predeterminado)
      this.synth.pitch = 1; // Tono normal (1 es el valor predeterminado)

      // Evento que se dispara cuando la lectura comienza.
      this.synth.onstart = () => {
        console.log('Comenzando a leer en voz alta...');
        // Aquí podrías añadir lógica para mostrar un indicador de lectura activa en la UI.
      };

      // Evento que se dispara cuando la lectura finaliza.
      this.synth.onend = () => {
        console.log('Lectura finalizada.');
        this.synth = null; // Limpia la referencia al objeto de síntesis una vez que ha terminado.
      };

      // Evento que se dispara si ocurre un error durante la síntesis de voz.
      this.synth.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('Error en la síntesis de voz:', event.error);
        this.synth = null; // Limpia la referencia en caso de error.
        // Podrías mostrar un mensaje de error más amigable al usuario.
        alert('Hubo un error al intentar leer en voz alta. Tu navegador podría no soportarlo o haber un problema.');
      };

      // Inicia la lectura del texto.
      window.speechSynthesis.speak(this.synth);
    } else {
      // Alerta al usuario si el navegador no soporta la API Web Speech.
      alert('Tu navegador no soporta la función de lectura en voz alta.');
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
  }
}
