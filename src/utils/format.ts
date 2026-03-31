export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'S/ DATA';
  const cleanDate = dateString.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return cleanDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};