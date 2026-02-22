package com.githubdemo.academia.bestpractices;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

public final class DriverFactory {
    private DriverFactory() {
    }

    public static WebDriver createDriver() {
        String browser = System.getProperty("browser", "chrome").toLowerCase();
        WebDriver driver;

        if ("firefox".equals(browser)) {
            FirefoxOptions options = new FirefoxOptions();
            driver = new FirefoxDriver(options);
        } else {
            ChromeOptions options = new ChromeOptions();
            driver = new ChromeDriver(options);
        }

        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ZERO);
        return driver;
    }
}
