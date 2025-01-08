import rl from 'readline'
import { randomUUID } from 'crypto';
import db from './db.json'

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

async function criarProduto() {
       const novoProduto: Produtos = {id: randomUUID(), 
        nome: String(await promptPromise.question('\nDigite o nome do produto: ')), 
        categoria: String(await promptPromise.question('Digite a categoria do produto: ')),
        preco: Number(await promptPromise.question('Digite o preço do produto: ')),
        quantidadeNoEstoque: Number(await promptPromise.question('Digite a quantidade do produto em estoque: '))
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

export { criarProduto, procurarCategoria }