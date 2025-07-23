import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { VisitCounterService } from './visit-counter.service';

describe('VisitCounterService', () => {
  let service: VisitCounterService;
  let httpTestingController: HttpTestingController; // Para mockear las solicitudes HTTP

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa el módulo de testing HTTP
      providers: [VisitCounterService] // Provee el servicio que vamos a testear
    });

    // Inyecta el servicio y el controlador de testing HTTP
    service = TestBed.inject(VisitCounterService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Asegúrate de que no queden solicitudes pendientes al finalizar cada test
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('incrementVisit', () => {
    it('should send a POST request to increment the visit count', () => {
      const mockResponse = { message: 'Contador incrementado correctamente' };

      service.incrementVisit().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Espera una solicitud POST a '/api/increment-visit'
      const req = httpTestingController.expectOne('/api/increment-visit');
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({}); // Verifica que el cuerpo de la solicitud esté vacío

      // Responde a la solicitud mockeada
      req.flush(mockResponse);
    });

    it('should handle errors gracefully when incrementing visit', () => {
      const errorMessage = 'Error al incrementar el contador';

      service.incrementVisit().subscribe(response => {
        // En caso de error, el servicio retorna 'of(null)', por lo que esperamos null
        expect(response).toBeNull();
      });

      const req = httpTestingController.expectOne('/api/increment-visit');
      req.error(new ErrorEvent('Network error', { message: errorMessage })); // Simula un error de red
    });
  });

  describe('getVisitCount', () => {
    it('should send a GET request and return the current visit count', () => {
      const mockCount = { count: 123 };

      service.getVisitCount().subscribe(data => {
        expect(data).toEqual(mockCount);
      });

      // Espera una solicitud GET a '/api/increment-visit'
      const req = httpTestingController.expectOne('/api/increment-visit');
      expect(req.request.method).toEqual('GET');

      // Responde a la solicitud mockeada
      req.flush(mockCount);
    });

    it('should return 0 when an error occurs while getting visit count', () => {
      const errorMessage = 'Error al obtener el contador';

      service.getVisitCount().subscribe(data => {
        // En caso de error, el servicio retorna 'of({ count: 0 })'
        expect(data).toEqual({ count: 0 });
      });

      const req = httpTestingController.expectOne('/api/increment-visit');
      req.error(new ErrorEvent('Network error', { message: errorMessage })); // Simula un error
    });
  });
});
