package com.githubdemo.academia.bestpractices;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

// Test isolation: each test gets a fresh WebDriver session via @BeforeMethod/@AfterMethod.
public class SeleniumBestPracticesTest {
    private final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    private WebDriver getDriver() {
        return driver.get();
    }

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        driver.set(DriverFactory.createDriver());
    }

    @AfterMethod(alwaysRun = true)
    public void tearDownAndCaptureArtifacts(ITestResult result) {
        WebDriver currentDriver = getDriver();
        if (currentDriver == null) {
            return;
        }

        // Trace/video equivalent in local Selenium: keep failure artifacts for debugging.
        if (!result.isSuccess()) {
            captureFailureScreenshot(currentDriver, result.getMethod().getMethodName());
        }

        currentDriver.quit();
        driver.remove();
    }

    private void captureFailureScreenshot(WebDriver currentDriver, String methodName) {
        try {
            Path folder = Paths.get("screenshots", "best-practices-java");
            Files.createDirectories(folder);
            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            File source = ((TakesScreenshot) currentDriver).getScreenshotAs(OutputType.FILE);
            Files.copy(source.toPath(), folder.resolve(methodName + "_FAILED_" + ts + ".png"), StandardCopyOption.REPLACE_EXISTING);
        } catch (NoSuchSessionException ignored) {
        } catch (WebDriverException ignored) {
        } catch (IOException ignored) {
        }
    }

    @Test(description = "Locator-first + wait-driven navigation to Get started")
    public void usesLocatorFirstAndWaitWithoutSleeps() {
        WebDriver currentDriver = getDriver();
        PlaywrightHomePage homePage = new PlaywrightHomePage(currentDriver);
        WebDriverWait wait = new WebDriverWait(currentDriver, Duration.ofSeconds(15));

        homePage.open();
        homePage.goToGetStarted();

        wait.until(ExpectedConditions.urlContains("/docs/intro"));
        wait.until(ExpectedConditions.textToBe(By.cssSelector("main h1"), "Installation"));
        assertTrue(currentDriver.getCurrentUrl().contains("/docs/intro"), "Expected docs intro URL after clicking Get started");
        assertTrue(currentDriver.findElement(By.cssSelector("main h1")).getText().trim().equals("Installation"),
            "Installation heading should be visible");
    }

    @Test(description = "Native Selenium click() on Docs link")
    public void usesNativeClickMethodOnDocsLink() {
        WebDriver currentDriver = getDriver();
        PlaywrightHomePage homePage = new PlaywrightHomePage(currentDriver);

        homePage.open();
        homePage.clickDocsLink();

        assertTrue(currentDriver.getCurrentUrl().contains("/docs/intro"), "Expected docs intro URL after clicking Docs");
    }

    @Test(description = "Polymorphism via NavigationService over section implementations")
    public void demonstratesPolymorphismThroughSectionNavigation() {
        WebDriver currentDriver = getDriver();
        NavigationService service = new NavigationService();
        DocsSection docsSection = new DocsSection(currentDriver);
        ApiSection apiSection = new ApiSection(currentDriver);

        service.visitSection(docsSection);
        service.visitSection(apiSection);

        assertTrue(currentDriver.findElement(By.cssSelector("h1")).getText().trim().equals("Playwright Library"),
                "Playwright Library heading should be visible");
    }
}
