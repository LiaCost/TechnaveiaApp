export interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const fetchAddressByCep = async (cep: string): Promise<AddressData | null> => {
  const cleanCep = cep.replace(/\D/g, ''); // Remove pontos e traços
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    return data.erro ? null : data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};