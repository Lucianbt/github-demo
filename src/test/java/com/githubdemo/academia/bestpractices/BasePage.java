package com.githubdemo.academia.bestpractices;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

// Abstraction + encapsulation: shared wait/click/open behavior for all pages.
public abstract class BasePage {
    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    protected void open(String absoluteUrl) {
        driver.get(absoluteUrl);
    }

    protected WebElement visible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected WebElement clickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    protected void click(By locator) {
        clickable(locator).click();
    }

    protected void clickFirstVisible(By locator) {
        StaleElementReferenceException lastStale = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
                return;
            } catch (StaleElementReferenceException stale) {
                lastStale = stale;
            }
        }
        if (lastStale != null) {
            throw lastStale;
        }
    }
}
