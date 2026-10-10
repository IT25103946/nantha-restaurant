package com.example.nantharestaurant.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food_items")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "group_name", length = 100)
    private String groupName;

    // Default Constructor
    public FoodItem() {}

    public FoodItem(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public FoodItem(String name, double price, String imageUrl) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public FoodItem(String name, double price, String imageUrl, String groupName) {
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.groupName = groupName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }
}
