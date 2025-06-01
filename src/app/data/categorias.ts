import { categoriasMod } from '../models/categoriasMod.model';

export const categorias: categoriasMod[] = [
  {
    nombre: 'Anticoagulante',
    subCategorias: ['AC01', 'AC02', 'AC03', 'AC04', 'AC05', 'AC06', 'AC07'],
    icono: '🩸'
  }, //end anticoagulantes
  {
    nombre: 'Hipoglicemiantes',
    subCategorias: ['HG01', 'HG02', 'HG03', 'HG04', 'HG05', 'HG06'],
    icono: '📉🍬'
  }, //end hipoglucemiantes
  {
    nombre: 'Prevencion de caidas',
    subCategorias: ['PC01', 'PC02', 'PC03', 'PC04', 'PC05'],
    icono: '🚧   '
  },
  {
    nombre: 'Social',
    subCategorias: ['SC01', 'SC02', 'SC03', 'SC04', 'SC05', 'SC06', 'SC07', 'SC08', 'SC09'],
    icono: '🤝  '
  }
];
