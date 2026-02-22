package com.githubdemo.academia.bestpractices;

// Polymorphism consumer: works with any SectionNavigator implementation.
public class NavigationService {
    public void visitSection(SectionNavigator section) {
        section.navigate();
    }
}
