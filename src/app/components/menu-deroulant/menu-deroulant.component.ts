import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
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
export class MenuDeroulantComponent implements OnInit {

  @ViewChildren('botonCategorias, botonSubCategorias, botonPregResp, respTexto') private excludeButtons!: QueryList<ElementRef>;


  todasLasCategorias: categoriasMod[] = categorias;
  todosLosDetallesDeSubCategorias: subCatMod[] = subCategoriasDetalles;
  todasLasPreguntasRespuestas: pregRespMod[] = preguntasRespuestas;

  botonActivo: string | null = null;
  categoriaPrincipalActiva: string | null = null;

  // Almacenará las subcategorías detalladas a mostrar en la segunda columna
  subCategoriasAMostrar: subCatMod[] = [];

  // Mantiene un registro del botón de subcategoría activo (para su propio click)
  subCategoriaActiva: string | null = null; // Almacenará el `codigo` de la subcategoría activa

  preguntasAMostrar: pregRespMod[] = []; // Contendrá las preguntas/respuestas filtradas
  preguntaActiva: string | null = null; // Almacenará la `pregunta` activa (o quizás su `codigo` si fuera único)
  respuestaSeleccionada: string | null = null; // Para mostrar la respuesta de la pregunta activa
  interfazActiva: boolean = false;

  ngOnInit(): void { }

  @HostListener('document:click', ['$event'])
  onClickDoc(event: MouseEvent): void {
    if (this.categoriaPrincipalActiva != null) {
      const clickedElement = event.target as HTMLElement;
      // Comprueba si el clic NO está dentro del botón
      let isClickInsideExcludedButton = false;

      this.excludeButtons.forEach(buttonRef => {
        if (buttonRef.nativeElement.contains(clickedElement)) {
          isClickInsideExcludedButton = true;
          return;
        }
      });

      if (!isClickInsideExcludedButton) {
        this.onClickCategoriaPrincipal(this.categoriaPrincipalActiva); //reset interfaz
      }
    }

  }

  onClickCategoriaPrincipal(nombreCategoria: string): void {
    var categoriaSeleccionada: any;
    if (this.categoriaPrincipalActiva === nombreCategoria) {
      // Si se hizo click en la misma categoría activa, la desactiva y oculta todo lo siguiente
      this.categoriaPrincipalActiva = null;
      this.subCategoriasAMostrar = [];
      this.subCategoriaActiva = null;
      this.preguntasAMostrar = []; // Limpia las preguntas
      this.preguntaActiva = null; // Limpia la pregunta activa
      this.respuestaSeleccionada = null; // Limpia la respuesta
      this.interfazActiva = false;
    } else {
      // Activa la nueva categoría principal
      this.categoriaPrincipalActiva = nombreCategoria;

      this.subCategoriaActiva = null; // Reinicia la subcategoría activa
      this.preguntasAMostrar = []; // Limpia las preguntas anteriores
      this.preguntaActiva = null; // Limpia la pregunta activa
      this.respuestaSeleccionada = null; // Limpia la respuesta

      categoriaSeleccionada = this.todasLasCategorias.find(cat => cat.nombre === nombreCategoria);
      if (categoriaSeleccionada) {
        this.subCategoriasAMostrar = this.todosLosDetallesDeSubCategorias.filter(subCat =>
          categoriaSeleccionada.subCategorias.includes(subCat.codigo)
        );
      } else {
        this.subCategoriasAMostrar = [];
      }
    }
    console.log('Categoría principal activa:', this.categoriaPrincipalActiva);
    console.log('Subcategorías a mostrar:', this.subCategoriasAMostrar);
  }

  /**
   * Maneja el click en un botón de subcategoría.
   * Al hacer click, activa/desactiva la subcategoría y prepara las preguntas/respuestas relacionadas.
   * También reinicia la selección de pregunta.
   * @param codigoSubCategoria El código de la subcategoría clickeada.
   */
  onClickSubCategoria(codigoSubCategoria: string): void {
    if (this.subCategoriaActiva === codigoSubCategoria) {
      // Si se hizo click en la misma subcategoría activa, la desactiva y oculta las preguntas
      this.subCategoriaActiva = null;
      this.preguntasAMostrar = [];
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
    } else {
      // Activa la nueva subcategoría
      this.subCategoriaActiva = codigoSubCategoria;
      this.preguntaActiva = null; // Reinicia la pregunta activa
      this.respuestaSeleccionada = null; // Reinicia la respuesta

      // Filtra las preguntas/respuestas basándose en el código de la subcategoría activa
      this.preguntasAMostrar = this.todasLasPreguntasRespuestas.filter(pr =>
        pr.codigo === codigoSubCategoria
      );
    }
    console.log('Subcategoría activa actual:', this.subCategoriaActiva);
    console.log('Preguntas a mostrar:', this.preguntasAMostrar.map(p => p.pregunta));
  }
  /**
   * Maneja el click en un botón de pregunta.
   * Al hacer click, activa/desactiva la pregunta y muestra/oculta su respuesta.
   * @param pregunta El texto completo de la pregunta clickeada.
   */
  onClickPregunta(pregunta: string): void {
    if (this.preguntaActiva === pregunta) {
      // Si se hizo click en la misma pregunta activa, la desactiva
      this.preguntaActiva = null;
      this.respuestaSeleccionada = null;
    } else {
      // Activa la nueva pregunta
      this.preguntaActiva = pregunta;
      // Encuentra la respuesta correspondiente y la asigna
      const pregResp = this.preguntasAMostrar.find(pr => pr.pregunta === pregunta);
      this.respuestaSeleccionada = pregResp ? pregResp.respuesta : null;
    }
    console.log('Pregunta activa actual:', this.preguntaActiva);
    console.log('Respuesta seleccionada:', this.respuestaSeleccionada);
  }
  /**
   * Verifica si un botón de categoría principal debe tener la clase 'activo'.
   * @param nombreCategoria El nombre de la categoría a verificar.
   * @returns true si la categoría principal está activa, false en caso contrario.
   */
  esCategoriaPrincipalActiva(nombreCategoria: string): boolean {
    return this.categoriaPrincipalActiva === nombreCategoria;
  }

  /**
   * Verifica si un botón de subcategoría debe tener la clase 'activo'.
   * @param codigoSubCategoria El código de la subcategoría a verificar.
   * @returns true si la subcategoría está activa, false en caso contrario.
   */
  esSubCategoriaActiva(codigoSubCategoria: string): boolean {
    return this.subCategoriaActiva === codigoSubCategoria;
  }
  /**
   * Verifica si un botón de pregunta debe tener la clase 'activo'.
   * @param pregunta El texto de la pregunta a verificar.
   * @returns true si la pregunta está activa, false en caso contrario.
   */
  esPreguntaActiva(pregunta: string): boolean {
    return this.preguntaActiva === pregunta;
  }
}
