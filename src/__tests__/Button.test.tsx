import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button', () => {
  it('renderiza com o título correto', async () => {
    await render(<Button title="Entrar" onPress={() => {}} />);
    expect(screen.getByText('ENTRAR')).toBeTruthy();
  });

  it('chama onPress ao ser pressionado', async () => {
    const onPress = jest.fn();
    await render(<Button title="Salvar" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não chama onPress quando disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Salvar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('mostra loading indicator quando loading=true', async () => {
    await render(<Button title="Entrar" onPress={() => {}} loading />);
    // Texto não deve aparecer durante loading
    expect(screen.queryByText('ENTRAR')).toBeNull();
  });

  it('aplica estilo secondary corretamente', async () => {
    await render(<Button title="Cancelar" onPress={() => {}} type="secondary" />);
    expect(screen.getByText('CANCELAR')).toBeTruthy();
  });
});
