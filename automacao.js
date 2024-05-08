const puppeteer = require('puppeteer');

// Constantes para os seletores usados no script
const SELECTORS = {
    loginInput: '#txtLogin',
    passwordInput: '#txtSenha',
    captchaLabel: '#lblCaptcha',
    captchaInput: '#txtCaptcha',
    loginButton: '#btnLogon',
    menuSystem: '#FormularioPrincipal > div.top > div > div.menu_trigger',
    teacherDiary: '#SEEPageMenu > div > div:nth-child(2) > li:nth-child(3) > a',
    listButton: '#cphFuncionalidade_btnListar',
    seriesList: '#cphFuncionalidade_gdvListagem > tbody > tr:nth-child(2) > td:nth-child(1)',
    contentsButton: '#cphFuncionalidade_btnAuxiliar1',
    calendarSelect: '#selectMesCalendarioMensal'
};

// Função principal que executa o script Puppeteer
async function runScript() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    console.log('Abrindo o site');
    await page.goto('https://siap.educacao.go.gov.br/login.aspx');

    await login(page);
    await navigateSystem(page);

    await browser.close();
}

// Função para realizar o login no site
async function login(page) {
    console.log('Inserindo o usuário');
    await page.waitForSelector(SELECTORS.loginInput);
    await page.keyboard.type('82001472153');

    console.log('Inserindo a senha');
    await page.waitForSelector(SELECTORS.passwordInput);
    await page.click(SELECTORS.passwordInput);
    await page.keyboard.type('Wheeller');

    console.log('Capturando o código');
    const captchaCode = await page.evaluate(selector => {
        return document.querySelector(selector).textContent;
    }, SELECTORS.captchaLabel);

    console.log('Inserindo o código');
    await page.click(SELECTORS.captchaInput);
    await page.keyboard.type(captchaCode);

    console.log('Entrando');
    await page.click(SELECTORS.loginButton);
}

// Função para navegar pelo sistema após o login
async function navigateSystem(page) {
    console.log('Menu Sistema');
    await page.waitForSelector(SELECTORS.menuSystem);
    await page.click(SELECTORS.menuSystem);

    console.log('Diário do professor');
    await page.waitForSelector(SELECTORS.teacherDiary, { timeout: 10000 });
    await page.click(SELECTORS.teacherDiary);

    console.log('Listando');
    await page.waitForSelector(SELECTORS.listButton, { timeout: 10000 });
    await page.click(SELECTORS.listButton);

    console.log('Conteúdos');
    await page.waitForSelector(SELECTORS.seriesList);
    await page.click(SELECTORS.seriesList);
    await page.waitForSelector(SELECTORS.contentsButton);
    await page.click(SELECTORS.contentsButton);

    console.log('Operações adicionais podem ser executadas aqui');
}

// Executar o script e capturar quaisquer erros
runScript().catch(error => {
    console.error('Erro durante a execução do script', error);
});
