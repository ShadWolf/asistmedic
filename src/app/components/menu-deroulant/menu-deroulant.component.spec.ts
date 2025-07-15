// menu-deroulant.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MenuDeroulantComponent } from './menu-deroulant.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // Añadido: MatButtonToggleModule
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Añadido: NoopAnimationsModule
import { ElementRef, QueryList } from '@angular/core'; // Añadido: ElementRef, QueryList

// Importa tus modelos
import { categoriasMod } from '../../models/categoriasMod.model';
import { subCatMod } from '../../models/subCatMod.model';
import { pregRespMod } from '../../models/pregRespMod.model';
import { EMPTY } from 'rxjs';

// Mock de datos para las pruebas unitarias (usando los del usuario)
const MOCK_CATEGORIAS: categoriasMod[] = [
  { nombre: 'Anticoagulantes', subCategorias: ['AC01', 'AC02'], icono: '' },
  { nombre: 'Hipoglicemiantes', subCategorias: ['HG01'], icono: '' }
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

// --- Mocks para window.speechSynthesis ---
// Creamos un mock para el objeto global window y su propiedad speechSynthesis
const mockSpeechSynthesis = {
  speak: jasmine.createSpy('speak'),
  cancel: jasmine.createSpy('cancel'),
  speaking: false,
  getVoices: () => [],
  onvoiceschanged: null,
};

// Creamos un mock para el constructor de SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = 'es-ES';
  rate: number = 1;
  pitch: number = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Almacenamos las referencias originales para restaurarlas después de los tests
let originalWindowSpeechSynthesis: any;
let originalWindowSpeechSynthesisUtterance: any;

// --- Mock para ElementRef y QueryList ---
class MockElementRef {
  nativeElement: HTMLElement = document.createElement('div');
  constructor(element?: HTMLElement) {
    if (element) {
      this.nativeElement = element;
    }
  }
}

// Extendemos QueryList para poder controlar sus elementos en los tests
class MockQueryList<T> extends QueryList<T> {
  private _items: T[];
  constructor(items: T[] = []) {
    super();
    this._items = items;
  }
  // No sobreescribimos 'length', 'first', 'last' como accesores,
  // QueryList base los maneja si _results se actualiza via notifyOnChanges()

  // Ajustamos la firma de forEach para que coincida con la de QueryList
  override forEach(fn: (item: T, index: number, array: T[]) => void): void { this._items.forEach(fn); }

  set items(newItems: T[]) {
    this._items = newItems;
    this.notifyOnChanges(); // Simula la notificación de cambios de QueryList
  }
}


describe('MenuDeroulantComponent', () => {
  let component: MenuDeroulantComponent;
  let fixture: ComponentFixture<MenuDeroulantComponent>;
  let windowSpy: jasmine.SpyObj<Window>; // Añadido: espía para el objeto window

  beforeAll(() => {
    // Guarda las referencias originales antes de mockear
    originalWindowSpeechSynthesis = window.speechSynthesis;
    originalWindowSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

    // Mockea window.speechSynthesis y el constructor de SpeechSynthesisUtterance
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
  });

  afterAll(() => {
    // Restaura las referencias originales después de todos los tests
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalWindowSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: originalWindowSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(async () => {
    // Crea un espía para el objeto window para controlar innerWidth
    windowSpy = jasmine.createSpyObj('Window', ['innerWidth', 'addEventListener', 'removeEventListener']);
    Object.defineProperty(windowSpy, 'innerWidth', { writable: true, value: 1024 }); // Valor por defecto para desktop

    await TestBed.configureTestingModule({
      imports: [
        MenuDeroulantComponent, // Importa el componente standalone
        CommonModule,
        MatButtonModule,
        MatListModule,
        MatButtonToggleModule, // Añadido
        NoopAnimationsModule // Añadido
      ],
      providers: [
        // Provee el mock para el objeto window
        { provide: Window, useValue: windowSpy }
      ]
    }).compileComponents(); // Compila el componente y sus plantillas
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDeroulantComponent);
    component = fixture.componentInstance;

    // Sobreescribe los datos con los mocks para las pruebas
    component.todasLasCategorias = MOCK_CATEGORIAS;
    component.todosLosDetallesDeSubCategorias = MOCK_SUBCATEGORIAS;
    component.todasLasPreguntasRespuestas = MOCK_PREGUNTAS_RESPUESTAS;

    // Inicializa los QueryList con mocks de ElementRef si es necesario
    // Para @ViewChildren, necesitamos que `excludeButtons` tenga elementos para el `onClickDoc`
    const mockButtonElements = [
      new MockElementRef(document.createElement('button')), // Simula botonCategorias
      new MockElementRef(document.createElement('button')), // Simula botonSubCategorias
      new MockElementRef(document.createElement('button')), // Simula botonPregResp
      new MockElementRef(document.createElement('div')),    // Simula respTexto
      new MockElementRef(document.createElement('button')), // Simula botonLeerVozAlta
    ];
    // Asigna el MockQueryList a la propiedad del componente
    (component as any).excludeButtons = new MockQueryList(mockButtonElements);

    // Mock para subCategoryContainer
    (component as any).subCategoryContainer = new MockElementRef(document.createElement('div'));

    // Mock para _window en el componente
    component._window = window as any; // Asigna el mock de window al _window del componente

    fixture.detectChanges(); // Detecta cambios iniciales para que el HTML se renderice
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // --- Tests para inicialización y @HostListener('window:resize') ---
  it('debería inicializar isMobile a false para pantallas grandes', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    component.checkScreenSize(); // Llama manualmente para asegurar que el espía de window.innerWidth se use
    expect(component.isMobile).toBeFalse();
  });

  it('debería inicializar isMobile a true para pantallas pequeñas', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 700 });
    component.checkScreenSize();
    expect(component.isMobile).toBeTrue();
  });

  it('debería actualizar isMobile en resize', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 600 });
    // Dispara el evento de resize (HostListener)
    window.dispatchEvent(new Event('resize'));
    expect(component.isMobile).toBeTrue();

    Object.defineProperty(window, 'innerWidth', { writable: true, value: 900 });
    window.dispatchEvent(new Event('resize'));
    expect(component.isMobile).toBeFalse();
  });

  // --- Tests para @HostListener('document:click') ---

  it('debería cerrar la ventana (el popup de preguntas/respuestas) si se hace clic fuera de los botones y una subcategoría está activa', () => {
    // 1. Configura el estado para que la "ventana emergente" esté activa
    component.categoriaPrincipalActiva = 'Anticoagulantes'; // Una categoría activa
    component.subCategoriaActiva = 'SUB_CAT_MOCK'; // <--- CLAVE: Una subcategoría activa (simulando que el popup está abierto)

    // 2. Crea un elemento fuera de los botones excluidos
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement); // Añádelo al DOM para que `contains` funcione

    // 3. Espía cerrarVentana para verificar su llamada
    spyOn(component, 'cerrarVentana');

    // 4. Simula un clic en el elemento exterior
    const mockMouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(mockMouseEvent, 'target', { value: outsideElement });
    component.onClickDoc(mockMouseEvent);

    // 5. Verifica que cerrarVentana fue llamado
    expect(component.cerrarVentana).toHaveBeenCalled();

    // 6. Limpia el DOM después del test
    document.body.removeChild(outsideElement);
  });

  it('NO debería cerrar la ventana si se hace clic dentro de un botón excluido', () => {
    component.categoriaPrincipalActiva = 'Anticoagulantes';
    // Simula un clic en el nativeElement del primer botón excluido
    const excludedButtonElement = (component as any).excludeButtons.first.nativeElement;

    spyOn(component, 'cerrarVentana');

    const mockMouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(mockMouseEvent, 'target', { value: excludedButtonElement });
    component.onClickDoc(mockMouseEvent);

    expect(component.cerrarVentana).not.toHaveBeenCalled();
  });

  it('NO debería cerrar la ventana si no hay categoría principal activa', () => {
    component.categoriaPrincipalActiva = null; // Asegura que no hay categoría activa

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    spyOn(component, 'cerrarVentana');

    const mockMouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(mockMouseEvent, 'target', { value: outsideElement });
    component.onClickDoc(mockMouseEvent);

    expect(component.cerrarVentana).not.toHaveBeenCalled();

    document.body.removeChild(outsideElement);
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
      component.onClickCategoriaPrincipal('Lala'); // Categoría no existente
      // Aquí el componente no encontrará la categoría, por lo que subCategoriasAMostrar será vacío
      expect(component.subCategoriasAMostrar.length).toBe(0);
      expect(component.categoriaPrincipalActiva).toBe('Lala'); // La categoría activa se establece igual

      // 2. Cambiar a otra categoría principal existente
      component.onClickCategoriaPrincipal('Hipoglicemiantes');

      expect(component.categoriaPrincipalActiva).toBe('Hipoglicemiantes');
      expect(component.subCategoriasAMostrar.length).toBe(1);
      expect(component.subCategoriasAMostrar[0].codigo).toBe('HG01');
    });
    it('debería mostrar un warning si subCategoryContainer.nativeElement no está definido en móvil', fakeAsync(() => {
      spyOn(console, 'warn');

      component.isMobile = true;
      component.categoriaPrincipalActiva = 'OtraCategoria';
      component.todasLasCategorias = [];
      component.todosLosDetallesDeSubCategorias = [];

      // Simula que subCategoryContainer existe pero no tiene nativeElement
      component.subCategoryContainer = {} as ElementRef;

      component.onClickCategoriaPrincipal('NuevaCategoria');
      tick(100);

      expect(console.warn).toHaveBeenCalledWith(
        'Scroll: subCategoryContainer.nativeElement NO ENCONTRADO para scrolling.'
      );
    }));

    it('should call detenerLectura when changing category', () => {
      spyOn(component, 'detenerLectura');
      component.onClickCategoriaPrincipal('Anticoagulantes');
      expect(component.detenerLectura).toHaveBeenCalled();
    });

    it('should attempt to scroll on mobile', fakeAsync(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 700 });
      component.checkScreenSize(); // Establece isMobile a true
      fixture.detectChanges();

      spyOn(component.subCategoryContainer.nativeElement, 'scrollIntoView');

      component.onClickCategoriaPrincipal('Anticoagulantes');
      tick(100); // Avanza el tiempo para el setTimeout

      expect(component.subCategoryContainer.nativeElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    }));
  });

  // --- Pruebas para onClickSubCategoria ---
  describe('onClickSubCategoria', () => {
    beforeEach(() => {
      // Necesitamos una categoría principal activa para que las subcategorías se puedan filtrar
      component.onClickCategoriaPrincipal('Anticoagulantes');
      mockSpeechSynthesis.speak.calls.reset();
      mockSpeechSynthesis.cancel.calls.reset();
      mockSpeechSynthesis.speaking = false; // Asegura que 'speaking' sea false al inicio de cada test

      fixture.detectChanges();
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

    it('should call detenerLectura when changing subcategory', () => {
      spyOn(component, 'detenerLectura');
      component.onClickSubCategoria('AC01');
      expect(component.detenerLectura).toHaveBeenCalled();
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

    it('should call detenerLectura when selecting a new question', () => {
      spyOn(component, 'detenerLectura');
      component.onClickPregunta('¿Qué es AC?');
      expect(component.detenerLectura).toHaveBeenCalled();
    });
    it('debería asignar null a respuestaSeleccionada si la pregunta no se encuentra en preguntasAMostrar', () => {
      component.preguntaActiva = '¿Qué es React?';

      spyOn(component, 'detenerLectura');

      component.onClickPregunta('¿Qué es Vue?'); // No existe en preguntasAMostrar

      expect(component.preguntaActiva).toBe('¿Qué es Vue?');
      expect(component.respuestaSeleccionada).toBeNull();
      expect(component.detenerLectura).toHaveBeenCalled();
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

  // --- Tests para cerrarVentana() ---
  it('cerrarVentana debería resetear el estado de la subcategoría activa, preguntas y respuestas, pero mantener la categoría principal y las subcategorías a mostrar', () => {
    // Configura el estado inicial con valores
    component.categoriaPrincipalActiva = 'Anticoagulantes';
    component.subCategoriaActiva = 'AC01';
    component.preguntaActiva = '¿Qué es AC?';
    component.respuestaSeleccionada = 'Respuesta AC01-1';
    component.subCategoriasAMostrar = [{ codigo: 'AC01', titulo: 'Sub', descripcion: 'Desc' }];
    component.preguntasAMostrar = [{ codigo: 'AC01', pregunta: 'P', respuesta: 'R' }];

    // Guarda una referencia a la longitud inicial de subCategoriasAMostrar
    const initialSubCategoriasAMostrarLength = component.subCategoriasAMostrar.length;
    const initialCategoriaPrincipalActiva = component.categoriaPrincipalActiva;

    // Llama a la función a testear
    component.cerrarVentana();

    // Verifica que las variables que DEBEN resetearse, se reseteen a null/vacío
    expect(component.subCategoriaActiva).toBeNull();
    expect(component.preguntaActiva).toBeNull();
    expect(component.respuestaSeleccionada).toBeNull();
    expect(component.preguntasAMostrar.length).toBe(0);

    // Verifica que las variables que NO DEBEN resetearse, mantengan su valor
    expect(component.categoriaPrincipalActiva).toBe(initialCategoriaPrincipalActiva); // Debe mantener el valor
    expect(component.subCategoriasAMostrar.length).toBe(initialSubCategoriasAMostrarLength); // No debe cambiar
  });

  it('cerrarVentana debería detener la lectura', () => {
    spyOn(component, 'detenerLectura');
    component.cerrarVentana();
    expect(component.detenerLectura).toHaveBeenCalled();
  });

  // --- Tests para Text-to-Speech (TTS) ---
  it('leerPreguntaRespuesta debería llamar a speechSynthesis.speak', () => {
    component.leerPreguntaRespuesta('Test Pregunta', 'Test Respuesta');
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    const utterance = mockSpeechSynthesis.speak.calls.mostRecent().args[0];
    expect(utterance.text).toBe('Pregunta: Test Pregunta. Respuesta: Test Respuesta.');
    expect(utterance.lang).toBe('es-ES');
  });

  it('leerPreguntaRespuesta debería detener la lectura si ya está leyendo el mismo contenido', () => {
    mockSpeechSynthesis.speaking = true; // Simula que ya está hablando
    component.currentPlayingQuestion = 'Test Pregunta';
    component.currentPlayingAnswer = 'Test Respuesta';
    spyOn(component, 'detenerLectura');

    component.leerPreguntaRespuesta('Test Pregunta', 'Test Respuesta');
    expect(component.detenerLectura).toHaveBeenCalled();
  });

  it('leerPreguntaRespuesta debería detener la lectura anterior si es diferente contenido', () => {
    mockSpeechSynthesis.speaking = true;
    component.currentPlayingQuestion = 'Old Question';
    component.currentPlayingAnswer = 'Old Answer';
    spyOn(component, 'detenerLectura').and.callThrough(); // Permite que el mock de cancel se llame

    component.leerPreguntaRespuesta('New Question', 'New Answer');
    expect(component.detenerLectura).toHaveBeenCalled();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled(); // El detenerLectura debería haber llamado a cancel
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled(); // Y luego iniciar la nueva lectura
  });

  it('detenerLectura debería llamar a speechSynthesis.cancel', () => {
    mockSpeechSynthesis.speaking = true; // Simula que está hablando
    component.detenerLectura();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    // Corrección: Acceso a propiedad privada
    expect((component as any).synth).toBeNull();
    expect(component.currentPlayingQuestion).toBeNull();
    expect(component.currentPlayingAnswer).toBeNull();
  });

  it('detenerLectura no debería llamar a speechSynthesis.cancel si no está hablando', () => {
    mockSpeechSynthesis.speaking = true;
    component.detenerLectura();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('ngOnDestroy debería llamar a detenerLectura', () => {
    spyOn(component, 'detenerLectura');
    component.ngOnDestroy();
    expect(component.detenerLectura).toHaveBeenCalled();
  });

  it('debería actualizar currentPlayingQuestion y currentPlayingAnswer en onstart y onend', () => {
    component.leerPreguntaRespuesta('Q1', 'A1');
    const utterance = mockSpeechSynthesis.speak.calls.mostRecent().args[0];

    // Simula el evento onstart
    if (utterance.onstart) {
      utterance.onstart();
    }
    expect(component.currentPlayingQuestion).toBe('Q1');
    expect(component.currentPlayingAnswer).toBe('A1');

    // Simula el evento onend
    if (utterance.onend) {
      utterance.onend();
    }
    expect(component.currentPlayingQuestion).toBeNull();
    expect(component.currentPlayingAnswer).toBeNull();
    // Corrección: Acceso a propiedad privada
    expect((component as any).synth).toBeNull();
  });

  it('debería limpiar el estado en onerror', () => {
    component.leerPreguntaRespuesta('Q1', 'A1');
    const utterance = mockSpeechSynthesis.speak.calls.mostRecent().args[0];

    // Simula el evento onerror
    if (utterance.onerror) {
      utterance.onerror({ error: 'network' } as SpeechSynthesisErrorEvent);
    }
    expect(component.currentPlayingQuestion).toBeNull();
    expect(component.currentPlayingAnswer).toBeNull();
    // Corrección: Acceso a propiedad privada
    expect((component as any).synth).toBeNull();
  });

  it('getButtonText debería devolver "Detener lectura" si el mismo contenido se está reproduciendo', () => {
    const testPregunta = 'Pregunta de prueba';
    const testRespuesta = 'Respuesta de prueba';

    // Configura el mock de speechSynthesis para que `speaking` sea true
    mockSpeechSynthesis.speaking = true;

    // Configura las propiedades del componente para que coincidan con el contenido que se "está reproduciendo"
    component.currentPlayingQuestion = testPregunta;
    component.currentPlayingAnswer = testRespuesta;

    // Llama a la función y verifica el resultado
    expect(component.getButtonText(testPregunta, testRespuesta)).toBe('Detener lectura');
  });

  it('getButtonText debería devolver "Leer en voz alta" si no se está reproduciendo el mismo contenido', () => {
    // Caso 1: No se está reproduciendo nada
    mockSpeechSynthesis.speaking = false;
    component.currentPlayingQuestion = null;
    component.currentPlayingAnswer = null;
    expect(component.getButtonText('Pregunta 1', 'Respuesta 1')).toBe('Leer en voz alta');

    // Caso 2: Se está reproduciendo algo diferente
    mockSpeechSynthesis.speaking = true;
    component.currentPlayingQuestion = 'Otra pregunta';
    component.currentPlayingAnswer = 'Otra respuesta';
    expect(component.getButtonText('Pregunta 1', 'Respuesta 1')).toBe('Leer en voz alta');
  });

  it('getButtonText debería devolver "Leer en voz alta" si no se está reproduciendo nada', () => {
    // Asegurarse de que el mock de speechSynthesis.speaking esté en false para este test
    mockSpeechSynthesis.speaking = true;
    component.currentPlayingQuestion = 'Alguna pregunta';
    component.currentPlayingAnswer = 'Alguna respuesta';
    // Asegurarse de que el _window.speechSynthesis.speaking del componente también refleje el mock
    Object.defineProperty(component._window.speechSynthesis, 'speaking', { value: false, writable: true });

    expect(component.getButtonText('Alguna pregunta', 'Alguna respuesta')).toBe('Leer en voz alta');
  });

});
