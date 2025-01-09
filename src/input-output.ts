import rl from 'readline'

const prompt = rl.createInterface({
    input: process.stdin,
    output: process.stdout
})

const promptPromise = {
    question: (pergunta:string) => new Promise((resolve, reject) => {
        try{
            prompt.question((pergunta), (resposta: string) => resolve(resposta))
        } catch(error){
            reject(error)
        }
    }),
    close: () => prompt.close()
}

type Produtos = {
    id: string,
    nome: string,
    categoria: string,
    quantidadeNoEstoque: number,
    preco: number
}

type ProdutoDTO = Omit<Produtos, "id">

async function perguntarId(fim?: string) {
    if(fim){
        const id = String(await promptPromise.question('\nDigite o id do produto: '))
        promptPromise.close()
        return id
    }
    return String(await promptPromise.question('\nDigite o id do produto: '))
}

async function perguntarNome() {
    const nome =  String(await promptPromise.question('\nDigite o nome do produto: '))
    promptPromise.close()
    return nome
}

async function criarProduto() {
    const novoProduto: ProdutoDTO = { 
        nome: String(await promptPromise.question('\nDigite o nome do produto: ')), 
        categoria: String(await promptPromise.question('Digite a categoria do produto: ')),
        preco: parseFloat(String(await promptPromise.question('Digite o preço do produto: '))),
        quantidadeNoEstoque: Number(await promptPromise.question('Digite a quantidade do produto em estoque: '))
    }
    promptPromise.close()
    return novoProduto
}

async function atualizarProduto(produto: Partial<Produtos>) {
    const novoProduto: ProdutoDTO = { 
        nome: produto.nome ?? String(await promptPromise.question('\nDigite o nome do produto: ')), 
        categoria: produto.categoria ?? String(await promptPromise.question('Digite a categoria do produto: ')),
        preco: produto.preco ?? parseFloat(String(await promptPromise.question('Digite o preço do produto: '))),
        quantidadeNoEstoque: produto.quantidadeNoEstoque?? Number(await promptPromise.question('Digite a quantidade do produto em estoque: '))
    }
    promptPromise.close()
    return novoProduto
}

async function procurarCategoria(categorias:string[]) {
    console.log("\nEssas são as categorias dos produtos do inventário. Escolha uma: ")
    categorias.forEach(cat => {console.log(cat)});
    const categoriaProcurada = String(await promptPromise.question('\nDigite a categoria desejada: '))
    promptPromise.close()
    return categoriaProcurada
}

async function perguntarAtributos(produtoLa: Produtos) {
    const resposta = String (await promptPromise.question('\nDigite quais dos seguintes atributos deseja separando-os por vírgula: nome, categoria, preco, quantidade em estoque: '))
    const atributosEscolhidos = resposta.split(',').map(p => p.trim().toLowerCase())
    if(atributosEscolhidos.includes('quantidade em estoque')){
        atributosEscolhidos[atributosEscolhidos.findIndex(p => p === 'quantidade em estoque')] = 'quantidadeNoEstoque'
    }
 
    const aux = {}
    for (const key in produtoLa) {
        if (!atributosEscolhidos.includes(key)) {
            aux[key] = produtoLa[key as keyof Produtos];
        }
    }
    return atualizarProduto(aux)
}

async function confirmarExclusao() {
    const confirmacaoExclusão = await promptPromise.question('\nTem certeza que gostaria de excluir o produto? \n\n[s/N]: ')
    promptPromise.close()
    return confirmacaoExclusão
}

async function perguntarLista() {
    const op = String (await promptPromise.question('Escolha uma das seguintes opções para listagem:\n1. Listagem geral.\n2. Listagem filtrada por categoria.\n3. Listagem ordenada.\n\nDigite o número da opção desejada: '))
    if(op === '1') promptPromise.close()
    return op
}

async function perguntarBusca() {
    return String(await promptPromise.question('Escolha uma das seguintes opções para a busca do produto:\n1. Busca pelo id.\n2. Busca pelo nome do produto.\n\nDigite o número da opção desejada: '))
}

async function perguntarOrdem() {
    const ordem = String (await promptPromise.question('Escolha uma das seguintes opções para ordenar:\n1. Por nome.\n2. Por preço.\n3. Por quantidade no estoque.\n\nDigite o número da opção desejada: '))
    promptPromise.close()
    return ordem
}

async function perguntarMenu(){
    return String (await promptPromise.question('Escolha uma das seguintes opções:\n1. Adicionar produto.\n2. Listar produtos.\n3. Atualizar produto.\n4. Excluir produto.\n5. Buscar produto.\n\nDigite o número da opção desejada: '))
}
export { criarProduto, procurarCategoria, 
    perguntarId, perguntarNome, perguntarAtributos, 
    confirmarExclusao, perguntarLista, perguntarOrdem, 
    perguntarMenu, perguntarBusca, promptPromise }