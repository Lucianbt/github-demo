package com.githubdemo.academia;

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
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

public class Contact {
    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "https://academiatestarii.ro";

    @BeforeClass
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    @Test(description = "Contact form flow on academiatestarii.ro")
    public void contactFormTest() {
        driver.get(baseUrl);

        // assert Contact link visible and click it
        By contactLinkBy = By.cssSelector("a.elementor-item[href='https://academiatestarii.ro/contact/']");
        WebElement contactLink = wait.until(ExpectedConditions.visibilityOfElementLocated(contactLinkBy));
        Assert.assertTrue(contactLink.isDisplayed(), "Contact link should be visible");
        contactLink.click();

        // assert instruction text visible
        By instructionBy = By.xpath("//span[contains(normalize-space(),'Completează informațiile de mai jos')]");
        WebElement instruction = wait.until(ExpectedConditions.visibilityOfElementLocated(instructionBy));
        Assert.assertTrue(instruction.isDisplayed(), "Instruction text should be visible on contact page");

        // fill form fields
        WebElement name = wait.until(ExpectedConditions.elementToBeClickable(By.id("form-field-name")));
        WebElement prenume = wait.until(ExpectedConditions.elementToBeClickable(By.id("form-field-field_d4138de")));
        WebElement phone = wait.until(ExpectedConditions.elementToBeClickable(By.id("form-field-field_55ad473")));
        WebElement email = wait.until(ExpectedConditions.elementToBeClickable(By.id("form-field-email")));
        WebElement message = wait.until(ExpectedConditions.elementToBeClickable(By.id("form-field-message")));

        name.clear();
        name.sendKeys("Lucian");
        prenume.clear();
        prenume.sendKeys("Petrariu");
        phone.clear();
        phone.sendKeys("0742317876");
        email.clear();
        email.sendKeys("lucianpetrariubt@gmail.com");
        message.clear();
        message.sendKeys("Mesaj de test");

        // assert and click Trimite button — ensure the button is in view first
        By trimiteBy = By.xpath("//span[@class='elementor-button-text' and normalize-space()='Trimite']");
        WebElement trimite = wait.until(ExpectedConditions.elementToBeClickable(trimiteBy));
        Assert.assertTrue(trimite.isDisplayed(), "Trimite button should be visible");
        // scroll the button into center of viewport before clicking
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center', inline:'center'});", trimite);
        try {
            trimite.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", trimite);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", trimite);
        }

        // wait for success message, scroll it into view, then wait 2s and capture confirmation screenshot
        By successBy = By.xpath("//div[contains(@class,'elementor-message-success') and contains(normalize-space(),'Your submission was successful')]");
        WebElement success = wait.until(ExpectedConditions.visibilityOfElementLocated(successBy));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", success);
        try {
            Thread.sleep(2000);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
        try {
            Path screenshotsDir = Paths.get("screenshots", "Contact");
            Files.createDirectories(screenshotsDir);
            String timestampAfter = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String afterFilename = "afterSubmit_" + timestampAfter + ".png";
            File afterSrc = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path afterDest = screenshotsDir.resolve(afterFilename);
            Files.copy(afterSrc.toPath(), afterDest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }

        // go to bottom and assert phone is present
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
        By phoneBy = By.xpath("//span[contains(@class,'elementor-icon-list-text') and normalize-space()='0733 760 795']");
        WebElement phoneSpan = wait.until(ExpectedConditions.visibilityOfElementLocated(phoneBy));
        Assert.assertTrue(phoneSpan.isDisplayed(), "Phone number should be present at bottom of page");
    }

    @AfterMethod
    public void takeScreenshotOnTestResult(ITestResult result) {
        if (driver == null) return;
        try {
            // save screenshots into the `screenshots/Contact` folder under the repository root
            Path screenshotsDir = Paths.get("screenshots", "Contact");
            Files.createDirectories(screenshotsDir);
            // small pause to allow UI transitions/animations to settle before capture
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
            String status = result.isSuccess() ? "PASSED" : "FAILED";
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String method = result.getMethod().getMethodName();
            String filename = method + "_" + status + "_" + timestamp + ".png";
            File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path dest = screenshotsDir.resolve(filename);
            Files.copy(src.toPath(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) driver.quit();
    }
}
