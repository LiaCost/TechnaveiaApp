import React from 'react';
import { StatusBar } from 'react-native';
// 1. Importa a nova tela que criamos baseada no PDF do professor
import PersistenciaLocalScreen from './src-api/screens/PersistenciaLocalScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="default" />
      {/* 2. Comentamos temporariamente a estrutura do grupo e chamamos a tela do PDF */}
      <PersistenciaLocalScreen />
    </>
  );
}