import { ApiError } from '../services/api';

describe('ApiError', () => {
  it('cria erro com statusCode e mensagem', () => {
    const error = new ApiError(404, 'Não encontrado');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Não encontrado');
    expect(error.name).toBe('ApiError');
  });

  it('preserva raw data quando fornecido', () => {
    const raw = { details: 'campo inválido' };
    const error = new ApiError(400, 'Validação falhou', raw);
    expect(error.raw).toEqual(raw);
  });

  it('é instância de Error', () => {
    const error = new ApiError(500, 'Erro interno');
    expect(error).toBeInstanceOf(Error);
  });
});
