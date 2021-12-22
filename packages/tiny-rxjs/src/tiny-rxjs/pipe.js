export const pipe =
  (...operators) =>
  initSource$ =>
    operators.reduce((source$, operator) => operator(source$), initSource$);

const pipe2 =
  (...operators) =>
  initSource$ => {
    let source$ = initSource$;

    while (operators.length) {
      const operator = operators.shift();
      source$ = operator(source$);
    }

    return source$;
  };
