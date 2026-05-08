export const normalizePhone = (value: string) => {
  return value.replace(/\D/g, "");
};

export const isPhoneValid = (value: string) => {
  return normalizePhone(value).length >= 8;
};
