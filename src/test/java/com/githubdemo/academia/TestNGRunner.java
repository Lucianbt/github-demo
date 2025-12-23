package com.githubdemo.academia;

import org.testng.TestNG;

public class TestNGRunner {
    public static void main(String[] args) {
        TestNG testng = new TestNG();
        testng.setTestClasses(new Class[] { Contact.class });
        testng.setDefaultSuiteName("SingleTestSuite");
        testng.setDefaultTestName("ContactTest");
        testng.run();
    }
}
