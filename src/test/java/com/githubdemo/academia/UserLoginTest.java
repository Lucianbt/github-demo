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

public class UserLoginTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "https://academiatestarii.ro";

    @BeforeClass
    public void setUp() {
        // Use WebDriverManager to manage the ChromeDriver binary automatically
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        // Increase explicit wait to 30s to handle slower page loads
        wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    @Test(description = "Login flow and settings navigation on academiatestarii.ro")
    public void loginAndLogout() {
        driver.get(baseUrl);

        // assert "Intră în cont" visible and click it
        By intrabtnBy = By.xpath("//span[contains(@class,'elementor-button-text') and normalize-space()='Intră în cont']");
        WebElement intraBtn = wait.until(ExpectedConditions.visibilityOfElementLocated(intrabtnBy));
        Assert.assertTrue(intraBtn.isDisplayed(), "'Intră în cont' should be visible on homepage");
        intraBtn.click();

        // assert Sign In header visible (use the provided precise selector)
        By signInHeaderBy = By.cssSelector("#wrapper > div.masterstudy__login-page > div > div > div.masterstudy-authorization__wrapper > div.masterstudy-authorization__header > span");
        WebElement signInHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(signInHeaderBy));
        Assert.assertTrue(signInHeader.isDisplayed(), "Sign In header should be visible on login overlay/page (using provided selector)");

        // fill username and password
        By userInputBy = By.cssSelector("input[name='user_login'].masterstudy-authorization__form-input");
        By passInputBy = By.cssSelector("input[name='user_password']");
        WebElement userInput = wait.until(ExpectedConditions.elementToBeClickable(userInputBy));
        WebElement passInput = wait.until(ExpectedConditions.elementToBeClickable(passInputBy));
        userInput.clear();
        userInput.sendKeys("lucianpetrariubt@gmail.com");
        passInput.clear();
        passInput.sendKeys("vexedzxc47");

        // click Sign In button
        By signInBtnBy = By.xpath("//span[contains(@class,'masterstudy-button__title') and normalize-space()='Sign In']");
        WebElement signInBtn = wait.until(ExpectedConditions.elementToBeClickable(signInBtnBy));
        signInBtn.click();

        // assert greeting visible: "Salut Petrariu Lucian"
        By greetingBy = By.xpath("//span[contains(@class,'elementor-button-text') and contains(normalize-space(),'Salut') and contains(normalize-space(),'Petrariu')]");
        WebElement greeting = wait.until(ExpectedConditions.visibilityOfElementLocated(greetingBy));
        Assert.assertTrue(greeting.isDisplayed(), "Greeting with user name should be visible after login");

        // click the ellipsis toggle
        By ellipsisBy = By.cssSelector("i.stm_lms_acc_tabs__toggle.fa.fa-ellipsis-v");
        WebElement ellipsis = wait.until(ExpectedConditions.elementToBeClickable(ellipsisBy));
        ellipsis.click();

        // click Setări
        By setariBy = By.xpath("//span[contains(@class,'float_menu_item__title') and normalize-space()='Setări']");
        WebElement setari = wait.until(ExpectedConditions.elementToBeClickable(setariBy));
        setari.click();

        // click logout link (Dezautentificare)
        By logoutBy = By.xpath("//a[contains(@class,'stm-lms-logout-button')][.//span[contains(normalize-space(),'Dezautentificare')]]");
        WebElement logout = wait.until(ExpectedConditions.elementToBeClickable(logoutBy));
        try {
            logout.click();
        } catch (ElementClickInterceptedException e) {
            // fallback: scroll into view and click via JS if normal click is intercepted
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", logout);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", logout);
        }

        // assert we are back on main page where Intră în cont is visible
        WebElement intraAfter = wait.until(ExpectedConditions.visibilityOfElementLocated(intrabtnBy));
        Assert.assertTrue(intraAfter.isDisplayed(), "'Intră în cont' should be visible after logout (back on main page)");
    }

    @AfterMethod
    public void takeScreenshotOnTestResult(ITestResult result) {
        if (driver == null) return;
        try {
            Path screenshotsDir = Paths.get("screenshots", "UserLoginTestJava");
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
