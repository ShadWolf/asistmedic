import { categoriasMod } from '../models/categoriasMod.model';

export const categorias: categoriasMod[] = [
  {
    nombre: 'Salud',
    subCategorias: ['SA'],
    icono: '⚕️'
  },
  {
    nombre: 'Prevención de caídas',
    subCategorias: ['PC01', 'PC02', 'PC03', 'PC04', 'PC05'],
    icono: '🚧   '
  },
  {
    nombre: 'Apoyo Social',
    subCategorias: ['SC01', 'SC02', 'SC03', 'SC04', 'SC05', 'SC06', 'SC07', 'SC08', 'SC09'],
    icono: '🤝  '
  },

];
