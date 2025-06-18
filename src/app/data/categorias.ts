import { categoriasMod } from '../models/categoriasMod.model';

export const categorias: categoriasMod[] = [
  {
    nombre: 'Sonda Nasogástrica',
    subCategorias: ['SG01', 'SG02', 'SG03', 'SG04'],
    icono: '💉👃🥛'
  },
  {
    nombre: 'Hipoglicemiantes',
    subCategorias: ['HG01', 'HG02', 'HG03', 'HG04', 'HG05', 'HG06'],
    icono: '📉🍬'
  }, //end hipoglucemiantes
  {
    nombre: 'Anticoagulante',
    subCategorias: ['AC01', 'AC02', 'AC03', 'AC04', 'AC05', 'AC06', 'AC07'],
    icono: '🩸'
  }, //end anticoagulantes
  {
    nombre: 'Analgésia y dolor',
    subCategorias: ['AN01', 'AN02', 'AN03'],
    icono: '💊 '
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
