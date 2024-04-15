const solutionBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const initialBoard = [7, 4, 2, 8, 1, 5, 6, 3, 0];

const showBoard = (board) => {
  console.log(`[${board[0]}, ${board[1]}, ${board[2]}]`);
  console.log(`[${board[3]}, ${board[4]}, ${board[5]}]`);
  console.log(`[${board[6]}, ${board[7]}, ${board[8]}]`);
}

const isFinalState = (initialBoard, solutionBoard) => solutionBoard === initialBoard;

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
    const hasLessCost = !!alreadyOpen && !!alreadyVisited && cost < alreadyOpen.cost && cost < alreadyVisited.cost; // verifica se esse nodo tem menor custo do que o que já foi visitado

    const newNode = {
      board: board,
      cost: cost,
      path: [
        ...parent.path,
        parent.board,
      ],
    }

    if (!alreadyOpen && !alreadyVisited) { // se o nodo ainda não tiver sido visitado, add na lista
      open.push(newNode); // add o novo nodo na lista de abertos
      return;
    }

    if (alreadyOpen && hasLessCost) {
      open = open.filter(state => state !== alreadyOpen); // remove o que já foi visitado, pois tem maior custo
      open.push(newNode);
    }
  }

  let currentState = board;

  while (JSON.stringify(currentState) !== JSON.stringify(solutionBoard)) {
    const current = open[0]; // pega o nodo com menor custo
    currentState = current.board;
    open = open.sort((a, b) => a.cost - b.cost); // ordena a lista a partir do 'cost'

    const newNodes = searchNodes(current.board); // procura novos nodos, a partir do 'current'
    newNodes.forEach((board, index) => addOpenNode({ board, cost: current.cost + (index + 1), parent: current }));
    open = open.filter(state => state !== current); // remove o 'current' da lista de nodos abertos
    visited.push(current); // adiciona o current na lista de nodos visitados
  }

  console.log(visited);
  console.log(open);
};

uniformCost(initialBoard);

if (isFinalState(initialBoard, solutionBoard)) {
  console.log('Fim de jogo!');
}
