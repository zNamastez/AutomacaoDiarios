// Imports
const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

app.post('/run-script', async () => {

    /* Configurando navegador */
    const navegador = await puppeteer.launch({
        headless: false
    });

    /* Abrindo o site */
    console.log('Abrindo o site')
    const page = await navegador.newPage();
    await page.goto('https://siap.educacao.go.gov.br/login.aspx');

    /* Inserindo o usuário */
    console.log('Inserindo o usuário')
    const usuario = '#txtLogin';

    await page.waitForSelector(
        usuario,
        { timeout: 5000 });

    await page.keyboard.type('82001472153');

    /* Inserindo a senha */
    console.log('Inserindo a senha')
    const senha = '#txtSenha'

    await page.waitForSelector(
        senha,
        { timeout: 5000 });

    await page.click(senha)
    await page.keyboard.type('Wheeller');

    /* Capturar o código */
    console.log('Capturando o código')
    const captcha = '#lblCaptcha'

    await page.waitForSelector(
        captcha,
        { timeout: 5000 });

    const codigo = await page.evaluate(() => document.querySelector('#lblCaptcha').textContent);

    /* Inserir o código */
    console.log('Inserindo o código')
    const inputCaptcha = '#txtCaptcha'
    await page.click(inputCaptcha);
    await page.keyboard.type(codigo)

    /* Entrar */
    console.log('Entrando')
    const entrar = '#btnLogon'
    await page.click(entrar)

    /* Menu Sistema */
    console.log('Menu Sistema')
    const menuSistema = '#FormularioPrincipal > div.top > div > div.menu_trigger'

    await page.waitForSelector(
        menuSistema,
        { timeout: 5000 });

    await page.click(menuSistema)

    /* Diário do professor */
    console.log('Diario do professor')
    const diarioDoProfessor = '#SEEPageMenu > div > div:nth-child(2) > li:nth-child(3) > a'

    await delay(5000)

    await page.waitForSelector(
        diarioDoProfessor,
        { timeout: 10000 });

    await page.click(diarioDoProfessor)

    /* Listar */
    console.log('Listando')
    const Listar = '#cphFuncionalidade_btnListar'

    await page.waitForSelector(
        Listar,
        { timeout: 10000 });

    await page.click(Listar)

    /* Conteúdos */
    console.log('Conteudos')
    const serie = '#cphFuncionalidade_gdvListagem > tbody > tr:nth-child(2) > td:nth-child(1)'

    await page.waitForSelector(
        serie,
        { timeout: 5000 });

    await page.click(serie)
    await delay(5000)
    const conteudos = '#cphFuncionalidade_btnAuxiliar1'

    await page.waitForSelector(
        conteudos,
        { timeout: 10000 });

    await page.click(conteudos)

    /* Calendario */
    console.log('Capturando valores do calendário')

    const select = await page.waitForSelector(
        '#selectMesCalendarioMensal', 
        { timeout: 10000 });

    const options = await page.evaluate(() => {

        const select = document.querySelector('#selectMesCalendarioMensal');
        const meses = [];
        select.querySelectorAll('option').forEach(option => {

            meses.push(option.value);});

        return meses;});
    
    console.log('Iniciando procedimento para cada mês')

    for (const value of options) {

        await page.select(
            '#selectMesCalendarioMensal', 
            value);

        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        /* Verificando datas executadas */
        const diasExecutados = await page.evaluate(() => {

            const dias = Array.from(document.querySelectorAll('tbody > tr > td'));
            const resultados = [];

            dias.forEach(td => {

                if (td.hasAttribute('data-executado')) {

                    const dataExecutado = td.getAttribute('data-executado') === 'True';
                    const data = td.getAttribute('data');
                    resultados.push({ data, dataExecutado });}});

            return resultados;});
              

        for (const { data, dataExecutado } of diasExecutados) {

            if (dataExecutado) {

                console.log(`Data: ${data} - Executado: ${dataExecutado}`);}

            else {

                console.log(`Data: ${data} - Não executado, executando código adicional.`);
                const dataSelector = `td[data="${data}"]`
                await page.click(dataSelector)
                
                await delay(5000)
                const optionsAulas = await page.evaluate(() => {

                    const select = document.querySelector('#cphFuncionalidade_cphCampos_LstAulasDiaSelecionado');
                    const aulas = [];
                    select.querySelectorAll('option').forEach(option => {
            
                        aulas.push(option.value);});
            
                    return aulas;});

                if (optionsAulas.length < 2) {
                    await page.click('#cphFuncionalidade_cphCampos_grdPlanejado_Button1_0')
                    await delay(5000)
                    await page.click('#cphFuncionalidade_btnAlterar')
                    await delay(5000)
                }
                else {
                    await page.click('#cphFuncionalidade_cphCampos_grdPlanejado_Button1_0')
                    await delay(5000)
                    await page.click('#cphFuncionalidade_btnAlterar')
                    await delay(5000)

                    await page.select(
                        '#cphFuncionalidade_cphCampos_LstAulasDiaSelecionado',
                        '2ª Aula')

                    await delay(5000)
                    await page.click('#cphFuncionalidade_cphCampos_grdPlanejado_Button1_0')
                    await delay(5000)
                    await page.click('#cphFuncionalidade_btnAlterar')
                    await delay(5000)
                }
                console.log(optionsAulas)
            }
        }
    }

})

const port = 5000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
