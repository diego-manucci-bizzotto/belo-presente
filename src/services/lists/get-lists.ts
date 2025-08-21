
type Lists = {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
}[];

export const getLists = async (): Promise<Lists> => {
  const response = await fetch('/api/lists', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json()
    console.log(errorData);
    // toast.error(errorData.error || "Erro ao buscar listas");
    // throw new Error(errorData.error || "Erro ao buscar listas");
  }

  return await response.json();
}
