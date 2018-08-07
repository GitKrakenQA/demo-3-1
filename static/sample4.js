import 'mocha';
import './global';
import webDriver, { ThenableWebDriver } from 'selenium-webdriver';
import {
    expect
} from 'chai';

import BasePage from '../Lib/basePage';
import GloMainPage from '../Lib/gloMainPage';

import {
    deleteGkAccount,
    deleteGitHubAccount,
    signUpToGloWithNewGkAccount,
    signUpToGloWithGitHubAccount
} from '../Utils/registerUtility';

import Credentials from '../Consts/credentials';
import Domains from '../Consts/domains';
import GloConsts from '../Consts/glo';


let basePage: BasePage;
describe('Sign Up Tests', function() {
    this.timeout(300000); // 5 mins
    const baseURL = Domains.dev;
    const gloMainPage = new GloMainPage();
    let driver: ThenableWebDriver;

    const ensureWelcomeBoardIsCreated = async (): Promise<void> => {
        (await basePage.findById('boardMenuAnchor')).click();
        await basePage.standBy(2000);
        const welcomeBoardElement = await basePage.findByXpath('//div[@title="Welcome Board"]', 2000);
        expect(welcomeBoardElement).to.exist;
        welcomeBoardElement.click();
    };

    const ensureDefaultThemeIsGlo = async (): Promise<void> => {
        await gloMainPage.openAccountPanel(basePage, 2000);
        await gloMainPage.openAccountPanelOption(GloConsts.userAccountPanelOptions.theme, basePage, 2000);
        await basePage.standBy(1000);
        const selectedThemeButttonText = await (await basePage.findByCss('button[disabled] span', 2000)).getText();
        expect(selectedThemeButttonText).to.be.equal(GloConsts.themeOptions.gloTheme);
    };

    const ensureNotificationToChangeUsernameIsDisplayed = async (): Promise<void> => {
        (await basePage.findById('glo-notifications-toggle', 2000)).click();
        await basePage.standBy(1000);
        const changeUsernameNotificationButton = await basePage.findAllByXpath(`//button/span[contains(text(), "${GloConsts.notificationButtons.changeUsername}")]`, 2000);
        const okNotificationButton = await basePage.findAllByXpath(`//button/span[contains(text(), "${GloConsts.notificationButtons.ok}")]`, 2000);
        expect(changeUsernameNotificationButton.length).to.be.equal(1);
        expect(okNotificationButton.length).to.be.equal(1);
    };

    const ensureColumnsCreated = async (): Promise<void> => {
        await basePage.standBy(4000);
        const columnsContainer = await basePage.findAllByXpath('//div[@id="column-container"]/div', 3000);
        expect((await columnsContainer.length - 1)).to.be.equal(3);
    };

    const ensureLabelCreated = async (): Promise<void> => {
        await gloMainPage.openBoardSettingsPanel(basePage, 2000);
        await gloMainPage.openBoardSettingsPanelOption(GloConsts.boardSettingsPanelOptions.labels, basePage, 4000);
        await basePage.standBy(3000);
        const tealLabelCount = (await basePage.findAllByXpath('//*[@style="background-color: rgb(6, 133, 134);"]', 2000)).length;
        expect(tealLabelCount).to.be.equal(1);
    };

    beforeEach(async function(): Promise<void> {
        driver = new webDriver.Builder().withCapabilities(webDriver.Capabilities.chrome()).setChromeOptions(this.options).build();
        basePage = new BasePage(driver);
        await basePage.visit(`${baseURL}/login`);
    });

    it(
        'Should create a Glo account and make sure Welcome Board is created, '
        + 'default theme is Glo, three columns created and there is one label',
        async function(): Promise<void> {
            const dataToLogIn = Credentials.dataToLogInWithGKAccount;

            await signUpToGloWithNewGkAccount(basePage, dataToLogIn);
            await ensureNotificationToChangeUsernameIsDisplayed();
            await ensureWelcomeBoardIsCreated();
            await ensureColumnsCreated();
            await ensureLabelCreated();
            await gloMainPage.clickOnArrowLeft(basePage);
            await ensureDefaultThemeIsGlo();
            await gloMainPage.clickOnArrowLeft(basePage);
            await deleteGkAccount(basePage, this.options, dataToLogIn);
    });

    it(
        'Should create a Glo account using GitHub and make sure Welcome Board is created, '
        + 'default theme is Glo, three columns created and there is one label',
        async function(): Promise<void> {
            const dataToLogIn = Credentials.dataToLogInWithGitHubAccount;

            await basePage.waitUntilUrlMatch(`${baseURL}/login`, 10000);
            await signUpToGloWithGitHubAccount(basePage, dataToLogIn);
            (await basePage.findByXpath(`//a[@href="${baseURL}/glo/"]`)).click();
            await basePage.waitUntilUrlMatch(`${baseURL}/glo/`, 20000);
            await ensureNotificationToChangeUsernameIsDisplayed();
            await ensureWelcomeBoardIsCreated();
            await ensureColumnsCreated();
            await ensureLabelCreated();
            await gloMainPage.clickOnArrowLeft(basePage);
            await ensureDefaultThemeIsGlo();
            await gloMainPage.clickOnArrowLeft(basePage);
            await deleteGitHubAccount(basePage, this.options, dataToLogIn);
    });
});
