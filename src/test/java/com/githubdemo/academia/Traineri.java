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

public class Traineri {
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

    @Test(description = "Trainerii -> teacher -> contact flow on academiatestarii.ro")
    public void traineriFlow() {
        driver.get(baseUrl);

        // --- login (copied/adapted from UserLoginTest.java)
        By intrabtnBy = By.xpath("//span[contains(@class,'elementor-button-text') and normalize-space()='Intră în cont']");
        WebElement intraBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(intrabtnBy));
        Assert.assertTrue(intraBtn.isDisplayed(), "'Intră în cont' should be visible on homepage");
        intraBtn.click();

        By signInHeaderBy = By.cssSelector("#wrapper > div.masterstudy__login-page > div > div > div.masterstudy-authorization__wrapper > div.masterstudy-authorization__header > span");
        WebElement signInHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(signInHeaderBy));
        Assert.assertTrue(signInHeader.isDisplayed(), "Sign In header should be visible on login overlay/page");

        By userInputBy = By.cssSelector("input[name='user_login'].masterstudy-authorization__form-input");
        By passInputBy = By.cssSelector("input[name='user_password']");
        WebElement userInput = wait.until(ExpectedConditions.elementToBeClickable(userInputBy));
        WebElement passInput = wait.until(ExpectedConditions.elementToBeClickable(passInputBy));
        userInput.clear();
        userInput.sendKeys("lucianpetrariubt@gmail.com");
        passInput.clear();
        passInput.sendKeys("vexedzxc47");

        By signInBtnBy = By.xpath("//span[contains(@class,'masterstudy-button__title') and normalize-space()='Sign In']");
        WebElement signInBtn = wait.until(ExpectedConditions.elementToBeClickable(signInBtnBy));
        signInBtn.click();

        By greetingBy = By.xpath("//span[contains(@class,'elementor-button-text') and contains(normalize-space(),'Salut') and contains(normalize-space(),'Petrariu')]");
        WebElement greeting = wait.until(ExpectedConditions.visibilityOfElementLocated(greetingBy));
        Assert.assertTrue(greeting.isDisplayed(), "Greeting with user name should be visible after login");

        // --- assert Trainerii link visible and click it
        By traineriiBy = By.cssSelector("a.elementor-item[href='https://academiatestarii.ro/trainerii/']");
        WebElement traineriiLink = wait.until(ExpectedConditions.visibilityOfElementLocated(traineriiBy));
        Assert.assertTrue(traineriiLink.isDisplayed(), "'Trainerii' link should be visible in navigation");
        // use JS scroll/click fallback for reliability
        try {
            traineriiLink.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", traineriiLink);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", traineriiLink);
        }

        // --- assert teacher thumbnail anchor exists (George Stan) and click it
        By georgeBy = By.xpath("//a[@href='https://academiatestarii.ro/teachers/george-stan/']//img[contains(@alt,'George Stan')]");
        WebElement georgeImg = wait.until(ExpectedConditions.visibilityOfElementLocated(georgeBy));
        Assert.assertTrue(georgeImg.isDisplayed(), "George Stan thumbnail should be visible on Trainerii page");
        WebElement georgeAnchor = georgeImg.findElement(By.xpath("ancestor::a[1]"));
        try {
            georgeAnchor.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", georgeAnchor);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", georgeAnchor);
        }

        // --- assert contact email on teacher page
        By contactEmailBy = By.xpath("//span[contains(normalize-space(),'contact@academiatestarii.ro')]");
        WebElement contactEmail = wait.until(ExpectedConditions.visibilityOfElementLocated(contactEmailBy));
        Assert.assertTrue(contactEmail.isDisplayed(), "Teacher page should show contact@academiatestarii.ro");

        // --- navigate to Contact using the main Contact link (reuse Contact.java logic)
        By contactLinkBy = By.cssSelector("a.elementor-item[href='https://academiatestarii.ro/contact/']");
        WebElement contactLink = wait.until(ExpectedConditions.visibilityOfElementLocated(contactLinkBy));
        Assert.assertTrue(contactLink.isDisplayed(), "Contact link should be visible");
        try {
            contactLink.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", contactLink);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", contactLink);
        }

        // --- fill and submit contact form (copied from Contact.java)
        By instructionBy = By.xpath("//span[contains(normalize-space(),'Completează informațiile de mai jos')]");
        WebElement instruction = wait.until(ExpectedConditions.visibilityOfElementLocated(instructionBy));
        Assert.assertTrue(instruction.isDisplayed(), "Instruction text should be visible on contact page");

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
        message.sendKeys("Mesaj de test trimitere din test Traineri");

        By trimiteBy = By.xpath("//span[@class='elementor-button-text' and normalize-space()='Trimite']");
        WebElement trimite = wait.until(ExpectedConditions.elementToBeClickable(trimiteBy));
        Assert.assertTrue(trimite.isDisplayed(), "Trimite button should be visible");
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center', inline:'center'});", trimite);
        try {
            trimite.click();
        } catch (ElementClickInterceptedException e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", trimite);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", trimite);
        }

        By successBy = By.xpath("//div[contains(@class,'elementor-message-success') and contains(normalize-space(),'Your submission was successful')]");
        WebElement success = wait.until(ExpectedConditions.visibilityOfElementLocated(successBy));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", success);
        try {
            Thread.sleep(2000);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }

        // capture post-submit screenshot into screenshots/traineri
        try {
            Path screenshotsDir = Paths.get("screenshots", "traineri");
            Files.createDirectories(screenshotsDir);
            String timestampAfter = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String afterFilename = "afterSubmit_" + timestampAfter + ".png";
            File afterSrc = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path afterDest = screenshotsDir.resolve(afterFilename);
            Files.copy(afterSrc.toPath(), afterDest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }

    @AfterMethod
    public void takeScreenshotOnTestResult(ITestResult result) {
        if (driver == null) return;
        try {
            Path screenshotsDir = Paths.get("screenshots", "traineri");
            Files.createDirectories(screenshotsDir);
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
