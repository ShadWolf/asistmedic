import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitCounterService {
  private apiUrl = '/api/increment-visit'; // La ruta a tu Vercel Function

  constructor(private http: HttpClient) { }

  incrementVisit(): Observable<any> {
    return this.http.post(this.apiUrl, {})
      .pipe(
        tap(() => console.log('Contador de visitas incrementado')),
        catchError(error => {
          console.error('Error al incrementar el contador:', error);
          return of(null); // Manejo de errores
        })
      );
  }

  getVisitCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error al obtener el contador:', error);
          return of({ count: 0 }); // Retorna 0 si hay un error
        })
      );
  }
}
