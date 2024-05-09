// Import
const puppeteer = require('puppeteer');

// Função de automação do navegador
(async () => {

    console.log("Configurando o Puppeteer")
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    global.page = page

    console.log('Abrindo o site');
    await page.goto('https://siap.educacao.go.gov.br/login.aspx');

    console.log('Inserindo o usuário');
    await PageWaitSelector('#txtLogin');
    await page.keyboard.type('82001472153');

    console.log('Inserindo a senha');
    const senha = '#txtSenha';
    await PageWaitSelector(senha);
    await page.click(senha);
    await page.keyboard.type('Wheeller');

    console.log('Capturando o código');
    const captcha = '#lblCaptcha';
    await PageWaitSelector(captcha);
    const codigo = await page.evaluate(() => document.querySelector(captcha).textContent);

    console.log('Inserindo o código');
    await page.click('#txtCaptcha');
    await page.keyboard.type(codigo);

    console.log('Entrando');
    await page.click('#btnLogon');

    await MDL();

    console.log('Conteúdos');
    await Delay(5000); 

    const turmas = await page.evaluate(() => {

        const tbody = document.querySelector('#cphFuncionalidade_gdvListagem > tbody');
        return tbody ? tbody.querySelectorAll('tr').length : 0;

    });

    console.log(`Total de turmas encontradas: ${turmas - 1}`);

    for (let i = 2; i <= turmas; i++) {

        const serie = `#cphFuncionalidade_gdvListagem > tbody > tr:nth-child(${i})`;
        await PageWaitSelector(serie);
        await page.click(serie);
        await Delay(5000);
        
        const conteudos = '#cphFuncionalidade_btnAuxiliar1';
        await PageWaitSelector(conteudos)
        await page.click(conteudos);

        console.log('Capturando valores do calendário');
        const calendario = '#selectMesCalendarioMensal'
        await Delay(5000);

        if (!await page.$(calendario)) {

            console.error("Selector calendario não encontrado.");
            continue;
        }

        let options = await CapturarOptions("let options", calendario, "meses")

        console.log('Iniciando procedimento para cada mês');
        let executa = true

        for (const value of options) {

            if (!executa) {
                break;
            }

            await page.select(calendario, value);
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            const diasExecutados = await page.evaluate(() => {

                const dias = Array.from(document.querySelectorAll('tbody > tr > td'));
                const resultados = [];

                dias.forEach(td => {

                    if (td.hasAttribute('data-executado')) {

                        const dataExecutado = td.getAttribute('data-executado') === 'True';
                        const data = td.getAttribute('data');
                        resultados.push({ data, dataExecutado });

                    }

                });

                return resultados;

            });

            for (const { data, dataExecutado } of diasExecutados) {

                try {

                    if (dataExecutado) {

                        console.log(`Data: ${data} - Executado: ${dataExecutado}`);

                    } 
                    
                    else {

                        console.log(`Data: ${data} - Não executado, executando código adicional.`);
                        const dataSelector = `td[data="${data}"]`;
                        await page.click(dataSelector);
                        await Delay(5000); 
                        const optionsAulas = await CapturarOptions("const optionsAulas", '#cphFuncionalidade_cphCampos_LstAulasDiaSelecionado', "aulas")

                        if (optionsAulas.length < 2) {

                            console.log("1° Aula")
                            await PrimeiraAula()

                        } 

                        else {

                            console.log("1° e 2° Aula")
                            await PrimeiraAula()

                            for (let i = 1; i <= 2; i++) {
                                console.log(`Executando ${i}° vez`)
                                await page.select('#cphFuncionalidade_cphCampos_LstAulasDiaSelecionado', optionsAulas[1]);
                                await Delay(5000); 
                            }

                            await page.click('#cphFuncionalidade_cphCampos_grdPlanejado_Button1_0');
                            await Delay(5000); 
                            await page.click('#cphFuncionalidade_btnAlterar');
                            await Delay(5000); 

                        }

                    }

                }

                catch{

                    console.log("Turma finalizada")
                    executa = false
                    await MenuSistema();
                    await DiarioProfessor();
                    await Listar();
                    break

                }

            }

        }

    }

    await browser.close();

})();

// Função para aguardar um seletor
async function PageWaitSelector(selector, ) {

    await page.waitForSelector(
        selector, 
        { timeout: 10000 });

}

// Função para acessar "Menu Sistema"
async function MenuSistema() {

    console.log('Menu Sistema');
    const menuSistema = '#FormularioPrincipal > div.top > div > div.menu_trigger';
    await PageWaitSelector(menuSistema)
    await page.click(menuSistema);

}

// Função para acessar "Diario do Professor"
async function DiarioProfessor() {

    console.log('Diario do professor');
    const diarioDoProfessor = '#SEEPageMenu > div > div:nth-child(2) > li:nth-child(3) > a';
    await Delay(5000);
    await PageWaitSelector(diarioDoProfessor)
    await page.click(diarioDoProfessor);

}

// Função para listar as turmas
async function Listar() {

    console.log('Listando');
    const listar = '#cphFuncionalidade_btnListar';
    await PageWaitSelector(listar)
    await page.click(listar);

}

// Função para executar MenuSistema, DiarioProfessor e Listar
async function MDL() {

    await MenuSistema();
    await DiarioProfessor();
    await Listar();

}

// Função de delay
function Delay(time) {

    return new Promise(function (resolve) {

        setTimeout(
            resolve, 
            time);

    });

}

// Função para capturar os valores dos selects
async function CapturarOptions(Variavel, Selector, Lista) {

    Variavel = await page.evaluate((varSelector) => {

        const select = document.querySelector(varSelector);
        Lista = [];

        select.querySelectorAll('option').forEach(Option => {

        Lista.push(Option.value);
                                
        });
                            
        return Lista;
    }, Selector);

    return Variavel
}

// Função de procedimento pra 1° Aula
async function PrimeiraAula() {

    await page.click('#cphFuncionalidade_cphCampos_grdPlanejado_Button1_0');
    await Delay(5000); 
    await page.click('#cphFuncionalidade_btnAlterar');
    await Delay(5000); 
}