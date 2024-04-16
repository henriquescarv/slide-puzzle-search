const solutionBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const initialBoard = [7, 4, 2, 8, 1, 5, 6, 3, 0];

const showBoard = (board) => {
  console.log(`[${board[0]}, ${board[1]}, ${board[2]}]`);
  console.log(`[${board[3]}, ${board[4]}, ${board[5]}]`);
  console.log(`[${board[6]}, ${board[7]}, ${board[8]}]`);
}

const isFinalState = (board, solutionBoard) => JSON.stringify(solutionBoard) === JSON.stringify(board); // função para verificar se o board recebido é igual ao board solução

const moveToLeft = (board, position) => {
  const node = [...board];

  node[position] = board[position - 1];
  node[position - 1] = board[position];

  return node;
}

const moveToRight = (board, position) => {
  const node = [...board];

  node[position] = board[position + 1];
  node[position + 1] = board[position];

  return node;
}

const moveToTop = (board, position) => {
  const node = [...board];

  node[position] = board[position - 3];
  node[position - 3] = board[position];
  
  return node;
}

const moveToBottom = (board, position) => {
  const node = [...board];

  node[position] = board[position + 3];
  node[position + 3] = board[position];

  return node;
}

const searchNodes = (board) => {
  const nodes = [];

  const empty_position = board.findIndex(piece => piece === 0);

  if (!(empty_position % 3 === 0)) {
    nodes.push(moveToLeft(board, empty_position));
  }
  if (!([2, 5, 8].includes(empty_position))) {
    nodes.push(moveToRight(board, empty_position));
  }
  if (empty_position > 2) {
    nodes.push(moveToTop(board, empty_position));
  }
  if (empty_position < 6) {
    nodes.push(moveToBottom(board, empty_position));
  }

  return nodes;
}

// Busca por custo uniforme. O custo é o tamanho do caminho percorrido para chegar até o nodo. 
// Nodo inicial tem custo 0. Cada novo nodo acrescenta +1 no custo
const uniformCost = (board) => {
  let visited = [];
  let open = [{ 
    board: board,
    cost: 0,
    path: []
  }];

  const addOpenNode = ({ board, cost, parent }) => {
    const alreadyOpen = open.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de abertos
    const alreadyVisited = visited.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de visitados
    const hasLessCost = !!(alreadyOpen && cost < alreadyOpen.cost) || !!(alreadyVisited && cost < alreadyVisited.cost); // verifica se esse nodo tem menor custo do que o que já foi visitado

    const newNode = {
      board: board,
      cost: cost,
      path: [
        ...parent.path,
        parent.board,
      ],
    }

    if (!alreadyOpen && !alreadyVisited) { // se o nodo ainda não tiver sido visitado/aberto, add na lista
      open.push(newNode); // add o novo nodo na lista de abertos
      return;
    }

    if ((alreadyOpen || alreadyVisited) && hasLessCost) { // se o nodo já tiver sido visitado/aberto, e tiver menor custo, add na lista e remove o(s) antigo(s)
      open = open.filter(state => state !== alreadyOpen); // remove o que já foi aberto, pois tem maior custo
      visited = visited.filter(state => state !== alreadyVisited); // remove o que já foi visitado, pois tem maior custo

      open.push(newNode);
    }
  }

  let currentState = board;
  
  console.time('tempo-execucao');
  while (!isFinalState(currentState, solutionBoard)) {
    open = open.sort((a, b) => a.cost - b.cost); // ordena a lista a partir do 'cost', do MENOR pro MAIOR
    const current = open[0]; // pega o nodo com menor custo
    currentState = current.board;

    const newNodes = searchNodes(current.board); // procura novos nodos, a partir do 'current'
    newNodes.forEach((board, index) => addOpenNode({ board, cost: current.cost + (index + 1), parent: current }));
    open = open.filter(node => node !== current); // remove o 'current' da lista de nodos abertos
    visited.push(current); // adiciona o current na lista de nodos visitados
  }
  console.timeEnd('tempo-execucao');

  console.log(visited);
  console.log(open);
  console.log('Fim de jogo!');
};

//funções de cálculos de score para as heurísticas:
const calculateScoreByPosition = (board) => { // função para calcular o 'score' de cada nodo
  let score = 0;
  board.forEach((position, pIndex) => { 
    if (position !== 0 && position !== solutionBoard[pIndex]) {   // para cada posição errada
      score++;                                                    // o algoritmo adiciona +1 ao score
    }
  });

  return score;
};

const calculateManhatanScore = (board) => {  // função para calcular o 'score' de um tabuleiro a partir da distância de manhatan
  const distancesManhatan = { // distâncias de array traduzidas para distâncias de jogadas
    0: [ 0 ],
    1: [ 1, 3 ],
    2: [ 2, 4, 6 ],
    3: [ 5, 7 ],
    4: [ 8 ],
  };

  let score = 0;

  const getScoreByDistanceInMoves = (distanceInArray) => {
    if (distancesManhatan[0].includes(distanceInArray)) {   // se a distância entre uma peça e outra for 0 jogadas, quer dizer que ela já está no lugar, portanto
      return 0;                                            // recebe pontuação 0 (mínima = melhor)
    }
    if (distancesManhatan[1].includes(distanceInArray)) {   // se a distância entre uma peça e outra for 1 jogada
      return 10;                                            // recebe pontuação 1
    }
    if (distancesManhatan[2].includes(distanceInArray)) {
      return 20;
    }
    if (distancesManhatan[3].includes(distanceInArray)) {
      return 30;
    }
    if (distancesManhatan[4].includes(distanceInArray)) {
      return 40;
    }
  }

  board.forEach((position, index) => {
    const positionOnSolutionBoard = solutionBoard.findIndex(piece => piece === position);

    const distanceInArray = Math.abs(index - positionOnSolutionBoard);            // pegamos a distância que a peça está do seu objetivo (no array)
    const scoreByDistanceInMoves = getScoreByDistanceInMoves(distanceInArray);    // calculamos a distância em jogadas e atribuimos uma pontuação

    score += scoreByDistanceInMoves;                                              // adicionamos essa pontuação ao nosso score
  });

  return score;
};

const positionAStar = (initialBoard) => {
  let visited = [];
  let open = [{
    board: initialBoard,
    score: calculateScoreByPosition(initialBoard),    // agora nosso parâmetro é o score. Ou seja, a quantidade de peças no lugar
    path: [],
  }]

  const addOpenNode = (board, current) => {  // função para adicionar um novo nodo na lista de abertos
    const alreadyVisited = visited.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de visitados

    if (!alreadyVisited) {  // se não estiver, adiciona na lista de abertos
      open.push({
        board: board,
        score: calculateScoreByPosition(board),
        path: [
          ...current.path,
          current.board,
        ],
      });
    };
  } 

  let currentState = initialBoard;

  console.time('tempo-execucao');
  while (!isFinalState(currentState, solutionBoard)) {
    open = open.sort((a, b) => a.score - b.score); // ordena a lista a partir do 'score', do MENOR pro MAIOR
    const current = open[0];
    currentState = current.board;

    const newNodes = searchNodes(current.board); // procura novos nodos, a partir do 'current'

    newNodes.forEach((board) => addOpenNode(board, current));

    open = open.filter(node => node !== current); // remove o 'current' da lista de nodos abertos
    visited.push(current); // adiciona o current na lista de nodos visitados
  }
  console.timeEnd('tempo-execucao');

  console.log(visited);
  console.log(open);
  console.log('Fim de jogo!');
};

const manhatanAStar = (initialBoard) => {
  let visited = [];
  let open = [{
    board: initialBoard,
    score: calculateManhatanScore(initialBoard),    // agora nosso parâmetro é o score. Ou seja, a quantidade de peças no lugar
    path: [],
  }];

  const addOpenNode = (board, current) => {  // função para adicionar um novo nodo na lista de abertos
    const alreadyVisited = visited.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de visitados

    if (!alreadyVisited) {  // se não estiver, adiciona na lista de abertos
      open.push({
        board: board,
        score: calculateManhatanScore(board),
        path: [
          ...current.path,
          current.board,
        ],
      });
    };
  } 

  let currentState = initialBoard;

  console.time('tempo-execucao');
  while (!isFinalState(currentState, solutionBoard)) {
    open = open.sort((a, b) => a.score - b.score); // ordena a lista a partir do 'score', do MAIOR pro MENOR
    const current = open[0];
    currentState = current.board;

    const newNodes = searchNodes(current.board); // procura novos nodos, a partir do 'current'

    newNodes.forEach((board) => addOpenNode(board, current));

    open = open.filter(node => node !== current); // remove o 'current' da lista de nodos abertos
    visited.push(current); // adiciona o current na lista de nodos visitados
  }
  console.timeEnd('tempo-execucao');

  console.log(visited);
  console.log(open);
  console.log('Fim de jogo!');
};

const hardAStar = (initialBoard) => {
  const calculateHardScore = (board, cost = 0) => {
    const score = calculateManhatanScore(board) + cost
    return score;
  };

  const addOpenNode = ({ board, score, parent }) => {
    const alreadyOpen = open.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de abertos
    const alreadyVisited = visited.find(node => JSON.stringify(node.board) === JSON.stringify(board)); // verifica se esse estado já está na lista de visitados
    const hasLessScore = !!(alreadyOpen && score < alreadyOpen.score) || !!(alreadyVisited && score < alreadyVisited.score); // verifica se esse nodo tem menor custo do que o que já foi visitado

    const newNode = {
      board: board,
      score: score,
      path: [
        ...parent.path,
        parent.board,
      ],
    }

    if (!alreadyOpen && !alreadyVisited) { // se o nodo ainda não tiver sido visitado/aberto, add na lista
      open.push(newNode); // add o novo nodo na lista de abertos
      return;
    }

    if ((alreadyOpen || alreadyVisited) && hasLessScore) { // se o nodo já tiver sido visitado/aberto, e tiver menor custo, add na lista e remove o(s) antigo(s)
      open = open.filter(state => state !== alreadyOpen);   // remove o que já foi aberto, pois tem maior custo
      visited = visited.filter(state => state !== alreadyVisited); // remove o que já foi visitado, pois tem maior custo

      open.push(newNode);
    }
  }

  let visited = [];
  let open = [{
    board: initialBoard,
    score: calculateHardScore(initialBoard),
    path: [],
  }];

  let currentState = initialBoard;

  console.time('tempo-execucao');
  while (!isFinalState(currentState, solutionBoard)) {
    open = open.sort((a, b) => a.score - b.score); // ordena a lista a partir do 'score', do MENOR pro MAIOR
    const current = open[0];
    currentState = current.board;

    const newNodes = searchNodes(current.board); // procura novos nodos, a partir do 'current'

    newNodes.forEach((board, index) => addOpenNode({ board: board, score: calculateHardScore(board, current.score + (index + 1)), parent: current}));

    open = open.filter(node => node !== current); // remove o 'current' da lista de nodos abertos
    visited.push(current); // adiciona o current na lista de nodos visitados
  }
  console.timeEnd('tempo-execucao');

  console.log('Nodos visitados:', visited);
  console.log('Nodos abertos: ', open);
  console.log('')
  console.log('Tabuleiro inicial:')
  showBoard(initialBoard);
  console.log('')
  console.log('Tabuleiro final:')
  showBoard(solutionBoard);
  console.log('')
  console.log('Fim de jogo!');
};

hardAStar(initialBoard);
