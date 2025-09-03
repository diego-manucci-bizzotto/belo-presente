"use client";

export type SignUpRequest = {
  email: string,
  password: string
}

type SignUpResponse = {
  id: string,
  email: string
}

export const signUp = async ({email, password}: SignUpRequest): Promise<SignUpResponse> => {
  const response = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({email, password})
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}