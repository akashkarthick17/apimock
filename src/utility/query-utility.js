export const splitUserIdAndExp = (query) => {
  const arr = query.trim().split(' ');
  let userId;
  let expression;

  if (arr.length >= 2) {
    userId = arr.splice(0, 1)[0];
    expression = arr.join('');
  }

  return { userId, expression };
};

export const constructValidExpression = (expression, parameters) => {
  const operators = {
    AND: '&&',
    OR: '||',
    NOT: '!=',
  };

  for (const property in parameters) {
    expression = expression.replace(
      new RegExp(property, 'gi'),
      parameters[property]
    );
  }

  for (const property in operators) {
    expression = expression.replace(
      new RegExp(property, 'gi'),
      operators[property]
    );
  }

  // Replace single = with double =
  expression = expression.replace(/([^=><!&])=([^=><!&])/gi, ($i) => {
    return $i.replace('=', '==');
  });

  expression = expression.replace(/TRUE/g, true);

  return expression;
};
