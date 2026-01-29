// Jokin komponentti, jossa testaat
import React, { useEffect } from 'react';
import { database } from '../services/config'; // Oikea polku firebase.ts-tiedostoon
import { ref, set } from 'firebase/database';

const RealtimeDbTestComponent = () => {
  useEffect(() => {
    const testWrite = async () => {
      try {
        await set(ref(database, 'test/hello'), 'world');
        console.log("Realtime Database testikirjoitus onnistui!");
      } catch (error) {
        console.error("Realtime Database testikirjoitus epäonnistui:", error);
      }
    };

    testWrite();
  }, []);

  return null; // Tai jokin yksinkertainen tekstikomponentti
};

export default function  DbTestComponent() {
    return <RealtimeDbTestComponent />;
};