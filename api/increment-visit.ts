import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Asegúrate de que tu clave de servicio esté en una variable de entorno segura en Vercel
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'))
  : null;

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    try {
      const docRef = db.collection('metrics').doc('visits');

      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          transaction.set(docRef, { count: 1 });
        } else {
          const newCount = (doc.data()?.count || 0) + 1;
          transaction.update(docRef, { count: newCount });
        }
      });

      response.status(200).json({ message: 'Contador incrementado correctamente' });

    } catch (error) {
      console.error('Error al incrementar el contador:', error);
      response.status(500).json({ error: 'Error interno del servidor al incrementar el contador' });
    }
  } else if (request.method === 'GET') {
    try {
      const docRef = db.collection('metrics').doc('visits');
      const doc = await docRef.get();
      const count = doc.exists ? doc.data()?.count || 0 : 0;
      response.status(200).json({ count });
    } catch (error) {
      console.error('Error al obtener el contador:', error);
      response.status(500).json({ error: 'Error interno del servidor al obtener el contador' });
    }
  } else {
    response.status(405).json({ error: 'Método no permitido' });
  }
}
