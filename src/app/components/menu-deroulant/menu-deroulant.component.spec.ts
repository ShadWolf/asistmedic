import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuDeroulantComponent } from './menu-deroulant.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

// Importa tus modelos
import { categoriasMod } from '../../models/categoriasMod.model';
import { subCatMod } from '../../models/subCatMod.model';
import { pregRespMod } from '../../models/pregRespMod.model';

// Mock de datos para las pruebas unitarias
const MOCK_CATEGORIAS: categoriasMod[] = [
  { nombre: 'Anticoagulantes', subCategorias: ['AC01', 'AC02'] },
  { nombre: 'Hipoglicemiantes', subCategorias: ['HG01'] }
];

const MOCK_SUBCATEGORIAS: subCatMod[] = [
  { codigo: 'AC01', titulo: 'Conceptos Básicos', descripcion: 'Info básica AC' },
  { codigo: 'AC02', titulo: 'Tipos y usos', descripcion: 'Más info AC' },
  { codigo: 'HG01', titulo: 'Generalidades', descripcion: 'Info básica HG' }
];

const MOCK_PREGUNTAS_RESPUESTAS: pregRespMod[] = [
  { codigo: 'AC01', pregunta: '¿Qué es AC?', respuesta: 'Respuesta AC01-1' },
  { codigo: 'AC01', pregunta: '¿Para qué sirve AC?', respuesta: 'Respuesta AC01-2' },
  { codigo: 'AC02', pregunta: '¿Tipo de AC?', respuesta: 'Respuesta AC02-1' },
  { codigo: 'HG01', pregunta: '¿Qué es HG?', respuesta: 'Respuesta HG01-1' }
];

describe('MenuDeroulantComponent', () => {
  let component: MenuDeroulantComponent;
  let fixture: ComponentFixture<MenuDeroulantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuDeroulantComponent, // Importa el componente standalone
        CommonModule,
        MatButtonModule,
        MatListModule
      ]
    }).compileComponents(); // Compila el componente y sus plantillas

    fixture = TestBed.createComponent(MenuDeroulantComponent);
    component = fixture.componentInstance;

    // Sobreescribe los datos con los mocks para las pruebas
    component.todasLasCategorias = MOCK_CATEGORIAS;
    component.todosLosDetallesDeSubCategorias = MOCK_SUBCATEGORIAS;
    component.todasLasPreguntasRespuestas = MOCK_PREGUNTAS_RESPUESTAS;

    fixture.detectChanges(); // Detecta cambios iniciales para que el HTML se renderice
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Pruebas para onClickCategoriaPrincipal ---
  describe('onClickCategoriaPrincipal', () => {
    it('should set the active category and filter subcategories when a new category is clicked', () => {
      const categoriaNombre = 'Anticoagulantes';
      component.onClickCategoriaPrincipal(categoriaNombre);

      expect(component.categoriaPrincipalActiva).toBe(categoriaNombre);
      expect(component.subCategoriasAMostrar.length).toBe(2);
      expect(component.subCategoriasAMostrar[0].codigo).toBe('AC01');
      expect(component.subCategoriasAMostrar[1].codigo).toBe('AC02');
      expect(component.subCategoriaActiva).toBeNull();
      expect(component.preguntasAMostrar.length).toBe(0);
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });

    it('should deactivate the active category and clear related data if clicked again', () => {
      const categoriaNombre = 'Anticoagulantes';
      component.onClickCategoriaPrincipal(categoriaNombre); // Activa
      component.onClickCategoriaPrincipal(categoriaNombre); // Desactiva

      expect(component.categoriaPrincipalActiva).toBeNull();
      expect(component.subCategoriasAMostrar.length).toBe(0);
      expect(component.subCategoriaActiva).toBeNull();
      expect(component.preguntasAMostrar.length).toBe(0);
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });

    it('should clear all selections when switching to a different category', () => {
      // 1. Activar una categoría y subcategoría/pregunta
      component.onClickCategoriaPrincipal('Anticoagulantes');
      component.onClickSubCategoria('AC01');
      component.onClickPregunta('¿Qué es AC?');

      // 2. Cambiar a otra categoría principal
      component.onClickCategoriaPrincipal('Hipoglicemiantes');

      expect(component.categoriaPrincipalActiva).toBe('Hipoglicemiantes');
      expect(component.subCategoriasAMostrar.length).toBe(1); // Solo HG01
      expect(component.subCategoriasAMostrar[0].codigo).toBe('HG01');
      expect(component.subCategoriaActiva).toBeNull();
      expect(component.preguntasAMostrar.length).toBe(0);
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });
    it('should reset the active category if there is no match', () => {
      // 1. Activar una categoría y subcategoría/pregunta
      component.onClickCategoriaPrincipal('Lala');
      component.onClickSubCategoria('ZZ01');
      component.onClickPregunta('');

      // 2. Cambiar a otra categoría principal
      component.onClickCategoriaPrincipal('Hipoglicemiantes');

      expect(component.categoriaPrincipalActiva).toBe('Hipoglicemiantes');
      expect(component.subCategoriasAMostrar.length).toBe(1);
    });
  });

  // --- Pruebas para onClickSubCategoria ---
  describe('onClickSubCategoria', () => {
    beforeEach(() => {
      // Necesitamos una categoría principal activa para que las subcategorías se puedan filtrar
      component.onClickCategoriaPrincipal('Anticoagulantes');
    });

    it('should set the active subcategory and filter questions when a new subcategory is clicked', () => {
      const subCategoriaCodigo = 'AC01';
      component.onClickSubCategoria(subCategoriaCodigo);

      expect(component.subCategoriaActiva).toBe(subCategoriaCodigo);
      expect(component.preguntasAMostrar.length).toBe(2);
      expect(component.preguntasAMostrar[0].pregunta).toBe('¿Qué es AC?');
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });

    it('should deactivate the active subcategory and clear related data if clicked again', () => {
      const subCategoriaCodigo = 'AC01';
      component.onClickSubCategoria(subCategoriaCodigo); // Activa
      component.onClickSubCategoria(subCategoriaCodigo); // Desactiva

      expect(component.subCategoriaActiva).toBeNull();
      expect(component.preguntasAMostrar.length).toBe(0);
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });

    it('should clear question selection when switching to a different subcategory', () => {
      // 1. Activar una subcategoría y una pregunta
      component.onClickSubCategoria('AC01');
      component.onClickPregunta('¿Qué es AC?');

      // 2. Cambiar a otra subcategoría
      component.onClickSubCategoria('AC02');

      expect(component.subCategoriaActiva).toBe('AC02');
      expect(component.preguntasAMostrar.length).toBe(1); // Solo la pregunta de AC02
      expect(component.preguntasAMostrar[0].pregunta).toBe('¿Tipo de AC?');
      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });
  });

  // --- Pruebas para onClickPregunta ---
  describe('onClickPregunta', () => {
    beforeEach(() => {
      // Pre-condición: una subcategoría debe estar activa para tener preguntas a mostrar
      component.onClickCategoriaPrincipal('Anticoagulantes');
      component.onClickSubCategoria('AC01');
    });

    it('should set the active question and its response when a new question is clicked', () => {
      const preguntaTexto = '¿Qué es AC?';
      component.onClickPregunta(preguntaTexto);

      expect(component.preguntaActiva).toBe(preguntaTexto);
      expect(component.respuestaSeleccionada).toBe('Respuesta AC01-1');
    });

    it('should deactivate the active question and clear its response if clicked again', () => {
      const preguntaTexto = '¿Qué es AC?';
      component.onClickPregunta(preguntaTexto); // Activa
      component.onClickPregunta(preguntaTexto); // Desactiva

      expect(component.preguntaActiva).toBeNull();
      expect(component.respuestaSeleccionada).toBeNull();
    });
  });

  // --- Pruebas para las funciones de verificación de estado (esXActiva) ---
  describe('state verification functions', () => {
    it('esCategoriaPrincipalActiva should return true if category is active', () => {
      component.categoriaPrincipalActiva = 'Anticoagulantes';
      expect(component.esCategoriaPrincipalActiva('Anticoagulantes')).toBeTrue();
      expect(component.esCategoriaPrincipalActiva('Hipoglicemiantes')).toBeFalse();
    });

    it('esSubCategoriaActiva should return true if subcategory is active', () => {
      component.subCategoriaActiva = 'AC01';
      expect(component.esSubCategoriaActiva('AC01')).toBeTrue();
      expect(component.esSubCategoriaActiva('AC02')).toBeFalse();
    });

    it('esPreguntaActiva should return true if question is active', () => {
      component.preguntaActiva = '¿Qué es AC?';
      expect(component.esPreguntaActiva('¿Qué es AC?')).toBeTrue();
      expect(component.esPreguntaActiva('¿Para qué sirve AC?')).toBeFalse();
    });
  });
});
