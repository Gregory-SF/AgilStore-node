import { writeFile } from 'fs/promises';
import path from 'path'
import db from './db.json'
import rl from 'readline'
import { criarProduto, procurarCategoria } from './input-output';

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

const teste: Produtos[] = db
    
const dbJsonPath = path.resolve(process.cwd(),'src/db.json')

async function adicionar (){
    const novoProduto = await criarProduto()
    try {
        validarProduto(novoProduto)
    } catch (erro) {
       return console.error(erro) 
    }
    db.push(novoProduto)
    const produtosAtualizados = JSON.stringify(db, null, 2) 
    await writeFile(dbJsonPath, produtosAtualizados)
    console.log('Produto adicionado com sucesso')
}

function listarTodos(){
    console.table(db)
}

function validarProduto(produto:Produtos) {
    const {nome, categoria, preco, quantidadeNoEstoque} = produto
    if(!categoria || !nome || !preco || (!quantidadeNoEstoque && quantidadeNoEstoque!=0)){
        throw new Error('Preencha todos os valores válidos')
        // return console.error('Preencha todos os valores válidos')
    }
    if(preco <= 0 || quantidadeNoEstoque < 0){
        throw new Error('Preencha um número válido')
        // return console.error('Preencha um número válido')
    }
    if(quantidadeNoEstoque%1!=0){
        throw new Error('Preencha um número inteiro para o estoque')
        // return console.error('Preencha um número inteiro para o estoque')
    }
}

async function listarPorCategoria(){
    const categorias = db.filter((produto, index, atual) => atual.findIndex((aux) => aux.categoria === produto.categoria) === index).map(produto => produto.categoria);
    const categoriaProcurada = String(await procurarCategoria(categorias))
    if(db.filter(produto => produto.categoria.toLowerCase() === categoriaProcurada.toLowerCase()).length === 0) {
        return console.log(`A categoria ${categoriaProcurada} não existe. Por favor verifique se não há erros de digitação!`)
    }
    console.table(db.filter(produto => produto.categoria.toLowerCase() === categoriaProcurada.toLowerCase()))
}

function listarOrdenado(op: string){
    if(op === '1') console.table(db.sort((a, b) => {
        const nameA = a.nome.toUpperCase(); const nameB = b.nome.toUpperCase(); 
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }      
        return 0;
      }));
    if(op === '2') console.table(db.sort((a, b) => a.preco - b.preco));
    if(op === '3') console.table(db.sort((a, b) => a.quantidadeNoEstoque - b.quantidadeNoEstoque));
}

function atualizarPorId(id:string, dadosNovos: Produtos){
    const index = db.findIndex(produto => produto.id === id)
    const product = db.find(produto => produto.id === id)
    if(index === -1){
        return console.log("Id inválido")
    }
    teste[index] = {id: id, categoria: dadosNovos.categoria, nome: dadosNovos.nome, preco: dadosNovos.preco, quantidadeNoEstoque: dadosNovos.quantidadeNoEstoque}
    writeFile(dbJsonPath, JSON.stringify(teste, null, 2))
}

async function deletarProduto(id: string){
    const foundProduct = db.find(produto => produto.id === id)
    
    if(!foundProduct){
        return console.log(`O id ${id} não foi encontrado. Verifique se foi inserido o id correto`)
    }

    const confirmacaoExclusão = await promptPromise.question(`Tem certeza que gostaria de excluir o seguinte produto? ${JSON.stringify(foundProduct, null, 2)}\n\n[y/N]: `)
    promptPromise.close()

    if(confirmacaoExclusão === 'y'){
        console.log('Yes')
        const produtosAtualizados = db.filter(produto => produto.id != id)
        await writeFile(dbJsonPath, JSON.stringify(produtosAtualizados, null, 2))
        return console.log('Exclusão realizada')
    }

    console.log('No\nExclusão cancelada')
    
}

function procurarPorId(id: string){
    const foundProduct = db.find(produto => produto.id === id)
    
    if(!foundProduct){
        return console.log(`O produto de id ${id} não foi encontrado. Verifique se foi inserido o id correto`)
    }

    return console.log({foundProduct})
}

function procurarPorNome(nome: string){
    const foundProduct = db.find(produto => produto.nome.toUpperCase().includes(nome.toUpperCase()))
    
    if(!foundProduct){
        return console.log(`O produto de id ${nome} não foi encontrado. Verifique se foi inserido o id correto`)
    }

    return console.log({foundProduct})
}

async function listar(){
    const op = await promptPromise.question('Escolha uma das seguintes opções para listagem:\n1. Listagem geral.\n2. Listagem filtrada por categoria.\n3. Listagem ordenada.\n\nDigite o número da opção desejada: ')
    switch (op) {
        case '1':
            listarTodos()
            break;
        case '2':
            await listarPorCategoria()
            break;
        case '3':
            const ordem = String (await promptPromise.question('Escolha uma das seguintes opções para ordenar:\n1. Por nome.\n2. Por preço.\n3. Por quantidade no estoque.\n\nDigite o número da opção desejada: '))
            listarOrdenado(ordem)
            break; 
        default:
            console.log('Escolha inválida!\nEncerrando listagem')
            break;
    }
    promptPromise.close()

}

// adicionar()
// adicionar(nsei)
// listarTodos()
// listarPorCategoria('te cnologia')
// listarOrdenado(1)
// listarOrdenado(2)
// listarOrdenado(3)
// deletarProduto('c6add5ef-e647-4330-8e84-dc71a6e865bf')
// atualizarPorId('c6add5ef-e647-4330-8e84-dc71a6e865bf', krl)
// procurarPorId('350a4fb3-b7cd-4819-a8af-9006e33258')
// procurarPorNome('MOUSEP')
listar()