import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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
  imports: [MatListModule, MatButtonModule, CommonModule, MatButtonToggleModule],
  templateUrl: './menu-deroulant.component.html',
  styleUrl: './menu-deroulant.component.css'
})
export class MenuDeroulantComponent implements OnInit, OnDestroy {
  @ViewChildren('botonCategorias, botonSubCategorias, botonPregResp, respTexto, botonLeerVozAlta') private excludeButtons!: QueryList<ElementRef>;
  @ViewChild('subCategoryContainer') subCategoryContainer!: ElementRef;

  isMobile: boolean = false;

  todasLasCategorias: categoriasMod[] = categorias;
  todosLosDetallesDeSubCategorias: subCatMod[] = subCategoriasDetalles;
  todasLasPreguntasRespuestas: pregRespMod[] = preguntasRespuestas;

  categoriaPrincipalActiva: string | null = null;
  subCategoriasAMostrar: subCatMod[] = [];
  subCategoriaActiva: string | null = null; // Este es el que controla la visibilidad de la "ventana emergente"
  preguntasAMostrar: pregRespMod[] = [];
  preguntaActiva: string | null = null;
  respuestaSeleccionada: string | null = null;

  private synth: SpeechSynthesisUtterance | null = null;
  currentPlayingQuestion: string | null = null;
  currentPlayingAnswer: string | null = null;
  _window: Window = window;

  constructor() {
    this.checkScreenSize();
    console.log('Constructor: isMobile inicializado a', this.isMobile);
  }

  ngOnInit(): void {
    // ngOnInit se ejecuta después del constructor. Útil para lógica de inicialización adicional.
  }

  ngOnDestroy(): void {
    this.detenerLectura();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    console.log('Window resized: isMobile actualizado a', this.isMobile);
  }

  @HostListener('document:click', ['$event'])
  onClickDoc(event: MouseEvent): void {
    if (this.categoriaPrincipalActiva != null) {
      const clickedElement = event.target as HTMLElement;
      let isClickInsideExcludedButton = false;

      this.excludeButtons.forEach(buttonRef => {
        if (buttonRef.nativeElement.contains(clickedElement)) {
          isClickInsideExcludedButton = true;
          return;
        }
      });
      if (!isClickInsideExcludedButton && this.subCategoriaActiva !== null) {
        this.cerrarVentana(); // Usa la función de cierre limpia
      }
    }
  }

  onClickCategoriaPrincipal(nombreCategoria: string): void {
    let categoriaSeleccionada: any;
    if (this.categoriaPrincipalActiva === nombreCategoria) {
      // Si se hizo click en la misma categoría activa, la desactiva (cierra toda la interfaz)
      this.cerrarTodaLaInterfaz(); // Nueva función para cerrar todo
    } else {
      this.categoriaPrincipalActiva = nombreCategoria;
      this.subCategoriaActiva = null; // Importante: resetear solo la subcategoría activa
      this.preguntasAMostrar = [];
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
      this.detenerLectura();

      categoriaSeleccionada = this.todasLasCategorias.find(cat => cat.nombre === nombreCategoria);
      if (categoriaSeleccionada) {
        this.subCategoriasAMostrar = this.todosLosDetallesDeSubCategorias.filter(subCat =>
          categoriaSeleccionada.subCategorias.includes(subCat.codigo)
        );
      } else {
        this.subCategoriasAMostrar = [];
      }

      if (this.isMobile) {
        setTimeout(() => {
          if (this.subCategoryContainer && this.subCategoryContainer.nativeElement) {
            this.subCategoryContainer.nativeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            console.warn('Scroll: subCategoryContainer.nativeElement NO ENCONTRADO para scrolling.');
          }
        }, 100);
      }
    }
  }

  onClickSubCategoria(codigoSubCategoria: string): void {
    if (this.subCategoriaActiva === codigoSubCategoria) {
      // Si se hizo click en la misma subcategoría activa, la desactiva (cierra la "ventana emergente")
      this.subCategoriaActiva = null;
      this.preguntasAMostrar = [];
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
      this.detenerLectura();
    } else {
      this.subCategoriaActiva = codigoSubCategoria;
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
      this.detenerLectura();

      this.preguntasAMostrar = this.todasLasPreguntasRespuestas.filter(pr =>
        pr.codigo === codigoSubCategoria
      );
    }
  }

  onClickPregunta(pregunta: string): void {
    if (this.preguntaActiva === pregunta) {
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
    } else {
      this.preguntaActiva = pregunta;
      const pregResp = this.preguntasAMostrar.find(pr => pr.pregunta === pregunta);
      this.respuestaSeleccionada = pregResp ? pregResp.respuesta : null;
      this.detenerLectura();
    }
  }

  esCategoriaPrincipalActiva(nombreCategoria: string): boolean {
    return this.categoriaPrincipalActiva === nombreCategoria;
  }

  esSubCategoriaActiva(codigoSubCategoria: string): boolean {
    return this.subCategoriaActiva === codigoSubCategoria;
  }

  esPreguntaActiva(pregunta: string): boolean {
    return this.preguntaActiva === pregunta;
  }

  // --- Función para cerrar solo la "ventana emergente" (preguntas/respuestas) ---
  cerrarVentana(): void {
    this.subCategoriaActiva = null;
    this.respuestaSeleccionada = null;
    this.preguntaActiva = null;
    this.preguntasAMostrar = []; // Limpia las preguntas específicas de la ventana
    this.detenerLectura();
  }

  // --- Nueva función para cerrar TODA la interfaz (volver al estado inicial) ---
  cerrarTodaLaInterfaz(): void {
    this.categoriaPrincipalActiva = null;
    this.subCategoriaActiva = null;
    this.subCategoriasAMostrar = [];
    this.respuestaSeleccionada = null;
    this.preguntaActiva = null;
    this.preguntasAMostrar = [];
    this.detenerLectura();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  leerPreguntaRespuesta(pregunta: string, respuesta: string): void {
    const textoCompleto = `Pregunta: ${pregunta}. Respuesta: ${respuesta}.`;

    if (!!(window.speechSynthesis.speaking) &&
      this.currentPlayingQuestion === pregunta &&
      this.currentPlayingAnswer === respuesta) {
      this.detenerLectura();
      return;
    }

    this.detenerLectura();

    if ('speechSynthesis' in window) {
      this.synth = new SpeechSynthesisUtterance(textoCompleto);
      this.synth.lang = 'es-ES';
      this.synth.rate = 1;
      this.synth.pitch = 1;

      this.synth.onstart = () => {
        console.log('Comenzando a leer en voz alta...');
        this.currentPlayingQuestion = pregunta;
        this.currentPlayingAnswer = respuesta;
      };

      this.synth.onend = () => {
        console.log('Lectura finalizada.');
        this.synth = null;
        this.currentPlayingQuestion = null;
        this.currentPlayingAnswer = null;
      };

      this.synth.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error('Error en la síntesis de voz:', event.error);
        this.synth = null;
        this.currentPlayingQuestion = null;
        this.currentPlayingAnswer = null;
        console.error('Hubo un error al intentar leer en voz alta. Tu navegador podría no soportarlo o haber un problema.');
      };

      window.speechSynthesis.speak(this.synth);
    }
  }

  detenerLectura(): void {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    this.synth = null;
    this.currentPlayingQuestion = null;
    this.currentPlayingAnswer = null;
  }

  getButtonText(pregunta: string, respuesta: string): string {
    if (this._window.speechSynthesis.speaking &&
      this.currentPlayingQuestion === pregunta && // Corrección aquí: debe ser === para el mismo contenido
      this.currentPlayingAnswer === respuesta) { // Corrección aquí: debe ser === para el mismo contenido
      return 'Detener lectura';
    }
    return 'Leer en voz alta';
  }
}
