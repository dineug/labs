export const pipe = (...operators) => initSource$ =>
  operators.reduce((source$, operator) => operator(source$), initSource$);
