const router = require("express").Router();
const { Produto } = require("../models");
const sequelize = require("sequelize");

function validaPrecoVendaMargemLucro(precoCusto, precoVenda, margemLucro) {
    if (!!margemLucro && !isNaN(margemLucro)) {
        margemLucro = parseFloat(margemLucro) / 100.00;
        precoVenda = parseFloat(precoCusto) * (margemLucro + 1)
    } else if (!!precoVenda && !isNaN(precoVenda)) {
        console.log("cheguei")
        precoVenda = parseFloat(precoVenda);
        precoCusto = parseFloat(precoCusto);
        margemLucro = ((precoVenda - precoCusto) / precoCusto) * 100;
    }

    return {
        precoVenda: precoVenda,
        margemLucro: margemLucro.toFixed(2)
    }
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

        let validacaoVenda = validaPrecoVendaMargemLucro(precoCusto, precoVenda, margemLucro)

        let produto = await Produto.create({
            nome: nome,
            descricao: descricao,
            preco_custo: precoCusto,
            preco_venda: validacaoVenda.precoVenda,
            estoque: estoque,
            data_hora_cadastro: new Date(),
            margem_lucro: validacaoVenda.margemLucro
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

        let produto = await Produto.update(
            {
                nome: nome,
                descricao: descricao,
                preco_custo: precoCusto,
                preco_venda: validacaoVenda.precoVenda,
                estoque: estoque,
                margem_lucro: validacaoVenda.margemLucro
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
