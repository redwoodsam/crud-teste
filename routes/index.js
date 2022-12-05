const router = require("express").Router();
const { Pessoa } = require("../models");
const Sequelize = require("sequelize");

router.get("/pessoas", async (req, res) => {
    try {
        const pessoas = await Pessoa.findAll();
        res.json(pessoas);
    } catch(error) {
        res.send(error);
    }
});

router.get("/pessoas/:id", async (req, res) => {
    try {
        const id  = req.params.id;
        const pessoa = await Pessoa.findOne({
            where: {
                id: id
            }
        });
        res.json(pessoa);
    } catch(error) {
        res.send(error);
    }
});

router.post("/pessoas", async (req, res) => {
    try {
        const { nome, idade } = req.body;
        let pessoa = await Pessoa.create({
            nome: nome,
            idade: idade
        });
        res.json(pessoa);
    } catch(error) {
        res.send(error);
    }
});

router.put("/pessoas/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, idade } = req.body;
        let pessoa = await Pessoa.update({nome: nome, idade: idade}, {
            where: {
                id: id
            }
        });
        res.json(pessoa);
    } catch(error) {
        res.send(error);
    }
});

router.delete("/pessoas/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const pessoa = await Pessoa.destroy({
            where: {
                id: id
            }
        });

        res.json(`Pessoa apagada com sucesso!`);
    } catch(error) {
        res.send(error);
    }
});

module.exports = router;