
export type ResetPasswordRequest = {
  token: string,
  newPassword: string
}

type ResetPasswordResponse = {
  ok: boolean
}

export const resetPassword = async ({token, newPassword}: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({token, newPassword})
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}