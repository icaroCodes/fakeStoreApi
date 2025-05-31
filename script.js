const lista = document.getElementById('lista');
const loader = document.querySelector('.loader');
const carrinhoContainer = document.getElementById('carrinhoContainer');
const toastLive = document.getElementById('liveToast');
const toastBootstrap = new bootstrap.Toast(toastLive);

let carrinho = [];

function mostrarLoader(mostrar) {
    loader.classList.toggle('d-none', !mostrar);
}

async function carregarProdutos(categoria = 'all') {
    mostrarLoader(true);
    let url = 'https://fakestoreapi.com/products';

    if (categoria !== 'all') {
        url = `https://fakestoreapi.com/products/category/${encodeURIComponent(categoria)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');
        const produtos = await response.json();
        exibirProdutos(produtos);
    } catch (error) {
        lista.innerHTML = '<p class="text-center text-danger">Erro ao carregar os produtos.</p>';
    }

    mostrarLoader(false);
}

function exibirProdutos(produtos) {
    lista.innerHTML = '';

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('col-md-3');
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${produto.image}" class="card-img-top" alt="${produto.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${produto.title}</h5>
                    <p class="card-text">${produto.description.substring(0, 100)}...</p>
                    <p class="card-text fw-bold">$ ${produto.price}</p>
                    <button class="btn btn-primary mt-auto" onclick="adicionarAoCarrinho(${produto.id})" aria-label="Adicionar ${produto.title} ao carrinho">
                        <i class="bi bi-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}

async function adicionarAoCarrinho(id) {
    const produtoExistente = carrinho.find(p => p.id === id);

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${id}`);
            if (!response.ok) throw new Error('Erro ao buscar produto');
            const produto = await response.json();
            produto.quantidade = 1;
            carrinho.push(produto);
        } catch {
            alert('Erro ao adicionar produto ao carrinho');
            return;
        }
    }

    atualizarCarrinho();
}

function atualizarCarrinho() {
    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML = '<p class="text-center fs-5">Seu carrinho está vazio.</p>';
        return;
    }

    const produtosHTML = carrinho.map(produto => `
        <div class="card mb-3" style="max-width: 540px;">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${produto.image}" class="img-fluid rounded-start" alt="${produto.title}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${produto.title}</h5>
                        <p class="card-text">${produto.description.substring(0, 60)}...</p>
                        <p class="card-text fw-bold">$ ${produto.price} x ${produto.quantidade}</p>
                        <button class="btn btn-danger btn-sm" onclick="removerDoCarrinho(${produto.id})" aria-label="Remover ${produto.title} do carrinho">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const total = carrinho.reduce((acc, p) => acc + p.price * p.quantidade, 0).toFixed(2);

    carrinhoContainer.innerHTML = produtosHTML + `
        <div class="d-grid mt-3">
            <p class="fs-5 fw-bold">Total: $ ${total}</p>
            <button type="button" class="btn btn-success" onclick="finalizarCompra()">
                Finalizar Compra
            </button>
        </div>
    `;
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(produto => produto.id !== id);
    atualizarCarrinho();
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let mensagem = 'Olá, gostaria de comprar os seguintes produtos:%0A';
    let total = 0;

    carrinho.forEach(produto => {
        mensagem += `- ${produto.title} (x${produto.quantidade}): $${(produto.price * produto.quantidade).toFixed(2)}%0A`;
        total += produto.price * produto.quantidade;
    });

    mensagem += `%0ATotal: $${total.toFixed(2)}`;

    const numeroWhatsApp = '558592762550';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

    window.open(urlWhatsApp, '_blank');

    carrinho = [];
    atualizarCarrinho();

    toastBootstrap.show();
}

function carregarPorCategoria(categoria) {
    carregarProdutos(categoria);
}

// Carrega todos os produtos inicialmente
carregarProdutos();


function pesquisarProduto(event) {
  event.preventDefault(); // evitar que a página recarregue

  const termo = document.getElementById('inputPesquisa').value.toLowerCase().trim();
  if (!termo) {
    carregarProdutos(); // se vazio, carrega todos
    return;
  }

  mostrarLoader(true);

  fetch('https://fakestoreapi.com/products')
    .then(response => response.json())
    .then(produtos => {
      // filtra produtos pelo título que contenha o termo
      const filtrados = produtos.filter(p => p.title.toLowerCase().includes(termo));
      exibirProdutos(filtrados);
    })
    .catch(() => {
      lista.innerHTML = '<p class="text-center text-danger">Erro ao carregar os produtos.</p>';
    })
    .finally(() => mostrarLoader(false));
}
