package com.githubdemo.academia.bestpractices;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import static org.testng.Assert.assertTrue;

// Inheritance + polymorphism implementation.
public class ApiSection extends BasePage implements SectionNavigator {
    private static final String URL = "https://playwright.dev/docs/api/class-playwright";
    private static final By MAIN_HEADING = By.cssSelector("h1");

    public ApiSection(WebDriver driver) {
        super(driver);
    }

    @Override
    public void navigate() {
        open(URL);
        assertTrue(visible(MAIN_HEADING).isDisplayed(), "Main heading should be visible");
        assertTrue(visible(MAIN_HEADING).getText().trim().equals("Playwright Library"),
                "Main heading should be Playwright Library");
    }
}
