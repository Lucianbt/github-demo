package com.githubdemo.academia.bestpractices;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

// Inheritance: concrete page object extending BasePage.
public class PlaywrightHomePage extends BasePage {
    private static final String URL = "https://playwright.dev/";

    // Locator-first style in Selenium: semantic locator first (link text) over brittle XPath.
    private static final By GET_STARTED_LINK = By.cssSelector("a[href='/docs/intro']");
    private static final By DOCS_LINK = By.linkText("Docs");

    public PlaywrightHomePage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        open(URL);
    }

    public void goToGetStarted() {
        clickFirstVisible(GET_STARTED_LINK);
    }

    // Native Selenium interaction method.
    public void clickDocsLink() {
        click(DOCS_LINK);
    }
}
