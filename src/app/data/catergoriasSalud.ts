import { categoriasMod } from '../models/categoriasMod.model';

export const categoriasSalud: categoriasMod[] = [
  {
    nombre: 'Sonda Nasogastrica',
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
    nombre: 'Aanalgesia y dolor',
    subCategorias: ['AN01', 'AN02', 'AN03'],
    icono: '💊 '
  }
]
