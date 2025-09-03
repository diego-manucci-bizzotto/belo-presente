
export type ForgotPasswordRequest = {
  email: string;
}

type ForgotPasswordResponse = {
  ok: boolean
}

export const forgotPassword = async ({email}: ForgotPasswordRequest) : Promise<ForgotPasswordResponse> => {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({email})
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};