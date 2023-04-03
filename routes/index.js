const router = require("express").Router();
const { Produto } = require("../models");
const sequelize = require("sequelize");

function validaPrecoVendaMargemLucro(precoCusto = 0, precoVenda = 0, margemLucro = 0) {
    let novoPrecoVenda = 0;
    let novaMargemLucro = 0;

    if (!!margemLucro && !isNaN(margemLucro)) {
        margemLucro = (margemLucro / 100) + 1;
        novoPrecoVenda = precoCusto * margemLucro;
        novaMargemLucro = (margemLucro - 1) * 100;

    } else if (!!precoVenda && !isNaN(precoVenda)) {
        precoVenda = parseFloat(precoVenda);
        precoCusto = parseFloat(precoCusto);
        margemLucro = ((precoVenda - precoCusto) / precoCusto) * 100;
        console.log("cheguei2")
    }

    return {
        precoVenda: novoPrecoVenda,
        margemLucro: novaMargemLucro,
        precoCusto: precoCusto
    };
}

router.get("/produto", async (req, res) => {
    try {
        const produtos = await Produto.findAll();

        let produtosModificados = produtos.map(produto => {
            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                precoVenda: produto.preco_venda,
                precoCusto: produto.preco_custo,
                margemLucro: produto.margem_lucro,
                estoque: produto.estoque,
                dataHoraCadastro: produto.data_hora_cadastro
            }
        });

        res.json(produtosModificados);
    } catch (error) {
        res.send(error);
    }
});

router.get("/produto/:search", async (req, res) => {
    try {
        const search = req.params.search;
        const produtos = await Produto.findAll({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('nome')), 'LIKE', '%' + String(search).toLowerCase() + '%')
        });
        let produtosModificados = produtos.map(produto => {
            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                precoVenda: produto.preco_venda,
                precoCusto: produto.preco_custo,
                margemLucro: produto.margem_lucro,
                estoque: produto.estoque,
                dataHoraCadastro: produto.data_hora_cadastro
            }
        });
        res.json(produtosModificados);
    } catch (error) {
        res.send(error);
    }
});

router.post("/produto", async (req, res) => {
    try {
        const { nome, descricao, precoCusto, estoque } = req.body;

        let precoVenda = req.body.precoVenda;
        let margemLucro = req.body.margemLucro;

        let validacaoVenda = validaPrecoVendaMargemLucro(precoCusto, precoVenda, margemLucro);

        let precoVendaConvertido = Number(validacaoVenda.precoVenda).toFixed(2);
        let precoCustoConvertido = Number(validacaoVenda.precoCusto).toFixed(2);
        let margemLucroConvertido = Number(validacaoVenda.margemLucro).toFixed(2);

        let produto = await Produto.create({
            nome: nome,
            descricao: descricao,
            preco_custo: precoCustoConvertido,
            preco_venda: precoVendaConvertido,
            estoque: estoque,
            data_hora_cadastro: new Date(),
            margem_lucro: margemLucroConvertido
        });

        res.json(produto);

    } catch (error) {
        res.send(error);
    }
});

router.put("/produto/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, descricao, estoque } = req.body;

        let produtoSalvo = await Produto.findOne({
            where: {
                id: id
            }
        })

        let precoCusto = !!req.body.precoCusto ? req.body.precoCusto : produtoSalvo.dataValues.preco_custo;
        let precoVenda = !!req.body.precoVenda ? req.body.precoVenda : produtoSalvo.dataValues.preco_venda;
        let margemLucro = !!req.body.margemLucro ? req.body.margemLucro : produtoSalvo.dataValues.margem_lucro;

        let validacaoVenda = validaPrecoVendaMargemLucro(
            precoCusto,
            precoVenda,
            margemLucro
        )


        let precoVendaConvertido = Number(validacaoVenda.precoVenda).toFixed(2);
        let precoCustoConvertido = Number(validacaoVenda.precoCusto).toFixed(2);
        let margemLucroConvertido = Number(validacaoVenda.margemLucro).toFixed(2);

        let produto = await Produto.update(
            {
                nome: nome,
                descricao: descricao,
                preco_custo: precoCustoConvertido,
                preco_venda: precoVendaConvertido,
                estoque: estoque,
                margem_lucro: margemLucroConvertido
            },
            {
                where: {
                    id: id
                }
            });

        res.json(produto);
    } catch (error) {
        res.send(error);
    }
});

router.delete("/produto/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await Produto.destroy({
            where: {
                id: id
            }
        });

        res.json(`Produto apagada com sucesso!`);
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;
