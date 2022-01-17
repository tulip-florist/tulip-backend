export const inXMinutes = (x: number): Date => {
  const inXMin = new Date();
  inXMin.setMinutes(inXMin.getMinutes() + x);
  return inXMin;
};

export const inXMonths = (x: number): Date => {
  const inXMon = new Date();
  inXMon.setMonth(inXMon.getMonth() + x);
  return inXMon;
};
