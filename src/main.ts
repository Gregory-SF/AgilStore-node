import { writeFile } from 'fs/promises';
import path from 'path'
import db from './db.json'
import { criarProduto, perguntarId, perguntarNome, procurarCategoria, perguntarAtributos, confirmarExclusao, perguntarLista, perguntarOrdem, perguntarMenu, perguntarBusca, promptPromise } from './input-output';
import { randomUUID } from 'crypto';

type Produtos = {
    id: string,
    nome: string,
    categoria: string,
    quantidadeNoEstoque: number,
    preco: number
}

const dbJsonPath = path.resolve(process.cwd(),'src/db.json')

async function adicionar (){
    const novoProduto: Produtos = {id:randomUUID(),... await criarProduto()}
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

async function atualizarPorId(){
    const id = await perguntarId()
    const index = db.findIndex(produto => produto.id === id)
    const produtoEncontrado = db.find(produto => produto.id === id)
    if(!produtoEncontrado){
        promptPromise.close()
        return console.log("Id inválido")
    }
    const produtoAtualizado: Produtos = {id:id,... await perguntarAtributos(produtoEncontrado)}
    try {
        validarProduto(produtoAtualizado)
    } catch (erro) {
        return console.error(erro) 
    }    
    db[index] = produtoAtualizado;
    writeFile(dbJsonPath, JSON.stringify(db, null, 2))
}

async function deletarProduto(){
    const id = await perguntarId()
    const produtoEncontrado = db.find(produto => produto.id === id)
    
    if(!produtoEncontrado){
        promptPromise.close()
        return console.log(`O id ${id} não foi encontrado. Verifique se foi inserido o id correto`)
    }
    console.log(`Produto encontrado: ${JSON.stringify(produtoEncontrado, null, 2)}`)

    const confirmacaoExclusão = await confirmarExclusao()

    if(confirmacaoExclusão === 's'){
        console.log('\nSim')
        const produtosAtualizados = db.filter(produto => produto.id != id)
        await writeFile(dbJsonPath, JSON.stringify(produtosAtualizados, null, 2))
        return console.log('Exclusão realizada!')
    }

    console.log('Não\nExclusão cancelada')
}

async function procurarPorId(){
    const id = await perguntarId('1')
    const produtoEncontrado = db.find(produto => produto.id === id)
    
    if(!produtoEncontrado){
        return console.log(`O produto de id ${id} não foi encontrado. Verifique se foi inserido o id correto`)
    }

    return console.log({produtoEncontrado})
}

async function procurarPorNome(){
    const nome = String(await perguntarNome())
    const produtoEncontrado = db.find(produto => produto.nome.toUpperCase().includes(nome.toUpperCase()))
    
    if(!produtoEncontrado){
        return console.log(`O produto com nome ${nome} não foi encontrado. Verifique se foi inserido o id correto`)
    }

    return console.log({produtoEncontrado})
}

async function buscar() {
    switch (String(await perguntarBusca())) {
        case '1':
            await procurarPorId()
            break;
        case '2':
            await procurarPorNome()
            break;
        default:
            promptPromise.close()
            console.log('Escolha inválida!\nEncerrando busca!')
            break;
    }
}

async function listar(){
    switch (String(await perguntarLista())) {
        case '1':
            listarTodos()
            break;
        case '2':
            await listarPorCategoria()
            break;
        case '3':
            listarOrdenado(String(await perguntarOrdem()))
            break; 
        default:
            promptPromise.close()
            console.log('Escolha inválida!\nEncerrando listagem')
            break;
    }
}

async function menu() {
    switch (String(await perguntarMenu())) {
        case '1':
            await adicionar()
            break;
        case '2':
            await listar()
            break;
        case '3':
            await atualizarPorId()
            break; 
        case '4':
            await deletarProduto()
            break; 
        case '5':
            await buscar()
            break; 
        default:
            promptPromise.close()
            console.log('Escolha inválida!\nEncerrando programa!')
            break;
    }
}

menu()